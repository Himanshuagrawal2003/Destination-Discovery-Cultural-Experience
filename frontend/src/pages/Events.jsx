import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MdPlace, MdDateRange, MdAccessTime, MdAttachMoney } from 'react-icons/md';
import api from '../services/api';

const EVENT_TYPES = [
  { value: '', label: 'All Events' },
  { value: 'festival', label: 'Festival' },
  { value: 'concert', label: 'Concert' },
  { value: 'food-fair', label: 'Food Fair' },
  { value: 'religious', label: 'Religious Event' },
  { value: 'traditional-performance', label: 'Traditional Performance' },
  { value: 'cultural', label: 'Cultural Gathering' }
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [activeType, setActiveType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeType) queryParams.set('type', activeType);
        queryParams.set('limit', '12');

        const res = await api.get(`/events?${queryParams.toString()}`);
        setEvents(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [activeType]);

  return (
    <div className="container-cq py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">Cultural Events & Festivals</h1>
        <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Immerse yourself in traditional music, food celebrations, and regional religious festivals.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-100 dark:border-slate-800/80">
        {EVENT_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setActiveType(type.value)}
            className={`px-4 py-2 text-xs font-semibold rounded-full shrink-0 border cursor-pointer transition-colors ${
              activeType === type.value
                ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30'
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
            <div key={i} className="h-80 skeleton" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.map((item) => (
            <div key={item._id} className="group card overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300">
              <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                {item.coverImage ? (
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    🎉 Event Cover
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 text-primary-700 dark:text-primary-300 font-bold text-2xs rounded-lg shadow-sm capitalize">
                  {item.type.replace('-', ' ')}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-dark-muted flex items-center gap-0.5 font-medium">
                    <MdPlace className="text-slate-400 shrink-0" />
                    {item.location?.venue ? `${item.location.venue}, ` : ''}{item.location?.city}, {item.location?.country}
                  </p>
                  <p className="text-xs text-slate-650 dark:text-slate-350 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-slate-50 dark:border-slate-800/80 pt-4 flex items-center justify-between text-2xs text-slate-500 dark:text-dark-muted font-semibold">
                  <span className="flex items-center gap-0.5">
                    <MdDateRange /> {new Date(item.startDate).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-bold text-teal-750 dark:text-teal-400 flex items-center gap-0.5">
                    <MdAttachMoney /> {item.price?.isFree ? 'Free' : `$${item.price?.amount}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center text-slate-500 space-y-4">
          <span className="text-6xl block">🗓️</span>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Events Found</h3>
          <p className="text-sm max-w-md mx-auto">We couldn't find any events matching this category. Please check again later.</p>
        </div>
      )}
    </div>
  );
}
