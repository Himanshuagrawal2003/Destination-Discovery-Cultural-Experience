import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuSearch, 
  LuMapPin, 
  LuFilter, 
  LuX, 
  LuStar,
  LuSparkles,
  LuCompass,
  LuArrowRight,
  LuHistory,
  LuUtensils,
  LuCamera
} from 'react-icons/lu';
import api from '../services/api';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'beach', label: 'Beach' },
  { value: 'mountain', label: 'Mountain' },
  { value: 'city', label: 'City' },
  { value: 'desert', label: 'Desert' },
  { value: 'forest', label: 'Forest' },
  { value: 'historical', label: 'Historical' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'wildlife', label: 'Wildlife' }
];

const BUDGET_LEVELS = [
  { value: '', label: 'All Budgets' },
  { value: 'budget', label: 'Budget' },
  { value: 'mid-range', label: 'Mid-range' },
  { value: 'luxury', label: 'Luxury' }
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: '-rating.average', label: 'Highest Rated' },
  { value: '-viewCount', label: 'Most Visited' }
];

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localInput, setLocalInput] = useState('');
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);

  // Read search parameters
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const budget = searchParams.get('budget') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const hasSearch = Boolean(search.trim() || category || budget);

  useEffect(() => {
    setLocalInput(search);
  }, [search]);

  useEffect(() => {
    const fetchDestinationsList = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search.trim());
        if (category) queryParams.set('category', category);
        if (budget) queryParams.set('budget.level', budget);
        if (sort) queryParams.set('sort', sort);
        queryParams.set('page', page.toString());
        queryParams.set('limit', '12');

        const res = await api.get(`/destinations?${queryParams.toString()}`);
        setDestinations(res.data.data || []);
        setPagination(res.data.pagination || null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDestinationsList();
  }, [search, category, budget, sort, page]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    if (key !== 'page') {
      nextParams.set('page', '1'); // reset page on filter change
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localInput.trim()) {
      updateParam('search', localInput.trim());
    } else {
      updateParam('search', '');
    }
  };

  const handleClearFilters = () => {
    setLocalInput('');
    setSearchParams(new URLSearchParams());
  };

  const getSlug = (text) => {
    return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="container-cq py-8 space-y-8 min-h-screen bg-[#FAF7FF] dark:bg-dark-bg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-primary-900 dark:text-white font-display tracking-tight leading-snug">
            {hasSearch ? 'Search Destinations' : 'My Explored Destinations'}
          </h1>
          <p className="text-xs sm:text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">
            {hasSearch 
              ? 'Showing matching places for your search query.' 
              : 'Destinations you have searched and explored.'}
          </p>
        </div>
        {hasSearch && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
              className="lg:hidden btn bg-primary-100/50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-accent font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 flex-1 justify-center transition-all cursor-pointer"
            >
              <LuFilter className="text-base shrink-0" /> {isFilterCollapsed ? 'Show Filters' : 'Hide Filters'}
            </button>
            <button 
              onClick={handleClearFilters} 
              className="btn bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1 transition-all cursor-pointer"
            >
              <LuX className="text-base shrink-0" /> Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Main Search Bar (Always Accessible on Top) */}
      <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 p-2 bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-accent/40 transition-all">
          <div className="flex items-center gap-2 flex-1 px-3 min-w-0">
            <LuSearch className="text-xl text-accent shrink-0" />
            <input
              type="text"
              placeholder="Search by city, country, or landmark (e.g. Goa, Kyoto, Varanasi)..."
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              className="w-full bg-transparent border-none text-primary-900 dark:text-white placeholder-primary-300 dark:placeholder-dark-muted focus:outline-none text-sm font-medium"
            />
            {localInput && (
              <button
                type="button"
                onClick={() => {
                  setLocalInput('');
                  if (search) updateParam('search', '');
                }}
                className="text-primary-900/40 hover:text-primary-900 dark:text-dark-muted dark:hover:text-white p-1 cursor-pointer"
              >
                <LuX className="text-base" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="btn bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Conditional View: When user has no destinations yet vs when destinations exist */}
      {!hasSearch && destinations.length === 0 && !isLoading ? (
        /* Empty State: First-Time User Search Prompt */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto py-12 px-6 bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border rounded-3xl text-center space-y-8 shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-100/60 dark:bg-primary-900/30 text-accent flex items-center justify-center mx-auto text-3xl">
            <LuCompass className="animate-spin-slow" />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-primary-900 dark:text-white font-display">
              Type Any Place to Begin
            </h2>
            <p className="text-sm text-primary-900/60 dark:text-dark-muted leading-relaxed font-medium">
              Search any destination (e.g. Goa, Paris, Tokyo) in the search bar above. It will be added exclusively to your personal destination collection.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
            <div className="p-4 rounded-2xl bg-primary-50/50 dark:bg-dark-bg/60 border border-primary-100/50 dark:border-dark-border space-y-2">
              <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-lg">
                <LuCamera />
              </div>
              <h3 className="font-bold text-sm text-primary-900 dark:text-white font-display">100% Real Photography</h3>
              <p className="text-xs text-primary-900/60 dark:text-dark-muted">Authenticated landmark and monument photos from Wikimedia Commons.</p>
            </div>

            <div className="p-4 rounded-2xl bg-primary-50/50 dark:bg-dark-bg/60 border border-primary-100/50 dark:border-dark-border space-y-2">
              <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-lg">
                <LuHistory />
              </div>
              <h3 className="font-bold text-sm text-primary-900 dark:text-white font-display">Rich Cultural Lore</h3>
              <p className="text-xs text-primary-900/60 dark:text-dark-muted">Historical origins, traditional customs, and architectural wonders.</p>
            </div>

            <div className="p-4 rounded-2xl bg-primary-50/50 dark:bg-dark-bg/60 border border-primary-100/50 dark:border-dark-border space-y-2">
              <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-lg">
                <LuUtensils />
              </div>
              <h3 className="font-bold text-sm text-primary-900 dark:text-white font-display">Authentic Delicacies</h3>
              <p className="text-xs text-primary-900/60 dark:text-dark-muted">Must-try local dishes and secret culinary spots curated by AI.</p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Results Section */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className={`card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-6 h-fit lg:sticky lg:top-24 rounded-2xl shadow-sm ${isFilterCollapsed ? 'hidden lg:block' : 'block lg:block'}`}>
            <div className="flex items-center gap-2 font-bold text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">
              <LuFilter className="text-xl text-accent" />
              <h3>Refine Results</h3>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => updateParam('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium capitalize transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Budget Level Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Budget Level</label>
              <select
                value={budget}
                onChange={(e) => updateParam('budget', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              >
                {BUDGET_LEVELS.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Sort By</label>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-3 space-y-8">
            {/* Search Header Banner (Only when active search/filter) */}
            {hasSearch && (search || category || budget) && (
              <div className="p-4 bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
                <div>
                  <span className="text-xs font-bold text-primary-900/50 dark:text-dark-muted">Showing results for:</span>
                  <h2 className="text-lg font-black text-primary-900 dark:text-white font-display">
                    &ldquo;{search || category || budget}&rdquo;
                  </h2>
                </div>
                {search && (
                  <Link
                    to={`/destinations/${getSlug(search)}`}
                    className="btn bg-primary-100/60 hover:bg-accent hover:text-white dark:bg-primary-900/30 text-accent dark:hover:bg-accent dark:hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <LuSparkles className="text-sm shrink-0" /> Open Full AI Guide for &quot;{search}&quot; <LuArrowRight className="text-xs" />
                  </Link>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 skeleton animate-pulse rounded-2xl bg-primary-100/50 dark:bg-dark-card" />
                ))}
              </div>
            ) : destinations.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {destinations.map((item) => (
                    <Link
                      key={item._id}
                      to={`/destinations/${item.slug || item._id}`}
                      className="group card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl"
                    >
                      <div className="relative h-48 overflow-hidden bg-primary-100">
                        <img
                          src={item.coverImage || 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=900&auto=format&fit=crop&q=80'}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=900&auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-dark-card/95 text-accent font-extrabold text-2xs rounded-lg shadow-sm capitalize">
                          {item.category}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-primary-900 dark:text-white group-hover:text-accent transition-colors font-display text-sm">
                            {item.name}
                          </h3>
                          <p className="text-xs text-primary-900/50 dark:text-dark-muted flex items-center gap-1 mt-1 font-semibold">
                            <LuMapPin className="text-accent shrink-0 text-sm" />
                            {item.city ? `${item.city}, ` : ''}{item.country}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-primary-50 dark:border-dark-border pt-3 mt-3">
                          <span className="text-xs flex items-center gap-0.5 font-bold text-accent">
                            <LuStar className="fill-accent text-accent text-xs" /> <span>{item.rating?.average || 0}</span>
                          </span>
                          {item.budget?.level && (
                            <span className="px-2 py-0.5 bg-primary-50 text-accent dark:bg-primary-950 dark:text-primary-300 text-[10px] font-extrabold rounded capitalize">
                              {item.budget.level}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-4">
                    <button
                      disabled={!pagination.hasPrev}
                      onClick={() => updateParam('page', (page - 1).toString())}
                      className="btn bg-primary-100/50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-accent font-bold px-4 py-2 rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-bold text-primary-900/50 dark:text-dark-muted px-2">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      disabled={!pagination.hasNext}
                      onClick={() => updateParam('page', (page + 1).toString())}
                      className="btn bg-primary-100/50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-accent font-bold px-4 py-2 rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* No matching destinations in DB -> Offer instant AI Generation */
              <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-10 text-center space-y-5 rounded-2xl shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto text-2xl">
                  <LuSparkles />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">
                    No Exact Database Matches for &ldquo;{search}&rdquo;
                  </h3>
                  <p className="text-xs text-primary-900/60 dark:text-dark-muted leading-relaxed font-semibold">
                    CultureQuest AI can generate a complete cultural guide with genuine Wikimedia landmark photos for <strong>{search}</strong> right now.
                  </p>
                </div>
                {search && (
                  <Link
                    to={`/destinations/${getSlug(search)}`}
                    className="inline-flex items-center gap-2 btn bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <LuSparkles className="text-base" /> Generate & Explore &ldquo;{search}&rdquo; with AI
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

