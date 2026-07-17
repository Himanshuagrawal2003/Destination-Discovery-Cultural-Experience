import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LuSearch, 
  LuMapPin, 
  LuFilter, 
  LuX, 
  LuStar,
  LuCoins,
  LuSparkles
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
  const [destinations, setDestinations] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);

  // Read search parameters
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const budget = searchParams.get('budget') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchDestinationsList = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.set('search', search);
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
    nextParams.set('page', '1'); // reset page on filter change
    setSearchParams(nextParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container-cq py-8 space-y-8 min-h-screen bg-[#FAF7FF] dark:bg-dark-bg">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display">Explore Destinations</h1>
          <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Uncover historical wonders and choose your next trip itinerary.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
            className="lg:hidden btn bg-primary-100/50 hover:bg-primary-100 text-accent font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 flex-1 justify-center transition-all cursor-pointer"
          >
            <LuFilter className="text-base shrink-0" /> {isFilterCollapsed ? 'Show Filters' : 'Hide Filters'}
          </button>
          {(search || category || budget) && (
            <button onClick={handleClearFilters} className="btn bg-red-50 hover:bg-red-100 text-red-500 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1 transition-all cursor-pointer">
              <LuX className="text-base shrink-0" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className={`card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 space-y-6 h-fit lg:sticky lg:top-24 rounded-2xl shadow-sm ${isFilterCollapsed ? 'hidden lg:block' : 'block lg:block'}`}>
          <div className="flex items-center gap-2 font-bold text-primary-900 dark:text-white border-b border-primary-100 dark:border-dark-border pb-3 font-display">
            <LuFilter className="text-xl text-accent" />
            <h3>Filters</h3>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-primary-900 dark:text-dark-text uppercase tracking-wider mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Country, city, place name..."
                value={search}
                onChange={(e) => updateParam('search', e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm font-medium transition-all"
              />
              <LuSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-900/40 dark:text-dark-muted text-base" />
            </div>
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
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 skeleton animate-pulse rounded-2xl" />
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
                    <div className="relative h-48 overflow-hidden bg-primary-50">
                      {item.coverImage && (
                        <img
                          src={item.coverImage}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}
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
                          {item.city}, {item.country}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-primary-50 dark:border-dark-border pt-3 mt-3">
                        <span className="text-xs flex items-center gap-0.5 font-bold text-accent">
                          <LuStar className="fill-accent text-accent text-xs" /> <span>{item.rating?.average || 0}</span>
                        </span>
                        {item.budget?.level && (
                          <span className="px-2 py-0.5 bg-primary-50 text-accent dark:bg-primary-950 dark:text-primary-300 text-[10px] font-extrabold rounded capitalize">
                            💰 {item.budget.level}
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
                    className="btn bg-primary-100/50 hover:bg-primary-100 text-accent font-bold px-4 py-2 rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-primary-900/50 dark:text-dark-muted px-2">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => updateParam('page', (page + 1).toString())}
                    className="btn bg-primary-100/50 hover:bg-primary-100 text-accent font-bold px-4 py-2 rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted space-y-4 rounded-2xl">
              <span className="text-6xl block animate-float">🏖️</span>
              <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">No Destinations Found</h3>
              <p className="text-xs max-w-md mx-auto leading-relaxed font-semibold">We couldn't find any destinations matching your criteria. Try adjustments to your parameters or clear the query filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
