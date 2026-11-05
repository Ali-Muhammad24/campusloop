import { Link, NavLink } from 'react-router-dom';

// For now every link is shown. Later, links will depend on who is logged in.
const links = [
  { to: '/', label: 'Catalogue' },
  // Temporary link so the page can be opened from the navbar; normally you reach it from the Catalogue.
  { to: '/equipment/2', label: 'Item Details' },
  { to: '/my-requests', label: 'My Requests' },
  { to: '/admin/equipment', label: 'Manage Equipment' },
  { to: '/admin/dashboard', label: 'Admin Dashboard' },
  { to: '/login', label: 'Login' },
  { to: '/signup', label: 'Sign Up' },
];

function Navbar() {
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
      </div>
    </header>
  );
}

export default Navbar;
