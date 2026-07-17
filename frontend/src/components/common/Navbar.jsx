import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector }   from 'react-redux';
import { motion, AnimatePresence }    from 'framer-motion';
import {
  LuMenu, LuX, LuSearch, LuSun, LuMoon,
  LuBell, LuUser, LuSparkles, LuLogOut,
  LuLayoutDashboard, LuBookmark, LuMap, LuCompass
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
            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2 group" onClick={() => dispatch(closeMobileMenu())}>
              <span className="text-2xl group-hover:animate-float inline-block transition-all">🌍</span>
              <div>
                <span className="font-extrabold text-lg text-primary-900 dark:text-dark-text font-display">
                  Culture<span className="gradient-text">Quest</span>
                </span>
                <span className="hidden sm:inline text-xs text-primary-900/40 dark:text-dark-muted ml-1 font-bold">AI</span>
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
                    <LuSparkles className="text-accent text-sm shrink-0" />
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
                className="btn-icon hover:bg-primary-50 dark:hover:bg-dark-border text-primary-900/60 dark:text-dark-muted cursor-pointer"
                aria-label="Search"
              >
                <LuSearch className="text-lg" />
              </button>

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
                  </motion.div>
                </AnimatePresence>
              </button>

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

                  {/* User menu */}
                  <div className="hidden md:block relative" ref={userMenuRef}>
                    <button
                      id="user-menu-btn"
                      onClick={() => setIsUserMenu(!isUserMenu)}
                      className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-primary-50 dark:hover:bg-dark-border transition-colors cursor-pointer"
                    >
                      <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=8b5cf6&color=fff`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-accent shrink-0"
                      />
                      <span className="hidden sm:inline text-sm font-semibold text-primary-900 dark:text-dark-text max-w-[80px] truncate">
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
                          className="dropdown right-0 w-44 py-2 border border-primary-100 dark:border-dark-border"
                        >
                          <div className="px-4 py-2 border-b border-primary-100 dark:border-dark-border">
                            <p className="font-semibold text-sm text-primary-900 dark:text-dark-text">{user.name}</p>
                            <p className="text-xs text-primary-900/40 dark:text-dark-muted font-bold truncate mt-0.5">{user.email}</p>
                          </div>
                          {[
                            { to: '/dashboard', icon: LuLayoutDashboard, label: 'Dashboard' },
                            { to: '/profile',   icon: LuUser,    label: 'Profile' },
                            { to: '/bookmarks', icon: LuBookmark,  label: 'Bookmarks' },
                            { to: '/my-trips',  icon: LuMap,       label: 'My Trips' },
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setIsUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary-900/70 dark:text-dark-text hover:bg-primary-50 dark:hover:bg-dark-border transition-colors font-semibold"
                            >
                              <item.icon className="text-base text-accent" />
                              {item.label}
                            </Link>
                          ))}
                          <div className="border-t border-primary-100 dark:border-dark-border mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full cursor-pointer font-bold"
                            >
                              <LuLogOut className="text-base" />
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
                  <Link to="/login"    className="btn bg-primary-100/50 hover:bg-primary-100 text-accent font-bold px-4 py-2 rounded-xl text-sm transition-all">Log In</Link>
                  <Link to="/register" className="btn bg-accent hover:bg-accent/90 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-sm hover:shadow-glow">Sign Up</Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                id="mobile-menu-btn"
                onClick={() => dispatch(toggleMobileMenu())}
                className="md:hidden btn-icon hover:bg-primary-50 dark:hover:bg-dark-border text-primary-900/60 dark:text-dark-muted cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <LuX className="text-xl" /> : <LuMenu className="text-xl" />}
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
              className="absolute top-16 left-0 right-0 md:hidden overflow-hidden border-t border-primary-100 dark:border-dark-border bg-white dark:bg-dark-card shadow-lg z-[10000]"
            >
              <nav className="container-cq py-4 flex flex-col gap-1.5">
                {/* User Info on Mobile */}
                {user && (
                  <div className="bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/20 rounded-2xl p-4 mb-3 flex items-center gap-3">
                    <img
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=8b5cf6&color=fff`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-accent shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-primary-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-2xs text-primary-900/40 dark:text-dark-muted font-bold truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>
                )}

                {/* Base Nav Links */}
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => dispatch(closeMobileMenu())}
                    className={mobileLinkClass}
                  >
                    <LuCompass className="text-accent text-sm shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
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
                      <span>Dashboard</span>
                    </NavLink>
                    <NavLink
                      to="/ai/recommend"
                      onClick={() => dispatch(closeMobileMenu())}
                      className={mobileLinkClass}
                    >
                      <LuSparkles className="text-accent text-sm shrink-0" />
                      <span>AI Tools</span>
                    </NavLink>
                    <NavLink
                      to="/bookmarks"
                      onClick={() => dispatch(closeMobileMenu())}
                      className={mobileLinkClass}
                    >
                      <LuBookmark className="text-accent text-sm shrink-0" />
                      <span>Bookmarks</span>
                    </NavLink>
                    <NavLink
                      to="/my-trips"
                      onClick={() => dispatch(closeMobileMenu())}
                      className={mobileLinkClass}
                    >
                      <LuMap className="text-accent text-sm shrink-0" />
                      <span>My Trips</span>
                    </NavLink>
                    <NavLink
                      to="/profile"
                      onClick={() => dispatch(closeMobileMenu())}
                      className={mobileLinkClass}
                    >
                      <LuUser className="text-accent text-sm shrink-0" />
                      <span>Profile</span>
                    </NavLink>
                    <NavLink
                      to="/notifications"
                      onClick={() => dispatch(closeMobileMenu())}
                      className={mobileLinkClass}
                    >
                      <LuBell className="text-accent text-sm shrink-0" />
                      <span>Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
                    </NavLink>



                    <div className="border-t border-primary-100 dark:border-dark-border mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full cursor-pointer text-left"
                      >
                        <LuLogOut className="text-sm shrink-0" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2 mt-2 px-4">
                    <Link to="/login" onClick={() => dispatch(closeMobileMenu())} className="btn bg-primary-100/50 hover:bg-primary-100 text-accent font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex-1 text-center">Log In</Link>
                    <Link to="/register" onClick={() => dispatch(closeMobileMenu())} className="btn bg-accent hover:bg-accent/90 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all flex-1 text-center shadow-sm">Sign Up</Link>
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
