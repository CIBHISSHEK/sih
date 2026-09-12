import type { CentreCandidate, Language, RiskCheckResult, StorageType } from "@msp/shared";

export type VoiceState =
  | "LANGUAGE"
  | "CROP"
  | "QUANTITY"
  | "DAYS_SINCE_HARVEST"
  | "STORAGE"
  | "DATE"
  | "CONFIRM_RECOMMENDATION"
  | "DONE";

export interface VoiceSession {
  id: string;
  farmerId: string;
  lat: number;
  lng: number;
  district: string;
  state: VoiceState;
  retriesInState: number;
  filledFields: {
    lang?: Language;
    crop?: string;
    quantityQtl?: number;
    daysSinceHarvest?: number;
    storage?: StorageType;
    date?: string;
  };
  recommendation?: CentreCandidate;
  riskResult?: RiskCheckResult;
  createdAt: number;
}

const SESSION_TTL_MS = 30 * 60 * 1000;
const sessions = new Map<string, VoiceSession>();

export function createSession(id: string, farmerId: string, lat: number, lng: number, district: string): VoiceSession {
  const session: VoiceSession = {
    id,
    farmerId,
    lat,
    lng,
    district,
    state: "LANGUAGE",
    retriesInState: 0,
    filledFields: {},
    createdAt: Date.now()
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): VoiceSession | undefined {
  const s = sessions.get(id);
  if (s && Date.now() - s.createdAt > SESSION_TTL_MS) {
    sessions.delete(id);
    return undefined;
  }
  return s;
}

export function saveSession(session: VoiceSession) {
  sessions.set(session.id, session);
}

export function deleteSession(id: string) {
  sessions.delete(id);
}
