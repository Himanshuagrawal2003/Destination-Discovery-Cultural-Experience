import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LuMap, 
  LuBookmark, 
  LuMessageSquare, 
  LuBell, 
  LuSparkles,
  LuCompass, 
  LuSearch, 
  LuChefHat, 
  LuGlobe,
  LuCalendar
} from 'react-icons/lu';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import api from '../../services/api';

export default function Dashboard() {
  const user = useSelector(selectUser);
  const [stats, setStats] = useState({ trips: 0, bookmarks: 0, reviews: 0, notifications: 0 });
  const [recentTrips, setRecentTrips] = useState([]);
  const [recentBookmarks, setRecentBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tripsRes, bookmarksRes, reviewsRes, notifRes] = await Promise.all([
          api.get('/trips?limit=3'),
          api.get('/bookmarks?limit=3'),
          api.get('/reviews/my'),
          api.get('/notifications'),
        ]);

        setStats({
          trips: tripsRes.data.pagination?.total || tripsRes.data.data?.length || 0,
          bookmarks: bookmarksRes.data.count || 0,
          reviews: reviewsRes.data.count || 0,
          notifications: notifRes.data.unreadCount || 0,
        });

        setRecentTrips(tripsRes.data.data || []);
        setRecentBookmarks(bookmarksRes.data.bookmarks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-12 bg-[#FAF7FF] dark:bg-dark-bg">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-accent to-[#C4B5FD] p-6 md:p-8 rounded-3xl text-white shadow-md border border-primary-100/10">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold font-display leading-tight">Welcome, {user?.name}! 👋</h1>
          <p className="text-sm text-primary-50/90 font-medium">Ready to explore new cultures and plan customized journeys?</p>
        </div>
        <Link to="/trip-planner" className="btn bg-white text-accent hover:bg-primary-50 flex items-center gap-1.5 shrink-0 shadow-md font-bold transition-all">
          <LuMap className="text-lg" /> Plan A Trip
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Planned Trips', val: stats.trips, icon: LuMap, col: 'text-accent bg-primary-100/60 dark:bg-primary-900/20' },
          { label: 'Saved Bookmarks', val: stats.bookmarks, icon: LuBookmark, col: 'text-amber-600 bg-amber-100/60 dark:bg-amber-900/20' },
          { label: 'My Reviews', val: stats.reviews, icon: LuMessageSquare, col: 'text-accent bg-primary-100/60 dark:bg-primary-900/20' },
          { label: 'Notifications', val: stats.notifications, icon: LuBell, col: 'text-rose-600 bg-rose-100/60 dark:bg-rose-900/20' },
        ].map((item, idx) => (
          <div key={idx} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shadow-sm rounded-2xl">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.col}`}>
              <item.icon className="text-2xl" />
            </div>
            <div className="min-w-0">
              <p className="text-2xs text-primary-900/50 dark:text-dark-muted font-bold uppercase tracking-wider truncate">{item.label}</p>
              <p className="text-xl font-black text-primary-900 dark:text-white mt-0.5">{isLoading ? '...' : item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Quick Tools */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-primary-900 dark:text-white font-display flex items-center gap-2">
          <LuSparkles className="text-accent animate-pulse" /> Launch AI Travel Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { to: '/ai/recommend', label: 'Destination Matcher', desc: 'Find places based on budget and seasons.', icon: LuSparkles },
            { to: '/ai/itinerary', label: 'Day-Wise Itinerary', desc: 'Generate complete travel schedules.', icon: LuCompass },
            { to: '/ai/budget', label: 'Smart Budget Planner', desc: 'Calculate daily hotel and meal expenses.', icon: LuSearch },
            { to: '/ai/food-guide', label: 'Culinary Anthropologist', desc: 'Must-try street foods and rules.', icon: LuChefHat },
            { to: '/ai/cultural-guide', label: 'Etiquette & Customs', desc: 'Read local taboos, sacred site laws.', icon: LuGlobe },
            { to: '/ai/route-planner', label: 'Route & Transit Planner', desc: 'Get budget vs luxury travel routes.', icon: LuCompass }
          ].map((item, idx) => (
            <Link key={idx} to={item.to} className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-5 space-y-2 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-350 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-100/50 dark:bg-primary-900/20 text-accent">
                  <item.icon className="text-xl shrink-0" />
                </div>
                <h3 className="font-bold text-sm text-primary-900 dark:text-white font-display">{item.label}</h3>
              </div>
              <p className="text-xs text-primary-900/60 dark:text-dark-muted leading-relaxed font-medium">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Trips & Bookmarks split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-primary-900 dark:text-white font-display">My Scheduled Trips</h2>
            <Link to="/my-trips" className="text-xs font-bold text-accent hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="h-24 skeleton w-full animate-pulse" />
            ) : recentTrips.length > 0 ? (
              recentTrips.map((trip) => (
                <Link
                  key={trip._id}
                  to={`/trip-planner/${trip._id}`}
                  className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-4 flex gap-4 items-center hover:bg-primary-50/50 dark:hover:bg-dark-border/40 transition-all rounded-2xl shadow-sm hover:shadow-md"
                >
                  <div className="w-16 h-16 rounded-xl bg-primary-100/30 dark:bg-slate-800 overflow-hidden shrink-0">
                    {trip.destinations?.[0]?.coverImage ? (
                      <img src={trip.destinations[0].coverImage} alt={trip.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-400">🗺️</div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden space-y-1">
                    <h3 className="font-bold text-sm text-primary-900 dark:text-white truncate font-display">{trip.name}</h3>
                    <p className="text-2xs text-primary-900/60 dark:text-dark-muted truncate font-semibold">
                      📍 {trip.destinations?.map((d) => d.name).join(', ') || 'No destinations'}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-primary-900/40 dark:text-dark-muted font-bold">
                      <span className="flex items-center gap-1"><LuCalendar className="text-xs" /> {trip.days} day(s)</span>
                      <span className="capitalize badge bg-primary-100 text-accent font-bold px-2 py-0.5 rounded">{trip.status}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-8 text-center text-primary-900/40 dark:text-dark-muted text-xs font-semibold rounded-2xl">
                No trips planned yet. Click "Plan A Trip" above to build your first one.
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookmarks */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-primary-900 dark:text-white font-display">Recent Bookmarks</h2>
            <Link to="/bookmarks" className="text-xs font-bold text-accent hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="h-24 skeleton w-full animate-pulse" />
            ) : recentBookmarks.length > 0 ? (
              recentBookmarks.map((bookmark) => {
                const item = bookmark.destination || bookmark.experience || bookmark.event || bookmark.hiddenGem;
                if (!item) return null;
                const name = item.name || item.title;
                const img = item.coverImage || item.image;
                return (
                  <Link
                    key={bookmark._id}
                    to={bookmark.destination ? `/destinations/${item.slug || item._id}` : `/${bookmark.itemType}s`}
                    className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-4 flex gap-4 items-center hover:bg-primary-50/50 dark:hover:bg-dark-border/40 transition-all rounded-2xl shadow-sm hover:shadow-md"
                  >
                    <div className="w-16 h-16 rounded-xl bg-primary-100/30 dark:bg-slate-850 overflow-hidden shrink-0">
                      {img ? (
                        <img src={img} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary-400">🔖</div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden space-y-1">
                      <h3 className="font-bold text-sm text-primary-900 dark:text-white truncate font-display">{name}</h3>
                      <span className="px-2 py-0.5 rounded bg-accent/10 text-accent uppercase text-[9px] font-extrabold tracking-wider">
                        {bookmark.itemType}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="card bg-white dark:bg-dark-card border border-primary-100 dark:border-dark-border p-8 text-center text-primary-900/40 dark:text-dark-muted text-xs font-semibold rounded-2xl">
                No saved locations. Bookmark destinations or events to keep track of them.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
