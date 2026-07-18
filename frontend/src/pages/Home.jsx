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
  LuArrowRight
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

const TESTIMONIALS = [
  {
    id: 1,
    name: "Aria Chen",
    role: "Cultural Historian & Solo Traveler",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    quote: "CultureQuest's AI storytelling brought the ruins of Kyoto to life. I learned legends that aren't in any guidebook!",
    rating: 5,
    location: "Kyoto, Japan"
  },
  {
    id: 2,
    name: "Marcus Dupont",
    role: "Adventure Photographer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    quote: "The Hidden Gems Explorer led me to a quiet sunrise point in Cappadocia with no tourists. Absolutely breathtaking.",
    rating: 5,
    location: "Cappadocia, Turkey"
  },
  {
    id: 3,
    name: "Elena Rostova",
    role: "Family Traveler",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    quote: "The day itinerary generator scheduled our Rome trip perfectly. Balanced, family-friendly, and highly budget-aware.",
    rating: 5,
    location: "Rome, Italy"
  }
];

export default function Home() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      const slug = search.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      navigate(`/destinations/${slug}`);
    }
  };

  return (
    <div className="space-y-24 pb-24 bg-[#FAF7FF] dark:bg-dark-bg min-h-screen">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-24 md:py-32 px-4 border-b border-primary-100 dark:border-dark-border bg-gradient-to-b from-[#EDE9FE]/60 via-[#FAF7FF] to-[#FAF7FF] dark:from-dark-bg dark:to-dark-bg">
        {/* Soft glowing ambient backgrounds */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#C4B5FD]/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#DDD6FE]/30 rounded-full blur-3xl" />
        
        <div className="container-cq max-w-5xl text-center space-y-8 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white dark:bg-dark-card border border-primary-200 dark:border-dark-border text-xs font-bold tracking-wider text-primary-900 dark:text-primary-300 shadow-sm"
          >
            <LuSparkles className="text-accent animate-pulse" />
            AI-POWERED CULTURAL EXPERIENCE PLATFORM
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-display leading-tight text-primary-900 dark:text-white"
          >
            Discover the World's Rich Heritage & <br />
            <span className="text-accent drop-shadow-sm">Cultural Wonders</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-primary-900/70 dark:text-dark-muted max-w-2xl mx-auto font-medium"
          >
            Explore immersive local stories, discover authentic hidden gems, participate in traditional festivals, and build smart travel plans powered by Gemini AI.
          </motion.p>

          {/* Search Box */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white dark:bg-dark-card p-2 rounded-2xl sm:rounded-full shadow-lg border border-primary-100 dark:border-dark-border flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex-1 w-full flex items-center gap-2 px-4 py-2">
              <LuSearch className="text-xl text-primary-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Where do you want to explore?"
                className="w-full bg-transparent border-none text-primary-900 dark:text-white placeholder-primary-300 focus:outline-none text-sm font-medium"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto btn bg-accent hover:bg-accent/90 text-white px-8 py-3 rounded-xl sm:rounded-full font-bold shadow-md cursor-pointer transition-all hover:shadow-glow"
            >
              Explore
            </button>
          </motion.form>

          {/* Quick AI tools */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 pt-4 text-xs font-semibold text-primary-900 dark:text-white"
          >
            <Link to="/ai/recommend" className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-dark-card hover:bg-primary-100/50 dark:hover:bg-dark-border rounded-full border border-primary-200/50 dark:border-dark-border transition-all shadow-sm">
              <span>🤖</span> Discovery
            </Link>
            <Link to="/ai/itinerary" className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-dark-card hover:bg-primary-100/50 dark:hover:bg-dark-border rounded-full border border-primary-200/50 dark:border-dark-border transition-all shadow-sm">
              <span>📅</span> Day Itinerary
            </Link>
            <Link to="/ai/budget" className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-dark-card hover:bg-primary-100/50 dark:hover:bg-dark-border rounded-full border border-primary-200/50 dark:border-dark-border transition-all shadow-sm">
              <span>💵</span> Budget Planner
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── AI Features Section ── */}
      <section className="container-cq">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display">
            Supercharge Your Journey with Generative AI
          </h2>
          <p className="text-primary-900/60 dark:text-dark-muted text-sm font-medium">
            Discover places deeply, plan intelligently, and immerse yourself in local cultures with our tailored AI toolset.
          </p>
        </div>

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
                    <feat.icon className="text-2xl" />
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-bold">
                    {feat.badge}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-primary-900/60 dark:text-dark-muted leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  to={feat.link}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent/80 transition-colors"
                >
                  Launch App <LuArrowRight className="text-sm" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ── Testimonials Section ── */}
      <section className="container-cq">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display">
            Loved by Cultural Explorers
          </h2>
          <p className="text-primary-900/60 dark:text-dark-muted text-sm font-medium">
            Hear from global travelers who have designed, customized, and experienced local folklore through CultureQuest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-6 rounded-2xl space-y-4 shadow-sm"
            >
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(test.rating)].map((_, i) => (
                  <LuStar key={i} className="fill-amber-400 text-amber-400 text-sm" />
                ))}
              </div>
              <p className="text-sm italic text-primary-900/80 dark:text-dark-muted leading-relaxed font-medium">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-3 pt-2">
                <img
                  src={test.avatar}
                  alt={test.name}
                  className="w-10 h-10 rounded-full object-cover border border-primary-200"
                />
                <div>
                  <h4 className="font-bold text-xs text-primary-900 dark:text-white font-display">
                    {test.name}
                  </h4>
                  <p className="text-[10px] text-primary-900/50 dark:text-dark-muted font-semibold">
                    {test.role} • {test.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Call To Action Section ── */}
      <section className="container-cq">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-accent to-[#C4B5FD] text-white p-10 md:p-16 rounded-3xl overflow-hidden shadow-lg text-center space-y-6"
        >
          {/* Decorative shapes */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
              Ready to Explore the World's Untold Stories?
            </h2>
            <p className="text-sm sm:text-base text-primary-50 font-medium">
              Create an account now to start generating bespoke itineraries, uncovering local myths, discovering secret wonders, and mapping cultural details.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3 bg-white text-accent font-bold rounded-xl shadow-md hover:bg-primary-50 dark:hover:bg-gray-100 transition-all text-sm"
              >
                Get Started Free
              </Link>
              <Link
                to="/destinations"
                className="w-full sm:w-auto px-8 py-3 bg-transparent border border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all text-sm"
              >
                Browse Wonders
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
