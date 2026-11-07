import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/authSlice';
import { getHomePath } from '../utils/homePath';
import type { Role } from '../types';

interface ProtectedRouteProps {
  // Roles allowed to open the pages inside. Leave it out to allow any logged-in user.
  allowedRoles?: Role[];
}

// Wraps pages that need a login. Used as a parent route, so <Outlet /> is the page itself.
function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = useAppSelector(selectUser);

  // Not logged in: go to Login. "replace" stops the Back button from coming straight back here.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Admins on a Student page are simply sent to their own dashboard.
    if (user.role === 'Admin') {
      return <Navigate to={getHomePath(user.role)} replace />;
    }

    // Students on an Admin page see a clear message.
    return (
      <div className="card">
        <h1>Not authorized</h1>
        <p className="alert-error" role="alert">
          This page is only for Admins.
        </p>
        <Link to={getHomePath(user.role)}>Back to the Catalogue</Link>
      </div>
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
