import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { auth as firebaseAuth, isFirebaseConfigured } from "../firebase";
import { Brand } from "../components/Brand";
import { LANGUAGE_OPTIONS, type LandingLang } from "./landingCopy";

const PHONE_DIGITS = 10;
const COUNTRY_CODE = "+91";

function mapFirebaseError(code: string | undefined, t: ReturnType<typeof useLanguage>["t"]["login"]): string {
  if (code === "auth/invalid-verification-code") return t.invalidOtp;
  if (code === "auth/code-expired") return t.otpExpired;
  if (code === "auth/too-many-requests" || code === "auth/quota-exceeded") return t.tooManyAttempts;
  if (code === "auth/invalid-phone-number") return t.incompletePhone;
  return t.firebaseError;
}

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [mockOtp, setMockOtp] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverFirebaseEnabled, setServerFirebaseEnabled] = useState(false);
  const { login } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  // Real SMS only turns on when BOTH sides are configured: the browser has
  // Firebase web config (apps/web/.env), and the server has a service account
  // to verify the resulting ID token (apps/api/.env). Either half missing —
  // including a bare `npm install` with no setup done — falls back to the
  // always-available mock flow rather than dead-ending the login screen.
  useEffect(() => {
    api.get("/auth/config").then(({ data }) => setServerFirebaseEnabled(data.firebaseEnabled)).catch(() => setServerFirebaseEnabled(false));
  }, []);
  const useRealOtp = isFirebaseConfigured && serverFirebaseEnabled;

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneComplete = phoneDigits.length === PHONE_DIGITS;

  function onPhoneChange(value: string) {
    setPhone(value.replace(/\D/g, "").slice(0, PHONE_DIGITS));
  }

  async function requestOtpMock() {
    const { data } = await api.post("/auth/otp/request", { phone: phoneDigits });
    setMockOtp(data.otp);
    setOtp(data.otp);
    setStep("otp");
  }

  async function requestOtpFirebase() {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(firebaseAuth!, "recaptcha-container", { size: "invisible" });
    }
    const confirmation = await signInWithPhoneNumber(firebaseAuth!, `${COUNTRY_CODE}${phoneDigits}`, recaptchaRef.current);
    confirmationRef.current = confirmation;
    setMockOtp(null);
    setOtp("");
    setStep("otp");
  }

  async function requestOtp() {
    if (!isPhoneComplete) {
      setError(t.login.incompletePhone);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      if (useRealOtp) await requestOtpFirebase();
      else await requestOtpMock();
    } catch (err: any) {
      if (useRealOtp) {
        setError(mapFirebaseError(err?.code, t.login));
      } else {
        const serverMessage = err?.response?.data?.error;
        const isNetworkError = !err?.response;
        setError(isNetworkError ? t.login.cantReachServer : serverMessage || t.login.cantReachServer);
      }
    } finally {
      setLoading(false);
    }
  }

  async function completeLoginResponse(data: { token: string; role: "FARMER" | "STAFF" | "ADMIN"; isNewUser: boolean; farmer: any }) {
    login(data.token, data.role, data.farmer);
    if (data.role === "ADMIN") navigate("/admin");
    else if (data.role === "STAFF") navigate("/staff");
    else if (data.isNewUser) navigate("/register");
    else navigate("/farmer");
  }

  async function verifyOtpMock() {
    const { data } = await api.post("/auth/otp/verify", { phone: phoneDigits, otp });
    await completeLoginResponse(data);
  }

  async function verifyOtpFirebase() {
    const credential = await confirmationRef.current!.confirm(otp);
    const idToken = await credential.user.getIdToken();
    const { data } = await api.post("/auth/firebase-login", { idToken });
    await completeLoginResponse(data);
  }

  async function verifyOtp() {
    setError(null);
    setLoading(true);
    try {
      if (useRealOtp) await verifyOtpFirebase();
      else await verifyOtpMock();
    } catch (err: any) {
      if (useRealOtp) {
        setError(mapFirebaseError(err?.code, t.login));
      } else {
        const isNetworkError = !err?.response;
        setError(isNetworkError ? t.login.cantReachServer : t.login.invalidOtp);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-accent-200/40 blur-3xl" />
      <div id="recaptcha-container" />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-card border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="inline-block">
            <Brand />
          </Link>
          <select
            aria-label="Choose language"
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
            value={lang}
            onChange={(e) => setLang(e.target.value as LandingLang)}
          >
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-500 mb-6">{t.login.tagline}</p>

        {step === "phone" && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.login.phoneLabel}</span>
              <div className="mt-1 flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-lg">{COUNTRY_CODE}</span>
                <input
                  className="input-field rounded-l-none text-lg tracking-wide"
                  type="tel"
                  inputMode="numeric"
                  autoFocus
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && isPhoneComplete && requestOtp()}
                />
              </div>
              <span className="text-xs text-gray-400">{t.login.digitsOf(phoneDigits.length, PHONE_DIGITS)}</span>
            </label>
            <button
              className="btn-primary w-full py-3 text-lg"
              disabled={!isPhoneComplete || loading}
              onClick={requestOtp}
            >
              {loading ? t.login.sending : t.login.sendOtp}
            </button>
            {!useRealOtp && <p className="text-xs text-gray-400">{t.login.demoNote}</p>}
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            {mockOtp && !useRealOtp && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-3 py-2">
                <span className="font-semibold">{t.login.demoModeTag}</span> — {t.login.otpPrefilled} <b>{mockOtp}</b>
              </div>
            )}
            {useRealOtp && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg px-3 py-2">
                {t.login.smsSentTo} <b>{COUNTRY_CODE}{phoneDigits}</b>
              </div>
            )}
            <label className="block">
              <span className="text-sm font-medium text-gray-700">{t.login.enterOtp}</span>
              <input
                className="input-field mt-1 text-lg tracking-widest text-center"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                maxLength={6}
                autoFocus
              />
            </label>
            <button
              className="btn-primary w-full py-3 text-lg"
              disabled={otp.length !== 6 || loading}
              onClick={verifyOtp}
            >
              {loading ? t.login.verifying : t.login.verify}
            </button>
            <button
              className="btn-secondary w-full py-2.5 bg-gray-100 border-gray-200 hover:bg-gray-200"
              onClick={() => setStep("phone")}
            >
              {t.login.changePhone}
            </button>
          </div>
        )}

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}
