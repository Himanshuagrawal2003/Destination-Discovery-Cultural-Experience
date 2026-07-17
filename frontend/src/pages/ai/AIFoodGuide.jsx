import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  LuSparkles, 
  LuChefHat, 
  LuUtensils, 
  LuMapPin, 
  LuCoins, 
  LuBookOpen 
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AIFoodGuide() {
  const [isLoading, setIsLoading] = useState(false);
  const [foodGuide, setFoodGuide] = useState(null);
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
    try {
      const res = await api.post('/ai/food-guide', data);
      setFoodGuide(res.data.foodGuide);
      toast.success('Food guide ready!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate food guide');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
          <LuSparkles className="text-accent animate-pulse" /> AI Local Food Guide
        </h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Get dining advice, must-try local street foods, desserts, and restaurant suggestions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
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
            <input type="text" placeholder="e.g. Vegetarian, Gluten-free" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('dietaryPreferences')} />
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
        <div className="lg:col-span-2 space-y-8">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 skeleton w-full animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : foodGuide ? (
            <div className="space-y-8">
              {/* Traditional Dishes */}
              {foodGuide.traditionalDishes?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-primary-900 dark:text-white flex items-center gap-1.5 font-display">
                    <LuUtensils className="text-accent" /> Must-Try Traditional Dishes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {foodGuide.traditionalDishes.map((dish, i) => (
                      <div key={i} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 border-l-4 border-l-accent space-y-2 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <h4 className="font-bold text-primary-900 dark:text-white text-sm font-display">{dish.name}</h4>
                        <p className="text-xs text-primary-900/60 dark:text-dark-muted leading-relaxed font-medium">{dish.description}</p>
                        <div className="flex flex-wrap gap-x-3 text-[10px] text-primary-900/40 dark:text-dark-muted/50 font-bold pt-1">
                          <span className="flex items-center gap-1">
                            <LuMapPin /> Best: {dish.bestWhereToTry || dish.bestPlace}
                          </span>
                          <span className="flex items-center gap-1">
                            <LuCoins /> Price: {dish.priceRange || 'Moderate'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Street Food */}
              {foodGuide.streetFood?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-primary-900 dark:text-white flex items-center gap-1.5 font-display">
                    <LuChefHat className="text-amber-500 animate-pulse" /> Local Street Food Gems
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {foodGuide.streetFood.map((item, i) => (
                      <div key={i} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 border-l-4 border-l-amber-550 space-y-2 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <h4 className="font-bold text-primary-900 dark:text-white text-sm font-display">{item.name}</h4>
                        <p className="text-xs text-primary-900/60 dark:text-dark-muted leading-relaxed font-medium">{item.description}</p>
                        <div className="flex flex-wrap gap-x-3 text-[10px] text-primary-900/40 dark:text-dark-muted/50 font-bold pt-1">
                          <span className="flex items-center gap-1">
                            <LuMapPin /> Spot: {item.whereToFind || item.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <LuCoins /> Price: {item.price || 'Low'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dining Etiquette */}
              {foodGuide.diningEtiquette && (
                <div className="card bg-primary-50/70 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/20 p-5 space-y-3 rounded-2xl shadow-sm">
                  <h4 className="font-bold text-accent text-sm flex items-center gap-1.5 font-display">
                    <LuBookOpen className="text-accent text-sm shrink-0" /> Dining Etiquette & Table Manners
                  </h4>
                  <div className="text-xs text-primary-900/75 dark:text-dark-muted leading-relaxed whitespace-pre-line font-semibold">
                    {typeof foodGuide.diningEtiquette === 'string'
                      ? foodGuide.diningEtiquette
                      : Array.isArray(foodGuide.diningEtiquette)
                      ? foodGuide.diningEtiquette.map((tip, i) => <p key={i} className="mb-1">• {tip}</p>)
                      : Object.entries(foodGuide.diningEtiquette).map(([key, val], i) => (
                          <p key={i} className="mb-2">
                            <strong className="text-accent font-bold">{key.replace(/([A-Z])/g, ' $1')}:</strong> {val}
                          </p>
                        ))}
                  </div>
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
