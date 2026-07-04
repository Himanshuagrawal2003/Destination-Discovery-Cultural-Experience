import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectToken, selectIsAdmin } from '../../redux/slices/authSlice';

export default function AdminRoute() {
  const token = useSelector(selectToken);
  const isAdmin = useSelector(selectIsAdmin);

  if (!token) return <Navigate to="/login" replace />;
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
