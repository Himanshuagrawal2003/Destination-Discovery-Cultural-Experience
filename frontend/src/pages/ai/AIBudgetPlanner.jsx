import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuSparkles, LuCoins, LuHotel, LuUtensils, LuBus,
  LuActivity, LuCompass, LuCheck, LuCreditCard, LuBookOpen, LuBookmark,
  LuShoppingBag, LuEllipsis, LuStar
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

const formatPrice = (val, fallback = 0) => {
  if (val === 0) return 'Free';
  if (!val || String(val).trim() === '' || String(val).toUpperCase() === 'N/A'
    || String(val).toLowerCase() === 'null' || String(val).toLowerCase() === 'undefined') {
    return fallback > 0 ? `₹${fallback.toLocaleString('en-IN')}` : 'Included';
  }
  if (String(val).toLowerCase() === 'free') return 'Free';
  let c = String(val).replace(/₹\s*₹/g, '₹').replace(/\$/g, '₹').replace(/usd/gi, 'INR');
  if (!c.includes('₹') && !c.toLowerCase().includes('inr') && !c.toLowerCase().includes('rs')) c = `₹${c}`;
  return c;
};

const TIERS = [
  { key: 'budget', label: 'Budget', icon: LuCoins, color: 'blue', border: 'border-t-blue-400', badge: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300' },
  { key: 'midRange', label: 'Mid-Range', icon: LuSparkles, color: 'accent', border: 'border-t-accent', badge: 'bg-accent/10 text-accent' },
  { key: 'luxury', label: 'Luxury', icon: LuStar, color: 'amber', border: 'border-t-amber-500', badge: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300' },
];

const BREAKDOWN_ITEMS = [
  { keys: ['accommodation', 'hotel', 'stay', 'lodging'], label: 'Stay / Hotel', icon: LuHotel, defaults: { budget: 1200, midRange: 3500, luxury: 9000 } },
  { keys: ['meals', 'food', 'dining', 'breakfastLunchDinner'], label: 'Meals', icon: LuUtensils, defaults: { budget: 800, midRange: 1800, luxury: 4000 } },
  { keys: ['transport', 'transit', 'transportation', 'travel'], label: 'Transport', icon: LuBus, defaults: { budget: 400, midRange: 1000, luxury: 2500 } },
  { keys: ['activities', 'sightseeing', 'attractions', 'entranceFees'], label: 'Activities', icon: LuActivity, defaults: { budget: 500, midRange: 1200, luxury: 3000 } },
  { keys: ['shopping', 'shoppingAllowance', 'souvenirs'], label: 'Shopping', icon: LuShoppingBag, defaults: { budget: 300, midRange: 800, luxury: 2000 } },
  { keys: ['misc', 'miscellaneous', 'tips', 'other'], label: 'Misc', icon: LuEllipsis, defaults: { budget: 200, midRange: 500, luxury: 1200 } },
];

function TierCard({ tierKey, tierData }) {
  if (!tierData) return null;
  const tier = TIERS.find(t => t.key === tierKey);
  const TierIcon = tier?.icon;
  const breakdown = tierData.dailyBreakdown || tierData.breakdown || tierData.daily || {};

  const getVal = (item) => {
    for (const k of item.keys) {
      if (breakdown[k]) return breakdown[k];
    }
    return null;
  };

  const totalCost = tierData.totalCost || tierData.total || tierData.estimatedTotal;

  return (
    <div className={`bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border border-t-4 ${tier.border} rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {TierIcon && <TierIcon className="text-base text-accent" />}
            <h3 className="font-bold text-sm text-primary-900 dark:text-white font-display">{tier.label} Tier</h3>
          </div>
          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${tier.badge}`}>Avg. INR</span>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-primary-900/40 dark:text-dark-muted border-b border-primary-50 dark:border-dark-border pb-1.5">Daily Breakdown (₹)</p>
          {BREAKDOWN_ITEMS.map((item) => {
            const Icon = item.icon;
            const rawVal = getVal(item);
            const def = item.defaults[tierKey] || 500;
            return (
              <div key={item.label} className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-primary-900/60 dark:text-dark-muted">
                  <Icon className="text-accent text-sm shrink-0" />
                  {item.label}
                </span>
                <span className="font-bold text-primary-900 dark:text-white">{formatPrice(rawVal, def)}</span> </div>
            );
          })}
        </div> </div>

      <div className="bg-gradient-to-r from-primary-50/80 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-950/10 border border-primary-100/50 dark:border-dark-border p-3 rounded-xl space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary-900/40 dark:text-dark-muted">Est. Total</span>
          <span className="text-[9px] font-black bg-accent/10 text-accent px-2 py-0.5 rounded-md">Avg. Price</span> </div>
        <p className="text-sm font-extrabold text-accent font-display">{formatPrice(totalCost, BREAKDOWN_ITEMS.reduce((s, i) => s + (i.defaults[tierKey] || 0), 0) * 7)}</p> </div> </div>
  );
}

export default function AIBudgetPlanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [budgetPlan, setBudgetPlan] = useState(null);
  const [historyId, setHistoryId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { destination: '', duration: 7, travelStyle: 'mid-range', groupSize: 1 }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setBudgetPlan(null);
    setHistoryId(null);
    setIsSaved(false);
    try {
      const res = await api.post('/ai/budget-planner', data);
      setBudgetPlan(res.data.budgetPlan);
      setHistoryId(res.data.historyId || null);
      toast.success('Budget plan generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate budget plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!historyId) { toast.error('No plan to save'); return; }
    if (!localStorage.getItem('cq_token')) { toast.error('Please login to save'); return; }
    setIsSaving(true);
    try {
      await api.put(`/ai/history/${historyId}`, { isSaved: !isSaved });
      setIsSaved(!isSaved);
      toast.success(!isSaved ? 'Budget plan saved!' : 'Removed from Bookmarks');
    } catch { toast.error('Failed to update save status'); }
    finally { setIsSaving(false); }
  };

  const hasTiers = budgetPlan && (budgetPlan.budget || budgetPlan.midRange || budgetPlan.mid_range || budgetPlan.luxury);

  return (
    <div className="w-full space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary-900 dark:text-white font-display flex items-center gap-2 tracking-tight">
            <LuSparkles className="text-accent animate-pulse shrink-0 text-lg sm:text-2xl" /> 
            <span>AI Travel Budget Planner</span>
          </h1>
          <p className="text-xs sm:text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">
            Auto-calculate budget, mid-range & luxury travel costs in INR (₹).
          </p>
        </div>
        {budgetPlan && historyId && (
          <button onClick={handleToggleSave} disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${isSaved ? 'bg-amber-500 text-white border-amber-500' : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50'}`}>
            <LuBookmark className={isSaved ? 'fill-white text-white' : 'text-primary-900/50'} />
            {isSaved ? 'Saved' : 'Save Budget'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 h-fit rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">Trip Settings</h3>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Destination *</label>
            <input type="text" placeholder="e.g. Goa, India or Kyoto, Japan"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('destination', { required: 'Destination is required' })} />
            {errors.destination && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.destination.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2 whitespace-nowrap">Days</label>
              <input type="number" min="1" max="90"
                className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                {...register('duration')} />
            </div>
            <div>
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2 whitespace-nowrap">Group Size</label>
              <input type="number" min="1" max="20"
                className="w-full px-3 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
                {...register('groupSize')} />
            </div>
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LuCoins /> Calculate Expenses</>}
          </button>

          {!budgetPlan && !isLoading && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold text-primary-900/40 dark:text-dark-muted uppercase tracking-wider">What you'll get</p>
              {['3-tier cost breakdown (Budget/Mid/Luxury)', 'Daily accommodation, food & transport', 'Money saving tips', 'Payment & currency guide'].map(t => (
                <div key={t} className="flex items-center gap-2 text-xs text-primary-900/60 dark:text-dark-muted font-medium">
                  <LuCheck className="text-accent shrink-0" /> {t}
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-64 skeleton animate-pulse rounded-2xl" />)}
              </div>
              <div className="h-48 skeleton animate-pulse rounded-2xl" /> </div>
          ) : hasTiers ? (
            <AnimatePresence mode="wait">
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-6">

                {/* Tier Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TierCard tierKey="budget" tierData={budgetPlan.budget} />
                  <TierCard tierKey="midRange" tierData={budgetPlan.midRange || budgetPlan.mid_range} />
                  <TierCard tierKey="luxury" tierData={budgetPlan.luxury} /> </div>

                {/* Tips + Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Saving Tips */}
                  {Array.isArray(budgetPlan.savingTips) && budgetPlan.savingTips.length > 0 && (
                    <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-4 rounded-2xl shadow-sm">
                      <h4 className="font-bold text-primary-900 dark:text-white flex items-center gap-2 text-sm font-display border-b border-primary-100 dark:border-dark-border pb-3">
                        <LuCoins className="text-emerald-500 text-base shrink-0" /> Money Saving Tips
                      </h4>
                      <div className="space-y-2.5">
                        {budgetPlan.savingTips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                            <LuCheck className="text-emerald-500 shrink-0 mt-0.5 text-xs" />
                            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 leading-relaxed">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Tips */}
                  {budgetPlan.paymentTips && (
                    <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-4 rounded-2xl shadow-sm">
                      <h4 className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 text-sm font-display border-b border-primary-100 dark:border-dark-border pb-3">
                        <LuCreditCard className="text-amber-500 text-base shrink-0" /> Payment & Currency
                      </h4>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Best Currency', val: budgetPlan.paymentTips.bestCurrency || budgetPlan.paymentTips.currency },
                          { label: 'ATM Access', val: budgetPlan.paymentTips.atmAvailability },
                          { label: 'Card Acceptance', val: budgetPlan.paymentTips.creditCardAcceptance },
                          { label: 'Exchange Tip', val: budgetPlan.paymentTips.exchangeTips },
                        ].filter(i => i.val).map((item, idx) => (
                          <div key={idx} className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                            <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-0.5">{item.label}</p>
                            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">{item.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Emergency Buffer */}
                {budgetPlan.emergencyBuffer && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3">
                    <LuCoins className="text-rose-500 text-xl shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-rose-500 mb-0.5">Emergency Buffer Recommended</p>
                      <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">{budgetPlan.emergencyBuffer}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : budgetPlan ? (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 rounded-2xl shadow-sm whitespace-pre-line text-xs font-semibold leading-relaxed text-primary-900/70 dark:text-dark-muted">
              <h4 className="font-extrabold text-sm text-primary-900 dark:text-white mb-3 flex items-center gap-1.5 border-b pb-2.5 font-display">
                <LuBookOpen className="text-accent text-lg" /> Budget Plan Details
              </h4>
              {typeof budgetPlan === 'string' ? budgetPlan : JSON.stringify(budgetPlan, null, 2)}
            </div>
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-16 text-center flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <div className="p-4 rounded-2xl bg-accent/10 text-accent">
                <LuCoins className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Trip Details</h3>
              <p className="text-xs max-w-sm font-semibold leading-relaxed text-primary-900/50 dark:text-dark-muted">
                Enter your destination, duration, and group size to get a complete cost breakdown in 3 budget tiers.
              </p>
            </div>
          )}
        </div> </div> </div>
  );
}
