import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MdAutoAwesome, MdAttachMoney, MdCardTravel } from 'react-icons/md';
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

  const renderTierCard = (title, tierData, borderCol) => {
    if (!tierData) return null;
    return (
      <div className={`card p-6 border-t-4 ${borderCol} space-y-4`}>
        <h3 className="font-bold text-lg text-slate-800 dark:text-white capitalize">{title} Tier</h3>
        {tierData.dailyBreakdown && (
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-700 dark:text-slate-200">Daily Breakdown:</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-500">
              <p>🏨 Accommodation: {tierData.dailyBreakdown.accommodation || 'N/A'}</p>
              <p>🍔 Meals: {tierData.dailyBreakdown.meals || tierData.dailyBreakdown.food || 'N/A'}</p>
              <p>🚗 Transport: {tierData.dailyBreakdown.transport || 'N/A'}</p>
              <p>🎟️ Entrance/Activities: {tierData.dailyBreakdown.activities || 'N/A'}</p>
              <p>🛍️ Shopping: {tierData.dailyBreakdown.shopping || 'N/A'}</p>
              <p>💡 Misc: {tierData.dailyBreakdown.misc || 'N/A'}</p>
            </div>
          </div>
        )}
        <div className="divider my-1" />
        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
          <span className="text-xs font-semibold text-slate-500">Total Cost:</span>
          <span className="text-sm font-extrabold text-teal-700 dark:text-teal-400">
            {tierData.totalCost || 'N/A'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display flex items-center gap-2">
          <MdAutoAwesome className="text-amber-500 animate-pulse" /> AI Travel Budget Planner
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Plan and split expenses automatically for budget, mid-range and luxury travel tiers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3">Settings</h3>

          <div>
            <label className="label">Destination</label>
            <input
              type="text"
              placeholder="e.g. Kyoto, Japan"
              className="input"
              {...register('destination', { required: 'Destination is required' })}
            />
            {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
          </div>

          <div>
            <label className="label">Trip Duration (Days)</label>
            <input type="number" min="1" max="90" className="input" {...register('duration')} />
          </div>

          <div>
            <label className="label">Group Size</label>
            <input type="number" min="1" max="20" className="input" {...register('groupSize')} />
          </div>

          <button type="submit" disabled={isLoading} className="w-full btn btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MdAttachMoney /> Calculate Expenses
              </>
            )}
          </button>
        </form>

        {/* Results panel */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 skeleton w-full" />
              ))}
            </div>
          ) : budgetPlan ? (
            <div className="space-y-6">
              {/* Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderTierCard('budget', budgetPlan.budget, 'border-slate-500')}
                {renderTierCard('mid-range', budgetPlan.midRange || budgetPlan.mid_range, 'border-teal-500')}
                {renderTierCard('luxury', budgetPlan.luxury, 'border-amber-500')}
              </div>

              {/* General Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {budgetPlan.savingTips?.length > 0 && (
                  <div className="card p-5 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-1 text-sm text-teal-650">
                      💡 Money Saving Tips
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-500">
                      {budgetPlan.savingTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-teal-500">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {budgetPlan.paymentTips && (
                  <div className="card p-5 space-y-3">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-1 text-sm text-amber-600">
                      💳 Payment & Currency Guide
                    </h4>
                    <div className="text-xs text-slate-500 space-y-1.5 font-medium">
                      <p>💵 <strong>Best Currency:</strong> {budgetPlan.paymentTips.bestCurrency || budgetPlan.paymentTips.currency || 'Local'}</p>
                      <p>🏧 <strong>ATM Access:</strong> {budgetPlan.paymentTips.atmAvailability || 'Available'}</p>
                      <p>💳 <strong>Card Acceptance:</strong> {budgetPlan.paymentTips.creditCardAcceptance || 'Widely accepted'}</p>
                      <p>🔄 <strong>Exchange Tip:</strong> {budgetPlan.paymentTips.exchangeTips || 'Exchange in banks'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-4">
              <span className="text-6xl animate-float">💵</span>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-350">Awaiting Plan Configuration</h3>
              <p className="text-sm max-w-sm">Define your trip details and let AI calculate travel costs automatically.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
