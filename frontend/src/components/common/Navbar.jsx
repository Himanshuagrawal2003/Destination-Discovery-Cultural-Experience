import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector }   from 'react-redux';
import { motion, AnimatePresence }    from 'framer-motion';
import {
  LuMenu, LuX, LuSearch, LuSun, LuMoon,
  LuBell, LuUser, LuSparkles, LuLogOut,
  LuLayoutDashboard, LuBookmark, LuMap, LuCompass, LuChevronDown
} from 'react-icons/lu';
import { logout, selectUser } from '../../redux/slices/authSlice';
import { toggleDarkMode, toggleMobileMenu, closeMobileMenu,
         selectDarkMode, selectMobileMenu, selectUnreadCount } from '../../redux/slices/uiSlice';
import SearchOverlay from './SearchOverlay';

const NAV_LINKS = [
  { to: '/destinations', label: 'Destinations' },
  { to: '/hidden-gems',  label: 'Hidden Gems' },
  { to: '/events',       label: 'Events' },
  { to: '/about',        label: 'About' },
];

export default function Navbar() {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const user          = useSelector(selectUser);

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
    dispatch(closeMobileMenu());
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? 'text-accent'
        : 'text-primary-900/80 dark:text-dark-text hover:text-accent'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-primary-100/50 dark:bg-primary-900/20 text-accent font-bold'
        : 'text-primary-900/70 dark:text-dark-text hover:bg-primary-50 dark:hover:bg-dark-border'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-[9999] transition-all duration-300 ${
          isScrolled
            ? 'glass shadow-md border-b border-primary-100 dark:border-dark-border bg-white/80 dark:bg-dark-bg/85 backdrop-blur-md'
            : 'bg-white/95 dark:bg-dark-bg/95 backdrop-blur-sm'
        }`}
      >
        <div className="container-cq">
          <div className="flex items-center justify-between h-16">
            {/*  Logo  */}
            <Link to="/" className="flex items-center gap-2 group shrink-0 min-w-0" onClick={() => dispatch(closeMobileMenu())}>
              {/* Globe icon in accent color */}
              <svg viewBox="0 0 32 32" width="26" height="26" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 text-accent group-hover:scale-110 transition-transform duration-200">
                <circle cx="16" cy="13" r="9" stroke="currentColor" strokeWidth="1.8" fill="none"/>
                <ellipse cx="16" cy="13" rx="9" ry="3.6" stroke="currentColor" strokeWidth="1.4" fill="none" opacity="0.55"/>
                <line x1="16" y1="4" x2="16" y2="22" stroke="currentColor" strokeWidth="1.4" opacity="0.55"/>
                <circle cx="16" cy="13" r="2.2" fill="currentColor"/>
                <path d="M16 19 L16 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="16" cy="29.2" r="1.5" fill="currentColor" opacity="0.5"/>
              </svg>
              <div className="leading-tight">
                <div className="font-extrabold text-[17px] text-primary-900 dark:text-white font-display tracking-tight whitespace-nowrap">
                  Culture<span className="text-accent">Quest</span>
                </div>
                <div className="text-[10px] font-bold text-primary-900/40 dark:text-dark-muted tracking-widest uppercase whitespace-nowrap">AI Travel</div>
              </div>
            </Link>

            {/*  Desktop Nav  */}
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
              {user && (
                <NavLink to="/ai/recommend" className={linkClass}>
                  <span className="flex items-center gap-1">
                    <LuSparkles className="text-accent text-sm shrink-0" />
                    AI Tools
                  </span> </NavLink>
              )}
            </nav>

            {/*  Actions  */}
            <div className="flex items-center gap-2">


              {/* Dark Mode Toggle */}
              <button
                id="theme-toggle"
                onClick={() => dispatch(toggleDarkMode())}
                className="btn-icon hover:bg-primary-50 dark:hover:bg-dark-border text-primary-900/60 dark:text-dark-muted cursor-pointer"
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
                    {isDark ? <LuSun className="text-lg text-accent" /> : <LuMoon className="text-lg" />}
                  </motion.div> </AnimatePresence> </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <Link
                    to="/notifications"
                    className="hidden md:flex btn-icon hover:bg-primary-50 dark:hover:bg-dark-border relative text-primary-900/60 dark:text-dark-muted"
                    aria-label="Notifications"
                  >
                    <LuBell className="text-lg" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* User avatar — direct link to /profile */}
                  <Link
                    to="/profile"
                    onClick={() => { dispatch(closeMobileMenu()); }}
                    className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-primary-50 dark:hover:bg-dark-border transition-colors"
                  >
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=8b5cf6&color=fff`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-accent shrink-0"
                    />
                    <span className="hidden sm:inline text-sm font-semibold text-primary-900 dark:text-dark-text max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login"    className="btn bg-primary-100/50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-accent font-bold px-4 py-2 rounded-xl text-sm transition-all">Log In</Link>
                  <Link to="/register" className="btn bg-accent hover:bg-accent/90 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm hover:shadow-glow">Sign Up</Link> </div>
              )}

              {/* Mobile hamburger */}
              <button
                id="mobile-menu-btn"
                onClick={() => dispatch(toggleMobileMenu())}
                className="md:hidden btn-icon hover:bg-primary-50 dark:hover:bg-dark-border text-primary-900/60 dark:text-dark-muted cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <LuX className="text-xl" /> : <LuMenu className="text-xl" />}
              </button> </div> </div> </div>

        {/*  Mobile Menu  */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute top-16 left-0 right-0 md:hidden overflow-hidden border-t border-primary-100 dark:border-dark-border bg-white dark:bg-dark-card shadow-lg z-[10000]"
            >
              <nav className="container-cq py-4 flex flex-col gap-1.5">
                {/* Base Nav Links */}
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => dispatch(closeMobileMenu())}
                    className={mobileLinkClass}
                  >
                    <LuCompass className="text-accent text-sm shrink-0" />
                    <span>{link.label}</span> </NavLink>
                ))}

                {/* User Specific Links */}
                {user ? (
                  <>
                    <NavLink
                      to="/dashboard"
                      onClick={() => dispatch(closeMobileMenu())}
                      className={mobileLinkClass}
                    >
                      <LuLayoutDashboard className="text-accent text-sm shrink-0" />
                      <span>Dashboard</span> </NavLink>
                    <NavLink
                      to="/ai/recommend"
                      onClick={() => dispatch(closeMobileMenu())}
                      className={mobileLinkClass}
                    >
                      <LuSparkles className="text-accent text-sm shrink-0" />
                      <span>AI Tools</span> </NavLink>
                    <NavLink
                      to="/bookmarks"
                      onClick={() => dispatch(closeMobileMenu())}
                      className={mobileLinkClass}
                    >
                      <LuBookmark className="text-accent text-sm shrink-0" />
                      <span>Bookmarks</span> </NavLink>
                    <NavLink
                      to="/my-trips"
                      onClick={() => dispatch(closeMobileMenu())}
                      className={mobileLinkClass}
                    >
                      <LuMap className="text-accent text-sm shrink-0" />
                      <span>My Trips</span> </NavLink>
                    <NavLink
                      to="/profile"
                      onClick={() => dispatch(closeMobileMenu())}
                      className={mobileLinkClass}
                    >
                      <LuUser className="text-accent text-sm shrink-0" />
                      <span>Profile</span> </NavLink>
                    <NavLink
                      to="/notifications"
                      onClick={() => dispatch(closeMobileMenu())}
                      className={mobileLinkClass}
                    >
                      <LuBell className="text-accent text-sm shrink-0" />
                      <span>Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}</span> </NavLink>



                    <div className="border-t border-primary-100 dark:border-dark-border mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full cursor-pointer text-left"
                      >
                        <LuLogOut className="text-sm shrink-0" />
                        <span>Logout</span> </button> </div> </>
                ) : (
                  <div className="flex gap-2 mt-2 px-4">
                    <Link to="/login" onClick={() => dispatch(closeMobileMenu())} className="btn bg-primary-100/50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-accent font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex-1 text-center">Log In</Link>
                    <Link to="/register" onClick={() => dispatch(closeMobileMenu())} className="btn bg-accent hover:bg-accent/90 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex-1 text-center shadow-sm">Sign Up</Link> </div>
                )}
              </nav> </motion.div>
          )}
        </AnimatePresence> </header>

      {/* Mobile backdrop — click outside to close */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-[9998] md:hidden bg-black/20 backdrop-blur-[1px]"
            onClick={() => dispatch(closeMobileMenu())}
          />
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} /> </>
  );
}
