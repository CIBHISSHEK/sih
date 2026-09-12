"use strict";
// SQLite has no native JSON/array type — Prisma fields for these are stored as
// stringified JSON text. These helpers keep the (de)serialisation in one place
// so callers work with typed values instead of raw strings.
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson = toJson;
exports.fromJson = fromJson;
function toJson(value) {
    return JSON.stringify(value ?? null);
}
function fromJson(value, fallback) {
    if (!value)
        return fallback;
    try {
        return JSON.parse(value);
    }
    catch {
        return fallback;
    }
}
