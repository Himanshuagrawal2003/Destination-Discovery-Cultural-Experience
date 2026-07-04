import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector }   from 'react-redux';
import { motion, AnimatePresence }    from 'framer-motion';
import {
  MdMenu, MdClose, MdSearch, MdDarkMode, MdLightMode,
  MdNotifications, MdPerson, MdAutoAwesome, MdLogout,
  MdDashboard, MdExplore, MdMap, MdBookmark,
} from 'react-icons/md';
import { logout, selectUser, selectIsAdmin } from '../../redux/slices/authSlice';
import { toggleDarkMode, toggleMobileMenu, closeMobileMenu,
         selectDarkMode, selectMobileMenu, selectUnreadCount } from '../../redux/slices/uiSlice';
import SearchOverlay from './SearchOverlay';

const NAV_LINKS = [
  { to: '/destinations', label: 'Destinations' },
  { to: '/hidden-gems',  label: 'Hidden Gems' },
  { to: '/experiences',  label: 'Experiences' },
  { to: '/events',       label: 'Events' },
  { to: '/about',        label: 'About' },
];

export default function Navbar() {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const user          = useSelector(selectUser);
  const isAdmin       = useSelector(selectIsAdmin);
  const isDark        = useSelector(selectDarkMode);
  const isMobileOpen  = useSelector(selectMobileMenu);
  const unreadCount   = useSelector(selectUnreadCount);
  const [isScrolled,   setIsScrolled]   = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenu,   setIsUserMenu]   = useState(false);
  const userMenuRef = useRef(null);

  // Sticky scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    setIsUserMenu(false);
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-700 dark:text-dark-text hover:text-primary-600 dark:hover:text-primary-400'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'glass shadow-md border-b border-gray-100 dark:border-dark-border'
            : 'bg-white/90 dark:bg-dark-bg/90 backdrop-blur-sm'
        }`}
      >
        <div className="container-cq">
          <div className="flex items-center justify-between h-16">
            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2 group" onClick={() => dispatch(closeMobileMenu())}>
              <span className="text-2xl group-hover:animate-float inline-block transition-all">🌍</span>
              <div>
                <span className="font-bold text-lg text-gray-900 dark:text-dark-text font-display">
                  Culture<span className="gradient-text">Quest</span>
                </span>
                <span className="hidden sm:inline text-xs text-gray-400 dark:text-dark-muted ml-1 font-medium">AI</span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
              {user && (
                <NavLink to="/ai/recommend" className={linkClass}>
                  <span className="flex items-center gap-1">
                    <MdAutoAwesome className="text-accent" />
                    AI Tools
                  </span>
                </NavLink>
              )}
            </nav>

            {/* ── Actions ── */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                id="search-btn"
                onClick={() => setIsSearchOpen(true)}
                className="btn-icon hover:bg-gray-100 dark:hover:bg-dark-border text-gray-600 dark:text-dark-muted"
                aria-label="Search"
              >
                <MdSearch className="text-xl" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                id="theme-toggle"
                onClick={() => dispatch(toggleDarkMode())}
                className="btn-icon hover:bg-gray-100 dark:hover:bg-dark-border text-gray-600 dark:text-dark-muted"
                aria-label="Toggle dark mode"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDark ? 'dark' : 'light'}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{ rotate: 90,    opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDark ? <MdLightMode className="text-xl text-accent" /> : <MdDarkMode className="text-xl" />}
                  </motion.div>
                </AnimatePresence>
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <Link
                    to="/notifications"
                    className="btn-icon hover:bg-gray-100 dark:hover:bg-dark-border relative text-gray-600 dark:text-dark-muted"
                    aria-label="Notifications"
                  >
                    <MdNotifications className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-2xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* User menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      id="user-menu-btn"
                      onClick={() => setIsUserMenu(!isUserMenu)}
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                    >
                      <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=4f46e5&color=fff`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-primary-400"
                      />
                      <span className="hidden sm:inline text-sm font-semibold text-gray-800 dark:text-dark-text max-w-[80px] truncate">
                        {user.name.split(' ')[0]}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          className="dropdown right-0 min-w-[200px] py-2"
                        >
                          <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-border">
                            <p className="font-semibold text-sm text-gray-800 dark:text-dark-text">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-muted">{user.email}</p>
                          </div>
                          {[
                            { to: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
                            { to: '/profile',   icon: MdPerson,    label: 'Profile' },
                            { to: '/bookmarks', icon: MdBookmark,  label: 'Bookmarks' },
                            { to: '/my-trips',  icon: MdMap,       label: 'My Trips' },
                            ...(isAdmin ? [{ to: '/admin', icon: MdExplore, label: '🛡️ Admin' }] : []),
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setIsUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                            >
                              <item.icon className="text-base text-gray-400" />
                              {item.label}
                            </Link>
                          ))}
                          <div className="border-t border-gray-100 dark:border-dark-border mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full"
                            >
                              <MdLogout className="text-base" />
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login"    className="btn-secondary btn-sm">Log In</Link>
                  <Link to="/register" className="btn-primary btn-sm">Sign Up</Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                id="mobile-menu-btn"
                onClick={() => dispatch(toggleMobileMenu())}
                className="md:hidden btn-icon hover:bg-gray-100 dark:hover:bg-dark-border text-gray-600 dark:text-dark-muted"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card"
            >
              <nav className="container-cq py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => dispatch(closeMobileMenu())}
                    className={({ isActive }) =>
                      `px-4 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                {!user && (
                  <div className="flex gap-2 mt-2 px-4">
                    <Link to="/login" onClick={() => dispatch(closeMobileMenu())} className="btn-secondary flex-1">Log In</Link>
                    <Link to="/register" onClick={() => dispatch(closeMobileMenu())} className="btn-primary flex-1">Sign Up</Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
