import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { signToken, requireAuth } from "../middleware/auth";
import { isFirebaseConfigured, verifyFirebaseIdToken } from "../services/firebaseAdmin";

const router = Router();

const MOCK_OTP = "123456";

// Demo-only fixed phone numbers for the two non-farmer roles — there's no
// separate Staff/Admin table in the schema (see spec §5), so role is just a
// lookup on phone number for this prototype. Works the same whether the
// phone was verified via the mock flow or real Firebase SMS.
const DEMO_ROLE_PHONES: Record<string, "STAFF" | "ADMIN"> = {
  "9999999999": "ADMIN",
  "8888888888": "STAFF"
};

// Both login paths (mock OTP and real Firebase SMS) converge here once the
// phone number is verified — one place decides role vs. farmer record vs. JWT,
// so the two flows can never drift into different behaviour.
async function completeLogin(phone: string) {
  const role = DEMO_ROLE_PHONES[phone];
  if (role) {
    const token = signToken({ sub: phone, role });
    return { token, isNewUser: false, farmer: null, role };
  }

  let farmer = await prisma.farmer.findUnique({ where: { phone } });
  let isNewUser = false;
  if (!farmer) {
    farmer = await prisma.farmer.create({
      data: {
        name: "",
        phone,
        farmerIdMasked: `F-${phone.slice(-4)}XXX`,
        landSizeAcres: 0,
        primaryCrop: "",
        lat: 10.787,
        lng: 79.137,
        village: "",
        district: "Thanjavur",
        state: "Tamil Nadu",
        preferredLanguage: "en"
      }
    });
    isNewUser = true;
  }

  const token = signToken({ sub: farmer.id, role: "FARMER" });
  return { token, isNewUser: isNewUser || !farmer.name, farmer, role: "FARMER" as const };
}

// Firebase phone auth returns E.164 ("+919876543210") — normalise to the bare
// 10-digit form used everywhere else (DEMO_ROLE_PHONES, existing Farmer rows,
// the mock flow) so the two login paths never create duplicate accounts for
// the same number.
function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "").slice(-10);
}

router.get("/config", (_req, res) => {
  res.json({ firebaseEnabled: isFirebaseConfigured() });
});

router.post("/otp/request", (req, res) => {
  const schema = z.object({ phone: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "phone is required" });

  res.json({ message: "OTP sent", otp: MOCK_OTP, mock: true });
});

router.post("/otp/verify", async (req, res) => {
  const schema = z.object({ phone: z.string().min(6), otp: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "phone and otp are required" });
  const { phone, otp } = parsed.data;

  if (otp !== MOCK_OTP) return res.status(401).json({ error: "Invalid OTP" });

  const result = await completeLogin(phone);
  res.json(result);
});

// Real-phone login: the browser verifies the OTP directly with Firebase (see
// apps/web/src/firebase.ts) and hands us the resulting ID token, which we
// verify server-side before trusting the phone number it claims.
router.post("/firebase-login", async (req, res) => {
  const schema = z.object({ idToken: z.string().min(10) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "idToken is required" });

  const phoneE164 = await verifyFirebaseIdToken(parsed.data.idToken);
  if (!phoneE164) {
    return res.status(503).json({ error: "Could not verify this login — Firebase auth may not be configured on the server, or the token is invalid." });
  }

  const result = await completeLogin(normalizePhone(phoneE164));
  res.json(result);
});

router.post("/register", requireAuth, async (req, res) => {
  if (req.auth?.role !== "FARMER") return res.status(403).json({ error: "Only farmers can register a profile" });

  const schema = z.object({
    name: z.string().min(1),
    landSizeAcres: z.number().nonnegative(),
    primaryCrop: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
    village: z.string().min(1),
    district: z.string().min(1),
    state: z.string().min(1),
    preferredLanguage: z.enum(["hi", "ta", "te", "kn", "en"])
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const farmer = await prisma.farmer.update({ where: { id: req.auth.sub }, data: parsed.data });
  res.json({ farmer });
});

export default router;
