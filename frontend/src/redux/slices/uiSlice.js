import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const saved = localStorage.getItem('cq_theme');
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const initialState = {
  isDarkMode:      getInitialTheme(),
  isMobileMenuOpen:false,
  isSearchOpen:    false,
  isChatbotOpen:   false,
  isLoading:       false,
  searchQuery:     '',
  notifications:   [],
  unreadCount:     0,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem('cq_theme', state.isDarkMode ? 'dark' : 'light');
      // Apply to <html> element
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
      if (action.payload) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    toggleMobileMenu: (state) => { state.isMobileMenuOpen = !state.isMobileMenuOpen; },
    closeMobileMenu:  (state) => { state.isMobileMenuOpen = false; },
    toggleSearch:     (state) => { state.isSearchOpen = !state.isSearchOpen; },
    closeSearch:      (state) => { state.isSearchOpen = false; },
    toggleChatbot:    (state) => { state.isChatbotOpen = !state.isChatbotOpen; },
    setGlobalLoading: (state, action) => { state.isLoading = action.payload; },
    setSearchQuery:   (state, action) => { state.searchQuery = action.payload; },
    setNotifications: (state, action) => {
      state.notifications = action.payload.notifications;
      state.unreadCount   = action.payload.unreadCount;
    },
    decrementUnread:  (state) => { if (state.unreadCount > 0) state.unreadCount -= 1; },
    clearUnread:      (state) => { state.unreadCount = 0; },
  },
});

export const {
  toggleDarkMode, setDarkMode, toggleMobileMenu, closeMobileMenu,
  toggleSearch, closeSearch, toggleChatbot, setGlobalLoading,
  setSearchQuery, setNotifications, decrementUnread, clearUnread,
} = uiSlice.actions;

export const selectDarkMode    = (state) => state.ui.isDarkMode;
export const selectMobileMenu  = (state) => state.ui.isMobileMenuOpen;
export const selectChatbot     = (state) => state.ui.isChatbotOpen;
export const selectUnreadCount = (state) => state.ui.unreadCount;

export default uiSlice.reducer;
