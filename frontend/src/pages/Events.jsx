import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  LuMapPin, 
  LuCalendar, 
  LuClock, 
  LuCoins,
  LuSparkles,
  LuBookmark
} from 'react-icons/lu';
import api from '../services/api';
import { selectUser } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

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
  const user = useSelector(selectUser);
  const [events, setEvents] = useState([]);
  const [activeType, setActiveType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [bookmarkedEvents, setBookmarkedEvents] = useState({}); // { eventId: bookmarkId }

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get('/trips?limit=50');
        setTrips(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch user trips for event filtering:', err);
      }
    };
    fetchTrips();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeType) queryParams.set('type', activeType);
        if (selectedCity) queryParams.set('location.city', selectedCity);
        queryParams.set('limit', '12');

        const res = await api.get(`/events?${queryParams.toString()}`);
        const fetchedEvents = res.data.data || [];
        setEvents(fetchedEvents);

        // Check bookmark status for each event
        if (user && fetchedEvents.length > 0) {
          const bookmarkMap = {};
          await Promise.all(fetchedEvents.map(async (ev) => {
            try {
              const bRes = await api.get(`/bookmarks/check/${ev._id}?itemType=event`);
              if (bRes.data.isBookmarked) bookmarkMap[ev._id] = bRes.data.bookmarkId;
            } catch {}
          }));
          setBookmarkedEvents(bookmarkMap);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [activeType, selectedCity, user]);

  const handleTripChange = (e) => {
    const tripId = e.target.value;
    setSelectedTripId(tripId);
    if (!tripId) {
      setSelectedCity('');
      return;
    }
    const foundTrip = trips.find(t => t._id === tripId);
    if (foundTrip) {
      const city = foundTrip.destinations?.[0]?.city || foundTrip.destinations?.[0]?.name || '';
      setSelectedCity(city);
    }
  };

  const handleEventBookmark = async (eventId) => {
    if (!user) { toast.error('Please login to bookmark'); return; }
    try {
      if (bookmarkedEvents[eventId]) {
        await api.delete(`/bookmarks/${bookmarkedEvents[eventId]}`);
        setBookmarkedEvents(prev => { const n = {...prev}; delete n[eventId]; return n; });
        toast.success('Removed from bookmarks');
      } else {
        const res = await api.post('/bookmarks', { itemType: 'event', eventId });
        setBookmarkedEvents(prev => ({ ...prev, [eventId]: res.data.bookmark._id }));
        toast.success('Event saved to bookmarks!');
      }
    } catch { toast.error('Bookmark failed'); }
  };

  return (
    <div className="container-cq py-8 space-y-8 min-h-screen bg-[#FAF7FF] dark:bg-dark-bg">
      {/* Header & Trip Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-dark-card p-6 rounded-3xl border border-primary-100 dark:border-dark-border shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-primary-900 dark:text-white font-display">Cultural Events & Festivals</h1>
          <p className="text-xs text-primary-900/60 dark:text-dark-muted font-medium mt-1">Immerse yourself in traditional music, food celebrations, and regional religious festivals.</p>
        </div>
        
        {trips.length > 0 && (
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <span className="text-[10px] font-black text-primary-900/50 dark:text-dark-muted uppercase tracking-wider shrink-0 sm:mt-1">
              Filter by Planned Trip:
            </span>
            <select
              value={selectedTripId}
              onChange={handleTripChange}
              className="px-4 py-2.5 rounded-xl border border-primary-200 dark:border-dark-border bg-white dark:bg-dark-bg text-primary-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer shadow-sm capitalize"
            >
              <option value="">All Destinations</option>
              {trips.map(trip => {
                const destName = trip.destinations?.[0]?.name || 'Unknown Spot';
                return (
                  <option key={trip._id} value={trip._id}>
                    {trip.name} ({destName})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {selectedCity && (
        <div className="flex items-center justify-between p-4 bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-dark-border rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-primary-900/80 dark:text-slate-350">
            📍 Showing events and traditional festivals in <strong className="text-accent">{selectedCity}</strong> matching your planned trip.
          </p>
          <button 
            onClick={() => { setSelectedTripId(''); setSelectedCity(''); }}
            className="text-xs font-black text-accent hover:underline cursor-pointer border-none bg-transparent"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-primary-100 dark:border-dark-border">
        {EVENT_TYPES.map((type) => (
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
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.map((item) => (
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
                    🎉 Event Cover
                  </div>
                )}
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 dark:bg-dark-card/95 text-accent font-extrabold text-2xs rounded-lg shadow-sm capitalize">
                  {item.type.replace('-', ' ')}
                </span>
                {user && (
                  <button
                    onClick={() => handleEventBookmark(item._id)}
                    className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-dark-card/90 shadow-sm border border-primary-100/50 dark:border-dark-border cursor-pointer hover:scale-110 transition-transform"
                  >
                    <LuBookmark className={`text-sm ${bookmarkedEvents[item._id] ? 'text-accent fill-accent' : 'text-primary-900/40 dark:text-dark-muted'}`} />
                  </button>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-primary-900 dark:text-white group-hover:text-accent transition-colors font-display text-sm">
                    {item.title}
                  </h3>
                  <p className="text-xs text-primary-900/50 dark:text-dark-muted flex items-center gap-0.5 font-semibold">
                    <LuMapPin className="text-accent shrink-0" />
                    {item.location?.venue ? `${item.location.venue}, ` : ''}{item.location?.city}, {item.location?.country}
                  </p>
                  <p className="text-xs text-primary-900/60 dark:text-dark-muted line-clamp-3 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="border-t border-primary-50 dark:border-dark-border pt-4 flex items-center justify-between text-2xs text-primary-900/50 dark:text-dark-muted font-bold">
                  <span className="flex items-center gap-1">
                    <LuCalendar className="text-accent text-sm" /> {new Date(item.startDate).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-black text-accent flex items-center gap-0.5">
                    <LuCoins className="text-accent text-sm" /> {item.price?.isFree ? 'Free' : `₹${item.price?.amount}`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-12 text-center text-primary-900/40 dark:text-dark-muted space-y-4 rounded-2xl">
          <span className="text-6xl block animate-float">🗓️</span>
          <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">No Events Found</h3>
          <p className="text-xs max-w-md mx-auto leading-relaxed font-semibold">We couldn't find any events matching this category. Please check again later.</p>
        </div>
      )}
    </div>
  );
}
