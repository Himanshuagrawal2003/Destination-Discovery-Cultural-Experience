import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuSparkles, LuGlobe, LuBookOpen, LuTriangleAlert,
  LuShirt, LuMapPin, LuCompass, LuBookmark,
  LuCheck, LuX, LuMessageCircle, LuCamera, LuHand
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Safely parse JSON from raw AI text 
const safeParseGuide = (raw) => {
  if (!raw) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  try {
    const cleaned = String(raw)
      .replace(/```json/gi, '').replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

// Section config 
const SECTIONS = [
  {
    key: 'greetingsAndCustoms',
    label: 'Greetings & Customs',
    icon: LuCompass,
    color: 'amber',
    subKeys: {
      overview: { label: 'Overview', type: 'text' },
      dos: { label: 'Cultural Dos', type: 'do-list' },
      donts: { label: 'Cultural Don\'ts', type: 'dont-list' },
      phrases: { label: 'Local Phrases', type: 'phrase-list' },
    }
  },
  {
    key: 'religiousEtiquette',
    label: 'Religious Etiquette',
    icon: LuMapPin,
    color: 'purple',
    subKeys: {
      overview: { label: 'Overview', type: 'text' },
      dos: { label: 'Sacred Site Dos', type: 'do-list' },
      donts: { label: 'Sacred Site Don\'ts', type: 'dont-list' },
      keyPlaces: { label: 'Key Sacred Sites', type: 'place-list' },
    }
  },
  {
    key: 'clothingEtiquette',
    label: 'Clothing Etiquette',
    icon: LuShirt,
    color: 'blue',
    subKeys: {
      overview: { label: 'Overview', type: 'text' },
      dos: { label: 'Dress Dos', type: 'do-list' },
      donts: { label: 'Dress Don\'ts', type: 'dont-list' },
      climateTip: { label: 'Climate Tip', type: 'tip' },
      footwearTip: { label: 'Footwear Tip', type: 'tip' },
    }
  },
  {
    key: 'thingsToAvoid',
    label: 'Things to Avoid',
    icon: LuTriangleAlert,
    color: 'rose',
    subKeys: {
      overview: { label: 'Overview', type: 'text' },
      taboos: { label: 'Cultural Taboos', type: 'taboo-list' },
      gestures: { label: 'Offensive Gestures', type: 'gesture-list' },
      photographyRules: { label: 'Photography Rules', type: 'photo-list' },
    }
  },
];

const colorMap = {
  amber: {
    tab: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    tabActive: 'bg-amber-500 text-white shadow-amber-200/50 shadow-md',
    border: 'border-l-amber-500',
    badge: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800',
    icon: 'text-amber-500',
    do: 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    dont: 'bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
  },
  purple: {
    tab: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    tabActive: 'bg-purple-500 text-white shadow-purple-200/50 shadow-md',
    border: 'border-l-purple-500',
    badge: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800',
    icon: 'text-purple-500',
    do: 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    dont: 'bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
  },
  blue: {
    tab: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    tabActive: 'bg-blue-500 text-white shadow-blue-200/50 shadow-md',
    border: 'border-l-blue-500',
    badge: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500',
    do: 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    dont: 'bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
  },
  rose: {
    tab: 'bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    tabActive: 'bg-rose-500 text-white shadow-rose-200/50 shadow-md',
    border: 'border-l-rose-500',
    badge: 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800',
    icon: 'text-rose-500',
    do: 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    dont: 'bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
  },
};

// Sub-content renderers 
function RenderSubKey({ type, value, colors }) {
  if (!value) return null;

  if (type === 'text') {
    return (
      <p className="text-sm text-primary-900/80 dark:text-dark-muted leading-relaxed font-medium">
        {value}
      </p>
    );
  }

  if (type === 'tip') {
    return (
      <div className={`p-3.5 rounded-xl border ${colors.badge} text-sm text-primary-900/80 dark:text-dark-muted font-medium leading-relaxed`}>
        {value}
      </div>
    );
  }

  if (type === 'do-list') {
    const items = Array.isArray(value) ? value : [value];
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl ${colors.do} text-xs font-semibold`}>
            <LuCheck className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>{item}</span> </div>
        ))}
      </div>
    );
  }

  if (type === 'dont-list') {
    const items = Array.isArray(value) ? value : [value];
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl ${colors.dont} text-xs font-semibold`}>
            <LuX className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <span>{item}</span> </div>
        ))}
      </div>
    );
  }

  if (type === 'phrase-list') {
    const items = Array.isArray(value) ? value : [value];
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${colors.badge} text-xs font-semibold text-primary-900/80 dark:text-dark-muted`}>
            <LuMessageCircle className={`shrink-0 mt-0.5 ${colors.icon}`} />
            <span>{item}</span> </div>
        ))}
      </div>
    );
  }

  if (type === 'place-list') {
    const items = Array.isArray(value) ? value : [value];
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl border ${colors.badge} text-xs font-semibold text-primary-900/80 dark:text-dark-muted`}>
            <LuMapPin className={`shrink-0 mt-0.5 ${colors.icon}`} />
            <span>{item}</span> </div>
        ))}
      </div>
    );
  }

  if (type === 'taboo-list') {
    const items = Array.isArray(value) ? value : [value];
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
            <span className="shrink-0"></span>
            <span>{item}</span> </div>
        ))}
      </div>
    );
  }

  if (type === 'gesture-list') {
    const items = Array.isArray(value) ? value : [value];
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 text-xs font-semibold text-orange-700 dark:text-orange-300">
            <LuHand className="shrink-0 mt-0.5" />
            <span>{item}</span> </div>
        ))}
      </div>
    );
  }

  if (type === 'photo-list') {
    const items = Array.isArray(value) ? value : [value];
    return (
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/10 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <LuCamera className="shrink-0 mt-0.5" />
            <span>{item}</span> </div>
        ))}
      </div>
    );
  }

  // Fallback
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-1.5 list-disc list-inside text-xs text-primary-900/80 dark:text-dark-muted font-medium">
        {value.map((item, i) => <li key={i}>{String(item)}</li>)}
      </ul>
    );
  }

  return <p className="text-xs text-primary-900/70 dark:text-dark-muted">{String(value)}</p>;
}

// Main Component 
export default function AICulturalGuide() {
  const [isLoading, setIsLoading] = useState(false);
  const [culturalGuide, setCulturalGuide] = useState(null);
  const [activeTab, setActiveTab] = useState('greetingsAndCustoms');
  const [historyId, setHistoryId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { country: '', city: '' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setCulturalGuide(null);
    setHistoryId(null);
    setIsSaved(false);
    try {
      const res = await api.post('/ai/cultural-guide', data);
      const raw = res.data?.culturalGuide ?? res.data?.rawText ?? null;
      const parsed = safeParseGuide(raw) || safeParseGuide(res.data?.rawText);
      setCulturalGuide(parsed);
      setHistoryId(res.data.historyId || null);
      setActiveTab('greetingsAndCustoms');
      toast.success('Cultural guide ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate cultural guide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!historyId) { toast.error('No guide to save'); return; }
    if (!localStorage.getItem('cq_token')) { toast.error('Please login to save'); return; }
    setIsSaving(true);
    try {
      await api.put(`/ai/history/${historyId}`, { isSaved: !isSaved });
      setIsSaved(!isSaved);
      toast.success(!isSaved ? 'Saved to Bookmarks!' : 'Removed from Bookmarks');
    } catch {
      toast.error('Failed to update save status');
    } finally {
      setIsSaving(false);
    }
  };

  const activeSection = SECTIONS.find(s => s.key === activeTab) || SECTIONS[0];
  const colors = colorMap[activeSection.color];
  const sectionData = culturalGuide?.[activeTab] || null;

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary-900 dark:text-white font-display flex items-center gap-2 tracking-tight leading-snug">
            <LuSparkles className="text-accent animate-pulse shrink-0 text-lg sm:text-2xl" /> AI Cultural Customs Guide
          </h1>
          <p className="text-xs sm:text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">
            Learn local etiquette, dress codes, sacred site rules, and greetings.
          </p>
        </div>
        {culturalGuide && historyId && (
          <button
            onClick={handleToggleSave}
            disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${
              isSaved
                ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600'
                : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-950/20'
            }`}
          >
            <LuBookmark className={isSaved ? 'fill-white text-white' : 'text-primary-900/50'} />
            {isSaved ? 'Saved' : 'Save Guide'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/*  Form Panel  */}
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 h-fit rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">
            Destination
          </h3>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Country *</label>
            <input
              type="text"
              placeholder="e.g. India, Japan, France"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('country', { required: 'Country is required' })}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.country.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">City (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Varanasi, Kyoto"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('city')}
            /> </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><LuGlobe /> Load Cultural Customs</>
            )}
          </button>

          {/* Quick tips */}
          {!culturalGuide && !isLoading && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold text-primary-900/40 dark:text-dark-muted uppercase tracking-wider">What you'll get</p>
              {['Greetings & social customs', 'Religious site etiquette', 'Dress code guidelines', 'Cultural taboos & gestures'].map((t) => (
                <div key={t} className="flex items-center gap-2 text-xs text-primary-900/60 dark:text-dark-muted font-medium">
                  <LuCheck className="text-accent shrink-0" /> {t}
                </div>
              ))}
            </div>
          )}
        </form>

        {/*  Results Panel  */}
        <div className="lg:col-span-2 space-y-5">
          {isLoading ? (
            <div className="space-y-5">
              <div className="h-14 skeleton w-full animate-pulse rounded-2xl" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 skeleton w-full animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : culturalGuide ? (
            <AnimatePresence mode="wait">
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                {/* Tab bar */}
                <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-2.5 rounded-2xl shadow-sm flex flex-wrap gap-2">
                  {SECTIONS.map((sec) => {
                    const Icon = sec.icon;
                    const isActive = activeTab === sec.key;
                    const c = colorMap[sec.color];
                    return (
                      <button
                        key={sec.key}
                        type="button"
                        onClick={() => setActiveTab(sec.key)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive ? c.tabActive : c.tab
                        }`}
                      >
                        {Icon && <Icon className="text-sm shrink-0" />}
                        <span>{sec.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active section */}
                {sectionData ? (
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border rounded-2xl shadow-sm border-l-4 ${colors.border} overflow-hidden`}
                  >
                    {/* Section header */}
                    <div className="px-6 py-4 border-b border-primary-50 dark:border-dark-border flex items-center gap-3">
                      {activeSection?.icon && (() => {
                        const SecIcon = activeSection.icon;
                        return <div className={`p-2 rounded-xl ${colors.badge}`}><SecIcon className={`text-xl ${colors.icon}`} /></div>;
                      })()}
                      <div>
                        <h3 className="font-extrabold text-primary-900 dark:text-white font-display text-base">
                          {activeSection.label}
                        </h3>
                        <p className="text-[10px] text-primary-900/50 dark:text-dark-muted font-semibold uppercase tracking-wider">
                          Cultural etiquette guide
                        </p>
                      </div>
                    </div>

                    {/* Sub-key content */}
                    <div className="p-6 space-y-6">
                      {Object.entries(activeSection.subKeys).map(([subKey, { label, type }]) => {
                        const val = sectionData[subKey];
                        if (!val || (Array.isArray(val) && val.length === 0)) return null;
                        return (
                          <div key={subKey} className="space-y-3">
                            <h4 className={`text-[11px] font-extrabold uppercase tracking-widest ${colors.icon}`}>
                              {label}
                            </h4>
                            <RenderSubKey type={type} value={val} colors={colors} />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-10 rounded-2xl text-center text-primary-900/40 dark:text-dark-muted">
                    <p className="text-sm font-semibold">No data available for this section.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-16 text-center text-primary-900/40 dark:text-dark-muted flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                <LuCompass className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Destination</h3>
              <p className="text-xs max-w-sm font-semibold leading-relaxed">
                Enter a country or city to get a complete cultural etiquette guide with dos & don'ts, greetings, and religious customs.
              </p>
            </div>
          )}
        </div> </div> </div>
  );
}
