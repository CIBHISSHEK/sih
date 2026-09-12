export type Language = "hi" | "ta" | "te" | "kn" | "en";

export type BookingStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "IN_QUEUE"
  | "ARRIVED"
  | "PROCESSING"
  | "COMPLETED"
  | "PAID"
  | "CANCELLED"
  | "NO_SHOW";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type BookedVia = "APP" | "VOICE" | "STAFF";

export type PaymentStatus = "PENDING" | "INITIATED" | "PAID";

export type NotificationChannel = "PUSH" | "SMS" | "VOICE";

export type StorageType = "OPEN" | "COVERED";

export type Source = "ml" | "fallback";

export interface RecommendationBreakdownItem {
  label: string;
  rawValue: number;
  normalised: number;
  weight: number;
  contribution: number;
}

export interface RiskFactor {
  label: string;
  contribution: number;
  direction: "increases" | "decreases";
}

export interface CentreCandidate {
  centre: {
    id: string;
    name: string;
    code: string;
    address: string;
    district: string;
    lat: number;
    lng: number;
    queueLength: number;
    dailyCapacityQtl: number;
    remainingCapacityQtl: number;
    avgProcessingTimeMin: number;
    isNearCapacity: boolean;
  };
  distanceKm: number;
  availableSlots: Array<{ id: string; startTime: string; endTime: string; bookedQtl: number; capacityQtl: number }>;
  predictedWaitMin: number;
  score: number;
  breakdown: RecommendationBreakdownItem[];
  source: Source;
}

export interface RiskCheckResult {
  riskLevel: RiskLevel;
  riskScore: number;
  factors: RiskFactor[];
  weatherSummary: string;
  source: Source;
  photoAnalysed: boolean;
}
