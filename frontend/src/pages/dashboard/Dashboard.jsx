import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdMap, MdBookmark, MdRateReview, MdNotifications, MdAutoAwesome,
         MdExplore, MdAttachMoney, MdRestaurant, MdLanguage } from 'react-icons/md';
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
    <div className="space-y-8 pb-12">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-700 to-teal-900 p-6 md:p-8 rounded-3xl text-white shadow-lg">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold font-display leading-tight">Welcome, {user?.name}! 👋</h1>
          <p className="text-sm text-teal-100 font-medium">Ready to explore new cultures and plan customized journeys?</p>
        </div>
        <Link to="/trip-planner" className="btn btn-accent flex items-center gap-1.5 shrink-0">
          <MdMap className="text-lg" /> Plan A Trip
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Planned Trips', val: stats.trips, icon: MdMap, col: 'text-teal-600 bg-teal-50 dark:bg-teal-950/30 dark:text-teal-400' },
          { label: 'Saved Bookmarks', val: stats.bookmarks, icon: MdBookmark, col: 'text-amber-600 bg-amber-50 dark:bg-amber-955/20 dark:text-amber-400' },
          { label: 'My Reviews', val: stats.reviews, icon: MdRateReview, col: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/30 dark:text-cyan-400' },
          { label: 'Notifications', val: stats.notifications, icon: MdNotifications, col: 'text-rose-600 bg-rose-50 dark:bg-rose-955/20 dark:text-rose-400' },
        ].map((item, idx) => (
          <div key={idx} className="card p-5 flex items-center gap-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.col}`}>
              <item.icon className="text-2xl" />
            </div>
            <div>
              <p className="text-2xs text-slate-500 dark:text-dark-muted font-bold uppercase tracking-wider">{item.label}</p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{isLoading ? '...' : item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Quick Tools */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white font-display flex items-center gap-2">
          <MdAutoAwesome className="text-amber-500 animate-pulse" /> Launch AI Travel Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { to: '/ai/recommend', label: 'Destination Matcher', desc: 'Find places based on budget and seasons.', icon: MdAutoAwesome, iconCol: 'text-amber-500' },
            { to: '/ai/itinerary', label: 'Day-Wise Itinerary', desc: 'Generate complete travel schedules.', icon: MdExplore, iconCol: 'text-teal-600' },
            { to: '/ai/budget', label: 'Smart Budget Planner', desc: 'Calculate daily hotel and meal expenses.', icon: MdAttachMoney, iconCol: 'text-cyan-600' },
            { to: '/ai/food-guide', label: 'Culinary Anthropologist', desc: 'Must-try street foods and rules.', icon: MdRestaurant, iconCol: 'text-rose-500' },
            { to: '/ai/cultural-guide', label: 'Etiquette & Customs', desc: 'Read local taboos, sacred site laws.', icon: MdLanguage, iconCol: 'text-indigo-500' }
          ].map((item, idx) => (
            <Link key={idx} to={item.to} className="card p-5 space-y-2 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-3">
                <item.icon className={`text-2xl ${item.iconCol}`} />
                <h3 className="font-bold text-sm text-slate-850 dark:text-white">{item.label}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Trips & Bookmarks split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-850 dark:text-white font-display">My Scheduled Trips</h2>
            <Link to="/my-trips" className="text-2xs font-bold text-teal-650 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="h-24 skeleton w-full animate-pulse" />
            ) : recentTrips.length > 0 ? (
              recentTrips.map((trip) => (
                <Link
                  key={trip._id}
                  to={`/trip-planner/${trip._id}`}
                  className="card p-4 flex gap-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                    {trip.destinations?.[0]?.coverImage ? (
                      <img src={trip.destinations[0].coverImage} alt={trip.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">🗺️</div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden space-y-1">
                    <h3 className="font-bold text-sm text-slate-850 dark:text-white truncate">{trip.name}</h3>
                    <p className="text-2xs text-slate-500 truncate">
                      📍 {trip.destinations?.map((d) => d.name).join(', ') || 'No destinations'}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>📅 {trip.days} day(s)</span>
                      <span className="capitalize badge bg-teal-50 text-teal-700 font-bold">{trip.status}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="card p-8 text-center text-slate-400 text-xs">
                No trips planned yet. Click "Plan A Trip" above to build your first one.
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookmarks */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-855 dark:text-white font-display">Recent Bookmarks</h2>
            <Link to="/bookmarks" className="text-2xs font-bold text-teal-650 hover:underline">View All</Link>
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
                    className="card p-4 flex gap-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-850 overflow-hidden shrink-0">
                      {img ? (
                        <img src={img} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">🔖</div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden space-y-1">
                      <h3 className="font-bold text-sm text-slate-850 dark:text-white truncate">{name}</h3>
                      <span className="badge badge-primary uppercase text-[9px] font-bold tracking-wider">
                        {bookmark.itemType}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="card p-8 text-center text-slate-400 text-xs">
                No saved locations. Bookmark destinations or events to keep track of them.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
