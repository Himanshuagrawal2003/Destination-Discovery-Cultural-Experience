import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MdAutoAwesome, MdAttachMoney, MdExplore, MdBookmark, MdPlace, MdLightbulb } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AIRecommendations() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      budget: 'mid-range',
      travelStyle: 'solo',
      season: 'summer',
      interests: '',
      country: '',
      duration: 7,
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const interestsArray = data.interests ? data.interests.split(',').map((i) => i.trim()) : [];
      const res = await api.post('/ai/recommend-destinations', {
        ...data,
        interests: interestsArray,
      });
      setRecommendations(res.data.recommendations || []);
      toast.success('Recommendations ready!');
    } catch (err) {
      toast.error(err.message || 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display flex items-center gap-2">
          <MdAutoAwesome className="text-amber-500 animate-pulse" /> AI Destination Recommendations
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Get personalized suggestions based on your budget, style, and interests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3">Preferences</h3>

          <div>
            <label className="label">Preferred Budget</label>
            <select className="input" {...register('budget')}>
              <option value="budget">Budget ($)</option>
              <option value="mid-range">Mid-range ($$)</option>
              <option value="luxury">Luxury ($$$)</option>
            </select>
          </div>

          <div>
            <label className="label">Travel Style</label>
            <select className="input" {...register('travelStyle')}>
              <option value="solo">Solo</option>
              <option value="couple">Couple</option>
              <option value="family">Family</option>
              <option value="group">Group</option>
            </select>
          </div>

          <div>
            <label className="label">Season / Month</label>
            <input type="text" placeholder="e.g. Summer, October" className="input" {...register('season', { required: 'Season is required' })} />
            {errors.season && <p className="text-red-500 text-xs mt-1">{errors.season.message}</p>}
          </div>

          <div>
            <label className="label">Interests (comma separated)</label>
            <input type="text" placeholder="e.g. history, food, adventure" className="input" {...register('interests')} />
          </div>

          <div>
            <label className="label">Target Country/Region (Optional)</label>
            <input type="text" placeholder="e.g. Europe, Japan" className="input" {...register('country')} />
          </div>

          <div>
            <label className="label">Duration (Days)</label>
            <input type="number" min="1" max="60" className="input" {...register('duration')} />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MdAutoAwesome /> Match Destinations
              </>
            )}
          </button>
        </form>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 skeleton w-full" />
              ))}
            </div>
          ) : recommendations ? (
            recommendations.length > 0 ? (
              recommendations.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className="card p-6 space-y-4 border-l-4 border-teal-500"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {item.name}, {item.country}
                      </h3>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-1">Best time: {item.bestTime}</p>
                    </div>
                    <span className="badge badge-primary font-bold">
                      💡 Choice #{idx + 1}
                    </span>
                  </div>

                  <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed">
                    {item.whyItMatches}
                  </p>

                  {/* Budget breakdown */}
                  {item.budgetBreakdown && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800/80">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Estimated Daily Expenses (USD):</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-2xs font-semibold text-slate-500">
                        <div>🏨 Accommodation: {item.budgetBreakdown.accommodation || 'N/A'}</div>
                        <div>🍔 Food: {item.budgetBreakdown.food || 'N/A'}</div>
                        <div>🚗 Transport: {item.budgetBreakdown.transport || 'N/A'}</div>
                        <div>🎟️ Activities: {item.budgetBreakdown.activities || 'N/A'}</div>
                      </div>
                    </div>
                  )}

                  {/* Activities & Cultural Tips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {item.topActivities?.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 dark:text-white">🎯 Top Activities:</p>
                        <ul className="list-disc pl-4 text-slate-500 space-y-0.5">
                          {item.topActivities.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.culturalTips?.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800 dark:text-white">⛩️ Cultural Insights:</p>
                        <ul className="list-disc pl-4 text-slate-500 space-y-0.5">
                          {item.culturalTips.map((tip, i) => (
                            <li key={i}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {item.hiddenGem && (
                    <div className="bg-amber-50/20 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-500/20 text-xs">
                      <p className="font-bold text-amber-600 flex items-center gap-1">
                        <MdLightbulb /> Nearby Hidden Gem:
                      </p>
                      <p className="text-slate-600 dark:text-slate-350 mt-1">{item.hiddenGem}</p>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="card p-12 text-center text-slate-500">
                <p>AI didn't return any suggestions. Try expanding your search options.</p>
              </div>
            )
          ) : (
            <div className="card p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-4">
              <span className="text-6xl animate-float">🤖</span>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-350">Awaiting Search Preferences</h3>
              <p className="text-sm max-w-sm">Complete the parameters form on the left and match to discover tailored cultural trips suggestions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
