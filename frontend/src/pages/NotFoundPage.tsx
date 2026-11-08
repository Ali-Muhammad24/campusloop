import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/authSlice';
import { getHomePath } from '../utils/homePath';

function NotFoundPage() {
  const user = useAppSelector(selectUser);
  // Admins go back to their dashboard; everyone else to the Catalogue.
  const homePath = user ? getHomePath(user.role) : '/';

  return (
    <div className="card empty-message">
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or may have been moved.</p>
      <Link to={homePath} className="btn">
        Go to home page
      </Link>
    </div>
  );
}

export default NotFoundPage;
