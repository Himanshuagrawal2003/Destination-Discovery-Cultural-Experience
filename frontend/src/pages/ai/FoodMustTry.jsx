import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuChefHat, 
  LuUtensils, 
  LuMapPin, 
  LuCoins, 
  LuTrash2, 
  LuHeart,
  LuSparkles,
  LuBookOpen
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function FoodMustTry() {
  const [savedGuides, setSavedGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedGuides = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/ai/history?type=food-guide&isSaved=true');
      setSavedGuides(res.data.history || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load saved food guides');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedGuides();
  }, []);

  const handleRemove = async (id) => {
    try {
      await api.put(`/ai/history/${id}`, { isSaved: false });
      setSavedGuides(prev => prev.filter(item => item._id !== id));
      toast.success('Removed from Must-Try list');
    } catch (err) {
      toast.error('Failed to remove guide');
    }
  };

  const parseGuideData = (jsonStr) => {
    if (!jsonStr || typeof jsonStr !== 'string') return null;
    try {
      const cleanJson = jsonStr.match(/```json\n?([\s\S]*?)\n?```/) || jsonStr.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
      const parsed = JSON.parse(cleanJson ? (cleanJson[1] || cleanJson[0]) : jsonStr);
      return parsed;
    } catch (e) {
      console.warn('Failed parsing guide JSON:', e);
      return null;
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-12 bg-[#FAF7FF] dark:bg-dark-bg">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
          <LuHeart className="text-rose-500 animate-pulse fill-rose-500" /> Food Must Try
        </h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">
          Your bookmarked culinary discoveries, street foods, and traditional delicacies from around the world.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 skeleton w-full animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : savedGuides.length > 0 ? (
        <div className="space-y-8">
          <AnimatePresence>
            {savedGuides.map((guideItem) => {
              if (!guideItem || !guideItem.response) return null;
              const guide = parseGuideData(guideItem.response);
              const metadata = guideItem.metadata || {};
              const title = `${metadata.city ? `${metadata.city}, ` : ''}${metadata.country || 'Global Spot'}`;

              if (!guide) return null;

              return (
                <motion.div
                  key={guideItem._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-6"
                >
                  {/* Guide Header */}
                  <div className="flex justify-between items-center border-b border-primary-50 dark:border-dark-border pb-4">
                    <div>
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest bg-accent/10 px-2 py-0.5 rounded">
                        Saved Culinary Guide
                      </span>
                      <h2 className="text-xl font-extrabold text-primary-900 dark:text-white font-display mt-1">
                        {title}
                      </h2>
                    </div>
                    <button
                      onClick={() => handleRemove(guideItem._id)}
                      className="btn border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Remove from Must Try"
                    >
                      <LuTrash2 className="text-sm" />
                      Remove
                    </button>
                  </div>

                  {/* Traditional Dishes */}
                  {guide.traditionalDishes?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-primary-900/50 dark:text-dark-muted uppercase tracking-wider flex items-center gap-1">
                        <LuUtensils className="text-accent" /> Traditional Dishes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {guide.traditionalDishes.map((dish, idx) => (
                          <div key={idx} className="p-4 bg-primary-50/30 dark:bg-dark-bg/40 border border-primary-100/50 dark:border-dark-border rounded-2xl space-y-2">
                            <h4 className="font-extrabold text-sm text-primary-900 dark:text-white font-display">{dish.name}</h4>
                            <p className="text-xs text-primary-900/60 dark:text-dark-muted font-semibold leading-relaxed">{dish.description}</p>
                            <div className="flex gap-4 text-[10px] text-primary-900/40 dark:text-dark-muted/50 font-bold pt-1">
                              <span className="flex items-center gap-0.5"><LuMapPin /> {dish.bestWhereToTry || dish.bestPlace || 'Local places'}</span>
                              <span className="flex items-center gap-0.5"><LuCoins /> {dish.priceRange || 'Moderate'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Street Food */}
                  {guide.streetFood?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-primary-900/50 dark:text-dark-muted uppercase tracking-wider flex items-center gap-1">
                        <LuChefHat className="text-amber-500" /> Street Food Gems
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {guide.streetFood.map((sf, idx) => (
                          <div key={idx} className="p-4 bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/10 rounded-2xl space-y-2">
                            <h4 className="font-extrabold text-sm text-primary-900 dark:text-white font-display">{sf.name}</h4>
                            <p className="text-xs text-primary-900/60 dark:text-dark-muted font-semibold leading-relaxed">{sf.description}</p>
                            <div className="flex gap-4 text-[10px] text-amber-600/70 dark:text-amber-400 font-bold pt-1">
                              <span className="flex items-center gap-0.5"><LuMapPin /> Spot: {sf.whereToFind || sf.location || 'Street stalls'}</span>
                              <span className="flex items-center gap-0.5"><LuCoins /> Price: {sf.price || 'Low'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Desserts */}
                  {guide.desserts?.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-black text-primary-900/50 dark:text-dark-muted uppercase tracking-wider flex items-center gap-1">
                        <LuSparkles className="text-purple-500" /> Desserts & Sweets
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {guide.desserts.map((dessert, idx) => (
                          <div key={idx} className="p-4 bg-purple-50/20 dark:bg-purple-950/10 border border-purple-100/40 dark:border-purple-900/10 rounded-2xl space-y-1.5">
                            <h4 className="font-extrabold text-sm text-primary-900 dark:text-white font-display">{dessert.name}</h4>
                            <p className="text-xs text-primary-900/60 dark:text-dark-muted font-semibold leading-relaxed">{dessert.description}</p>
                            {dessert.culturalSignificance && (
                              <p className="text-[10px] text-purple-600/80 dark:text-purple-400 font-medium italic pt-1">★ {dessert.culturalSignificance}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dining Etiquette */}
                  {guide.diningEtiquette && (
                    <div className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/10 p-4 rounded-2xl space-y-2">
                      <h4 className="font-extrabold text-primary-900 dark:text-white text-xs flex items-center gap-1.5">
                        <LuBookOpen className="text-accent" /> Local Dining Etiquette
                      </h4>
                      <div className="text-xs text-primary-900/70 dark:text-dark-muted leading-relaxed font-semibold">
                        {typeof guide.diningEtiquette === 'string'
                          ? guide.diningEtiquette
                          : Array.isArray(guide.diningEtiquette)
                          ? guide.diningEtiquette.map((tip, i) => <p key={i} className="mb-1">• {tip}</p>)
                          : Object.entries(guide.diningEtiquette).map(([key, val], i) => (
                              <p key={i} className="mb-1.5">
                                <strong className="text-accent font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong> {val}
                              </p>
                            ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/60 dark:text-dark-muted space-y-4 rounded-3xl shadow-sm">
          <span className="text-6xl block animate-float">🍽️</span>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">No Saved Dishes</h3>
          <p className="text-xs max-w-xs mx-auto leading-relaxed font-semibold">
            When you generate a local food guide, click "Save Food Guide" to keep your favorite recipes and restaurants here!
          </p>
        </div>
      )}
    </div>
  );
}
