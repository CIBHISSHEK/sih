// Human-readable booking token + arrival OTP generation.

const CENTRE_CODE_LEN = 3;

export function generateTokenNumber(centreCode: string, sequence: number): string {
  const prefix = centreCode.slice(0, CENTRE_CODE_LEN).toUpperCase();
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
