import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/authSlice';
import { getHomePath } from '../utils/homePath';

// Wraps Login and Signup: anyone can open them, but a logged-in user is sent to their home page.
function GuestRoute() {
  const user = useAppSelector(selectUser);

  if (user) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
