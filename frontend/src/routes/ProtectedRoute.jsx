import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/API';

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}

export default ProtectedRoute;