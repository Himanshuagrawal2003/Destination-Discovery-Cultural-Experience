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
  LuCompass
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AICulturalGuide() {
  const [isLoading, setIsLoading] = useState(false);
  const [culturalGuide, setCulturalGuide] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      country: '',
      city: '',
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setCulturalGuide(null);
    try {
      const res = await api.post('/ai/cultural-guide', data);
      setCulturalGuide(res.data.culturalGuide);
      toast.success('Cultural guide ready!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate cultural guide');
    } finally {
      setIsLoading(false);
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
      <div className={`card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 border-l-4 ${getSectionBorder(key)} space-y-3 rounded-2xl shadow-sm hover:shadow-md transition-all`}>
        <h4 className="font-bold text-primary-900 dark:text-white text-sm capitalize flex items-center gap-1.5 font-display border-b border-primary-50 dark:border-dark-border pb-2.5">
          {getSectionIcon(key)}
          <span>{title.replace(/([A-Z])/g, ' $1')}</span>
        </h4>
        <div className="text-xs text-primary-900/70 dark:text-dark-muted leading-relaxed whitespace-pre-line font-semibold space-y-1.5">
          {typeof data === 'string'
            ? data
            : Array.isArray(data)
            ? data.map((item, idx) => (
                <p key={idx} className="flex items-start gap-1">
                  <span className="text-accent shrink-0">•</span>
                  <span>{item}</span>
                </p>
              ))
            : Object.entries(data).map(([k, val], idx) => (
                <p key={idx} className="mb-2">
                  <strong className="text-accent font-bold">{k.replace(/([A-Z])/g, ' $1')}:</strong> {val}
                </p>
              ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
          <LuSparkles className="text-accent animate-pulse" /> AI Cultural Customs Guide
        </h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Learn local etiquette, dress code rules, sacred site regulations, and greetings.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSection('Greetings & Customs', 'greetingsAndCustoms', culturalGuide.greetingsAndCustoms || culturalGuide.greetings)}
              {renderSection('Sacred Sites Etiquette', 'religiousEtiquette', culturalGuide.religiousPracticesAndSacredSites || culturalGuide.religiousEtiquette)}
              {renderSection('Clothing Rules', 'clothingEtiquette', culturalGuide.traditionalClothing || culturalGuide.clothingEtiquette)}
              {renderSection('Taboos (Things to Avoid)', 'thingsToAvoid', culturalGuide.thingsToAvoid || culturalGuide.taboos)}
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
