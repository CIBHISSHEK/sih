import type { VoiceSession, VoiceState } from "./session";
import { extractNumber } from "./numerals";
import { getRecommendations, chooseSlot } from "../allocation";
import { runRiskCheck } from "../risk";
import { createBooking, BookingCapacityError, SlotExpiredError } from "../booking";
import promptsEn from "./prompts/en.json";
import promptsHi from "./prompts/hi.json";
import promptsTa from "./prompts/ta.json";
import promptsTe from "./prompts/te.json";
import promptsKn from "./prompts/kn.json";
import { localDateStr, addDaysLocal, type Language } from "@msp/shared";

const PROMPTS: Record<Language, Record<string, string>> = {
  en: promptsEn,
  hi: promptsHi,
  ta: promptsTa,
  te: promptsTe,
  kn: promptsKn
};

export function getInitialPrompt(lang: Language): string {
  return PROMPTS[lang]?.LANGUAGE ?? PROMPTS.en.LANGUAGE;
}

const MAX_RETRIES = 1;

function lang(session: VoiceSession): Language {
  return session.filledFields.lang ?? "en";
}

function t(session: VoiceSession, key: string, vars: Record<string, string | number> = {}): string {
  const template = PROMPTS[lang(session)][key] ?? PROMPTS.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

function promptFor(session: VoiceSession, state: VoiceState): string {
  return t(session, state);
}

function detectLanguage(text: string): Language | null {
  const s = text.toLowerCase();
  if (s.includes("hindi") || s.includes("हिंदी") || s.includes("हिन्दी")) return "hi";
  if (s.includes("tamil") || s.includes("தமிழ்")) return "ta";
  if (s.includes("telugu") || s.includes("తెలుగు")) return "te";
  if (s.includes("kannada") || s.includes("ಕನ್ನಡ")) return "kn";
  if (s.includes("english") || s.includes("अंग्रेजी")) return "en";
  return null;
}

const CROP_KEYWORDS = ["paddy", "rice", "wheat", "maize", "cotton", "sugarcane", "धान", "गेहूं", "मक्का", "நெல்", "கோதுமை", "வரி", "గోధుమ", "మొక్కజొన్న", "ಭತ್ತ", "ಗೋಧಿ", "ಮೆಕ್ಕೆಜೋಳ"];
const CROP_CANONICAL: Record<string, string> = {
  rice: "paddy", धान: "paddy", நெல்: "paddy", వరి: "paddy", ಭತ್ತ: "paddy",
  गेहूं: "wheat", கோதுமை: "wheat", గోధుమ: "wheat", ಗೋಧಿ: "wheat",
  मक्का: "maize", மக்காச்சோளம்: "maize", మొక్కజొన్న: "maize", ಮೆಕ್ಕೆಜೋಳ: "maize"
};

function detectCrop(text: string): string | null {
  const s = text.toLowerCase().trim();
  for (const kw of CROP_KEYWORDS) {
    if (s.includes(kw)) return CROP_CANONICAL[kw] ?? kw;
  }
  // fall back to accepting the raw word if it's a single plausible token
  const firstWord = s.split(/\s+/)[0];
  return firstWord && firstWord.length > 1 ? firstWord : null;
}

function detectStorage(text: string): "OPEN" | "COVERED" | null {
  const s = text.toLowerCase();
  if (/open|खुला|திறந்த|బహిరంగ|ತೆರೆದ/.test(s)) return "OPEN";
  if (/cover|ढका|மூடிய|కప్పబడిన|ಮುಚ್ಚಿದ/.test(s)) return "COVERED";
  return null;
}

function detectDate(text: string): string | null {
  const s = text.toLowerCase();
  if (/today|आज|இன்று|ఈరోజు|ಇಂದು/.test(s)) return localDateStr();
  if (/tomorrow|कल|நாளை|రేపు|ನಾಳೆ/.test(s)) {
    return localDateStr(addDaysLocal(new Date(), 1));
  }
  const isoMatch = text.match(/\d{4}-\d{2}-\d{2}/);
  return isoMatch ? isoMatch[0] : null;
}

function detectYesNo(text: string): "yes" | "no" | null {
  const s = text.toLowerCase();
  if (/\byes\b|हां|हाँ|ஆம்|అవును|ಹೌದು/.test(s)) return "yes";
  if (/\bno\b|नहीं|இல்லை|కాదు|ಇಲ್ಲ/.test(s)) return "no";
  return null;
}

export interface TurnResult {
  transcript: string;
  nextPrompt: string;
  state: VoiceState;
  filledFields: VoiceSession["filledFields"];
  done: boolean;
  booking?: Awaited<ReturnType<typeof createBooking>>;
}

export async function processTurn(session: VoiceSession, text: string): Promise<TurnResult> {
  const trimmed = text.trim();

  switch (session.state) {
    case "LANGUAGE": {
      const detected = detectLanguage(trimmed);
      if (!detected) return retry(session, "LANGUAGE");
      session.filledFields.lang = detected;
      return advance(session, "CROP");
    }

    case "CROP": {
      const crop = detectCrop(trimmed);
      if (!crop) return retry(session, "CROP");
      session.filledFields.crop = crop;
      return advance(session, "QUANTITY");
    }

    case "QUANTITY": {
      const qty = extractNumber(trimmed, lang(session));
      if (qty == null || qty <= 0) return retry(session, "QUANTITY");
      session.filledFields.quantityQtl = qty;
      return advance(session, "DAYS_SINCE_HARVEST");
    }

    case "DAYS_SINCE_HARVEST": {
      const days = extractNumber(trimmed, lang(session));
      if (days == null || days < 0) return retry(session, "DAYS_SINCE_HARVEST");
      session.filledFields.daysSinceHarvest = days;
      return advance(session, "STORAGE");
    }

    case "STORAGE": {
      const storage = detectStorage(trimmed);
      if (!storage) return retry(session, "STORAGE");
      session.filledFields.storage = storage;
      return advance(session, "DATE");
    }

    case "DATE": {
      const date = detectDate(trimmed);
      if (!date) return retry(session, "DATE");
      session.filledFields.date = date;
      return buildRecommendation(session);
    }

    case "CONFIRM_RECOMMENDATION": {
      const answer = detectYesNo(trimmed);
      if (!answer) return retry(session, "CONFIRM_RECOMMENDATION");
      if (answer === "no") {
        session.state = "DONE";
        return { transcript: text, nextPrompt: t(session, "DONE_CANCELLED"), state: "DONE", filledFields: session.filledFields, done: true };
      }
      return confirmBooking(session, text);
    }

    default:
      return { transcript: text, nextPrompt: t(session, "HANDOFF"), state: "DONE", filledFields: session.filledFields, done: true };
  }
}

function retry(session: VoiceSession, state: VoiceState): TurnResult {
  session.retriesInState += 1;
  if (session.retriesInState > MAX_RETRIES) {
    session.state = "DONE";
    return { transcript: "", nextPrompt: t(session, "HANDOFF"), state: "DONE", filledFields: session.filledFields, done: true };
  }
  return { transcript: "", nextPrompt: t(session, "RETRY", { prompt: promptFor(session, state) }), state, filledFields: session.filledFields, done: false };
}

function advance(session: VoiceSession, next: VoiceState): TurnResult {
  session.state = next;
  session.retriesInState = 0;
  return { transcript: "", nextPrompt: promptFor(session, next), state: next, filledFields: session.filledFields, done: false };
}

async function buildRecommendation(session: VoiceSession): Promise<TurnResult> {
  const { crop, quantityQtl, daysSinceHarvest, storage, date } = session.filledFields;
  const [candidates, riskResult] = await Promise.all([
    getRecommendations({ lat: session.lat, lng: session.lng, crop: crop!, quantityQtl: quantityQtl!, date: date! }),
    runRiskCheck({ lat: session.lat, lng: session.lng, district: session.district, crop: crop!, daysSinceHarvest: daysSinceHarvest!, storage: storage! })
  ]);

  if (candidates.length === 0) {
    session.state = "DONE";
    return { transcript: "", nextPrompt: t(session, "NO_OPTIONS"), state: "DONE", filledFields: session.filledFields, done: true };
  }

  session.recommendation = candidates[0];
  session.riskResult = riskResult;
  session.state = "CONFIRM_RECOMMENDATION";
  session.retriesInState = 0;

  const prompt = t(session, "CONFIRM_RECOMMENDATION", {
    centreName: candidates[0].centre.name,
    distanceKm: candidates[0].distanceKm,
    predictedWaitMin: candidates[0].predictedWaitMin,
    riskLevel: riskResult.riskLevel
  });
  return { transcript: "", nextPrompt: prompt, state: "CONFIRM_RECOMMENDATION", filledFields: session.filledFields, done: false };
}

async function confirmBooking(session: VoiceSession, rawText: string): Promise<TurnResult> {
  const rec = session.recommendation!;
  const risk = session.riskResult!;
  const slot = rec.availableSlots[0] ?? (await chooseSlot(rec.centre.id, session.filledFields.date!, session.filledFields.quantityQtl!));
  if (!slot) {
    session.state = "DONE";
    return { transcript: rawText, nextPrompt: t(session, "NO_OPTIONS"), state: "DONE", filledFields: session.filledFields, done: true };
  }

  try {
    const booking = await createBooking({
      farmerId: session.farmerId,
      centreId: rec.centre.id,
      slotId: slot.id,
      crop: session.filledFields.crop!,
      quantityQtl: session.filledFields.quantityQtl!,
      bookedVia: "VOICE",
      riskSnapshot: { riskLevel: risk.riskLevel, riskScore: risk.riskScore, factors: risk.factors },
      recommendationSnapshot: { score: rec.score, predictedWaitMin: rec.predictedWaitMin, breakdown: rec.breakdown }
    });

    session.state = "DONE";
    return {
      transcript: rawText,
      nextPrompt: t(session, "DONE_BOOKED", { tokenNumber: booking.tokenNumber, arrivalOtp: booking.arrivalOtp }),
      state: "DONE",
      filledFields: session.filledFields,
      done: true,
      booking
    };
  } catch (err) {
    if (err instanceof BookingCapacityError || err instanceof SlotExpiredError) {
      session.state = "DONE";
      return { transcript: rawText, nextPrompt: t(session, "NO_OPTIONS"), state: "DONE", filledFields: session.filledFields, done: true };
    }
    throw err;
  }
}
