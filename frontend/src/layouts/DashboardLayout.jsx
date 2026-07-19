import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector }     from 'react-redux';
import { motion }                       from 'framer-motion';
import {
  MdDashboard, MdExplore, MdMap, MdBookmark,
  MdRateReview, MdNotifications, MdPerson, MdAutoAwesome,
  MdHistory, MdAttachMoney, MdRestaurant, MdLanguage,
} from 'react-icons/md';
import { logout, selectUser } from '../redux/slices/authSlice';
import Navbar from '../components/common/Navbar';
import Chatbot from '../components/ai/Chatbot';

const NAV_ITEMS = [
  { to: '/dashboard',        icon: MdDashboard,     label: 'Dashboard' },
  { to: '/profile',          icon: MdPerson,        label: 'Profile' },
  { to: '/bookmarks',        icon: MdBookmark,      label: 'Bookmarks' },
  { to: '/my-trips',         icon: MdMap,           label: 'My Trips' },
  { to: '/my-reviews',       icon: MdRateReview,    label: 'My Reviews' },
  { to: '/notifications',    icon: MdNotifications, label: 'Notifications' },
  { to: '/manage-destinations', icon: MdExplore,     label: 'Manage Destinations' },
];

const AI_ITEMS = [
  { to: '/ai/recommend',      icon: MdAutoAwesome,  label: 'AI Recommendations' },
  { to: '/ai/itinerary',      icon: MdExplore,      label: 'AI Itinerary' },
  { to: '/ai/budget',         icon: MdAttachMoney,  label: 'Budget Planner' },
  { to: '/ai/food-guide',     icon: MdRestaurant,   label: 'Food Guide' },
  { to: '/ai/cultural-guide', icon: MdLanguage,     label: 'Cultural Guide' },
  { to: '/ai/route-planner',  icon: MdExplore,      label: 'Route Planner' },
  { to: '/ai/history',        icon: MdHistory,      label: 'AI History' },
];

export default function DashboardLayout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-accent text-white shadow-md hover:bg-accent/90 shadow-glow/10'
        : 'text-primary-900/70 dark:text-dark-muted hover:bg-primary-100/50 dark:hover:bg-dark-border hover:text-accent dark:hover:text-primary-300'
    }`;

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-bg flex flex-col w-full overflow-x-hidden">
      <Navbar />
      <div className="flex flex-1 container-cq py-6 gap-6 min-w-0">
        {/* ─ Sidebar ─ */}
        <motion.aside
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0,   opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="hidden lg:flex flex-col w-64 shrink-0"
        >
          <div className="card p-4 sticky top-24 space-y-1">
            {/* User info */}
            <div className="flex items-center gap-3 p-3 mb-4 bg-gradient-to-r from-primary-50 to-secondary/10 dark:from-primary-900/20 dark:to-primary-800/10 rounded-xl">
              <img
                src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=8b5cf6&color=fff`}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-accent"
              />
              <div className="overflow-hidden">
                <p className="font-semibold text-sm text-gray-800 dark:text-dark-text truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-dark-muted truncate">{user?.email}</p>
              </div>
            </div>

            {/* Nav items */}
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass} end>
                  <item.icon className="text-lg shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="divider" />

            {/* AI Features */}
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-dark-muted px-3 pb-1">
              🤖 AI Features
            </p>
            <nav className="space-y-1">
              {AI_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} className={linkClass}>
                  <item.icon className="text-lg shrink-0 text-accent" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="divider" />

            <button onClick={handleLogout} className="btn-ghost w-full justify-start text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl">
              <span>🚪</span> Logout
            </button>
          </div>
        </motion.aside>

        {/* ─ Main Content ─ */}
        <main className="flex-1 min-w-0">
          {/* Mobile / Tablet Horizontal Scrollable Sub-navbar */}
          <div className="lg:hidden w-full overflow-x-auto pb-3 flex gap-2 no-scrollbar border-b border-slate-100 dark:border-slate-800/80 mb-6">
            {[...NAV_ITEMS, ...AI_ITEMS].map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-accent text-white shadow-md'
                      : 'bg-white dark:bg-dark-card text-primary-900/70 dark:text-dark-muted border border-primary-100 dark:border-dark-border hover:bg-primary-50 dark:hover:bg-primary-950/20'
                  }`}
                  end={item.to === '/dashboard'}
                >
                  <item.icon className={`text-sm shrink-0 ${item.to.startsWith('/ai') ? 'text-accent' : ''}`} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
