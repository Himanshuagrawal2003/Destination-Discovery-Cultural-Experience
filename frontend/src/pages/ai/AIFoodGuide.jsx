import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  LuSparkles, 
  LuChefHat, 
  LuUtensils, 
  LuMapPin, 
  LuCoins, 
  LuBookOpen,
  LuBookmark
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AIFoodGuide() {
  const [isLoading, setIsLoading] = useState(false);
  const [foodGuide, setFoodGuide] = useState(null);
  
  // Independent save states
  const [historyId, setHistoryId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      country: '',
      city: '',
      dietaryPreferences: '',
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setFoodGuide(null);
    setHistoryId(null);
    setIsSaved(false);
    try {
      const res = await api.post('/ai/food-guide', data);
      setFoodGuide(res.data.foodGuide);
      setHistoryId(res.data.historyId || null);
      toast.success('Food guide ready!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate food guide');
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
      toast.error('Please login to save the food guide');
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/ai/history/${historyId}`, { isSaved: !isSaved });
      setIsSaved(!isSaved);
      toast.success(!isSaved ? 'Food guide saved to your Bookmarks!' : 'Removed from Bookmarks');
    } catch (err) {
      toast.error(err.message || 'Failed to update save status');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
            <LuSparkles className="text-accent animate-pulse" /> AI Local Food Guide
          </h1>
          <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Get dining advice, must-try local street foods, desserts, and restaurant suggestions.</p>
        </div>
        
        {foodGuide && historyId && (
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
            {isSaved ? 'Saved to Bookmarks' : 'Save Food Guide'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 h-fit rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">Destination</h3>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Country</label>
            <input
              type="text"
              placeholder="e.g. Italy, Thailand"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('country', { required: 'Country is required' })}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.country.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">City / Region (Optional)</label>
            <input type="text" placeholder="e.g. Rome, Bangkok" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('city')} />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Dietary Preferences (Optional)</label>
            <input type="text" placeholder="e.g. Vegetarian, Veg" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('dietaryPreferences')} />
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
                <LuChefHat /> Find Food Guide
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
          ) : foodGuide ? (
            <div className="space-y-6">
              {/* Check if we have structured traditionalDishes */}
              {((Array.isArray(foodGuide.traditionalDishes) && foodGuide.traditionalDishes.length > 0) || (Array.isArray(foodGuide.streetFood) && foodGuide.streetFood.length > 0) || foodGuide.diningEtiquette) ? (
                <div className="space-y-6">
                  {/* Traditional Dishes */}
                  {Array.isArray(foodGuide.traditionalDishes) && foodGuide.traditionalDishes.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-primary-900 dark:text-white flex items-center gap-1.5 font-display">
                        <LuUtensils className="text-accent" /> Must-Try Dishes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {foodGuide.traditionalDishes.map((dish, i) => {
                          if (!dish) return null;
                          const name = typeof dish === 'object' ? dish.name || dish.dishName || 'Dish' : String(dish);
                          const desc = typeof dish === 'object' ? dish.description || dish.desc || '' : '';
                          const spot = typeof dish === 'object' ? dish.bestWhereToTry || dish.bestPlace || 'Local places' : 'Local places';
                          const price = typeof dish === 'object' ? dish.priceRange || 'Moderate' : 'Moderate';
                          return (
                            <div key={i} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 border-l-4 border-l-accent space-y-2 rounded-2xl shadow-sm hover:shadow-md transition-all">
                              <h4 className="font-bold text-primary-900 dark:text-white text-sm font-display">{name}</h4>
                              {desc && <p className="text-xs text-primary-900/60 dark:text-dark-muted leading-relaxed font-medium">{desc}</p>}
                              <div className="flex flex-wrap gap-x-3 text-[10px] text-primary-900/40 dark:text-dark-muted/50 font-bold pt-1">
                                <span className="flex items-center gap-1">
                                  <LuMapPin /> Best: {spot}
                                </span>
                                <span className="flex items-center gap-1">
                                  <LuCoins /> Price: {price}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Street Food */}
                  {Array.isArray(foodGuide.streetFood) && foodGuide.streetFood.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-primary-900 dark:text-white flex items-center gap-1.5 font-display">
                        <LuChefHat className="text-amber-500 animate-pulse" /> Local Street Food
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {foodGuide.streetFood.map((item, i) => {
                          if (!item) return null;
                          const name = typeof item === 'object' ? item.name || item.itemName || 'Street Food' : String(item);
                          const desc = typeof item === 'object' ? item.description || item.desc || '' : '';
                          const spot = typeof item === 'object' ? item.whereToFind || item.location || 'Local markets' : 'Local markets';
                          const price = typeof item === 'object' ? item.price || 'Low' : 'Low';
                          return (
                            <div key={i} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 border-l-4 border-l-amber-500 space-y-2 rounded-2xl shadow-sm hover:shadow-md transition-all">
                              <h4 className="font-bold text-primary-900 dark:text-white text-sm font-display">{name}</h4>
                              {desc && <p className="text-xs text-primary-900/60 dark:text-dark-muted leading-relaxed font-medium">{desc}</p>}
                              <div className="flex flex-wrap gap-x-3 text-[10px] text-primary-900/40 dark:text-dark-muted/50 font-bold pt-1">
                                <span className="flex items-center gap-1">
                                  <LuMapPin /> Spot: {spot}
                                </span>
                                <span className="flex items-center gap-1">
                                  <LuCoins /> Price: {price}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dining Etiquette */}
                  {foodGuide.diningEtiquette && (
                    <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-4 rounded-2xl shadow-sm">
                      <h4 className="font-bold text-accent text-sm flex items-center gap-1.5 font-display border-b border-primary-100 dark:border-dark-border pb-3">
                        <LuBookOpen className="text-accent text-base shrink-0" /> Dining Etiquette & Table Manners
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {typeof foodGuide.diningEtiquette === 'string' ? (
                          <div className="p-3.5 bg-primary-50/20 dark:bg-dark-bg/40 border border-primary-100/50 dark:border-dark-border rounded-xl text-xs font-semibold text-primary-900/80 dark:text-dark-muted leading-relaxed">
                            {foodGuide.diningEtiquette}
                          </div>
                        ) : Array.isArray(foodGuide.diningEtiquette) ? (
                          foodGuide.diningEtiquette.map((tip, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-3.5 bg-primary-50/20 dark:bg-dark-bg/40 border border-primary-100/50 dark:border-dark-border rounded-xl transition-all hover:bg-primary-50/40 dark:hover:bg-dark-bg/60">
                              <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 shrink-0 animate-pulse" />
                              <span className="text-xs font-semibold text-primary-900/80 dark:text-dark-muted leading-relaxed">{tip}</span>
                            </div>
                          ))
                        ) : typeof foodGuide.diningEtiquette === 'object' && foodGuide.diningEtiquette !== null ? (
                          Object.entries(foodGuide.diningEtiquette).map(([key, val], i) => {
                            const text = typeof val === 'object' && val !== null
                              ? Array.isArray(val) ? val.join(', ') : JSON.stringify(val)
                              : val;
                            return (
                              <div key={i} className="p-3.5 bg-primary-50/20 dark:bg-dark-bg/40 border border-primary-100/50 dark:border-dark-border rounded-xl flex flex-col gap-1 transition-all hover:bg-primary-50/40 dark:hover:bg-dark-bg/60">
                                <strong className="text-accent text-[10px] font-black uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</strong>
                                <span className="text-xs font-semibold text-primary-900/80 dark:text-dark-muted leading-relaxed">{text}</span>
                              </div>
                            );
                          })
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback: render raw text */
                <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 rounded-2xl shadow-sm whitespace-pre-line text-xs font-semibold leading-relaxed text-primary-900/70 dark:text-dark-muted">
                  <h4 className="font-extrabold text-sm text-primary-900 dark:text-white mb-3 flex items-center gap-1.5 border-b border-primary-50 dark:border-dark-border pb-2.5 font-display">
                    <LuBookOpen className="text-accent text-lg" />
                    <span>Food Guide Details</span>
                  </h4>
                  {foodGuide.rawText || (typeof foodGuide === 'string' ? foodGuide : JSON.stringify(foodGuide, null, 2))}
                </div>
              )}
            </div>
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <span className="text-6xl animate-float">🍲</span>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Food Preferences</h3>
              <p className="text-xs max-w-sm font-semibold leading-relaxed">Enter a country name to discover dining practices, local dishes, and recommended restaurants.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
