import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  LuSparkles, 
  LuCoins, 
  LuHotel, 
  LuUtensils, 
  LuBus, 
  LuActivity, 
  LuCompass, 
  LuCheck, 
  LuCreditCard, 
  LuBookOpen,
  LuBookmark
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AIBudgetPlanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [budgetPlan, setBudgetPlan] = useState(null);
  
  // Independent save states
  const [historyId, setHistoryId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      destination: '',
      duration: 7,
      travelStyle: 'mid-range',
      groupSize: 1,
    }
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
      toast.error(err.message || 'Failed to generate budget plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!historyId) {
      toast.error('No generated plan found to save');
      return;
    }
    const token = localStorage.getItem('cq_token');
    if (!token) {
      toast.error('Please login to save the budget plan');
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/ai/history/${historyId}`, { isSaved: !isSaved });
      setIsSaved(!isSaved);
      toast.success(!isSaved ? 'Budget plan saved to your Bookmarks!' : 'Removed from Bookmarks');
    } catch (err) {
      toast.error(err.message || 'Failed to update save status');
    } finally {
      setIsSaving(false);
    }
  };

  const formatPriceString = (str) => {
    if (!str || String(str).toUpperCase() === 'N/A') return 'N/A';
    if (String(str).toLowerCase() === 'free') return 'Free';
    let cleaned = String(str).replace(/₹\s*₹/g, '₹');
    cleaned = cleaned.replace(/\$/g, '₹').replace(/usd/gi, 'INR');
    if (!cleaned.includes('₹') && !cleaned.toLowerCase().includes('inr') && !cleaned.toLowerCase().includes('rs')) {
      cleaned = `₹${cleaned}`;
    }
    return cleaned;
  };

  const renderTierCard = (title, tierData, borderCol) => {
    if (!tierData) return null;
    return (
      <div className={`card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 border-t-4 ${borderCol} flex flex-col justify-between space-y-4 rounded-2xl shadow-sm hover:shadow-md transition-all`}>
        <div className="space-y-3">
          <h3 className="font-bold text-base text-primary-900 dark:text-white capitalize font-display flex items-center justify-between">
            <span>{title} Tier</span>
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </h3>
          {tierData.dailyBreakdown && (
            <div className="space-y-2 text-xs font-semibold">
              <h4 className="font-bold text-primary-900 dark:text-slate-200 border-b border-primary-50 dark:border-dark-border pb-1">
                Daily Breakdown (INR, ₹):
              </h4>
              <div className="space-y-2 text-primary-900/70 dark:text-dark-muted font-semibold">
                <p className="flex items-center gap-2"><LuHotel className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-20 inline-block">Stay:</span> {formatPriceString(tierData.dailyBreakdown.accommodation)}</p>
                <p className="flex items-center gap-2"><LuUtensils className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-20 inline-block">Meals:</span> {formatPriceString(tierData.dailyBreakdown.meals || tierData.dailyBreakdown.food)}</p>
                <p className="flex items-center gap-2"><LuBus className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-20 inline-block">Transit:</span> {formatPriceString(tierData.dailyBreakdown.transport)}</p>
                <p className="flex items-center gap-2"><LuActivity className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-20 inline-block">Activities:</span> {formatPriceString(tierData.dailyBreakdown.activities)}</p>
                <p className="flex items-center gap-2"><LuCoins className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-20 inline-block">Shopping:</span> {formatPriceString(tierData.dailyBreakdown.shopping)}</p>
                <p className="flex items-center gap-2"><LuCompass className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-20 inline-block">Misc:</span> {formatPriceString(tierData.dailyBreakdown.misc)}</p>
              </div>
            </div>
          )}
        </div>
        <div className="divider border-primary-100 dark:border-dark-border my-1" />
        <div className="bg-primary-50/70 dark:bg-primary-950/20 p-3 rounded-xl border border-primary-100/50 dark:border-primary-900/10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-primary-900/40 dark:text-dark-muted/65 uppercase tracking-wider">Total Cost</span>
            <span className="px-2 py-0.5 text-[9px] font-black bg-accent/10 text-accent rounded-md">Estimate</span>
          </div>
          <div className="text-xs font-extrabold text-accent font-display tracking-tight leading-relaxed break-words">
            {formatPriceString(tierData.totalCost)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
            <LuSparkles className="text-accent animate-pulse" /> AI Travel Budget Planner
          </h1>
          <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Plan and split expenses automatically for budget, mid-range and luxury travel tiers.</p>
        </div>
        
        {budgetPlan && historyId && (
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
            {isSaved ? 'Saved to Bookmarks' : 'Save Budget'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 h-fit rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">Settings</h3>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Destination</label>
            <input
              type="text"
              placeholder="e.g. Kyoto, Japan"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('destination', { required: 'Destination is required' })}
            />
            {errors.destination && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.destination.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Trip Duration (Days)</label>
            <input type="number" min="1" max="90" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('duration')} />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Group Size</label>
            <input type="number" min="1" max="20" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('groupSize')} />
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
                <LuCoins /> Calculate Expenses
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
          ) : budgetPlan ? (
            <div className="space-y-6">
              {/* Check if we have budget tiers */}
              {(budgetPlan.budget || budgetPlan.midRange || budgetPlan.mid_range || budgetPlan.luxury) ? (
                <div className="space-y-6">
                  {/* Tiers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {renderTierCard('budget', budgetPlan.budget, 'border-t-primary-300')}
                    {renderTierCard('mid-range', budgetPlan.midRange || budgetPlan.mid_range, 'border-t-accent')}
                    {renderTierCard('luxury', budgetPlan.luxury, 'border-t-amber-500')}
                  </div>

                  {/* General Tips */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.isArray(budgetPlan.savingTips) && budgetPlan.savingTips.length > 0 && (
                      <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-4 rounded-2xl shadow-sm">
                        <h4 className="font-bold text-primary-900 dark:text-white flex items-center gap-1.5 text-sm font-display border-b border-primary-100 dark:border-dark-border pb-3">
                          <LuSparkles className="text-accent text-base" /> Money Saving Tips
                        </h4>
                        <div className="grid grid-cols-1 gap-2.5">
                          {budgetPlan.savingTips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-3.5 bg-primary-50/20 dark:bg-dark-bg/40 border border-primary-100/50 dark:border-dark-border rounded-xl transition-all hover:bg-primary-50/40 dark:hover:bg-dark-bg/60">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 shrink-0 animate-pulse" />
                              <span className="text-xs font-semibold text-primary-900/80 dark:text-dark-muted leading-relaxed">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {budgetPlan.paymentTips && (
                      <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-4 rounded-2xl shadow-sm">
                        <h4 className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm font-display border-b border-primary-100 dark:border-dark-border pb-3">
                          <LuCreditCard className="text-amber-500 text-base shrink-0" /> Payment & Currency Guide
                        </h4>
                        <div className="grid grid-cols-1 gap-2.5">
                          {[
                            { label: 'Best Currency', val: budgetPlan.paymentTips.bestCurrency || budgetPlan.paymentTips.currency || 'Local', icon: <LuCoins className="text-amber-500 mt-0.5 shrink-0" /> },
                            { label: 'ATM Access', val: budgetPlan.paymentTips.atmAvailability || 'Available', icon: <LuHotel className="text-amber-500 mt-0.5 shrink-0" /> },
                            { label: 'Card Acceptance', val: budgetPlan.paymentTips.creditCardAcceptance || 'Widely accepted', icon: <LuCreditCard className="text-amber-500 mt-0.5 shrink-0" /> },
                            { label: 'Exchange Tip', val: budgetPlan.paymentTips.exchangeTips || 'Exchange in banks', icon: <LuBookOpen className="text-amber-500 mt-0.5 shrink-0" /> }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3.5 bg-primary-50/20 dark:bg-dark-bg/40 border border-primary-100/50 dark:border-dark-border rounded-xl transition-all hover:bg-primary-50/40 dark:hover:bg-dark-bg/60">
                              {item.icon}
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-black text-accent uppercase tracking-wider">{item.label}</span>
                                <span className="text-xs font-semibold text-primary-900/80 dark:text-dark-muted leading-relaxed">{item.val}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Fallback: render raw text */
                <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 rounded-2xl shadow-sm whitespace-pre-line text-xs font-semibold leading-relaxed text-primary-900/70 dark:text-dark-muted">
                  <h4 className="font-extrabold text-sm text-primary-900 dark:text-white mb-3 flex items-center gap-1.5 border-b border-primary-50 dark:border-dark-border pb-2.5 font-display">
                    <LuBookOpen className="text-accent text-lg" />
                    <span>Budget Plan Details</span>
                  </h4>
                  {budgetPlan.rawText || (typeof budgetPlan === 'string' ? budgetPlan : JSON.stringify(budgetPlan, null, 2))}
                </div>
              )}
            </div>
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <span className="text-6xl animate-float">💵</span>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Plan Configuration</h3>
              <p className="text-xs max-w-sm font-semibold leading-relaxed">Define your trip details and let AI calculate travel costs automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
