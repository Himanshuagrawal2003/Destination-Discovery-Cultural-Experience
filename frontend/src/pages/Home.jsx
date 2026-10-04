import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LuSearch,
  LuMapPin,
  LuSparkles,
  LuCompass,
  LuHistory,
  LuBookOpen,
  LuChefHat,
  LuCalendarDays,
  LuMessageSquare,
  LuStar,
  LuGem,
  LuArrowRight,
  LuThumbsUp
} from 'react-icons/lu';
import api from '../services/api';

const AI_FEATURES = [
  {
    icon: LuCompass,
    title: "AI Destination Discovery",
    desc: "Find custom-tailored travel suggestions based on your budget, season, interests, and preferred style.",
    link: "/ai/recommend",
    badge: "Popular"
  },
  {
    icon: LuBookOpen,
    title: "Heritage Storyteller",
    desc: "Unveil historical secrets, folklore, local legends, and cultural etiquette of monuments and ancient cities.",
    link: "/ai/history",
    badge: "Immersive"
  },
  {
    icon: LuSparkles,
    title: "AI Itinerary Builder",
    desc: "Generate complete, interactive day-by-day itineraries with morning, afternoon, evening, and night activities.",
    link: "/ai/itinerary",
    badge: "Smart"
  },
  {
    icon: LuGem,
    title: "Hidden Gems Explorer",
    desc: "Discover quiet cafes, photography spots, peaceful temples, and scenic viewpoints off the beaten path.",
    link: "/hidden-gems",
    badge: "Secret"
  },
  {
    icon: LuChefHat,
    title: "Authentic Food Finder",
    desc: "Explore regional delicacies, local street food recommendations, and premium traditional dining options.",
    link: "/ai/food-guide",
    badge: "Yummy"
  },
  {
    icon: LuMessageSquare,
    title: "Travel Assistant Chat",
    desc: "Get instant advice on local visa guidelines, weather alerts, emergency contact numbers, and currency exchange.",
    link: "/destinations", // Chatbot is available globally, guides to active explore
    badge: "24/7 Live"
  }
];

export default function Home() {
  const [search, setSearch] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/reviews/featured?limit=9');
        const list = res.data?.reviews || res.data?.data?.reviews || [];
        setReviews(list);
      } catch (err) {
        console.error('Error fetching featured reviews:', err);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      const slug = search.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      navigate(`/destinations/${slug}`);
    }
  };

  return (
    <div className="space-y-14 sm:space-y-20 md:space-y-24 pb-20 sm:pb-24 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      {/*  Hero Section  */}
      <section className="relative overflow-hidden py-14 sm:py-20 md:py-28 px-4 border-b border-primary-100 dark:border-dark-border bg-gradient-to-b from-[#EDE9FE]/60 via-[#FAF7FF] to-[#FAF7FF] dark:from-dark-bg dark:to-dark-bg dark:bg-dark-bg">
        {/* Soft glowing ambient backgrounds (hidden in dark mode to prevent white haze) */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#C4B5FD]/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none dark:hidden" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#DDD6FE]/30 rounded-full blur-3xl pointer-events-none dark:hidden" />

        <div className="container-cq max-w-5xl text-center space-y-5 sm:space-y-6 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display leading-tight tracking-tight text-primary-900 dark:text-white"
          >
            Discover the World's Rich Heritage & <br className="hidden sm:inline" />
            <span className="text-accent drop-shadow-sm">Cultural Wonders</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-base md:text-lg text-primary-900/70 dark:text-dark-muted max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Explore immersive local stories, discover authentic hidden gems, participate in traditional festivals, and build smart travel plans powered by Gemini AI.
          </motion.p>

          {/* Search Box */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white dark:bg-dark-card p-1.5 sm:p-2 rounded-2xl sm:rounded-full shadow-lg border border-primary-100 dark:border-dark-border flex items-center gap-2"
          >
            <div className="flex-1 w-full flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 min-w-0">
              <LuSearch className="text-lg sm:text-xl text-primary-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Where to explore? (e.g. Kyoto, Varanasi, Agra)"
                className="w-full bg-transparent border-none text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none text-xs sm:text-sm font-medium truncate"
              />
            </div>
            <button
              type="submit"
              className="btn bg-accent hover:bg-accent/90 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-full font-bold shadow-md cursor-pointer transition-all hover:shadow-glow text-xs sm:text-sm shrink-0"
            >
              Explore
            </button>
          </motion.form>

          {/* Quick AI tools */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-2 text-xs font-semibold text-primary-900 dark:text-white"
          >
            <Link to="/ai/recommend" className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-dark-card hover:bg-primary-100/50 dark:hover:bg-dark-border rounded-full border border-primary-200/50 dark:border-dark-border transition-all shadow-sm shrink-0">
              <LuCompass className="text-accent text-xs sm:text-sm" /> AI Discovery
            </Link>
            <Link to="/ai/itinerary" className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-dark-card hover:bg-primary-100/50 dark:hover:bg-dark-border rounded-full border border-primary-200/50 dark:border-dark-border transition-all shadow-sm shrink-0">
              <LuSparkles className="text-accent text-xs sm:text-sm" /> Day Itinerary
            </Link>
            <Link to="/ai/budget" className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-dark-card hover:bg-primary-100/50 dark:hover:bg-dark-border rounded-full border border-primary-200/50 dark:border-dark-border transition-all shadow-sm shrink-0">
              <LuStar className="text-accent text-xs sm:text-sm" /> Budget Planner
            </Link>
          </motion.div>
        </div>
      </section>

      {/*  AI Features Section  */}
      <section className="container-cq">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-primary-900 dark:text-white font-display tracking-tight leading-snug">
            Supercharge Your Journey with Generative AI
          </h2>
          <p className="text-primary-900/60 dark:text-dark-muted text-sm font-medium">
            Discover places deeply, plan intelligently, and immerse yourself in local cultures with our tailored AI toolset.
          </p> </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AI_FEATURES.map((feat, index) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -6, boxShadow: "0 12px 30px -10px rgba(139, 92, 246, 0.15)" }}
              className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 rounded-2xl flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-xl bg-primary-100/60 dark:bg-primary-900/20 text-accent">
                    <feat.icon className="text-2xl" /> </div>
                  <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-bold">
                    {feat.badge}
                  </span> </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-primary-900/60 dark:text-dark-muted leading-relaxed">
                    {feat.desc}
                  </p> </div> </div>
              <div className="pt-6">
                <Link
                  to={feat.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors"
                >
                  Launch App <LuArrowRight className="text-sm" /> </Link> </div> </motion.div>
          ))}
        </div> </section>


      {/*  Real Reviews Section  */}
      <section className="container-cq">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-primary-900 dark:text-white font-display tracking-tight leading-snug">
            Loved by Cultural Explorers
          </h2>
          <p className="text-primary-900/60 dark:text-dark-muted text-sm font-medium">
            Real reviews from travelers who explored destinations through CultureQuest.
          </p> </div>

        {isLoadingReviews ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 rounded-2xl space-y-4 shadow-sm animate-pulse">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => <div key={j} className="w-4 h-4 bg-amber-200 rounded-sm" />)}
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-primary-100 dark:bg-dark-border rounded w-full" />
                  <div className="h-3 bg-primary-100 dark:bg-dark-border rounded w-4/5" />
                  <div className="h-3 bg-primary-100 dark:bg-dark-border rounded w-3/5" /> </div>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-dark-border" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3 bg-primary-100 dark:bg-dark-border rounded w-24" />
                    <div className="h-2 bg-primary-100 dark:bg-dark-border rounded w-36" /> </div> </div> </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="text-5xl"></div>
            <p className="text-primary-900/60 dark:text-dark-muted text-sm font-medium">
              No reviews yet  be the first explorer to share your experience!
            </p>
            <Link to="/destinations" className="inline-block mt-2 btn bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
              Explore Destinations
            </Link> </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map((rev, index) => {
                const avatarSrc = rev.user?.avatar || rev.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.name || 'User')}&background=4f46e5&color=fff&size=200`;
                const destName = rev.destination?.name || 'a destination';
                const destSlug = rev.destination?.slug;
                return (
                  <motion.div
                    key={rev._id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <LuStar
                          key={i}
                          className={`text-sm ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-primary-200 dark:text-dark-border'}`}
                        />
                      ))}
                      <span className="ml-1.5 text-[10px] text-primary-900/50 dark:text-dark-muted font-semibold">{rev.rating}/5</span>
                    </div>

                    {/* Title if available */}
                    {rev.title && (
                      <p className="text-xs font-bold text-primary-900 dark:text-white uppercase tracking-wide">{rev.title}</p>
                    )}

                    {/* Comment */}
                    <p className="flex-1 text-sm italic text-primary-900/80 dark:text-dark-muted leading-relaxed font-medium line-clamp-4">
                      &ldquo;{rev.comment}&rdquo;
                    </p>

                    {/* Destination badge */}
                    {destSlug ? (
                      <Link
                        to={`/destinations/${destSlug}`}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-accent hover:underline w-fit"
                      >
                        <LuMapPin className="text-xs shrink-0" /> {destName}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-900/40 dark:text-dark-muted w-fit">
                        <LuMapPin className="text-xs shrink-0" /> {destName}
                      </span>
                    )}

                    {/* User info */}
                    <div className="flex items-center gap-3 pt-3 border-t border-primary-100 dark:border-dark-border">
                      <img
                        src={avatarSrc}
                        alt={rev.user?.name || 'User'}
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.name || 'U')}&background=4f46e5&color=fff&size=200`; }}
                        className="w-9 h-9 rounded-full object-cover border-2 border-primary-100 dark:border-dark-border shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-primary-900 dark:text-white font-display truncate">
                          {rev.user?.name || 'Anonymous'}
                        </h4>
                        <p className="text-[10px] text-primary-900/50 dark:text-dark-muted font-semibold">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {rev.likesCount > 0 && <span className="ml-2 inline-flex items-center gap-0.5"><LuThumbsUp className="text-[9px]" /> {rev.likesCount}</span>}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* See More Toggle Button */}
            {reviews.length > 3 && (
              <div className="text-center pt-8">
                <button
                  type="button"
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="btn bg-white dark:bg-dark-card hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white text-accent dark:text-primary-300 font-bold px-7 py-3 rounded-xl border border-primary-200/60 dark:border-dark-border text-xs sm:text-sm shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  {showAllReviews ? 'Show Less' : `See More Reviews (${reviews.length - 3} more)`}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/*  Call To Action Section  */}
      <section className="container-cq">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-accent via-primary-600 to-primary-700 dark:from-dark-card dark:via-[#1e1b4b] dark:to-dark-card border border-primary-100/20 dark:border-dark-border text-white p-8 sm:p-12 md:p-16 rounded-3xl overflow-hidden shadow-xl text-center space-y-6"
        >
          {/* Decorative shapes (subtle) */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 dark:bg-accent/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 dark:bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-display leading-tight">
              Ready to Explore the World's Untold Stories?
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-primary-100 dark:text-dark-muted font-medium">
              Create an account now to start generating bespoke itineraries, uncovering local myths, discovering secret wonders, and mapping cultural details.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3 bg-white text-accent hover:bg-primary-50 dark:bg-accent dark:text-white dark:hover:bg-accent/90 font-bold rounded-xl shadow-md transition-all text-xs sm:text-sm cursor-pointer"
              >
                Get Started Free
              </Link>
              <Link
                to="/destinations"
                className="w-full sm:w-auto px-8 py-3 bg-transparent border border-white/30 dark:border-dark-border text-white font-bold rounded-xl hover:bg-white/10 dark:hover:bg-dark-border/50 transition-all text-xs sm:text-sm cursor-pointer"
              >
                Browse Wonders
              </Link>
            </div>
          </div>
        </motion.div>
      </section> </div>
  );
}
