import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion }           from 'framer-motion';
import { MdDashboard, MdPlace, MdPeople, MdEvent, MdStar } from 'react-icons/md';
import Navbar from '../components/common/Navbar';

const ADMIN_NAV = [
  { to: '/admin',              icon: MdDashboard, label: 'Analytics',    end: true },
  { to: '/admin/destinations', icon: MdPlace,     label: 'Destinations' },
  { to: '/admin/users',        icon: MdPeople,    label: 'Users' },
  { to: '/admin/events',       icon: MdEvent,     label: 'Events' },
  { to: '/admin/experiences',  icon: MdStar,      label: 'Experiences' },
];

export default function AdminLayout() {
  const location = useLocation();
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-700 text-white shadow'
        : 'text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border'
    }`;

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-bg flex flex-col">
      <Navbar />
      <div className="flex flex-1 container-cq py-6 gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="card p-4 sticky top-24">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-dark-muted px-2 mb-3">
              🛡️ Admin Panel
            </p>
            <nav className="space-y-1">
              {ADMIN_NAV.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                  <item.icon className="text-lg" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile / Tablet Horizontal Scrollable Admin Navbar */}
          <div className="lg:hidden w-full overflow-x-auto pb-3 flex gap-2 no-scrollbar border-b border-slate-100 dark:border-slate-800/80 mb-6">
            {ADMIN_NAV.map((item) => {
              const isActive = item.end 
                ? location.pathname === item.to 
                : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-700 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-650 dark:text-slate-300 border border-slate-100 dark:border-slate-800/60 hover:bg-gray-50 dark:hover:bg-slate-900/30'
                  }`}
                  end={item.end}
                >
                  <item.icon className="text-sm shrink-0" />
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
    </div>
  );
}
