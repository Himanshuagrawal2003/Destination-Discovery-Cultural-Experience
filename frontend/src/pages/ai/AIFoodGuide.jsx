import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuSparkles, LuChefHat, LuUtensils, LuMapPin, LuCoins,
  LuBookmark, LuCake, LuStar, LuClock, LuLeaf, LuFlame
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

const formatPrice = (p, def = 'Avg. ₹150 - ₹300') => {
  if (!p || String(p).trim() === '' || String(p).toUpperCase() === 'N/A') return def;
  if (String(p).toLowerCase() === 'low') return 'Avg. ₹50 - ₹150';
  if (String(p).toLowerCase() === 'moderate') return 'Avg. ₹200 - ₹500';
  if (String(p).toLowerCase().includes('high') || String(p).toLowerCase() === 'expensive') return 'Avg. ₹600 - ₹1,500';
  let c = String(p).replace(/₹\s*₹/g, '₹').replace(/\$/g, '₹').replace(/usd/gi, 'INR');
  if (!c.includes('₹') && !c.toLowerCase().includes('inr') && !c.toLowerCase().includes('rs') && !c.toLowerCase().includes('free')) c = `₹${c}`;
  if (!c.toLowerCase().includes('avg') && !c.toLowerCase().includes('approx') && !c.toLowerCase().includes('free')) c = `Avg. ${c}`;
  return c;
};

// Dish Card 
function DishCard({ item, borderColor = 'border-l-accent', priceDefault = 'Avg. ₹200 - ₹400' }) {
  if (!item) return null;
  const name = typeof item === 'object' ? item.name || item.dishName || item.itemName || 'Dish' : String(item);
  const desc = typeof item === 'object' ? item.description || item.desc || '' : '';
  const spot = typeof item === 'object' ? item.whereToTry || item.whereToFind || item.bestWhereToTry || item.location || item.area || '' : '';
  const bestTime = typeof item === 'object' ? item.bestTime || '' : '';
  const price = typeof item === 'object' ? item.priceRange || item.price || '' : '';
  const specialty = typeof item === 'object' ? item.specialty || '' : '';
  const type = typeof item === 'object' ? item.type || '' : '';
  const culturalSig = typeof item === 'object' ? item.culturalSignificance || item.cultural || '' : '';

  return (
    <div className={`bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border border-l-4 ${borderColor} rounded-2xl p-5 space-y-2.5 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-primary-900 dark:text-white text-sm font-display leading-snug">{name}</h4>
        {type && (
          <span className="shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-accent/10 text-accent">{type}</span>
        )}
      </div>
      {desc && <p className="text-xs text-primary-900/65 dark:text-dark-muted leading-relaxed font-medium">{desc}</p>}
      {specialty && <p className="text-xs text-accent font-semibold italic"> {specialty}</p>}
      {culturalSig && <p className="text-xs text-purple-600 dark:text-purple-400 font-medium"> {culturalSig}</p>}
      <div className="flex flex-wrap gap-3 text-[10px] font-bold text-primary-900/40 dark:text-dark-muted pt-1 border-t border-primary-50 dark:border-dark-border">
        {spot && <span className="flex items-center gap-1"><LuMapPin className="text-accent" />{spot}</span>}
        {bestTime && <span className="flex items-center gap-1"><LuClock className="text-amber-500" />{bestTime}</span>}
        <span className="flex items-center gap-1 text-accent font-extrabold"><LuCoins />{formatPrice(price, priceDefault)}</span> </div> </div>
  );
}

// Restaurant Card 
function RestaurantCard({ item }) {
  if (!item) return null;
  const name = item.name || 'Restaurant';
  const type = item.type || item.style || '';
  const area = item.area || item.location || '';
  const specialty = item.specialty || '';
  const price = item.priceRange || item.price || '';

  return (
    <div className="bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border border-l-4 border-l-emerald-500 rounded-2xl p-5 space-y-2.5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-bold text-primary-900 dark:text-white text-sm font-display leading-snug">{name}</h4>
        {type && <span className="shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">{type}</span>}
      </div>
      {specialty && <p className="text-xs text-accent font-semibold"> Specialty: {specialty}</p>}
      <div className="flex flex-wrap gap-3 text-[10px] font-bold text-primary-900/40 dark:text-dark-muted pt-1 border-t border-primary-50 dark:border-dark-border">
        {area && <span className="flex items-center gap-1"><LuMapPin className="text-emerald-500" />{area}</span>}
        {price && <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold"><LuCoins />{formatPrice(price, 'Avg. ₹500 - ₹1,200 per person')}</span>}
      </div> </div>
  );
}

// Main Component 
export default function AIFoodGuide() {
  const [isLoading, setIsLoading] = useState(false);
  const [foodGuide, setFoodGuide] = useState(null);
  const [activeTab, setActiveTab] = useState('traditionalDishes');
  const [historyId, setHistoryId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { country: '', city: '', dietaryPreferences: '' }
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
      setActiveTab('traditionalDishes');
      toast.success('Food guide ready!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to generate food guide');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!historyId) { toast.error('No guide to save'); return; }
    if (!localStorage.getItem('cq_token')) { toast.error('Please login to save'); return; }
    setIsSaving(true);
    try {
      await api.put(`/ai/history/${historyId}`, { isSaved: !isSaved });
      setIsSaved(!isSaved);
      toast.success(!isSaved ? 'Food guide saved!' : 'Removed from Bookmarks');
    } catch { toast.error('Failed to update save status'); }
    finally { setIsSaving(false); }
  };

  const TABS = [
    { id: 'traditionalDishes', label: 'Must-Try Dishes', icon: LuUtensils, color: 'accent' },
    { id: 'streetFood', label: 'Street Food', icon: LuFlame, color: 'amber' },
    { id: 'desserts', label: 'Desserts', icon: LuCake, color: 'pink' },
    { id: 'restaurants', label: 'Restaurants', icon: LuChefHat, color: 'emerald' },
    { id: 'diningEtiquette', label: 'Dining Etiquette', icon: LuLeaf, color: 'purple' },
  ];

  const tabColors = {
    accent: 'bg-accent text-white shadow-md',
    amber: 'bg-amber-500 text-white shadow-md',
    pink: 'bg-pink-500 text-white shadow-md',
    emerald: 'bg-emerald-500 text-white shadow-md',
    purple: 'bg-purple-500 text-white shadow-md',
  };
  const tabInactive = 'bg-primary-50 dark:bg-primary-950/20 text-primary-900/60 dark:text-dark-muted hover:bg-primary-100 dark:hover:bg-primary-900/20';

  const activeTabConfig = TABS.find(t => t.id === activeTab);
  const ActiveTabIcon = activeTabConfig?.icon;

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary-900 dark:text-white font-display flex items-center gap-2 tracking-tight leading-snug">
            <LuSparkles className="text-accent animate-pulse shrink-0 text-lg sm:text-2xl" /> AI Local Food Guide
          </h1>
          <p className="text-xs sm:text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">
            Discover must-try dishes, street food gems, desserts, restaurants & dining etiquette.
          </p>
        </div>
        {foodGuide && historyId && (
          <button onClick={handleToggleSave} disabled={isSaving}
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm ${isSaved ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600' : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50'}`}>
            <LuBookmark className={isSaved ? 'fill-white text-white' : 'text-primary-900/50'} />
            {isSaved ? 'Saved' : 'Save Guide'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 h-fit rounded-2xl shadow-sm">
          <h3 className="font-bold text-lg text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">Destination</h3>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Country *</label>
            <input type="text" placeholder="e.g. Italy, India, Thailand"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('country', { required: 'Country is required' })} />
            {errors.country && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.country.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">City / Region (Optional)</label>
            <input type="text" placeholder="e.g. Rome, Bangkok"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('city')} />
          </div>

          <div>
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Dietary Preference (Optional)</label>
            <input type="text" placeholder="e.g. Vegetarian, Vegan, Halal"
              className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              {...register('dietaryPreferences')} />
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full btn bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:shadow-glow">
            {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LuChefHat /> Find Food Guide</>}
          </button>

          {!foodGuide && !isLoading && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold text-primary-900/40 dark:text-dark-muted uppercase tracking-wider">What you'll get</p>
              {['Traditional must-try dishes', 'Local street food gems', 'Authentic desserts', 'Top restaurants', 'Dining etiquette tips'].map(t => (
                <div key={t} className="flex items-center gap-2 text-xs text-primary-900/60 dark:text-dark-muted font-medium">
                  <LuChefHat className="text-accent shrink-0 text-[10px]" /> {t}
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Results */}
        <div className="lg:col-span-2 space-y-5">
          {isLoading ? (
            <div className="space-y-5">
              <div className="h-12 skeleton w-full animate-pulse rounded-2xl" />
              {[1, 2, 3].map(i => <div key={i} className="h-36 skeleton w-full animate-pulse rounded-2xl" />)}
            </div>
          ) : foodGuide ? (
            <AnimatePresence mode="wait">
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">

                {/* Tab bar */}
                <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-2.5 rounded-2xl shadow-sm flex flex-wrap gap-2">
                  {TABS.map(tab => {
                    const TabIcon = tab.icon;
                    const hasData = tab.id === 'diningEtiquette'
                      ? !!foodGuide[tab.id]
                      : Array.isArray(foodGuide[tab.id]) && foodGuide[tab.id].length > 0;
                    return (
                      <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === tab.id ? tabColors[tab.color] : tabInactive} ${!hasData ? 'opacity-40 cursor-not-allowed' : ''}`}
                        disabled={!hasData}>
                        {TabIcon && <TabIcon className="text-sm shrink-0" />}
                        <span>{tab.label}</span>
                        {hasData && <span className={`w-1.5 h-1.5 rounded-full ${activeTab === tab.id ? 'bg-white/60' : 'bg-accent'}`} />}
                      </button>
                    );
                  })}
                </div>

                {/* Section content */}
                <motion.div key={activeTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
                  className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden">

                  {/* Section header */}
                  <div className="px-6 py-4 border-b border-primary-50 dark:border-dark-border flex items-center gap-3">
                    {ActiveTabIcon && (
                      <div className="p-2 rounded-xl bg-accent/10 text-accent">
                        <ActiveTabIcon className="text-xl" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-primary-900 dark:text-white font-display text-base">{activeTabConfig?.label}</h3>
                      <p className="text-[10px] text-primary-900/50 dark:text-dark-muted font-semibold uppercase tracking-wider">AI curated food guide</p>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Traditional Dishes */}
                    {activeTab === 'traditionalDishes' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(foodGuide.traditionalDishes || []).map((item, i) => (
                          <DishCard key={i} item={item} borderColor="border-l-accent" priceDefault="Avg. ₹200 - ₹400" />
                        ))}
                      </div>
                    )}

                    {/* Street Food */}
                    {activeTab === 'streetFood' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(foodGuide.streetFood || []).map((item, i) => (
                          <DishCard key={i} item={item} borderColor="border-l-amber-500" priceDefault="Avg. ₹50 - ₹150" />
                        ))}
                      </div>
                    )}

                    {/* Desserts */}
                    {activeTab === 'desserts' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(foodGuide.desserts || []).map((item, i) => (
                          <DishCard key={i} item={item} borderColor="border-l-pink-500" priceDefault="Avg. ₹80 - ₹200" />
                        ))}
                      </div>
                    )}

                    {/* Restaurants */}
                    {activeTab === 'restaurants' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(foodGuide.restaurants || []).map((item, i) => (
                          <RestaurantCard key={i} item={item} />
                        ))}
                      </div>
                    )}

                    {/* Dining Etiquette */}
                    {activeTab === 'diningEtiquette' && (
                      <div className="space-y-3">
                        {Array.isArray(foodGuide.diningEtiquette) ? (
                          foodGuide.diningEtiquette.map((tip, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl">
                              <LuLeaf className="text-purple-500 shrink-0 text-base mt-0.5" />
                              <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 leading-relaxed">{tip}</p>
                            </div>
                          ))
                        ) : typeof foodGuide.diningEtiquette === 'object' ? (
                          Object.entries(foodGuide.diningEtiquette).map(([k, v], i) => (
                            <div key={i} className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-wider text-purple-500">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 leading-relaxed">{Array.isArray(v) ? v.join(', ') : String(v)}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-primary-900/70 dark:text-dark-muted font-medium leading-relaxed">{String(foodGuide.diningEtiquette)}</p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-16 text-center flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <div className="p-4 rounded-2xl bg-accent/10 text-accent">
                <LuUtensils className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Food Preferences</h3>
              <p className="text-xs max-w-sm font-semibold leading-relaxed text-primary-900/50 dark:text-dark-muted">
                Enter a country to discover must-try dishes, street food, desserts, top restaurants, and dining etiquette.
              </p>
            </div>
          )}
        </div> </div> </div>
  );
}
