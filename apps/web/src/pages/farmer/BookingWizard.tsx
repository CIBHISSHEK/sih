import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { REGISTER_COPY } from "../registerCopy";
import { BackButton } from "../../components/NavButtons";
import type { CentreCandidate, RiskCheckResult } from "@msp/shared";

// Local-calendar-day string — not toISOString(), which converts to UTC first
// and can shift the date by a day in timezones ahead of UTC (e.g. IST).
function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function tomorrowDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return localDateStr(d);
}

type Step = "crop" | "harvest" | "risk" | "recommend" | "confirm";

const STEP_ORDER: Step[] = ["crop", "harvest", "risk", "recommend"];
const CROPS = ["paddy", "wheat", "maize"];

// Downscale client-side before sending — a full-resolution phone photo can be
// several MB and there's no need for more detail than a ~900px edge gives
// the heuristic analysis on the other end.
function resizeImageToDataUrl(file: File, maxDim = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export default function BookingWizard() {
  const { farmer } = useAuth();
  const { lang, t } = useLanguage();
  const cropCopy = REGISTER_COPY[lang].crops;
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("crop");

  const [crop, setCrop] = useState("paddy");
  const [quantityQtl, setQuantityQtl] = useState(10);
  const [date, setDate] = useState(localDateStr());
  const [daysSinceHarvest, setDaysSinceHarvest] = useState(2);
  const [storage, setStorage] = useState<"OPEN" | "COVERED">("COVERED");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  const [risk, setRisk] = useState<RiskCheckResult | null>(null);
  const [candidates, setCandidates] = useState<CentreCandidate[]>([]);
  const [selected, setSelected] = useState<CentreCandidate | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [expandedWhy, setExpandedWhy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Live GPS gives a more accurate "nearby" recommendation than the farmer's
  // registered village — falls back to the profile location silently if GPS
  // is unavailable/denied, so the flow never blocks on it.
  const [location, setLocation] = useState<{ lat: number; lng: number; source: "gps" | "profile" }>({
    lat: farmer!.lat,
    lng: farmer!.lng,
    source: "profile"
  });
  const [locatingGps, setLocatingGps] = useState(false);

  function tryUseGps() {
    if (!navigator.geolocation) return;
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, source: "gps" });
        setLocatingGps(false);
      },
      () => setLocatingGps(false),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  }

  function useRegisteredLocation() {
    setLocation({ lat: farmer!.lat, lng: farmer!.lng, source: "profile" });
  }

  // Auto-pick up GPS on load — but only if the browser already has (or will
  // grant) permission without us having to interrupt the farmer. Either way
  // they can switch it afterwards with the toggle below.
  useEffect(() => {
    if (navigator.permissions?.query) {
      navigator.permissions.query({ name: "geolocation" as PermissionName }).then((res) => {
        if (res.state !== "denied") tryUseGps();
      }).catch(() => tryUseGps());
    } else {
      tryUseGps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setPhotoBusy(true);
    setError(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setPhotoDataUrl(dataUrl);
    } catch {
      setError("Could not read that photo — please try another.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function runRiskCheck() {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/risk-check", {
        lat: location.lat,
        lng: location.lng,
        district: farmer!.district,
        crop,
        daysSinceHarvest,
        storage,
        photoBase64: photoDataUrl ?? undefined
      });
      setRisk(data);
      setStep("risk");
    } catch {
      setError("Could not run the risk check. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCandidates(lat: number, lng: number, forDate: string) {
    const { data } = await api.post("/recommendations", { lat, lng, crop, quantityQtl, date: forDate });
    return data.candidates as CentreCandidate[];
  }

  async function runRecommendations() {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      let result = await fetchCandidates(location.lat, location.lng, date);

      // Live GPS is great when you're actually near a centre, but every
      // seeded centre in this demo is around Thanjavur — so GPS from
      // anywhere else (a laptop in a different city, say) would otherwise
      // show an empty list. Fall back to the farmer's registered location,
      // which is guaranteed to have real, bookable centres nearby.
      if (result.length === 0 && location.source === "gps") {
        result = await fetchCandidates(farmer!.lat, farmer!.lng, date);
        if (result.length > 0) setLocation({ lat: farmer!.lat, lng: farmer!.lng, source: "profile" });
      }

      // If "today" was picked but every centre's operating hours for today
      // have already elapsed (no slot starts after now), every centre
      // legitimately returns empty — that's correct, but looks exactly like
      // "nothing is showing up" from the wizard. Roll forward to tomorrow
      // automatically rather than leaving a farmer staring at a blank list.
      if (result.length === 0 && date === localDateStr()) {
        const nextDay = tomorrowDateStr();
        const retry = await fetchCandidates(location.lat, location.lng, nextDay);
        if (retry.length > 0) {
          setDate(nextDay);
          setNotice(t.bookingWizard.noSlotsLeftToday);
          result = retry;
        }
      }

      setCandidates(result);
      if (result[0]) {
        setSelected(result[0]);
        setSelectedSlotId(result[0].availableSlots[0]?.id ?? null);
      }
      setStep("recommend");
    } catch {
      setError("Could not fetch recommendations.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmBooking() {
    if (!selected || !selectedSlotId || !risk) return;
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/bookings", {
        centreId: selected.centre.id,
        slotId: selectedSlotId,
        crop,
        quantityQtl,
        bookedVia: "APP",
        riskSnapshot: { riskLevel: risk.riskLevel, riskScore: risk.riskScore, factors: risk.factors },
        recommendationSnapshot: { score: selected.score, predictedWaitMin: selected.predictedWaitMin, breakdown: selected.breakdown }
      });
      navigate(`/farmer/booking/${data.booking.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || "That slot was just taken by another booking — please pick a different one.");
      runRecommendations();
    } finally {
      setLoading(false);
    }
  }

  const riskColor =
    risk?.riskLevel === "HIGH" ? "bg-red-50 border-red-300 text-red-800" :
    risk?.riskLevel === "MEDIUM" ? "bg-amber-50 border-amber-300 text-amber-800" :
    "bg-emerald-50 border-emerald-300 text-emerald-800";

  const stepIdx = STEP_ORDER.indexOf(step);

  return (
    <div className="min-h-screen max-w-lg mx-auto px-4 py-6">
      <BackButton onClick={() => navigate("/farmer")} label={t.common.back} />
      <h1 className="text-xl font-display font-bold text-gray-900 mb-3">{t.bookingWizard.title}</h1>

      {stepIdx >= 0 && (
        <div className="flex items-center gap-1.5 mb-5">
          {STEP_ORDER.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= stepIdx ? "bg-brand-600" : "bg-gray-200"}`} />
          ))}
        </div>
      )}

      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}
      {notice && <div className="bg-amber-50 text-amber-800 text-sm rounded-lg px-3 py-2 mb-4">{notice}</div>}

      {step === "crop" && (
        <div className="card p-6 space-y-4">
          <div className={`text-xs rounded-lg px-3 py-2 ${location.source === "gps" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            <span className="flex items-center gap-1.5">
              📍 {locatingGps ? t.bookingWizard.locatingGps : location.source === "gps" ? t.bookingWizard.usingGpsLocation : t.bookingWizard.usingProfileLocation}
            </span>
            {!locatingGps && (
              <div className="mt-1.5 flex gap-2">
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded-full font-semibold transition ${location.source === "gps" ? "bg-emerald-600 text-white" : "bg-white border border-current"}`}
                  onClick={tryUseGps}
                >
                  {t.bookingWizard.retryGps}
                </button>
                <button
                  type="button"
                  className={`px-2.5 py-1 rounded-full font-semibold transition ${location.source === "profile" ? "bg-amber-600 text-white" : "bg-white border border-current"}`}
                  onClick={useRegisteredLocation}
                >
                  {t.bookingWizard.useRegisteredVillage}
                </button>
              </div>
            )}
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.bookingWizard.cropLabel}</span>
            <select className="input-field mt-1 text-lg" value={crop} onChange={(e) => setCrop(e.target.value)}>
              {CROPS.map((c) => <option key={c} value={c}>{cropCopy[c as keyof typeof cropCopy]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.bookingWizard.quantityLabel}</span>
            <input type="number" min={1} className="input-field mt-1 text-lg" value={quantityQtl} onChange={(e) => setQuantityQtl(Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.bookingWizard.dateLabel}</span>
            <input type="date" className="input-field mt-1 text-lg" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <button className="btn-primary w-full py-3 text-lg" onClick={() => setStep("harvest")}>
            {t.bookingWizard.next}
          </button>
        </div>
      )}

      {step === "harvest" && (
        <div className="card p-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.bookingWizard.daysSinceHarvestLabel}</span>
            <input type="number" min={0} className="input-field mt-1 text-lg" value={daysSinceHarvest} onChange={(e) => setDaysSinceHarvest(Number(e.target.value))} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.bookingWizard.storageLabel}</span>
            <div className="flex gap-3 mt-1">
              {(["OPEN", "COVERED"] as const).map((s) => (
                <button
                  key={s}
                  className={`flex-1 py-3 rounded-lg font-semibold border-2 ${storage === s ? "border-brand-600 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-500"}`}
                  onClick={() => setStorage(s)}
                >
                  {s === "OPEN" ? t.bookingWizard.open : t.bookingWizard.covered}
                </button>
              ))}
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700">{t.bookingWizard.uploadPhotoLabel}</span>
            <p className="text-xs text-gray-400 mt-0.5 mb-2">{t.bookingWizard.uploadPhotoHint}</p>

            {photoDataUrl ? (
              <div className="flex items-center gap-3">
                <img src={photoDataUrl} alt="Produce preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-full transition cursor-pointer text-center">
                    {t.bookingWizard.retakePhoto}
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoChange} />
                  </label>
                  <button
                    type="button"
                    className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-full transition"
                    onClick={() => setPhotoDataUrl(null)}
                  >
                    {t.bookingWizard.removePhoto}
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-500 font-medium cursor-pointer hover:border-brand-400 hover:text-brand-600 transition">
                {photoBusy ? t.common.loading : `📷 ${t.bookingWizard.uploadPhotoLabel}`}
                <input type="file" accept="image/*" capture="environment" className="hidden" disabled={photoBusy} onChange={handlePhotoChange} />
              </label>
            )}
          </label>

          <button disabled={loading} className="btn-primary w-full py-3 text-lg" onClick={runRiskCheck}>
            {loading ? t.bookingWizard.checking : t.bookingWizard.checkRisk}
          </button>
        </div>
      )}

      {step === "risk" && risk && (
        <div className="space-y-4">
          <div className={`rounded-2xl border-2 p-6 shadow-soft ${riskColor}`}>
            <p className="text-sm font-semibold uppercase tracking-wide opacity-70">{t.bookingWizard.riskPreCheckLabel}</p>
            <p className="text-3xl font-extrabold mt-1">{risk.riskLevel}</p>
            <p className="text-sm opacity-80 mt-1">{risk.weatherSummary}</p>
            <p className="text-xs opacity-60 mt-2">
              Source: {risk.source === "ml" ? "ML prediction" : "analytical fallback"}
              {risk.photoAnalysed && ` + ${t.bookingWizard.photoSignalLabel.toLowerCase()}`}
            </p>
            {photoDataUrl && !risk.photoAnalysed && (
              <p className="text-xs opacity-70 mt-1 italic">{t.bookingWizard.photoUnavailable}</p>
            )}
            <ul className="mt-4 space-y-1.5 text-sm">
              {(() => {
                const maxAbs = Math.max(...risk.factors.map((f) => Math.abs(f.contribution)), 0.0001);
                return risk.factors.map((f, i) => (
                  <li key={i}>
                    <div className="flex justify-between">
                      <span>{f.label}</span>
                      <span className="font-medium">{f.direction === "increases" ? "▲" : "▼"}</span>
                    </div>
                    <div className="w-full bg-black/10 rounded-full h-1.5 mt-0.5">
                      <div
                        className="h-1.5 rounded-full bg-current opacity-70"
                        style={{ width: `${Math.max(4, (Math.abs(f.contribution) / maxAbs) * 100)}%` }}
                      />
                    </div>
                  </li>
                ));
              })()}
            </ul>
          </div>
          <button disabled={loading} className="btn-primary w-full py-3 text-lg" onClick={runRecommendations}>
            {loading ? t.bookingWizard.findingCentres : t.bookingWizard.seeRecommendations}
          </button>
        </div>
      )}

      {step === "recommend" && (
        <div className="space-y-3">
          {candidates.length === 0 && <p className="text-gray-500">{t.bookingWizard.noCentresAvailable}</p>}
          {candidates.map((c) => (
            <div
              key={c.centre.id}
              className={`card p-4 border-2 cursor-pointer transition ${selected?.centre.id === c.centre.id ? "border-brand-600 shadow-soft" : "border-transparent"}`}
              onClick={() => { setSelected(c); setSelectedSlotId(c.availableSlots[0]?.id ?? null); }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{c.centre.name}</p>
                  <p className="text-sm text-gray-500">{c.distanceKm} {t.bookingWizard.kmAway} · {t.bookingWizard.queueLabel} {c.centre.queueLength} · {t.bookingWizard.waitLabel} ~{c.predictedWaitMin} min</p>
                </div>
                <span className="text-lg font-bold text-brand-700">{(c.score * 100).toFixed(0)}</span>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
                <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${Math.min(100, (c.centre.remainingCapacityQtl / c.centre.dailyCapacityQtl) * 100)}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{c.centre.remainingCapacityQtl.toFixed(0)} / {c.centre.dailyCapacityQtl} qtl available · source: {c.source}</p>

              <button
                className="text-xs text-brand-700 underline mt-2"
                onClick={(e) => { e.stopPropagation(); setExpandedWhy(expandedWhy === c.centre.id ? null : c.centre.id); }}
              >
                {expandedWhy === c.centre.id ? t.bookingWizard.hideReasoning : t.bookingWizard.whyThisCentre}
              </button>

              {expandedWhy === c.centre.id && (
                <div className="mt-2 space-y-1 border-t pt-2">
                  {c.breakdown.map((b, i) => (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between">
                        <span>{b.label} ({b.rawValue.toFixed(1)})</span>
                        <span className={b.contribution >= 0 ? "text-emerald-600" : "text-red-600"}>
                          {b.contribution >= 0 ? "+" : ""}{(b.contribution * 100).toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${b.contribution >= 0 ? "bg-emerald-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min(100, Math.abs(b.contribution) * 300)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selected?.centre.id === c.centre.id && c.availableSlots.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.availableSlots.map((s) => (
                    <button
                      key={s.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedSlotId(s.id); }}
                      className={`text-xs px-3 py-1.5 rounded-full border ${selectedSlotId === s.id ? "bg-brand-600 text-white border-brand-600" : "border-gray-300 text-gray-600"}`}
                    >
                      {s.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {selected && (
            <button disabled={loading || !selectedSlotId} className="btn-primary w-full py-3 text-lg" onClick={confirmBooking}>
              {loading ? t.bookingWizard.bookingInProgress : `${t.bookingWizard.confirmBookingPrefix} ${selected.centre.name}`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
