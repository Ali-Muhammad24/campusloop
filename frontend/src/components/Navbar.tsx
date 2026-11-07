import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, selectUser } from '../store/authSlice';

// Links for each kind of visitor. (Item Details isn't here: you open it from a Catalogue card.)
const guestLinks = [
  { to: '/', label: 'Catalogue' },
  { to: '/login', label: 'Login' },
  { to: '/signup', label: 'Sign Up' },
];

const studentLinks = [
  { to: '/', label: 'Catalogue' },
  { to: '/my-requests', label: 'My Requests' },
];

const adminLinks = [
  { to: '/admin/equipment', label: 'Manage Equipment' },
  { to: '/admin/dashboard', label: 'Admin Dashboard' },
];

function Navbar() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const links = !user ? guestLinks : user.role === 'Admin' ? adminLinks : studentLinks;

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
