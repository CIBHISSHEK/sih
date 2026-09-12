// SQLite has no native JSON/array type — Prisma fields for these are stored as
// stringified JSON text. These helpers keep the (de)serialisation in one place
// so callers work with typed values instead of raw strings.

export function toJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

export function fromJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
