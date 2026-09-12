import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useLanguage } from "../../context/LanguageContext";
import { BackButton } from "../../components/NavButtons";

interface TurnLog {
  who: "system" | "farmer";
  text: string;
}

const SPEECH_LANG: Record<string, string> = { hi: "hi-IN", ta: "ta-IN", te: "te-IN", kn: "kn-IN", en: "en-IN" };

// Chrome/Edge populate speechSynthesis.getVoices() asynchronously — calling
// it before the "voiceschanged" event has fired at least once often returns
// an empty list, which is one of the more common reasons TTS silently
// produces no audio on a page's first speak() call.
function getVoicesWhenReady(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) return resolve(existing);
    const onChange = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", onChange);
    // Some browsers never fire voiceschanged at all — don't wait forever.
    setTimeout(() => {
      window.speechSynthesis.removeEventListener("voiceschanged", onChange);
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[], targetLang: string): SpeechSynthesisVoice | undefined {
  const exact = voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase());
  if (exact) return exact;
  const prefix = targetLang.split("-")[0].toLowerCase();
  return voices.find((v) => v.lang.toLowerCase().startsWith(prefix));
}

export default function VoiceBooking() {
  const navigate = useNavigate();
  const { lang: uiLang, t } = useLanguage();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [log, setLog] = useState<TurnLog[]>([]);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [speechUnavailable, setSpeechUnavailable] = useState(false);
  const [noVoiceForLang, setNoVoiceForLang] = useState<string | null>(null);
  // The voice conversation's own spoken language — starts from whatever the
  // farmer already chose for the app UI, then updates once the conversation
  // itself asks/confirms a language, since a voice session can diverge from it.
  const [lang, setLang] = useState(uiLang);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  async function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setSpeechUnavailable(true);
      return;
    }
    try {
      const targetLang = SPEECH_LANG[lang] ?? "en-IN";
      const voices = await getVoicesWhenReady();
      const voice = pickVoice(voices, targetLang);

      // Browsers only speak languages whose voice is actually installed on
      // the OS — this is a device limitation, not a bug in the app. Windows
      // ships English by default; Hindi/Tamil/Telugu/Kannada voices need to
      // be added under Settings > Time & Language > Speech > Add voices.
      if (!voice && lang !== "en") setNoVoiceForLang(lang);
      else if (voice) setNoVoiceForLang(null);

      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = targetLang;
      if (voice) utter.voice = voice;
      utter.onerror = () => setSpeechUnavailable(true);

      window.speechSynthesis.cancel();
      // Speaking in the same tick as cancel() can leave Chrome's synthesis
      // queue stuck (a known browser bug) — yielding one tick first reliably
      // avoids it.
      setTimeout(() => window.speechSynthesis.speak(utter), 50);
    } catch {
      setSpeechUnavailable(true);
    }
  }

  function pushSystem(text: string) {
    setLog((l) => [...l, { who: "system", text }]);
  }

  async function startSession() {
    setBusy(true);
    try {
      const { data } = await api.post("/voice/session");
      setSessionId(data.sessionId);
      setLog([{ who: "system", text: data.nextPrompt }]);
      speak(data.nextPrompt);
    } catch {
      pushSystem(t.voiceBooking.somethingWentWrong);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    startSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendTurn(text: string) {
    if (!sessionId || !text.trim() || busy) return;
    setLog((l) => [...l, { who: "farmer", text }]);
    setTextInput("");
    setBusy(true);
    try {
      const { data } = await api.post("/voice/turn", { sessionId, text });

      if (data.filledFields?.lang) setLang(data.filledFields.lang);
      pushSystem(data.nextPrompt);
      speak(data.nextPrompt);

      if (data.done) {
        setDone(true);
        if (data.booking) {
          setTimeout(() => navigate(`/farmer/booking/${data.booking.id}`), 3500);
        }
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // The in-memory session expired (server restart, or 30+ min idle) —
        // restart transparently rather than leaving the conversation stuck.
        pushSystem(t.voiceBooking.restartingSession);
        setSessionId(null);
        await startSession();
      } else {
        pushSystem(t.voiceBooking.somethingWentWrong);
      }
    } finally {
      setBusy(false);
    }
  }

  // Requesting the mic directly (rather than just calling recognition.start())
  // gets us a real, catchable reason when nothing happens: SpeechRecognition's
  // own permission handling is inconsistent across browsers and, inside an
  // embedded webview/preview without microphone access granted to its origin,
  // often fails completely silently — no prompt, no error event, nothing.
  async function startListening() {
    if (!SpeechRecognitionCtor || listening || busy) return;

    if (!window.isSecureContext) {
      pushSystem(t.voiceBooking.insecureContext);
      return;
    }

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop()); // we only needed the permission grant
      } catch (err: any) {
        if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
          pushSystem(t.voiceBooking.noMicFound);
        } else if (err?.name === "NotAllowedError" || err?.name === "SecurityError" || err?.name === "PermissionDeniedError") {
          pushSystem(t.voiceBooking.micDenied);
        } else {
          pushSystem(t.voiceBooking.recognitionError);
        }
        return;
      }
    }

    let gotResult = false;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = SPEECH_LANG[lang] ?? "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      gotResult = true;
      const transcript = event.results[0][0].transcript;
      sendTurn(transcript);
    };
    recognition.onend = () => {
      setListening(false);
      if (!gotResult) pushSystem(t.voiceBooking.noSpeechDetected);
    };
    recognition.onerror = (event: any) => {
      gotResult = true; // suppress the onend "no speech" message — this is a more specific one
      setListening(false);
      const code = event?.error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        pushSystem(t.voiceBooking.micDenied);
      } else if (code === "no-speech") {
        pushSystem(t.voiceBooking.noSpeechDetected);
      } else {
        pushSystem(t.voiceBooking.recognitionError);
      }
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setListening(false);
      pushSystem(t.voiceBooking.recognitionError);
    }
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6 flex flex-col">
      <BackButton onClick={() => navigate("/farmer")} label={t.common.back} />
      <h1 className="text-xl font-display font-bold text-gray-900 mb-1">{t.voiceBooking.title}</h1>
      <p className="text-sm text-gray-500 mb-4">{t.voiceBooking.subtitle}</p>

      <div className="flex-1 card p-4 space-y-3 overflow-y-auto mb-4" style={{ minHeight: 300 }}>
        {log.map((entry, i) => (
          <div key={i} className={`flex items-end gap-1.5 ${entry.who === "farmer" ? "justify-end" : "justify-start"}`}>
            {entry.who === "system" && (
              <button
                aria-label="Play audio"
                title="Play audio"
                className="shrink-0 w-7 h-7 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 flex items-center justify-center transition"
                onClick={() => speak(entry.text)}
              >
                🔊
              </button>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${entry.who === "farmer" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-800"}`}>
              {entry.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-gray-100 text-gray-400">…</div>
          </div>
        )}
      </div>

      {speechUnavailable && (
        <p className="text-xs text-amber-600 text-center mb-2">
          {t.voiceBooking.noSpeechSupport}
        </p>
      )}
      {noVoiceForLang && (
        <p className="text-xs text-amber-600 text-center mb-2 bg-amber-50 rounded-lg px-3 py-2">
          {t.voiceBooking.noVoiceForLanguage}
        </p>
      )}

      {!done && (
        <div className="space-y-3">
          <button
            disabled={!SpeechRecognitionCtor || listening || busy}
            onClick={startListening}
            className="btn-primary w-full py-4 rounded-full text-lg flex items-center justify-center gap-2 disabled:opacity-40"
          >
            🎙 {listening ? t.voiceBooking.listening : t.voiceBooking.tapToSpeak}
          </button>
          {!SpeechRecognitionCtor && (
            <p className="text-xs text-amber-600 text-center">{t.voiceBooking.noSpeechSupport}</p>
          )}
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder={t.voiceBooking.typePlaceholder}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendTurn(textInput)}
              disabled={busy}
            />
            <button className="btn-primary px-5 disabled:opacity-40" disabled={busy} onClick={() => sendTurn(textInput)}>
              {t.voiceBooking.send}
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="text-center text-gray-500 text-sm">
          <button className="mt-2 underline text-brand-700" onClick={() => navigate("/farmer")}>{t.voiceBooking.backToHome}</button>
        </div>
      )}
    </div>
  );
}
