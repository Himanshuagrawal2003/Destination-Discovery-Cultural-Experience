import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { MdAutoAwesome, MdRestaurant, MdOutlineFoodBank } from 'react-icons/md';
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
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display flex items-center gap-2">
          <MdAutoAwesome className="text-amber-500 animate-pulse" /> AI Local Food Guide
        </h1>
        <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Get dining advice, must-try local street foods, desserts, and restaurant suggestions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4 h-fit">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-855 pb-3">Destination</h3>

          <div>
            <label className="label">Country</label>
            <input
              type="text"
              placeholder="e.g. Italy, Thailand"
              className="input"
              {...register('country', { required: 'Country is required' })}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
          </div>

          <div>
            <label className="label">City / Region (Optional)</label>
            <input type="text" placeholder="e.g. Rome, Bangkok" className="input" {...register('city')} />
          </div>

          <div>
            <label className="label">Dietary Preferences (Optional)</label>
            <input type="text" placeholder="e.g. Vegetarian, Gluten-free" className="input" {...register('dietaryPreferences')} />
          </div>

          <button type="submit" disabled={isLoading} className="w-full btn btn-primary flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MdRestaurant /> Find Food Guide
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
          ) : foodGuide ? (
            <div className="space-y-6">
              {/* Traditional Dishes */}
              {foodGuide.traditionalDishes?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-850 dark:text-white flex items-center gap-1">
                    🥘 Must-Try Traditional Dishes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {foodGuide.traditionalDishes.map((dish, i) => (
                      <div key={i} className="card p-4 space-y-2 border-l-4 border-teal-500">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{dish.name}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{dish.description}</p>
                        <div className="text-[10px] text-slate-400 font-semibold pt-1">
                          📍 Best place: {dish.bestWhereToTry || dish.bestPlace} | 💰 Price: {dish.priceRange || 'Moderate'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Street Food */}
              {foodGuide.streetFood?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-855 dark:text-white flex items-center gap-1">
                    🍢 Local Street Food Gems
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {foodGuide.streetFood.map((item, i) => (
                      <div key={i} className="card p-4 space-y-2 border-l-4 border-amber-500">
                        <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                        <div className="text-[10px] text-slate-400 font-semibold pt-1">
                          📍 Spot: {item.whereToFind || item.location} | 💰 Price: {item.price || 'Low'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dining Etiquette */}
              {foodGuide.diningEtiquette && (
                <div className="card p-5 space-y-3">
                  <h4 className="font-bold text-slate-850 dark:text-white text-sm flex items-center gap-1.5 text-teal-650">
                    🏮 Dining Etiquette & Table Manners
                  </h4>
                  <div className="text-xs text-slate-550 leading-relaxed whitespace-pre-line">
                    {typeof foodGuide.diningEtiquette === 'string'
                      ? foodGuide.diningEtiquette
                      : Array.isArray(foodGuide.diningEtiquette)
                      ? foodGuide.diningEtiquette.map((tip, i) => <p key={i} className="mb-1">• {tip}</p>)
                      : Object.entries(foodGuide.diningEtiquette).map(([key, val], i) => (
                          <p key={i} className="mb-1.5">
                            <strong>{key.replace(/([A-Z])/g, ' $1')}:</strong> {val}
                          </p>
                        ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-4">
              <span className="text-6xl animate-float">🍲</span>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-350">Awaiting Food Preferences</h3>
              <p className="text-sm max-w-sm">Enter a country name to discover dining practices, local dishes, and recommended restaurants.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
