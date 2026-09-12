import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { Brand } from "../../components/Brand";
import { LogoutButton } from "../../components/NavButtons";
import { HeroGlow, WaveDivider, EmptyCrateIcon } from "../../components/decorative";
import { LANGUAGE_OPTIONS, type LandingLang } from "../landingCopy";

interface BookingSummary {
  id: string;
  tokenNumber: string;
  status: string;
  crop: string;
  quantityQtl: number;
  centre: { name: string };
  slot: { date: string; startTime: string };
}

const STATUS_COLOR: Record<string, string> = {
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_QUEUE: "bg-indigo-100 text-indigo-700",
  ARRIVED: "bg-purple-100 text-purple-700",
  PROCESSING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PAID: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-200 text-gray-600",
  NO_SHOW: "bg-red-100 text-red-700"
};

export default function FarmerHome() {
  const { farmer, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/bookings/mine").then(({ data }) => {
      setBookings(data.bookings);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white bg-dot-grid">
      {/* Hero */}
      <div className="relative bg-brand-gradient pb-10 overflow-hidden">
        <HeroGlow />
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2">
            <Brand dark size="sm" />
            <div className="flex items-center gap-2 shrink-0">
              <select
                aria-label="Choose language"
                className="text-xs font-medium border border-white/25 rounded-lg px-2 py-1.5 bg-white/15 text-white backdrop-blur [&>option]:text-gray-900"
                value={lang}
                onChange={(e) => setLang(e.target.value as LandingLang)}
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
              <LogoutButton dark onClick={logout} />
            </div>
          </div>
          <div className="mt-8 mb-2">
            <h1 className="text-3xl font-display font-extrabold text-white break-words leading-tight">
              {t.farmerHome.greeting}, {farmer?.name || "Farmer"}
            </h1>
            {(farmer?.village || farmer?.state) && (
              <p className="text-sm text-brand-50/90 mt-1.5 flex items-center gap-1">
                <span aria-hidden>📍</span>
                {[farmer?.village, farmer?.state].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>
      <WaveDivider />

      <div className="max-w-xl mx-auto px-4 sm:px-6 -mt-2">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            className="btn-primary py-6 text-base flex flex-col items-center gap-2.5"
            onClick={() => navigate("/farmer/book")}
          >
            <span className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">📅</span>
            <span>{t.farmerHome.bookSlot}</span>
          </button>
          <button
            className="card py-6 text-base font-semibold text-brand-700 hover:shadow-soft hover:-translate-y-0.5 transition flex flex-col items-center gap-2.5"
            onClick={() => navigate("/farmer/voice")}
          >
            <span className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-2xl">🎙</span>
            <span>{t.farmerHome.bookByVoice}</span>
          </button>
        </div>

        <h2 className="font-display font-bold text-gray-800 mb-3">{t.farmerHome.yourBookings}</h2>
        {loading && <p className="text-gray-400">{t.farmerHome.loading}</p>}
        {!loading && bookings.length === 0 && (
          <div className="card p-8 text-center text-gray-400">
            <EmptyCrateIcon className="w-16 h-16 mx-auto mb-3" />
            <p>{t.farmerHome.noBookings}</p>
          </div>
        )}
        <div className="space-y-3 pb-10">
          {bookings.map((b) => (
            <Link
              to={`/farmer/booking/${b.id}`}
              key={b.id}
              className="card flex items-center gap-4 p-4 hover:shadow-soft hover:-translate-y-0.5 transition"
            >
              <div className="w-11 h-11 shrink-0 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl">
                🌾
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg font-display leading-tight">{b.tokenNumber}</p>
                <p className="text-sm text-gray-600 truncate">{b.centre.name}</p>
                <p className="text-xs text-gray-400">{b.slot.date} · {b.slot.startTime} · {b.crop} · {b.quantityQtl} qtl</p>
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${STATUS_COLOR[b.status] ?? "bg-gray-100"}`}>
                {b.status.replace("_", " ")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
