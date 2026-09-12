import { prisma } from "../prisma";
import { haversineKm } from "./geo";
import { predictWait } from "./mlClient";
import {
  SCORING_WEIGHTS,
  EXPECTED_MAX_QUEUE,
  MAX_ACCEPTABLE_WAIT,
  DEFAULT_RADIUS_KM,
  SLOT_SPREAD_PENALTY_THRESHOLD,
  clamp,
  fromJson,
  isSlotPast,
  type CentreCandidate,
  type RecommendationBreakdownItem,
  type Source
} from "@msp/shared";

export interface RecommendationInput {
  lat: number;
  lng: number;
  crop: string;
  quantityQtl: number;
  date: string; // YYYY-MM-DD
  radiusKm?: number;
}

export async function getRecommendations(input: RecommendationInput): Promise<CentreCandidate[]> {
  const radiusKm = input.radiusKm ?? DEFAULT_RADIUS_KM;

  const centres = await prisma.centre.findMany({
    where: { remainingCapacityQtl: { gte: input.quantityQtl } },
    include: { slots: { where: { date: input.date } } }
  });

  // Drop any slot whose start time has already passed today — otherwise a
  // farmer could "book" a time slot that's already gone, which then trips
  // the no-show sweep almost immediately since it never had a real window
  // to arrive in.
  for (const centre of centres) {
    centre.slots = centre.slots.filter((s) => !isSlotPast(input.date, s.startTime));
  }

  const withinRadius = centres
    .map((centre) => ({ centre, distanceKm: haversineKm(input.lat, input.lng, centre.lat, centre.lng) }))
    .filter(({ centre, distanceKm }) => {
      const crops = fromJson<string[]>(centre.cropsAccepted, []);
      return distanceKm <= radiusKm && crops.includes(input.crop) && centre.slots.length > 0;
    });

  const now = new Date();
  const candidates: CentreCandidate[] = [];

  for (const { centre, distanceKm } of withinRadius) {
    const capacityRatio = centre.remainingCapacityQtl / centre.dailyCapacityQtl;

    const mlResult = await predictWait({
      queue_length: centre.queueLength,
      avg_processing_time_min: centre.avgProcessingTimeMin,
      remaining_capacity_pct: capacityRatio,
      hour_of_day: now.getHours(),
      day_of_week: now.getDay(),
      quantity_qtl: input.quantityQtl
    });

    let predictedWaitMin: number;
    let source: Source;
    if (mlResult) {
      predictedWaitMin = mlResult.predicted_wait_min;
      source = "ml";
    } else {
      predictedWaitMin = centre.avgProcessingTimeMin * centre.queueLength * 0.8;
      source = "fallback";
    }

    const proximity = 1 - clamp(distanceKm / radiusKm, 0, 1);
    const capacityScore = clamp(capacityRatio, 0, 1);
    const queuePressure = clamp(centre.queueLength / EXPECTED_MAX_QUEUE, 0, 1);
    const waitPressure = clamp(predictedWaitMin / MAX_ACCEPTABLE_WAIT, 0, 1);

    const breakdown: RecommendationBreakdownItem[] = [
      { label: "Proximity", rawValue: distanceKm, normalised: proximity, weight: SCORING_WEIGHTS.W_DISTANCE, contribution: SCORING_WEIGHTS.W_DISTANCE * proximity },
      { label: "Available capacity", rawValue: centre.remainingCapacityQtl, normalised: capacityScore, weight: SCORING_WEIGHTS.W_CAPACITY, contribution: SCORING_WEIGHTS.W_CAPACITY * capacityScore },
      { label: "Queue pressure", rawValue: centre.queueLength, normalised: queuePressure, weight: -SCORING_WEIGHTS.W_QUEUE, contribution: -SCORING_WEIGHTS.W_QUEUE * queuePressure },
      { label: "Predicted wait", rawValue: predictedWaitMin, normalised: waitPressure, weight: -SCORING_WEIGHTS.W_WAIT, contribution: -SCORING_WEIGHTS.W_WAIT * waitPressure }
    ];

    const score = breakdown.reduce((sum, item) => sum + item.contribution, 0);

    candidates.push({
      centre: {
        id: centre.id,
        name: centre.name,
        code: centre.code,
        address: centre.address,
        district: centre.district,
        lat: centre.lat,
        lng: centre.lng,
        queueLength: centre.queueLength,
        dailyCapacityQtl: centre.dailyCapacityQtl,
        remainingCapacityQtl: centre.remainingCapacityQtl,
        avgProcessingTimeMin: centre.avgProcessingTimeMin,
        isNearCapacity: centre.isNearCapacity
      },
      distanceKm: Math.round(distanceKm * 10) / 10,
      availableSlots: centre.slots
        .filter((s) => s.bookedQtl + input.quantityQtl <= s.capacityQtl)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))
        .map((s) => ({ id: s.id, startTime: s.startTime, endTime: s.endTime, bookedQtl: s.bookedQtl, capacityQtl: s.capacityQtl })),
      predictedWaitMin: Math.round(predictedWaitMin),
      score: Math.round(score * 1000) / 1000,
      breakdown,
      source
    });
  }

  return candidates.sort((a, b) => b.score - a.score);
}

export async function chooseSlot(centreId: string, date: string, quantityQtl: number) {
  const slots = await prisma.slot.findMany({ where: { centreId, date } });
  const withRoom = slots.filter((s) => !isSlotPast(date, s.startTime) && s.bookedQtl + quantityQtl <= s.capacityQtl);
  if (withRoom.length === 0) return null;

  return withRoom.sort((a, b) => {
    const aFilled = a.bookedQtl / a.capacityQtl > SLOT_SPREAD_PENALTY_THRESHOLD ? 1 : 0;
    const bFilled = b.bookedQtl / b.capacityQtl > SLOT_SPREAD_PENALTY_THRESHOLD ? 1 : 0;
    if (aFilled !== bFilled) return aFilled - bFilled;
    return a.startTime.localeCompare(b.startTime);
  })[0];
}
