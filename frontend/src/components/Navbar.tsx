import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, selectUser } from '../store/authSlice';

// Page links. Later, these will also depend on the user's role.
const pageLinks = [
  { to: '/', label: 'Catalogue' },
  // Temporary link so the page can be opened from the navbar; normally you reach it from the Catalogue.
  { to: '/equipment/2', label: 'Item Details' },
  { to: '/my-requests', label: 'My Requests' },
  { to: '/admin/equipment', label: 'Manage Equipment' },
  { to: '/admin/dashboard', label: 'Admin Dashboard' },
];

// Only shown when nobody is logged in.
const guestLinks = [
  { to: '/login', label: 'Login' },
  { to: '/signup', label: 'Sign Up' },
];

function Navbar() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const links = user ? pageLinks : [...pageLinks, ...guestLinks];

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          CampusLoop
        </Link>
        <nav className="navbar-links">
          {links.map((link) => (
            // NavLink adds the "active" class to the link of the current page.
            // "end" stops "/" from being active on every page.
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className="navbar-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="navbar-user">
            <span>
              {user.name} <span className="navbar-role">({user.role})</span>
            </span>
            <button type="button" className="btn btn-small" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
