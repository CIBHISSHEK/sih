import axios from "axios";
import { env } from "../../env";

export interface SttProvider {
  transcribe(audio: Buffer, lang: string): Promise<string>;
}

export interface TtsProvider {
  synthesize(text: string, lang: string): Promise<Buffer | null>;
}

// Mock mode is the default and what the demo runs on: the browser does STT
// via the Web Speech API and posts back plain `text`, and does TTS locally
// via speechSynthesis — so this provider is never actually asked to do audio
// work, only exists to keep the adapter interface honest.
export const MockProvider: SttProvider & TtsProvider = {
  async transcribe() {
    return "";
  },
  async synthesize() {
    return null;
  }
};

const SARVAM_BASE_URL = "https://api.sarvam.ai";

export const SarvamProvider: SttProvider & TtsProvider = {
  async transcribe(audio: Buffer, lang: string): Promise<string> {
    try {
      const form = new FormData();
      form.append("file", new Blob([new Uint8Array(audio)]), "audio.wav");
      form.append("language_code", lang);
      const { data } = await axios.post(`${SARVAM_BASE_URL}/speech-to-text`, form, {
        headers: { "api-subscription-key": env.SARVAM_API_KEY },
        timeout: 5000
      });
      return data.transcript ?? "";
    } catch (err) {
      console.error("Sarvam STT failed, no transcript available:", err);
      return "";
    }
  },
  async synthesize(text: string, lang: string): Promise<Buffer | null> {
    try {
      const { data } = await axios.post(
        `${SARVAM_BASE_URL}/text-to-speech`,
        { inputs: [text], target_language_code: lang },
        { headers: { "api-subscription-key": env.SARVAM_API_KEY }, timeout: 5000 }
      );
      const base64Audio = data.audios?.[0];
      return base64Audio ? Buffer.from(base64Audio, "base64") : null;
    } catch (err) {
      console.error("Sarvam TTS failed, falling back to no audio:", err);
      return null;
    }
  }
};

export function getVoiceProvider(): SttProvider & TtsProvider {
  return env.VOICE_PROVIDER === "sarvam" ? SarvamProvider : MockProvider;
}
