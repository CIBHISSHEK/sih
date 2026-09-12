import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Brand } from "../components/Brand";
import { LANGUAGE_OPTIONS, type LandingLang } from "./landingCopy";
import { REGISTER_COPY } from "./registerCopy";
import { INDIAN_STATES } from "./indianStates";

export default function Register() {
  const { setFarmer } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const [form, setForm] = useState({
    name: "",
    landSizeAcres: "1.5",
    primaryCrop: "paddy",
    state: "",
    village: "",
    district: "Thanjavur",
    lat: "10.787",
    lng: "79.1378"
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoState, setGeoState] = useState<"idle" | "locating" | "done" | "error">("idle");

  const copy = REGISTER_COPY[lang];

  // Turn GPS coordinates into a state / district / village so those fields
  // fill in automatically. BigDataCloud's client endpoint is free, needs no
  // key and is CORS-friendly; if it (or the network) fails we still keep the
  // coordinates and the farmer fills the names in by hand.
  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (!res.ok) return;
      const d = await res.json();
      const subdivision: string = d.principalSubdivision || "";
      const matchedState = INDIAN_STATES.find(
        (s) =>
          s.toLowerCase() === subdivision.toLowerCase() ||
          subdivision.toLowerCase().includes(s.toLowerCase()) ||
          s.toLowerCase().includes(subdivision.toLowerCase())
      );
      const district: string = d.city || d.localityInfo?.administrative?.slice(-2, -1)?.[0]?.name || "";
      const village: string = d.locality && d.locality !== d.city ? d.locality : "";
      setForm((f) => ({
        ...f,
        state: matchedState ?? f.state,
        district: district || f.district,
        village: village || f.village
      }));
    } catch {
      // offline / blocked — coordinates are still captured, names stay manual
    }
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setGeoState("error");
      return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setForm((f) => ({ ...f, lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) }));
        await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setGeoState("done");
      },
      () => setGeoState("error"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  }

  // Auto-capture on load only when the browser already has permission (so we
  // never pop an unexpected prompt); otherwise the farmer taps the button.
  useEffect(() => {
    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((res) => { if (res.state === "granted") captureLocation(); })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name: form.name,
        landSizeAcres: Number(form.landSizeAcres),
        primaryCrop: form.primaryCrop,
        village: form.village,
        district: form.district,
        state: form.state,
        preferredLanguage: lang,
        lat: Number(form.lat),
        lng: Number(form.lng)
      });
      setFarmer(data.farmer);
      navigate("/farmer");
    } catch {
      setError(copy.errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="relative w-full max-w-md card p-8 space-y-4">
        <Brand size="sm" />
        <h1 className="text-xl font-bold text-gray-900 pt-1">{copy.heading}</h1>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">{copy.fullName}</span>
          <input className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">{copy.state}</span>
          <select className="input-field mt-1" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
            <option value="" disabled>{copy.state}</option>
            {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">{copy.village}</span>
          <input className="input-field mt-1" value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{copy.landSize}</span>
            <input type="number" step="0.1" className="input-field mt-1" value={form.landSizeAcres} onChange={(e) => setForm({ ...form, landSizeAcres: e.target.value })} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{copy.primaryCrop}</span>
            <select className="input-field mt-1" value={form.primaryCrop} onChange={(e) => setForm({ ...form, primaryCrop: e.target.value })}>
              <option value="paddy">{copy.crops.paddy}</option>
              <option value="wheat">{copy.crops.wheat}</option>
              <option value="maize">{copy.crops.maize}</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">{copy.preferredLanguage}</span>
          <select
            className="input-field mt-1"
            value={lang}
            onChange={(e) => setLang(e.target.value as LandingLang)}
          >
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </label>

        <div>
          <button
            type="button"
            disabled={geoState === "locating"}
            className="btn-pill text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 disabled:opacity-60"
            onClick={captureLocation}
          >
            📍 {geoState === "locating" ? copy.saving : copy.useMyLocation}
          </button>
          <p
            className={`text-xs mt-1.5 ${
              geoState === "done" ? "text-emerald-600" : geoState === "error" ? "text-red-500" : "text-gray-400"
            }`}
          >
            {geoState === "done" && "✓ "}
            {geoState === "error"
              ? "Couldn't get your location — please pick your state and village manually."
              : `lat ${Number(form.lat).toFixed(4)}, lng ${Number(form.lng).toFixed(4)}`}
          </p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          className="btn-primary w-full py-3 text-lg"
          disabled={!form.name || !form.state || !form.village || loading}
          onClick={submit}
        >
          {loading ? copy.saving : copy.saveContinue}
        </button>
      </div>
    </div>
  );
}
