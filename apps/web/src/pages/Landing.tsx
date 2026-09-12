import { useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { LANDING_COPY, LANGUAGE_OPTIONS, type LandingLang } from "./landingCopy";
import { useLanguage } from "../context/LanguageContext";

export default function Landing() {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage();
  const copy = LANDING_COPY[lang];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-3">
            <select
              aria-label="Choose language"
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={lang}
              onChange={(e) => setLang(e.target.value as LandingLang)}
            >
              {LANGUAGE_OPTIONS.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
            <button
              className="text-sm font-semibold text-brand-700 hover:text-brand-800 px-3 py-2"
              onClick={() => navigate("/login")}
            >
              {copy.ctaSecondary}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <p className="inline-block text-xs sm:text-sm font-semibold text-brand-700 bg-brand-100 rounded-full px-4 py-1.5 mb-6">
            {copy.tagline}
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight max-w-3xl mx-auto leading-tight">
            {copy.heroTitle}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mt-6">
            {copy.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg shadow-brand-600/20"
              onClick={() => navigate("/login")}
            >
              {copy.ctaPrimary} →
            </button>
            <button
              className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-lg px-8 py-4 rounded-xl"
              onClick={() => navigate("/login")}
            >
              {copy.ctaSecondary}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-8 max-w-xl mx-auto">{copy.trust}</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">{copy.featuresHeading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {copy.features.map((f, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">{copy.howHeading}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {copy.steps.map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-11 h-11 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                  {i + 1}
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{s.title}</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">{copy.audienceHeading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {copy.audiences.map((a, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">{a.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1.5">{a.title}</h3>
              <p className="text-sm text-gray-500">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{copy.heroTitle}</h2>
          <button
            className="bg-white text-brand-700 font-semibold text-lg px-8 py-4 rounded-xl shadow-lg mt-2"
            onClick={() => navigate("/login")}
          >
            {copy.ctaPrimary} →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Brand size="sm" />
          <p className="text-xs text-gray-400 text-center">{copy.footerNote}</p>
        </div>
      </footer>
    </div>
  );
}
