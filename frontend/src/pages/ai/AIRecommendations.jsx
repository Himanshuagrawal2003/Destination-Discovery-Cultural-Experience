import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LuSparkles, 
  LuCoins, 
  LuCompass, 
  LuBookmark, 
  LuMapPin, 
  LuLightbulb, 
  LuHotel, 
  LuUtensils, 
  LuBus, 
  LuActivity,
  LuCalendar,
  LuCheck,
  LuBookOpen,
  LuChevronDown,
  LuChevronUp
} from 'react-icons/lu';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LeafletMap from '../../components/common/LeafletMap';

export default function AIRecommendations() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQ = searchParams.get('search') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [searchMode, setSearchMode] = useState('vibe'); // 'vibe' or 'manual'
  const [showOptional, setShowOptional] = useState(false);
  const [activeCardTabs, setActiveCardTabs] = useState({});

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      budget: 'mid-range',
      travelStyle: 'solo',
      season: 'summer',
      interests: '',
      country: '',
      duration: 7,
      experienceDescription: searchQ,
    }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const interestsArray = data.interests ? data.interests.split(',').map((i) => i.trim()) : [];
      const payload = {
        travelStyle: data.travelStyle,
        duration: data.duration,
      };

      if (searchMode === 'vibe') {
        if (!data.experienceDescription.trim()) {
          toast.error('Please describe your desired experience');
          setIsLoading(false);
          return;
        }
        payload.experienceDescription = data.experienceDescription;
        if (data.budget) payload.budget = data.budget;
        if (data.season) payload.season = data.season;
        if (data.country) payload.country = data.country;
        if (interestsArray.length > 0) payload.interests = interestsArray;
      } else {
        if (!data.season) {
          toast.error('Season/Month is required in manual mode');
          setIsLoading(false);
          return;
        }
        payload.budget = data.budget;
        payload.season = data.season;
        payload.country = data.country;
        payload.interests = interestsArray;
      }

      const res = await api.post('/ai/recommend-destinations', payload);
      setRecommendations(res.data.recommendations || []);
      toast.success('Recommendations ready!');
    } catch (err) {
      toast.error(err.message || 'Failed to fetch recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically trigger matching if search query is provided
  useEffect(() => {
    if (searchQ) {
      setValue('experienceDescription', searchQ);
      handleSubmit(onSubmit)();
    }
  }, [searchQ]);

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display flex items-center gap-2">
          <LuSparkles className="text-accent animate-pulse" /> AI Destination Recommendations
        </h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Get personalized suggestions by describing your desired experience or setting custom filters.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-6 h-fit rounded-2xl shadow-sm">
          {/* Mode Selector Tabs */}
          <div className="flex bg-primary-50 dark:bg-primary-950/40 p-1 rounded-xl border border-primary-100 dark:border-dark-border">
            <button
              onClick={() => setSearchMode('vibe')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                searchMode === 'vibe'
                  ? 'bg-white dark:bg-dark-card text-accent shadow-2xs'
                  : 'text-primary-900/50 dark:text-dark-muted hover:text-accent'
              }`}
            >
              ✨ Experience Vibe
            </button>
            <button
              onClick={() => setSearchMode('manual')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                searchMode === 'manual'
                  ? 'bg-white dark:bg-dark-card text-accent shadow-2xs'
                  : 'text-primary-900/50 dark:text-dark-muted hover:text-accent'
              }`}
            >
              ⚙️ Manual Filters
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {searchMode === 'vibe' ? (
              /* Vibe/Experience prompt Mode */
              <div className="space-y-2">
                <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Describe Your Vibe / Experience</label>
                <textarea
                  rows="4"
                  placeholder="e.g. I want to see historic temples, walk in quiet bamboo forests, try local traditional tea ceremonies, and eat fresh sushi at local food stalls..."
                  className="w-full px-4 py-3 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold h-auto resize-none leading-relaxed"
                  {...register('experienceDescription')}
                />
                <p className="text-[10px] text-primary-900/40 dark:text-dark-muted/50 font-bold leading-normal">
                  Describe what you want to see, feel, or eat in natural language. Gemini AI will match destinations directly!
                </p>
              </div>
            ) : (
              /* Manual filters Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Preferred Budget</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('budget')}>
                    <option value="budget">Budget (₹)</option>
                    <option value="mid-range">Mid-range (₹₹)</option>
                    <option value="luxury">Luxury (₹₹₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Season / Month</label>
                  <input type="text" placeholder="e.g. Summer, October" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('season')} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Interests (comma separated)</label>
                  <input type="text" placeholder="e.g. history, food, adventure" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('interests')} />
                </div>
              </div>
            )}

            {/* Collapsible Optional Filters for Vibe Mode / Standard for manual */}
            {searchMode === 'vibe' ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowOptional(!showOptional)}
                  className="flex items-center justify-between w-full text-xs font-bold text-accent cursor-pointer hover:underline select-none"
                >
                  <span className="flex items-center gap-1"><LuCompass className="text-sm shrink-0" /> Customize Preferences (Optional)</span>
                  {showOptional ? <LuChevronUp /> : <LuChevronDown />}
                </button>

                {showOptional && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-2 border-t border-primary-50 dark:border-dark-border"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Preferred Budget</label>
                      <select className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold transition-all" {...register('budget')}>
                        <option value="budget">Budget (₹)</option>
                        <option value="mid-range">Mid-range (₹₹)</option>
                        <option value="luxury">Luxury (₹₹₹)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Season / Month</label>
                      <input type="text" placeholder="e.g. Summer, October" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold transition-all" {...register('season')} />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Target Country/Region</label>
                      <input type="text" placeholder="e.g. Japan, Europe" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold transition-all" {...register('country')} />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Interests (comma separated)</label>
                      <input type="text" placeholder="e.g. history, food" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold transition-all" {...register('interests')} />
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-2 border-t border-primary-50 dark:border-dark-border">
                <div>
                  <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Target Country/Region (Optional)</label>
                  <input type="text" placeholder="e.g. Europe, Japan" className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all" {...register('country')} />
                </div>
              </div>
            )}

            {/* Common fields (Style, Duration) */}
            <div className="grid grid-cols-2 gap-4 border-t border-primary-50 dark:border-dark-border pt-4">
              <div>
                <label className="block text-[10px] font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Travel Style</label>
                <select className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold transition-all" {...register('travelStyle')}>
                  <option value="solo">Solo</option>
                  <option value="couple">Couple</option>
                  <option value="family">Family</option>
                  <option value="group">Group</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Duration (Days)</label>
                <input type="number" min="1" max="60" className="w-full px-3 py-2 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-xs font-semibold transition-all" {...register('duration')} />
              </div>
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
                  <LuSparkles /> Match Destinations
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 skeleton w-full animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : recommendations ? (
            recommendations.length > 0 ? (
              recommendations.map((item, idx) => {
                const activeTab = activeCardTabs[idx] || 'overview';
                const handleTabChange = (tab) => {
                  setActiveCardTabs((prev) => ({ ...prev, [idx]: tab }));
                };
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-5 border-l-4 border-l-accent rounded-2xl shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-primary-900 dark:text-white font-display">
                          {item.name}, {item.country}
                        </h3>
                        <p className="text-xs text-accent font-bold mt-1 flex items-center gap-1">
                          <LuCalendar className="text-sm shrink-0" /> Best time: {item.bestTime}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-primary-100/50 dark:bg-primary-900/20 text-accent font-extrabold text-[10px] tracking-wide">
                        💡 Choice #{idx + 1}
                      </span>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-1 border-b border-primary-100 dark:border-dark-border pb-1">
                      {[
                        { id: 'overview', label: 'Vibe & Overview' },
                        { id: 'activities', label: 'Activities & Food' },
                        { id: 'gems', label: 'Hidden Gems' },
                        { id: 'culture', label: 'Culture & Budget' },
                        { id: 'map', label: 'Map View' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleTabChange(tab.id)}
                          className={`py-1.5 px-3 font-extrabold text-[11px] uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                            activeTab === tab.id
                              ? 'bg-accent/15 text-accent'
                              : 'text-primary-900/50 dark:text-dark-muted hover:text-accent hover:bg-primary-50/50 dark:hover:bg-primary-950/20'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[140px] pt-1">
                      {activeTab === 'overview' && (
                        <div className="space-y-4">
                          <p className="text-sm text-primary-900/80 dark:text-dark-text leading-relaxed font-medium">
                            {item.whyItMatches}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-primary-900/60 dark:text-dark-muted pt-2 border-t border-primary-50 dark:border-dark-border">
                            <div>
                              <span className="block text-[10px] text-primary-900/40 uppercase font-black">💰 Total Budget</span>
                              <span className="text-accent text-sm capitalize">
                                {item.budgetBreakdown 
                                  ? `₹${(Number(item.budgetBreakdown.accommodation) || 0) + (Number(item.budgetBreakdown.food) || 0) + (Number(item.budgetBreakdown.transport) || 0) + (Number(item.budgetBreakdown.activities) || 0)} / day`
                                  : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-primary-900/40 uppercase font-black">📅 Recommended Season</span>
                              <span className="text-accent text-sm">{item.bestTime || 'Year-round'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'activities' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <h4 className="font-bold text-[11px] uppercase tracking-wider text-accent flex items-center gap-1">
                              <LuActivity className="text-sm shrink-0" /> Top Activities
                            </h4>
                            <ul className="space-y-1.5 text-xs text-primary-900/80 dark:text-dark-text font-semibold">
                              {item.topActivities?.map((act, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-bold text-[11px] uppercase tracking-wider text-accent flex items-center gap-1">
                              <LuUtensils className="text-sm shrink-0" /> Famous Local Foods
                            </h4>
                            <ul className="space-y-2 text-xs font-semibold">
                              {item.famousFoods?.map((food, i) => (
                                <li key={i} className="text-primary-900/80 dark:text-dark-text leading-relaxed">
                                  <strong className="text-accent">{food.name}</strong>: {food.description}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {activeTab === 'gems' && (
                        <div className="space-y-3">
                          <h4 className="font-bold text-[11px] uppercase tracking-wider text-accent flex items-center gap-1.5">
                            🗺️ Off-The-Beaten-Path Hidden Gems
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {item.hiddenGems?.map((gem, i) => (
                              <div key={i} className="bg-primary-50/50 dark:bg-primary-950/20 p-3 rounded-xl border border-primary-100/50 dark:border-primary-900/10 flex flex-col justify-between">
                                <h5 className="font-bold text-primary-900 dark:text-white text-xs">{gem.name}</h5>
                                <p className="text-[11px] text-primary-900/60 dark:text-dark-muted mt-1 leading-normal font-semibold">
                                  {gem.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 'culture' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <h4 className="font-bold text-[11px] uppercase tracking-wider text-accent flex items-center gap-1">
                              <LuBookOpen className="text-sm shrink-0" /> Cultural Insights
                            </h4>
                            <ul className="space-y-2 text-xs text-primary-900/80 dark:text-dark-text font-semibold italic">
                              {item.culturalTips?.map((tip, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <LuLightbulb className="text-accent shrink-0 mt-0.5" />
                                  <span>"{tip}"</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-bold text-[11px] uppercase tracking-wider text-accent flex items-center gap-1">
                              <LuCoins className="text-sm shrink-0" /> Daily Cost Breakdown
                            </h4>
                            <div className="bg-primary-50/50 dark:bg-primary-950/20 p-3 rounded-xl border border-primary-100/50 dark:border-primary-900/10 grid grid-cols-2 gap-2 text-xs font-semibold text-primary-900/70 dark:text-dark-muted">
                              <div>🏨 Stay: <span className="text-accent font-bold">₹{item.budgetBreakdown?.accommodation || 0}</span></div>
                              <div>🍜 Food: <span className="text-accent font-bold">₹{item.budgetBreakdown?.food || 0}</span></div>
                              <div>🚕 Transit: <span className="text-accent font-bold">₹{item.budgetBreakdown?.transport || 0}</span></div>
                              <div>🎟️ Tickets: <span className="text-accent font-bold">₹{item.budgetBreakdown?.activities || 0}</span></div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'map' && (
                        <div className="w-full h-64 rounded-xl overflow-hidden border border-primary-100 dark:border-dark-border relative">
                          <LeafletMap lat={Number(item.latitude)} lng={Number(item.longitude)} popupText={`${item.name}, ${item.country}`} zoom={8} />
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-primary-50 dark:border-dark-border">
                      <button
                        onClick={() => {
                          const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          navigate(`/destinations/${slug}`);
                        }}
                        className="btn bg-primary-100/50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-accent font-bold py-2 px-4 rounded-xl text-xs shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        👁️ View Details
                      </button>
                      <button
                        onClick={() => navigate(`/trip-planner?dest=${encodeURIComponent(item.name)}`)}
                        className="btn bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm hover:shadow-glow flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <LuCompass className="text-sm shrink-0" /> Plan Trip
                      </button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/60 dark:text-dark-muted rounded-2xl">
                <p className="font-semibold">AI didn't return any suggestions. Try expanding your search options.</p>
              </div>
            )
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted flex flex-col items-center justify-center space-y-4 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary-100/50 dark:bg-primary-900/20 flex items-center justify-center text-3xl animate-float">🤖</div>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">Awaiting Search Preferences</h3>
              <p className="text-xs max-w-xs leading-relaxed font-semibold">Complete the parameters form on the left and match to discover tailored cultural trips suggestions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
