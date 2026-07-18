import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  LuSparkles, 
  LuGlobe, 
  LuBookOpen, 
  LuTriangleAlert, 
  LuShirt, 
  LuMapPin,
  LuCompass,
  LuBookmark
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AICulturalGuide() {
  const [isLoading, setIsLoading] = useState(false);
  const [culturalGuide, setCulturalGuide] = useState(null);
  
  // Independent save states
  const [historyId, setHistoryId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      country: '',
      city: '',
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setCulturalGuide(null);
    setHistoryId(null);
    setIsSaved(false);
    try {
      const res = await api.post('/ai/cultural-guide', data);
      setCulturalGuide(res.data.culturalGuide);
      setHistoryId(res.data.historyId || null);
      toast.success('Cultural guide ready!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate cultural guide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!historyId) {
      toast.error('No generated guide found to save');
      return;
    }
    const token = localStorage.getItem('cq_token');
    if (!token) {
      toast.error('Please login to save the cultural guide');
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/ai/history/${historyId}`, { isSaved: !isSaved });
      setIsSaved(!isSaved);
      toast.success(!isSaved ? 'Cultural guide saved to your Bookmarks!' : 'Removed from Bookmarks');
    } catch (err) {
      toast.error(err.message || 'Failed to update save status');
    } finally {
      setIsSaving(false);
    }
  };

  const getSectionIcon = (sectionKey) => {
    switch (sectionKey) {
      case 'greetingsAndCustoms':
        return <LuCompass className="text-accent text-lg shrink-0" />;
      case 'religiousEtiquette':
        return <LuMapPin className="text-purple-500 text-lg shrink-0" />;
      case 'clothingEtiquette':
        return <LuShirt className="text-blue-500 text-lg shrink-0" />;
      case 'thingsToAvoid':
        return <LuTriangleAlert className="text-rose-500 text-lg shrink-0" />;
      default:
        return <LuBookOpen className="text-accent text-lg shrink-0" />;
    }
  };

  const getSectionBorder = (sectionKey) => {
    switch (sectionKey) {
      case 'greetingsAndCustoms':
        return 'border-l-accent';
      case 'religiousEtiquette':
        return 'border-l-purple-500';
      case 'clothingEtiquette':
        return 'border-l-blue-500';
      case 'thingsToAvoid':
        return 'border-l-rose-500';
      default:
        return 'border-l-primary-200';
    }
  };

  const renderSection = (title, key, data) => {
    if (!data) return null;
    return (
      <div className={`card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 border-l-4 ${getSectionBorder(key)} space-y-4 rounded-2xl shadow-sm hover:shadow-md transition-all`}>
        <h4 className="font-bold text-primary-900 dark:text-white text-sm capitalize flex items-center gap-1.5 font-display border-b border-primary-100 dark:border-dark-border pb-3">
          {getSectionIcon(key)}
          <span>{title.replace(/([A-Z])/g, ' $1')}</span>
        </h4>
        <div className="grid grid-cols-1 gap-2.5">
          {typeof data === 'string' ? (
            <div className="p-3.5 bg-primary-50/20 dark:bg-dark-bg/40 border border-primary-100/50 dark:border-dark-border rounded-xl text-xs font-semibold text-primary-900/80 dark:text-dark-muted leading-relaxed">
              {data}
            </div>
          ) : Array.isArray(data) ? (
            data.map((item, idx) => {
              const text = typeof item === 'object' && item !== null
                ? `${item.title || item.name || ''}: ${item.description || item.value || JSON.stringify(item)}`
                : item;
              return (
                <div key={idx} className="flex items-start gap-2.5 p-3.5 bg-primary-50/20 dark:bg-dark-bg/40 border border-primary-100/50 dark:border-dark-border rounded-xl transition-all hover:bg-primary-50/40 dark:hover:bg-dark-bg/60">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 shrink-0 animate-pulse" />
                  <span className="text-xs font-semibold text-primary-900/80 dark:text-dark-muted leading-relaxed">{text}</span>
                </div>
              );
            })
          ) : (
            Object.entries(data).map(([k, val], idx) => {
              const text = typeof val === 'object' && val !== null
                ? Array.isArray(val) ? val.join(', ') : JSON.stringify(val)
                : val;
              return (
                <div key={idx} className="p-3.5 bg-primary-50/20 dark:bg-dark-bg/40 border border-primary-100/50 dark:border-dark-border rounded-xl flex flex-col gap-1 transition-all hover:bg-primary-50/40 dark:hover:bg-dark-bg/60">
                  <strong className="text-accent text-[10px] font-black uppercase tracking-wider">{k.replace(/([A-Z])/g, ' $1')}</strong>
                  <span className="text-xs font-semibold text-primary-900/80 dark:text-dark-muted leading-relaxed">{text}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
            <LuSparkles className="text-accent animate-pulse" /> AI Cultural Customs Guide
          </h1>
          <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Learn local etiquette, dress code rules, sacred site regulations, and greetings.</p>
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
            {isSaved ? 'Saved to Bookmarks' : 'Save Cultural Guide'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 h-fit rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">Destination</h3>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Country</label>
            <input
              type="text"
              placeholder="e.g. India, Japan"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('country', { required: 'Country is required' })}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.country.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">City (Optional)</label>
            <input type="text" placeholder="e.g. Kyoto, Varanasi" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('city')} />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LuGlobe /> Load Cultural Customs
              </>
            )}
          </button>
        </form>

        {/* Results panel */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 skeleton w-full animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : culturalGuide ? (
            <div className="space-y-4">
              {/* Check if we have at least one structured key */}
              {(culturalGuide.greetingsAndCustoms || culturalGuide.greetings || culturalGuide.greetingsAndSocialCustoms ||
                culturalGuide.religiousPracticesAndSacredSites || culturalGuide.religiousEtiquette || culturalGuide.religiousPractices ||
                culturalGuide.traditionalClothing || culturalGuide.clothingEtiquette || culturalGuide.clothingRules ||
                culturalGuide.thingsToAvoid || culturalGuide.taboos || culturalGuide.taboosAndGestures) ? (
                <div className="grid grid-cols-1 gap-6">
                  {renderSection('Greetings & Customs', 'greetingsAndCustoms', culturalGuide.greetingsAndCustoms || culturalGuide.greetings || culturalGuide.greetingsAndSocialCustoms)}
                  {renderSection('Sacred Sites Etiquette', 'religiousEtiquette', culturalGuide.religiousPracticesAndSacredSites || culturalGuide.religiousEtiquette || culturalGuide.religiousPractices)}
                  {renderSection('Clothing Rules', 'clothingEtiquette', culturalGuide.traditionalClothing || culturalGuide.clothingEtiquette || culturalGuide.clothingRules)}
                  {renderSection('Taboos (Things to Avoid)', 'thingsToAvoid', culturalGuide.thingsToAvoid || culturalGuide.taboos || culturalGuide.taboosAndGestures)}
                </div>
              ) : (
                /* Fallback: render raw markdown text */
                <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 rounded-2xl shadow-sm whitespace-pre-line text-xs font-semibold leading-relaxed text-primary-900/70 dark:text-dark-muted">
                  <h4 className="font-extrabold text-sm text-primary-900 dark:text-white mb-3 flex items-center gap-1.5 border-b border-primary-50 dark:border-dark-border pb-2.5 font-display">
                    <LuBookOpen className="text-accent text-lg" />
                    <span>Cultural Guide Details</span>
                  </h4>
                  {culturalGuide.rawText || (typeof culturalGuide === 'string' ? culturalGuide : JSON.stringify(culturalGuide, null, 2))}
                </div>
              )}
            </div>
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <span className="text-6xl animate-float">⛩️</span>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Customs Parameters</h3>
              <p className="text-xs max-w-sm font-semibold leading-relaxed">Enter destination details and read authentic greetings, taboos, and site rules guidelines.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
