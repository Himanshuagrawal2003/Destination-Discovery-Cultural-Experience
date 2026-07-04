import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdSearch, MdPlace, MdAutoAwesome, MdFilterList } from 'react-icons/md';
import api from '../services/api';

export default function Home() {
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, trendingRes] = await Promise.all([
          api.get('/destinations/featured'),
          api.get('/destinations/trending'),
        ]);
        setFeatured(featuredRes.data.destinations || []);
        setTrending(trendingRes.data.destinations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* ── Hero Section ── */}
      <section className="relative hero-gradient text-white py-24 md:py-32 px-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />

        <div className="container-cq max-w-4xl text-center space-y-8 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold tracking-wider uppercase"
          >
            <MdAutoAwesome className="text-amber-400 animate-pulse" />
            AI-Powered Cultural Tourism Platform
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display leading-tight"
          >
            Discover the World's Rich Heritage & <span className="text-amber-400">Cultural Wonders</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-teal-50 max-w-2xl mx-auto font-medium"
          >
            Explore immersive local stories, discover authentic hidden gems, participate in traditional festivals, and build smart travel plans powered by Gemini AI.
          </motion.p>

          {/* Search Box */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white dark:bg-slate-800 p-2 rounded-2xl sm:rounded-full shadow-2xl flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex-1 w-full flex items-center gap-2 px-4 py-2">
              <MdSearch className="text-2xl text-slate-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Where do you want to explore?"
                className="w-full bg-transparent border-none text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto btn bg-teal-700 hover:bg-teal-800 text-white px-8 py-3 rounded-xl sm:rounded-full font-bold cursor-pointer"
            >
              Explore
            </button>
          </motion.form>

          {/* Quick AI tools */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 pt-4 text-xs font-semibold"
          >
            <Link to="/ai/recommend" className="flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-full backdrop-blur-sm transition-all border border-white/5">
              <span>🤖</span> Recommendation
            </Link>
            <Link to="/ai/itinerary" className="flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-full backdrop-blur-sm transition-all border border-white/5">
              <span>📅</span> Day Itinerary
            </Link>
            <Link to="/ai/budget" className="flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-full backdrop-blur-sm transition-all border border-white/5">
              <span>💵</span> Budget Planner
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Destinations ── */}
      <section className="container-cq">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">Featured Wonders</h2>
            <p className="text-slate-500 dark:text-dark-muted text-sm mt-1">Explore our most popular and historically significant destinations.</p>
          </div>
          <Link to="/destinations" className="text-sm font-semibold text-teal-650 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1 hover:underline">
            View All <span className="text-xs">→</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featured.slice(0, 4).map((item) => (
              <Link
                key={item._id}
                to={`/destinations/${item.slug || item._id}`}
                className="group card overflow-hidden flex flex-col hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {item.coverImage && (
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 text-primary-700 dark:text-primary-300 font-bold text-2xs rounded-lg shadow-sm capitalize">
                    {item.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-dark-muted flex items-center gap-1 mt-1 font-medium">
                      <MdPlace className="text-slate-400 shrink-0" />
                      {item.city}, {item.country}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/80 pt-3 mt-3">
                    <span className="stars text-xs flex items-center gap-0.5">
                      ⭐ <span className="font-bold text-slate-700 dark:text-slate-200">{item.rating?.average || 0}</span>
                    </span>
                    {item.isTrending && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] font-bold rounded">
                        Trending
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Trending Places ── */}
      <section className="container-cq">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">Trending Journeys</h2>
            <p className="text-slate-500 dark:text-dark-muted text-sm mt-1 font-medium">Top destinations getting active tourist reviews right now.</p>
          </div>
          <Link to="/destinations?sort=-viewCount" className="text-sm font-semibold text-teal-650 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1 hover:underline">
            View All <span className="text-xs">→</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {trending.slice(0, 3).map((item) => (
              <Link
                key={item._id}
                to={`/destinations/${item.slug || item._id}`}
                className="group card overflow-hidden flex flex-col hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {item.coverImage && (
                    <img
                      src={item.coverImage}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 text-primary-700 dark:text-primary-300 font-bold text-2xs rounded-lg shadow-sm capitalize">
                    {item.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-dark-muted flex items-center gap-1 mt-1">
                      <MdPlace className="text-slate-400 shrink-0" />
                      {item.city}, {item.country}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/80 pt-3 mt-4 text-xs font-semibold">
                    <span className="stars flex items-center gap-0.5 text-amber-500">
                      ⭐ <span className="font-bold text-slate-700 dark:text-slate-200">{item.rating?.average || 0}</span>
                    </span>
                    <span className="text-slate-400 dark:text-dark-muted font-medium">
                      👁️ {item.viewCount || 0} views
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
