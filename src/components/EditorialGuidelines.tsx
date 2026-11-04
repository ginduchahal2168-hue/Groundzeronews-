import React from 'react';
import { useNews } from '../context/NewsContext';
import { Shield, CheckCircle, AlertCircle, FileCheck, ArrowLeft } from 'lucide-react';

export const EditorialGuidelines: React.FC = () => {
  const { setActiveView } = useNews();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in duration-200 text-slate-200">
      <button
        onClick={() => setActiveView('home')}
        className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to News Wire</span>
      </button>

      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4" />
            <span>Journalistic Constitution</span>
          </div>
          <h1 className="text-3xl font-black text-white font-['Plus_Jakarta_Sans']">
            Ground Zero News Editorial Standards & Verification Charter
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Tagline: <em>"Truth First. News Everywhere."</em>
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>1. Verification & Zero-Hallucination Policy</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Ground Zero News enforces strict factual verification. Wire dispatches synthesized by AI are restricted to confirmed wire sources (e.g., Reuters, Press Trust of India, Associated Press, official press disclosures). Our proprietary AI models are mathematically constrained against inventing quotes, figures, casualty counts, or unverified claims.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span>2. Distinction of Confirmed vs. Developing Reports</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            During live breaking events, initial reports are visibly tagged with the amber <strong>DEVELOPING REPORT</strong> badge. Articles remain in this status until multiple primary corroborating sources or official communiqués are validated by our senior editorial desk.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            <span>3. Multilingual Translation Fidelity</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Translations into all 19 supported languages (Punjabi, Hindi, Urdu, Bengali, Assamese, Tamil, Telugu, Arabic, French, etc.) prioritize semantic precision and contextual nuance. Native scripts are respected, and transliterated proper nouns are audited for regional accuracy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-400" />
            <span>4. Corrections and Right of Reply</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            In the event of an inadvertent factual error, Ground Zero News publishes an explicit correction notice at the top of the revised article detailing what was corrected, the time of correction, and the verified facts. Requests for correction may be lodged directly via <code className="text-red-400">editorial@groundzeronews.org</code>.
          </p>
        </section>
      </div>
    </div>
  );
};
