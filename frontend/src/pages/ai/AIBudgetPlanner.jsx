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
  LuDollarSign 
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AIBudgetPlanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [budgetPlan, setBudgetPlan] = useState(null);
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
    try {
      const res = await api.post('/ai/budget-planner', data);
      setBudgetPlan(res.data.budgetPlan);
      toast.success('Budget plan generated!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate budget plan');
    } finally {
      setIsLoading(false);
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
      <div className={`card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 border-t-4 ${borderCol} flex flex-col justify-between space-y-5 rounded-2xl shadow-sm hover:shadow-md transition-all`}>
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white capitalize font-display flex items-center justify-between">
            <span>{title} Tier</span>
            <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
          </h3>
          {tierData.dailyBreakdown && (
            <div className="space-y-3 text-xs font-semibold">
              <h4 className="font-bold text-primary-900 dark:text-slate-200 border-b border-primary-50 dark:border-dark-border pb-1">
                Daily Breakdown (INR, ₹):
              </h4>
              <div className="space-y-2.5 text-primary-900/70 dark:text-dark-muted font-semibold">
                <p className="flex items-center gap-2"><LuHotel className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-24 inline-block">Stay:</span> {formatPriceString(tierData.dailyBreakdown.accommodation)}</p>
                <p className="flex items-center gap-2"><LuUtensils className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-24 inline-block">Meals:</span> {formatPriceString(tierData.dailyBreakdown.meals || tierData.dailyBreakdown.food)}</p>
                <p className="flex items-center gap-2"><LuBus className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-24 inline-block">Transit:</span> {formatPriceString(tierData.dailyBreakdown.transport)}</p>
                <p className="flex items-center gap-2"><LuActivity className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-24 inline-block">Activities:</span> {formatPriceString(tierData.dailyBreakdown.activities)}</p>
                <p className="flex items-center gap-2"><LuCoins className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-24 inline-block">Shopping:</span> {formatPriceString(tierData.dailyBreakdown.shopping)}</p>
                <p className="flex items-center gap-2"><LuCompass className="text-accent text-sm shrink-0" /> <span className="text-primary-900/40 dark:text-dark-muted/65 w-24 inline-block">Misc:</span> {formatPriceString(tierData.dailyBreakdown.misc)}</p>
              </div>
            </div>
          )}
        </div>
        <div className="divider border-primary-100 dark:border-dark-border my-1" />
        <div className="bg-primary-50/70 dark:bg-primary-950/20 p-4 rounded-2xl border border-primary-100/50 dark:border-primary-900/10 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-primary-900/40 dark:text-dark-muted/65 uppercase tracking-wider">Total Cost</span>
            <span className="px-2 py-0.5 text-[9px] font-black bg-accent/10 text-accent rounded-md">Estimate</span>
          </div>
          <div className="text-sm font-extrabold text-accent font-display tracking-tight leading-relaxed break-words">
            {formatPriceString(tierData.totalCost)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
          <LuSparkles className="text-accent animate-pulse" /> AI Travel Budget Planner
        </h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Plan and split expenses automatically for budget, mid-range and luxury travel tiers.</p>
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
              {/* Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderTierCard('budget', budgetPlan.budget, 'border-t-primary-300')}
                {renderTierCard('mid-range', budgetPlan.midRange || budgetPlan.mid_range, 'border-t-accent')}
                {renderTierCard('luxury', budgetPlan.luxury, 'border-t-amber-500')}
              </div>

              {/* General Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgetPlan.savingTips?.length > 0 && (
                  <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 space-y-3 rounded-2xl shadow-sm">
                    <h4 className="font-bold text-primary-900 dark:text-white flex items-center gap-1.5 text-sm font-display">
                      <LuSparkles className="text-accent" /> Money Saving Tips
                    </h4>
                    <ul className="space-y-2 text-xs text-primary-900/60 dark:text-dark-muted font-semibold">
                      {budgetPlan.savingTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <LuCheck className="text-accent shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {budgetPlan.paymentTips && (
                  <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 space-y-3 rounded-2xl shadow-sm">
                    <h4 className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-sm font-display">
                      <LuCreditCard className="text-amber-500" /> Payment & Currency Guide
                    </h4>
                    <div className="text-xs text-primary-900/70 dark:text-dark-muted space-y-2.5 font-semibold">
                      <p className="flex items-start gap-1.5"><LuCoins className="text-amber-500 mt-0.5 shrink-0" /> <span><strong>Best Currency:</strong> {budgetPlan.paymentTips.bestCurrency || budgetPlan.paymentTips.currency || 'Local'}</span></p>
                      <p className="flex items-start gap-1.5"><LuHotel className="text-amber-500 mt-0.5 shrink-0" /> <span><strong>ATM Access:</strong> {budgetPlan.paymentTips.atmAvailability || 'Available'}</span></p>
                      <p className="flex items-start gap-1.5"><LuCreditCard className="text-amber-500 mt-0.5 shrink-0" /> <span><strong>Card Acceptance:</strong> {budgetPlan.paymentTips.creditCardAcceptance || 'Widely accepted'}</span></p>
                      <p className="flex items-start gap-1.5"><LuBookOpen className="text-amber-500 mt-0.5 shrink-0" /> <span><strong>Exchange Tip:</strong> {budgetPlan.paymentTips.exchangeTips || 'Exchange in banks'}</span></p>
                    </div>
                  </div>
                )}
              </div>
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
