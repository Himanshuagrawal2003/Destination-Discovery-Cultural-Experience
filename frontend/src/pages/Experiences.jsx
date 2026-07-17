import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LuMapPin, 
  LuCoins, 
  LuClock, 
  LuUsers, 
  LuGlobe,
  LuSparkles
} from 'react-icons/lu';
import api from '../services/api';

const EXPERIENCE_TYPES = [
  { value: '', label: 'All Experiences' },
  { value: 'cooking-class', label: 'Cooking Class' },
  { value: 'temple-tour', label: 'Temple Tour' },
  { value: 'village-tour', label: 'Village Tour' },
  { value: 'dance-workshop', label: 'Dance Workshop' },
  { value: 'craft-workshop', label: 'Craft Workshop' },
  { value: 'festival-experience', label: 'Festival Experience' },
  { value: 'food-tour', label: 'Food Tour' }
];

export default function Experiences() {
  const [experiences, setExperiences] = useState([]);
  const [activeType, setActiveType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeType) queryParams.set('type', activeType);
        queryParams.set('limit', '12');

        const res = await api.get(`/experiences?${queryParams.toString()}`);
        setExperiences(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExperiences();
  }, [activeType]);

  return (
    <div className="container-cq py-8 space-y-8 min-h-screen bg-[#FAF7FF] dark:bg-dark-bg">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary-900 dark:text-white font-display">Cultural Experiences</h1>
        <p className="text-sm text-primary-900/60 dark:text-dark-muted font-medium mt-1">Book local heritage activities, culinary workshops, village walks, and temple tours.</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-primary-100 dark:border-dark-border">
        {EXPERIENCE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setActiveType(type.value)}
            className={`px-4 py-2 text-xs font-bold rounded-full shrink-0 border cursor-pointer transition-all ${
              activeType === type.value
                ? 'bg-accent text-white border-accent shadow-sm hover:bg-accent/90'
                : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border-primary-200 dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-950/20'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 skeleton animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : experiences.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {experiences.map((item) => (
            <div key={item._id} className="group card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-300 rounded-2xl">
              <div className="relative h-48 overflow-hidden bg-primary-50">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 dark:bg-dark-border flex items-center justify-center text-primary-900/40">
                    📸 Experience
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-dark-card/95 text-accent font-extrabold text-2xs rounded-lg shadow-sm capitalize">
                  {item.type.replace('-', ' ')}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-primary-900 dark:text-white group-hover:text-accent transition-colors font-display text-sm">
                    {item.title}
                  </h3>
                  <p className="text-xs text-primary-900/50 dark:text-dark-muted flex items-center gap-0.5 font-semibold">
                    <LuMapPin className="text-accent" />
                    {item.location?.city}, {item.location?.country}
                  </p>
                  <p className="text-xs text-primary-900/60 dark:text-dark-muted line-clamp-3 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-primary-50 dark:border-dark-border pt-4 grid grid-cols-2 gap-2 text-2xs text-primary-900/50 dark:text-dark-muted font-bold">
                  <span className="flex items-center gap-1">
                    <LuClock className="text-accent text-sm" /> {item.duration?.value} {item.duration?.unit}
                  </span>
                  <span className="flex items-center gap-1 justify-end">
                    <LuUsers className="text-accent text-sm" /> Max {item.maxGroupSize} guests
                  </span>
                  <span className="flex items-center gap-1">
                    <LuGlobe className="text-accent text-sm" /> {item.languages?.join(', ')}
                  </span>
                  <span className="text-right text-sm font-black text-accent">
                    ₹{item.price?.amount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted space-y-4 rounded-2xl">
          <span className="text-6xl block animate-float">🎭</span>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">No Experiences Found</h3>
          <p className="text-xs max-w-md mx-auto leading-relaxed font-semibold">We couldn't find any listings matching this category. Please check again later.</p>
        </div>
      )}
    </div>
  );
}
