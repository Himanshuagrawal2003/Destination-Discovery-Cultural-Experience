import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuSparkles, LuCompass, LuCheck, LuArrowRight, LuCoins,
  LuClock, LuMapPin, LuPlane, LuCar, LuBus, LuBookmark, LuX, LuInfo
} from 'react-icons/lu';
import { MdTrain } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';

const formatCost = (raw, def = 'Avg. ₹1,200 - ₹2,500') => {
  if (!raw || String(raw).toUpperCase() === 'N/A') return def;
  let c = String(raw).replace(/₹\s*₹/g, '₹').replace(/\$/g, '₹').replace(/usd/gi, 'INR');
  if (!c.includes('₹') && !c.toLowerCase().includes('inr') && !c.toLowerCase().includes('rs') && !c.toLowerCase().includes('free')) c = `₹${c}`;
  if (!c.toLowerCase().includes('avg') && !c.toLowerCase().includes('approx') && !c.toLowerCase().includes('free')) c = `Avg. ${c}`;
  return c;
};

const TRANSPORT_STYLES = {
  flight: { icon: LuPlane, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' },
  train: { icon: MdTrain, color: 'text-accent', bg: 'bg-accent/5 dark:bg-accent/10', border: 'border-accent/20 dark:border-accent/30', badge: 'bg-accent/10 text-accent' },
  bus: { icon: LuBus, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300' },
  car: { icon: LuCar, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300' },
};

const getTransportStyle = (title = '') => {
  const l = title.toLowerCase();
  if (l.includes('flight') || l.includes('air') || l.includes('plane')) return TRANSPORT_STYLES.flight;
  if (l.includes('train') || l.includes('rail')) return TRANSPORT_STYLES.train;
  if (l.includes('bus') || l.includes('coach')) return TRANSPORT_STYLES.bus;
  return TRANSPORT_STYLES.car;
};

export default function AIRoutePlanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [historyId, setHistoryId] = useState(null);
  const [routePlan, setRoutePlan] = useState(null);
  const [activeRoute, setActiveRoute] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { origin: '', destination: '', preferences: '' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setRoutePlan(null);
    setHistoryId(null);
    setIsSaved(false);
    setActiveRoute(0);
    try {
      const res = await api.post('/ai/route-planner', data);
      setRoutePlan(res.data.routePlan);
      setHistoryId(res.data.historyId || null);
      toast.success('Transit pathways generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate routes');
    } finally { setIsLoading(false); }
  };

  const handleToggleSave = async () => {
    if (!historyId) { toast.error('No route to save'); return; }
    if (!localStorage.getItem('cq_token')) { toast.error('Please login to save'); return; }
    setIsSaving(true);
    try {
      await api.put(`/ai/history/${historyId}`, { isSaved: !isSaved });
      setIsSaved(!isSaved);
      toast.success(!isSaved ? 'Route saved to Bookmarks!' : 'Removed from Bookmarks');
    } catch { toast.error('Failed to update'); }
    finally { setIsSaving(false); }
  };

  const options = routePlan?.options || [];
  const activeOpt = options[activeRoute];
  const style = activeOpt ? getTransportStyle(activeOpt.title) : null;
  const Icon = style?.icon || LuCompass;

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary-900 dark:text-white font-display flex items-center gap-2 tracking-tight leading-snug">
            <LuCompass className="text-accent animate-pulse shrink-0 text-lg sm:text-2xl" /> AI Route & Transport
          </h1>
          <p className="text-xs sm:text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">
            Compare routes, transit options, booking platforms & cost breakdowns.
          </p>
        </div>
        {routePlan && historyId && (
          <button onClick={handleToggleSave} disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${isSaved ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50'}`}>
            <LuBookmark className={isSaved ? 'fill-white text-white' : 'text-primary-900/50'} />
            {isSaved ? 'Saved' : 'Save Route'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 h-fit rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">Route Builder</h3>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">From (Origin) *</label>
            <div className="relative">
              <LuMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-accent text-sm" />
              <input type="text" placeholder="e.g. Bhopal, India"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                {...register('origin', { required: 'Origin is required' })} /> </div>
            {errors.origin && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.origin.message}</p>}
          </div>

          {/* Arrow between */}
          <div className="flex items-center gap-2 text-primary-900/30 dark:text-dark-muted">
            <div className="flex-1 h-px bg-primary-100 dark:bg-dark-border" />
            <LuArrowRight className="text-accent" />
            <div className="flex-1 h-px bg-primary-100 dark:bg-dark-border" /> </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">To (Destination) *</label>
            <div className="relative">
              <LuMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 text-sm" />
              <input type="text" placeholder="e.g. Mumbai, Maharashtra"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                {...register('destination', { required: 'Destination is required' })} /> </div>
            {errors.destination && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.destination.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Preferences (Optional)</label>
            <textarea placeholder="e.g. avoid flights, scenic train routes, overnight options"
              rows="3"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all resize-none"
              {...register('preferences')} /> </div>

          <button type="submit" disabled={isLoading}
            className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LuCompass /> Find Best Routes</>}
          </button> </form>

        {/* Results */}
        <div className="lg:col-span-2 space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-20 skeleton animate-pulse rounded-2xl" />
              <div className="h-16 skeleton animate-pulse rounded-2xl" />
              {[1, 2].map(i => <div key={i} className="h-48 skeleton animate-pulse rounded-2xl" />)}
            </div>
          ) : routePlan ? (
            <AnimatePresence mode="wait">
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">

                {/* Best Route highlight */}
                {routePlan.bestRoute && (
                  <div className="p-4 bg-accent/5 dark:bg-accent/10 border border-accent/20 rounded-2xl flex items-start gap-3">
                    <LuSparkles className="text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-accent mb-1">CultureQuest Recommendation</p>
                      <p className="text-sm font-semibold text-primary-900/90 dark:text-slate-200 leading-relaxed italic">"{routePlan.bestRoute}"</p> </div> </div>
                )}

                {/* Route tabs */}
                {options.length > 0 && (
                  <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-2.5 rounded-2xl shadow-sm flex flex-wrap gap-2">
                    {options.map((opt, idx) => {
                      const s = getTransportStyle(opt.title);
                      const Ico = s.icon;
                      return (
                        <button key={idx} onClick={() => setActiveRoute(idx)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeRoute === idx ? `${s.bg} ${s.border} border ${s.color}` : 'bg-primary-50 dark:bg-primary-950/20 text-primary-900/60 dark:text-dark-muted hover:bg-primary-100'}`}>
                          <Ico className="text-sm shrink-0" />
                          <span className="truncate max-w-[100px]">{opt.title?.replace(/route|option/gi, '').trim() || `Option ${idx + 1}`}</span> </button>
                      );
                    })}
                  </div>
                )}

                {/* Active route card */}
                {activeOpt && (
                  <motion.div key={activeRoute} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
                    className={`card bg-white dark:bg-dark-card border ${style.border} rounded-2xl shadow-sm overflow-hidden`}>

                    {/* Card header */}
                    <div className={`px-6 py-4 border-b border-primary-50 dark:border-dark-border ${style.bg} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${style.border} ${style.bg}`}>
                          <Icon className={`${style.color} text-lg`} /> </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-primary-900 dark:text-white font-display">{activeOpt.title}</h4>
                          <p className="text-[10px] text-primary-900/50 dark:text-dark-muted font-semibold uppercase tracking-wider">Transport option</p> </div> </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg ${style.badge}`}>
                          <LuCoins className="shrink-0" /> {formatCost(activeOpt.cost)}
                        </span>
                        {activeOpt.duration && (
                          <span className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-900/70 dark:text-dark-muted">
                            <LuClock className="shrink-0" /> {activeOpt.duration}
                          </span>
                        )}
                      </div> </div>

                    <div className="p-6 space-y-5">
                      {/* Pathway timeline */}
                      {Array.isArray(activeOpt.pathway) && activeOpt.pathway.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-primary-900/50 dark:text-dark-muted">Pathway Stages</h5>
                          <div className="relative border-l-2 border-accent/30 pl-4 ml-2 space-y-3">
                            {activeOpt.pathway.map((step, idx) => (
                              <div key={idx} className="relative">
                                <span className="absolute -left-[21px] top-1.5 w-3 h-3 bg-accent border-2 border-white dark:border-dark-card rounded-full shrink-0" />
                                <div className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-dark-border p-3 rounded-xl">
                                  <p className="text-xs font-semibold text-primary-900/80 dark:text-dark-muted leading-relaxed">
                                    <span className="text-accent font-black mr-1">Step {idx + 1}:</span>{step}
                                  </p> </div> </div>
                            ))}
                          </div> </div>
                      )}

                      {/* Booking info */}
                      {Array.isArray(activeOpt.bookingInfo) && activeOpt.bookingInfo.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-black uppercase tracking-wider text-primary-900/50 dark:text-dark-muted">Where to Book</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeOpt.bookingInfo.map((bk, i) => (
                              <div key={i} className="flex items-center gap-2.5 p-3 bg-primary-50/30 dark:bg-dark-bg/40 border border-primary-100/50 dark:border-dark-border rounded-xl">
                                <span className="w-1.5 h-1.5 bg-accent rounded-full shrink-0" />
                                <span className="text-xs font-semibold text-accent">{bk}</span> </div>
                            ))}
                          </div> </div>
                      )}

                      {/* Pros & Cons */}
                      {(Array.isArray(activeOpt.pros) || Array.isArray(activeOpt.cons)) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Array.isArray(activeOpt.pros) && activeOpt.pros.length > 0 && (
                            <div className="space-y-2">
                              <h6 className="text-[10px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                                <LuCheck className="text-emerald-500" /> Pros
                              </h6>
                              {activeOpt.pros.map((p, i) => (
                                <div key={i} className="flex items-start gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                  <LuCheck className="text-emerald-500 shrink-0 mt-0.5 text-xs" />
                                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">{p}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {Array.isArray(activeOpt.cons) && activeOpt.cons.length > 0 && (
                            <div className="space-y-2">
                              <h6 className="text-[10px] font-black uppercase tracking-wider text-rose-500 flex items-center gap-1">
                                <LuX className="text-rose-500" /> Cons
                              </h6>
                              {activeOpt.cons.map((c, i) => (
                                <div key={i} className="flex items-start gap-2 p-2.5 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-xl">
                                  <LuX className="text-rose-500 shrink-0 mt-0.5 text-xs" />
                                  <span className="text-xs font-semibold text-rose-800 dark:text-rose-200">{c}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-16 text-center flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <div className="p-4 rounded-2xl bg-accent/10 text-accent">
                <LuCompass className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Route Inputs</h3>
              <p className="text-xs max-w-sm font-semibold leading-relaxed text-primary-900/50 dark:text-dark-muted">
                Enter origin and destination to compare bus, train, flight & road route options.
              </p>
            </div>
          )}
        </div> </div> </div>
  );
}
