import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Si no está autenticado, lo mandamos al login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizamos las rutas hijas (el Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;
