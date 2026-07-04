import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MdAutoAwesome, MdLanguage, MdSecurity } from 'react-icons/md';
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

  const renderSection = (title, data) => {
    if (!data) return null;
    return (
      <div className="card p-5 space-y-3">
        <h4 className="font-bold text-slate-850 dark:text-white text-sm capitalize border-b border-slate-100 dark:border-slate-800/80 pb-2">
          {title.replace(/([A-Z])/g, ' $1')}
        </h4>
        <div className="text-xs text-slate-550 leading-relaxed whitespace-pre-line">
          {typeof data === 'string'
            ? data
            : Array.isArray(data)
            ? data.map((item, idx) => <p key={idx} className="mb-1.5">• {item}</p>)
            : Object.entries(data).map(([key, val], idx) => (
                <p key={idx} className="mb-2">
                  <strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {val}
                </p>
              ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display flex items-center gap-2">
          <MdAutoAwesome className="text-amber-500 animate-pulse" /> AI Cultural Customs Guide
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1 font-sans">Learn local etiquette, dress code rules, sacred site regulations, and greetings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-855 pb-3">Destination</h3>

          <div>
            <label className="label">Country</label>
            <input
              type="text"
              placeholder="e.g. India, Japan"
              className="input"
              {...register('country', { required: 'Country is required' })}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
          </div>

          <div>
            <label className="label">City (Optional)</label>
            <input type="text" placeholder="e.g. Kyoto, Varanasi" className="input" {...register('city')} />
          </div>

          <button type="submit" disabled={isLoading} className="w-full btn btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MdLanguage /> Load Cultural Customs
              </>
            )}
          </button>
        </form>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 skeleton w-full" />
              ))}
            </div>
          ) : culturalGuide ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderSection('greetingsAndCustoms', culturalGuide.greetingsAndCustoms || culturalGuide.greetings)}
              {renderSection('religiousEtiquette', culturalGuide.religiousPracticesAndSacredSites || culturalGuide.religiousEtiquette)}
              {renderSection('clothingEtiquette', culturalGuide.traditionalClothing || culturalGuide.clothingEtiquette)}
              {renderSection('thingsToAvoid', culturalGuide.thingsToAvoid || culturalGuide.taboos)}
            </div>
          ) : (
            <div className="card p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-4">
              <span className="text-6xl animate-float">⛩️</span>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-350">Awaiting Customs Parameters</h3>
              <p className="text-sm max-w-sm">Enter destination details and read authentic greetings, taboos, and site rules guidelines.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
