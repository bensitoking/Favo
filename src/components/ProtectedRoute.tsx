// src/components/ProtectedRoute.tsx
import { useAuth } from './hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.some(role => user[role])) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
};

// Uso en tus rutas:
<Route 
  path="/" 
  element={
    <ProtectedRoute roles={['esProvedor']}>
      <ProveedorDashboard />
    </ProtectedRoute>
  } 
/>