import { Router } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { createSession, getSession, saveSession } from "../services/voice/session";
import { processTurn, getInitialPrompt } from "../services/voice/stateMachine";
import { getVoiceProvider } from "../services/voice/providers";
import { env } from "../env";
import type { Language } from "@msp/shared";

const router = Router();
router.use(requireAuth, requireRole("FARMER"));

router.post("/session", async (req, res) => {
  const farmer = await prisma.farmer.findUniqueOrThrow({ where: { id: req.auth!.sub } });
  const session = createSession(randomUUID(), farmer.id, farmer.lat, farmer.lng, farmer.district || "Thanjavur");
  const greetingLang = (farmer.preferredLanguage as Language) || "en";
  res.json({ sessionId: session.id, nextPrompt: getInitialPrompt(greetingLang), state: session.state });
});

router.post("/turn", async (req, res) => {
  const schema = z.object({ sessionId: z.string(), audio: z.string().optional(), text: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "sessionId and either text or audio are required" });

  const session = getSession(parsed.data.sessionId);
  if (!session) return res.status(404).json({ error: "Voice session not found or expired" });

  let transcript = parsed.data.text ?? "";
  if (!transcript && parsed.data.audio) {
    const provider = getVoiceProvider();
    transcript = await provider.transcribe(Buffer.from(parsed.data.audio, "base64"), session.filledFields.lang ?? "en");
  }

  const result = await processTurn(session, transcript);
  saveSession(session);

  let promptAudioUrl: string | undefined;
  if (env.VOICE_PROVIDER === "sarvam") {
    const provider = getVoiceProvider();
    const audio = await provider.synthesize(result.nextPrompt, session.filledFields.lang ?? "en");
    if (audio) promptAudioUrl = `data:audio/wav;base64,${audio.toString("base64")}`;
  }

  res.json({
    transcript: result.transcript,
    nextPrompt: result.nextPrompt,
    promptAudioUrl,
    state: result.state,
    filledFields: result.filledFields,
    done: result.done,
    booking: result.booking
  });
});

export default router;
