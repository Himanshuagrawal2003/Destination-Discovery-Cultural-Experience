import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe }       from './redux/slices/authSlice';
import { setDarkMode }   from './redux/slices/uiSlice';
import { selectToken }   from './redux/slices/authSlice';
import { selectDarkMode } from './redux/slices/uiSlice';

// Layouts
import MainLayout      from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout     from './layouts/AdminLayout';
import AuthLayout      from './layouts/AuthLayout';

// Guards
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute     from './components/common/AdminRoute';

// ─── Pages ──────────────────────────────────────────────────────────────────
import Home              from './pages/Home';
import Destinations      from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import HiddenGems        from './pages/HiddenGems';
import Experiences       from './pages/Experiences';
import Events            from './pages/Events';
import TripPlanner       from './pages/TripPlanner';
import TripDetail        from './pages/TripDetail';
import Bookmarks         from './pages/Bookmarks';
import About             from './pages/About';
import Contact           from './pages/Contact';
import FAQ               from './pages/FAQ';
import Privacy           from './pages/Privacy';
import Terms             from './pages/Terms';
import NotFound          from './pages/NotFound';

// Auth pages
import Login         from './pages/auth/Login';
import Register      from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword  from './pages/auth/ResetPassword';

// AI pages
import AIRecommendations from './pages/ai/AIRecommendations';
import AIBudgetPlanner   from './pages/ai/AIBudgetPlanner';
import AIItinerary       from './pages/ai/AIItinerary';
import AIFoodGuide       from './pages/ai/AIFoodGuide';
import AICulturalGuide   from './pages/ai/AICulturalGuide';
import AIHistory         from './pages/ai/AIHistory';

// User Dashboard
import Dashboard       from './pages/dashboard/Dashboard';
import Profile         from './pages/dashboard/Profile';
import MyTrips         from './pages/dashboard/MyTrips';
import MyReviews       from './pages/dashboard/MyReviews';
import Notifications   from './pages/dashboard/Notifications';

// Admin Dashboard
import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminDestinations   from './pages/admin/AdminDestinations';
import AdminUsers          from './pages/admin/AdminUsers';
import AdminEvents         from './pages/admin/AdminEvents';
import AdminExperiences    from './pages/admin/AdminExperiences';

// ─── App Component ───────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();
  const token    = useSelector(selectToken);
  const isDark   = useSelector(selectDarkMode);

  // Sync dark mode on mount
  useEffect(() => {
    dispatch(setDarkMode(isDark));
  }, []);

  // Re-fetch user profile on mount if token exists
  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* ─ Public Routes (MainLayout) ─ */}
        <Route element={<MainLayout />}>
          <Route index              element={<Home />} />
          <Route path="destinations"element={<Destinations />} />
          <Route path="destinations/:id" element={<DestinationDetail />} />
          <Route path="hidden-gems" element={<HiddenGems />} />
          <Route path="experiences" element={<Experiences />} />
          <Route path="events"      element={<Events />} />
          <Route path="about"       element={<About />} />
          <Route path="contact"     element={<Contact />} />
          <Route path="faq"         element={<FAQ />} />
          <Route path="privacy"     element={<Privacy />} />
          <Route path="terms"       element={<Terms />} />
        </Route>

        {/* ─ Auth Routes ─ */}
        <Route element={<AuthLayout />}>
          <Route path="login"           element={<Login />} />
          <Route path="register"        element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* ─ Protected User Routes (DashboardLayout) ─ */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="dashboard"        element={<Dashboard />} />
            <Route path="profile"          element={<Profile />} />
            <Route path="my-trips"         element={<MyTrips />} />
            <Route path="my-reviews"       element={<MyReviews />} />
            <Route path="notifications"    element={<Notifications />} />
            <Route path="bookmarks"        element={<Bookmarks />} />
            <Route path="trip-planner"     element={<TripPlanner />} />
            <Route path="trip-planner/:id" element={<TripDetail />} />

            {/* AI Routes */}
            <Route path="ai/recommend"     element={<AIRecommendations />} />
            <Route path="ai/budget"        element={<AIBudgetPlanner />} />
            <Route path="ai/itinerary"     element={<AIItinerary />} />
            <Route path="ai/food-guide"    element={<AIFoodGuide />} />
            <Route path="ai/cultural-guide"element={<AICulturalGuide />} />
            <Route path="ai/history"       element={<AIHistory />} />
          </Route>
        </Route>

        {/* ─ Admin Routes (AdminLayout) ─ */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="admin"                element={<AdminDashboard />} />
            <Route path="admin/destinations"   element={<AdminDestinations />} />
            <Route path="admin/users"          element={<AdminUsers />} />
            <Route path="admin/events"         element={<AdminEvents />} />
            <Route path="admin/experiences"    element={<AdminExperiences />} />
          </Route>
        </Route>

        {/* ─ 404 ─ */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
