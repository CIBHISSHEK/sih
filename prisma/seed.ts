import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------- small local helpers (deliberately self-contained — this file
// runs standalone via `npm run seed` / `tsx`, outside apps/api's TS rootDir) ----------

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
// Local-calendar-day string — NOT toISOString(), which converts to UTC first
// and silently shifts the date by a day in timezones ahead of UTC (e.g. IST).
function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function daysFromToday(offset: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}
function generateTokenNumber(centreCode: string, sequence: number): string {
  return `${centreCode.slice(0, 3).toUpperCase()}-${String(sequence).padStart(4, "0")}`;
}
function generateOtp(): string {
  return String(randInt(100000, 999999));
}

const HOURLY_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const CROPS = ["paddy", "wheat", "maize"];

const FIRST_NAMES = ["Murugan", "Lakshmi", "Karthik", "Meena", "Suresh", "Priya", "Anbu", "Kavitha", "Raja", "Selvi",
  "Manikandan", "Deepa", "Vijay", "Saroja", "Ramesh", "Bhuvana", "Senthil", "Revathi", "Gopal", "Nandhini",
  "Prakash", "Shanthi", "Arun", "Vasanthi", "Elango", "Geetha", "Balaji", "Sumathi", "Dinesh", "Uma"];

interface CentreSeed {
  name: string;
  code: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  dailyCapacityQtl: number;
  cropsAccepted: string[];
  region: keyof typeof REGION_META;
}

// Per-region village names + preferred-language weighting, so a farmer
// seeded near a given centre gets a village and language that actually
// matches that part of the country instead of every farmer nationwide
// looking like they're from Thanjavur.
const REGION_META = {
  thanjavur: {
    state: "Tamil Nadu",
    villages: ["Vallam", "Ammapettai", "Budalur", "Thiruvaiyaru", "Papanasam", "Orathanadu", "Pattukkottai",
      "Peravurani", "Kumbakonam", "Thiruvidaimarudur", "Needamangalam", "Aduthurai"],
    languages: ["ta", "ta", "ta", "hi", "en"] as const
  },
  bengaluru: {
    state: "Karnataka",
    villages: ["Nelamangala", "Kanakapura", "Magadi", "Channapatna", "Doddaballapura", "Hoskote"],
    languages: ["kn", "kn", "kn", "en", "hi"] as const
  },
  hyderabad: {
    state: "Telangana",
    villages: ["Shamshabad", "Medchal", "Ghatkesar", "Ibrahimpatnam", "Shankarpally"],
    languages: ["te", "te", "te", "en", "hi"] as const
  },
  delhi: {
    state: "Delhi",
    villages: ["Najafgarh", "Narela", "Bawana", "Kanjhawala", "Bakhtawarpur"],
    languages: ["hi", "hi", "hi", "en"] as const
  }
};

const CENTRES: CentreSeed[] = [
  { name: "Thanjavur Main PACR", code: "TNJ", address: "Trichy Road, Thanjavur", district: "Thanjavur", lat: 10.787, lng: 79.1378, dailyCapacityQtl: 1200, cropsAccepted: ["paddy", "wheat", "maize"], region: "thanjavur" },
  { name: "Kumbakonam Procurement Centre", code: "KBK", address: "Big Bazaar St, Kumbakonam", district: "Thanjavur", lat: 10.9601, lng: 79.3788, dailyCapacityQtl: 900, cropsAccepted: ["paddy", "maize"], region: "thanjavur" },
  { name: "Pattukkottai Centre", code: "PTK", address: "Trichy-Pattukkottai Rd", district: "Thanjavur", lat: 10.4269, lng: 79.3167, dailyCapacityQtl: 600, cropsAccepted: ["paddy", "wheat"], region: "thanjavur" },
  { name: "Orathanadu Centre", code: "ORT", address: "Main Bazaar, Orathanadu", district: "Thanjavur", lat: 10.6167, lng: 79.2333, dailyCapacityQtl: 500, cropsAccepted: ["paddy", "maize"], region: "thanjavur" },
  { name: "Papanasam Centre", code: "PPN", address: "Kumbakonam Rd, Papanasam", district: "Thanjavur", lat: 10.9167, lng: 79.2667, dailyCapacityQtl: 400, cropsAccepted: ["paddy", "wheat", "maize"], region: "thanjavur" },
  // Karnataka
  { name: "Bengaluru Rural APMC Yard", code: "BLR", address: "Yeshwanthpur Market Yard, Bengaluru", district: "Bengaluru Urban", lat: 13.0284, lng: 77.5547, dailyCapacityQtl: 1000, cropsAccepted: ["paddy", "maize"], region: "bengaluru" },
  { name: "Ramanagara Procurement Centre", code: "RMN", address: "APMC Yard, Ramanagara", district: "Ramanagara", lat: 12.7217, lng: 77.2812, dailyCapacityQtl: 700, cropsAccepted: ["paddy", "wheat", "maize"], region: "bengaluru" },
  // Telangana
  { name: "Hyderabad Agri Market Centre", code: "HYD", address: "Bowenpally Market Yard, Hyderabad", district: "Hyderabad", lat: 17.4830, lng: 78.4747, dailyCapacityQtl: 900, cropsAccepted: ["paddy", "maize"], region: "hyderabad" },
  // Delhi
  { name: "Azadpur Procurement Centre", code: "AZD", address: "Azadpur Mandi, Delhi", district: "North Delhi", lat: 28.7139, lng: 77.1746, dailyCapacityQtl: 1100, cropsAccepted: ["wheat", "maize"], region: "delhi" }
];

const PAST_DAYS = 21;
const FUTURE_DAYS = 5; // today + next 4

export async function runSeed() {
  console.log("Resetting database...");
  await prisma.notificationLog.deleteMany();
  await prisma.eventLog.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.centre.deleteMany();
  await prisma.farmer.deleteMany();

  console.log("Seeding centres...");
  const centres: (Awaited<ReturnType<typeof prisma.centre.create>> & { region: CentreSeed["region"] })[] = [];
  for (const c of CENTRES) {
    const centre = await prisma.centre.create({
      data: {
        name: c.name,
        code: c.code,
        address: c.address,
        district: c.district,
        lat: c.lat,
        lng: c.lng,
        cropsAccepted: JSON.stringify(c.cropsAccepted),
        dailyCapacityQtl: c.dailyCapacityQtl,
        remainingCapacityQtl: c.dailyCapacityQtl,
        queueLength: 0,
        avgProcessingTimeMin: randInt(10, 15)
      }
    });
    centres.push({ ...centre, region: c.region });
  }

  console.log("Seeding farmers...");
  const farmers = [];
  const FARMER_COUNT = 45; // ~5 per centre across all 9 centres/4 regions
  for (let i = 0; i < FARMER_COUNT; i++) {
    const nearCentre = pick(centres);
    const meta = REGION_META[nearCentre.region];
    // random offset that keeps farmers roughly 5-45km from a centre
    const distKm = rand(5, 45);
    const bearing = rand(0, 2 * Math.PI);
    const dLat = (distKm / 111) * Math.cos(bearing);
    const dLng = (distKm / (111 * Math.cos((nearCentre.lat * Math.PI) / 180))) * Math.sin(bearing);

    const phone = `9${randInt(100000000, 999999999)}`;
    const farmer = await prisma.farmer.create({
      data: {
        name: `${pick(FIRST_NAMES)} ${pick(["S", "R", "K", "M", "V", "P"])}`,
        phone,
        farmerIdMasked: `F-${phone.slice(-4)}XXX`,
        landSizeAcres: Math.round(rand(0.5, 8) * 10) / 10,
        primaryCrop: pick(CROPS),
        lat: nearCentre.lat + dLat,
        lng: nearCentre.lng + dLng,
        village: pick(meta.villages),
        district: nearCentre.district,
        state: meta.state,
        preferredLanguage: pick([...meta.languages])
      }
    });
    farmers.push(farmer);
  }

  console.log("Seeding slots...");
  const slotRows: { centreId: string; date: string; startTime: string; endTime: string; capacityQtl: number }[] = [];
  const dateRange: string[] = [];
  for (let offset = -PAST_DAYS; offset < FUTURE_DAYS; offset++) dateRange.push(isoDate(daysFromToday(offset)));

  for (const centre of centres) {
    const perSlotCapacity = Math.round(centre.dailyCapacityQtl / HOURLY_SLOTS.length);
    for (const date of dateRange) {
      for (let h = 0; h < HOURLY_SLOTS.length; h++) {
        const startTime = HOURLY_SLOTS[h];
        const endHour = 8 + h + 1;
        slotRows.push({
          centreId: centre.id,
          date,
          startTime,
          endTime: `${String(endHour).padStart(2, "0")}:00`,
          capacityQtl: perSlotCapacity
        });
      }
    }
  }
  await prisma.slot.createMany({ data: slotRows });
  const allSlots = await prisma.slot.findMany();
  const slotKey = (centreId: string, date: string, startTime: string) => `${centreId}|${date}|${startTime}`;
  const slotIndex = new Map(allSlots.map((s) => [slotKey(s.centreId, s.date, s.startTime), s]));

  console.log("Seeding 21 days of historical completed bookings...");
  const tokenCounters = new Map(centres.map((c) => [c.id, 0]));
  const nextToken = (centreId: string, centreCode: string) => {
    const n = (tokenCounters.get(centreId) ?? 0) + 1;
    tokenCounters.set(centreId, n);
    return generateTokenNumber(centreCode, n);
  };

  const historicalBookings = [];
  const pastDates = dateRange.filter((d) => d < isoDate(daysFromToday(0)));
  for (const date of pastDates) {
    for (const centre of centres) {
      const bookingsToday = randInt(2, 6);
      for (let i = 0; i < bookingsToday; i++) {
        const startTime = pick(HOURLY_SLOTS);
        const slot = slotIndex.get(slotKey(centre.id, date, startTime));
        if (!slot) continue;

        const farmer = pick(farmers);
        const crop = pick(JSON.parse(centre.cropsAccepted) as string[]);
        const quantityQtl = randInt(4, 20);
        const isRejectedCase = Math.random() < 0.08;
        const rejectedQtl = isRejectedCase ? Math.round(quantityQtl * rand(0.15, 0.6) * 10) / 10 : 0;
        const finalQuantityQtl = Math.round((quantityQtl - rejectedQtl) * 10) / 10;

        const [hh, mm] = startTime.split(":").map(Number);
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hh, mm, 0, 0);
        const arrivedAt = new Date(slotDateTime.getTime() + randInt(-5, 15) * 60000);
        const actualProcessingMin = randInt(8, 22);
        const completedAt = new Date(arrivedAt.getTime() + actualProcessingMin * 60000);
        const isSlaBreach = Math.random() < 0.12;
        const paidAt = new Date(completedAt.getTime() + (isSlaBreach ? randInt(50, 96) : randInt(1, 40)) * 3600000);

        historicalBookings.push({
          farmerId: farmer.id,
          centreId: centre.id,
          slotId: slot.id,
          crop,
          quantityQtl,
          status: "PAID",
          tokenNumber: nextToken(centre.id, centre.code),
          arrivalOtp: generateOtp(),
          bookedVia: pick(["APP", "APP", "VOICE", "STAFF"]),
          arrivedAt,
          processingStartedAt: arrivedAt,
          completedAt,
          actualProcessingMin,
          finalQuantityQtl,
          rejectedQtl,
          paymentStatus: "PAID",
          paymentAmount: Math.round(finalQuantityQtl * 2200),
          paidAt,
          createdAt: new Date(slotDateTime.getTime() - randInt(1, 3) * 86400000)
        });
      }
    }
  }
  await prisma.booking.createMany({ data: historicalBookings as any });

  console.log("Seeding today's live bookings across every status...");
  const today = isoDate(daysFromToday(0));
  const nowHour = new Date().getHours();

  type TodayCase = { status: string; count: number };
  const cases: TodayCase[] = [
    { status: "CONFIRMED", count: 4 },
    { status: "IN_QUEUE", count: 3 },
    { status: "ARRIVED", count: 2 },
    { status: "PROCESSING", count: 2 },
    { status: "COMPLETED", count: 3 },
    { status: "PAID", count: 2 },
    { status: "CANCELLED", count: 1 },
    { status: "NO_SHOW", count: 1 }
  ];

  const slotBookedDelta = new Map<string, number>();
  let createdToday = 0;

  for (const kase of cases) {
    for (let i = 0; i < kase.count; i++) {
      const centre = pick(centres);
      // CONFIRMED bookings sit in a future slot today. IN_QUEUE is still an
      // *actionable* status (Verify Arrival is available) and the no-show
      // cron sweeps anything more than 90 minutes past its slot's end time —
      // so it must land in the *most recent* past hour, not an arbitrary one
      // from earlier today, or it can get auto-marked NO_SHOW within a
      // cron tick of the server starting. ARRIVED/PROCESSING/COMPLETED/PAID
      // aren't at risk (they already have arrivedAt set) so any past slot is fine.
      const isFutureCase = kase.status === "CONFIRMED";
      const isRecentPastCase = kase.status === "IN_QUEUE";
      const futureSlots = HOURLY_SLOTS.filter((_, idx) => idx + 8 >= nowHour);
      const pastSlots = HOURLY_SLOTS.filter((_, idx) => idx + 8 < nowHour);
      const recentPastSlots = HOURLY_SLOTS.filter((_, idx) => idx + 8 < nowHour && idx + 8 >= nowHour - 1);
      const pool = isFutureCase
        ? (futureSlots.length ? futureSlots : HOURLY_SLOTS)
        : isRecentPastCase
        ? (recentPastSlots.length ? recentPastSlots : pastSlots.length ? [pastSlots[pastSlots.length - 1]] : HOURLY_SLOTS)
        : (pastSlots.length ? pastSlots : HOURLY_SLOTS);
      const chosenStart = pick(pool);
      const slot = slotIndex.get(slotKey(centre.id, today, chosenStart));
      if (!slot) continue;

      {
        const farmer = pick(farmers);
        const crop = pick(JSON.parse(centre.cropsAccepted) as string[]);
        const quantityQtl = randInt(4, 15);

        const data: any = {
          farmerId: farmer.id,
          centreId: centre.id,
          slotId: slot.id,
          crop,
          quantityQtl,
          status: kase.status,
          tokenNumber: nextToken(centre.id, centre.code),
          arrivalOtp: generateOtp(),
          bookedVia: "APP"
        };

        if (["IN_QUEUE", "ARRIVED", "PROCESSING", "COMPLETED", "PAID"].includes(kase.status)) {
          data.notifiedApproaching = false;
        }
        if (["ARRIVED", "PROCESSING", "COMPLETED", "PAID"].includes(kase.status)) {
          data.arrivedAt = new Date(Date.now() - randInt(5, 40) * 60000);
        }
        if (["PROCESSING", "COMPLETED", "PAID"].includes(kase.status)) {
          data.processingStartedAt = new Date(Date.now() - randInt(2, 20) * 60000);
        }
        if (["COMPLETED", "PAID"].includes(kase.status)) {
          const rejectedQtl = Math.random() < 0.08 ? Math.round(quantityQtl * 0.2 * 10) / 10 : 0;
          data.completedAt = new Date(Date.now() - randInt(0, 10) * 60000);
          data.actualProcessingMin = randInt(8, 20);
          data.finalQuantityQtl = Math.round((quantityQtl - rejectedQtl) * 10) / 10;
          data.rejectedQtl = rejectedQtl;
          data.paymentStatus = kase.status === "PAID" ? "PAID" : "INITIATED";
          if (kase.status === "PAID") {
            data.paymentAmount = Math.round(data.finalQuantityQtl * 2200);
            data.paidAt = new Date(Date.now() - randInt(0, 5) * 60000);
          }
        }

        const booking = await prisma.booking.create({ data });
        createdToday++;

        if (!["CANCELLED", "NO_SHOW"].includes(kase.status)) {
          slotBookedDelta.set(slot.id, (slotBookedDelta.get(slot.id) ?? 0) + quantityQtl);
        }
        void booking;
      }
    }
  }
  console.log(`Created ${createdToday} live bookings for today (target ~18).`);

  console.log("Reconciling slot capacity and centre live counters...");
  for (const [slotId, delta] of slotBookedDelta.entries()) {
    await prisma.slot.update({ where: { id: slotId }, data: { bookedQtl: { increment: delta } } });
  }

  for (const centre of centres) {
    const activeBookings = await prisma.booking.findMany({
      where: { centreId: centre.id, status: { in: ["CONFIRMED", "IN_QUEUE", "ARRIVED", "PROCESSING"] } }
    });
    const bookedTodayAndFuture = await prisma.booking.aggregate({
      where: { centreId: centre.id, status: { notIn: ["CANCELLED", "NO_SHOW"] }, slot: { date: { gte: today } } },
      _sum: { quantityQtl: true }
    });
    const bookedQty = bookedTodayAndFuture._sum.quantityQtl ?? 0;
    const remainingCapacityQtl = Math.max(0, centre.dailyCapacityQtl - bookedQty);

    await prisma.centre.update({
      where: { id: centre.id },
      data: {
        queueLength: activeBookings.length,
        remainingCapacityQtl,
        isNearCapacity: (centre.dailyCapacityQtl - remainingCapacityQtl) / centre.dailyCapacityQtl > 0.85
      }
    });
  }

  console.log("Seed complete.");
}

if (require.main === module) {
  runSeed()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
