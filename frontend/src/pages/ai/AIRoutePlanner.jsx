import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  LuSparkles, 
  LuCompass, 
  LuSave, 
  LuCheck, 
  LuArrowRight, 
  LuCoins, 
  LuClock, 
  LuMapPin,
  LuPlane,
  LuCar,
  LuBus,
  LuBookmark,
  LuBookOpen,
  LuX
} from 'react-icons/lu';
import { MdTrain } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AIRoutePlanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [historyId, setHistoryId] = useState(null);
  const [routePlan, setRoutePlan] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      origin: '',
      destination: '',
      preferences: '',
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setRoutePlan(null);
    setHistoryId(null);
    setIsSaved(false);
    try {
      const res = await api.post('/ai/route-planner', data);
      setRoutePlan(res.data.routePlan);
      setHistoryId(res.data.historyId || null);
      toast.success('Transit pathways generated!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate route pathways');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!historyId) {
      toast.error('No generated route found to save');
      return;
    }
    setIsSaving(true);
    try {
      await api.put(`/ai/history/${historyId}`, { isSaved: !isSaved });
      setIsSaved(!isSaved);
      toast.success(!isSaved ? 'Route plan saved to Bookmarks!' : 'Removed from Bookmarks');
    } catch (err) {
      toast.error(err.message || 'Failed to update save status');
    } finally {
      setIsSaving(false);
    }
  };

  const getTransportIcon = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('flight') || lower.includes('air') || lower.includes('plane')) {
      return <LuPlane className="text-blue-500" />;
    }
    if (lower.includes('train')) {
      return <MdTrain className="text-accent" />;
    }
    if (lower.includes('bus')) {
      return <LuBus className="text-amber-500" />;
    }
    return <LuCar className="text-emerald-500" />;
  };

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
            <LuCompass className="text-accent animate-spin-slow animate-pulse" /> AI Route & Transport Planner
          </h1>
          <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Discover optimal pathways, transits, booking counters, and cost breakdowns.</p>
        </div>

        {routePlan && historyId && (
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
            {isSaved ? 'Saved to Bookmarks' : 'Save Route Plan'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 h-fit rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">Route Builder</h3>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">From (Origin)</label>
            <input
              type="text"
              placeholder="e.g. Bhopal, India"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('origin', { required: 'Origin is required' })}
            />
            {errors.origin && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.origin.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">To (Destination)</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Maharashtra"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('destination', { required: 'Destination is required' })}
            />
            {errors.destination && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.destination.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Special Preferences (Optional)</label>
            <textarea 
              placeholder="e.g. avoid airplane, suggest scenic train routes, include overnight trains" 
              rows="3"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" 
              {...register('preferences')}
            />
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
                <LuCompass /> Find Best Routes
              </>
            )}
          </button>
        </form>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 skeleton w-full animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : routePlan ? (
            <div className="space-y-6">
              {/* Best Route Highlight */}
              {routePlan.bestRoute && (
                <div className="p-5 bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-2xl space-y-2">
                  <h4 className="text-xs font-black uppercase text-accent tracking-wider flex items-center gap-1.5 font-display">
                    <LuSparkles /> CultureQuest Recommendation
                  </h4>
                  <p className="text-xs font-semibold text-primary-900/90 dark:text-slate-200 leading-relaxed italic">
                    "{routePlan.bestRoute}"
                  </p>
                </div>
              )}

              {/* Pathway Options List */}
              {Array.isArray(routePlan.options) && routePlan.options.map((opt, idx) => {
                if (!opt) return null;
                const cost = opt.cost || 'Moderate';
                const duration = opt.duration || 'N/A';
                
                return (
                  <div key={idx} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-primary-50 dark:border-dark-border pb-3.5 gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-primary-50 dark:bg-dark-bg rounded-xl shrink-0">
                          {getTransportIcon(opt.title)}
                        </span>
                        <h4 className="font-bold text-sm text-primary-900 dark:text-white font-display">
                          {opt.title}
                        </h4>
                      </div>
                      
                      <div className="flex gap-3 text-[10px] font-bold">
                        <span className="flex items-center gap-1 bg-accent/10 dark:bg-accent/20 text-accent px-2.5 py-1 rounded-lg">
                          <LuCoins /> {cost}
                        </span>
                        <span className="flex items-center gap-1 bg-primary-150/40 dark:bg-primary-900/40 text-primary-900/60 dark:text-dark-muted px-2.5 py-1 rounded-lg">
                          <LuClock /> {duration}
                        </span>
                      </div>
                    </div>

                    {/* Step Timeline */}
                    {Array.isArray(opt.pathway) && opt.pathway.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-black uppercase tracking-wider text-primary-900/50 dark:text-dark-muted font-display">Pathway Stages</h5>
                        <div className="relative border-l-2 border-primary-100 dark:border-dark-border pl-4 ml-2.5 space-y-3">
                          {opt.pathway.map((step, sIdx) => (
                            <div key={sIdx} className="relative">
                              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-accent border-2 border-white dark:border-dark-card rounded-full shrink-0" />
                              <p className="text-xs font-semibold text-primary-900/80 dark:text-dark-muted leading-relaxed">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Booking Platforms */}
                    {Array.isArray(opt.bookingInfo) && opt.bookingInfo.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-[11px] font-black uppercase tracking-wider text-primary-900/50 dark:text-dark-muted font-display">Where to Book</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs font-bold text-accent">
                          {opt.bookingInfo.map((bk, bIdx) => (
                            <div key={bIdx} className="p-2.5 bg-primary-50/30 dark:bg-dark-bg/40 border border-primary-100/50 dark:border-dark-border rounded-xl flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                              <span>{bk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pros and Cons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {/* Pros */}
                      {Array.isArray(opt.pros) && opt.pros.length > 0 && (
                        <div className="space-y-2">
                          <h6 className="text-[10px] font-black uppercase tracking-wider text-emerald-500 font-display">Pros</h6>
                          <div className="space-y-1.5 text-2xs font-semibold text-primary-900/70 dark:text-dark-muted">
                            {opt.pros.map((p, pIdx) => (
                              <p key={pIdx} className="flex items-start gap-1.5">
                                <LuCheck className="text-emerald-500 shrink-0 mt-0.5" />
                                <span>{p}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cons */}
                      {Array.isArray(opt.cons) && opt.cons.length > 0 && (
                        <div className="space-y-2">
                          <h6 className="text-[10px] font-black uppercase tracking-wider text-rose-500 font-display">Cons</h6>
                          <div className="space-y-1.5 text-2xs font-semibold text-primary-900/70 dark:text-dark-muted">
                            {opt.cons.map((c, cIdx) => (
                              <p key={cIdx} className="flex items-start gap-1.5">
                                <LuX className="text-rose-500 shrink-0 mt-0.5" />
                                <span>{c}</span>
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <span className="text-6xl animate-float">🧭</span>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Route Inputs</h3>
              <p className="text-xs max-w-sm font-semibold leading-relaxed">Enter an origin and destination to compare bus, train, driving, and airplane transits.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
