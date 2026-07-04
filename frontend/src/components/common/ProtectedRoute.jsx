import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectToken } from '../../redux/slices/authSlice';

export default function ProtectedRoute() {
  const token = useSelector(selectToken);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
