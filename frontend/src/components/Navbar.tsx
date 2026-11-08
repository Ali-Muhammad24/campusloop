import { useEffect, useState, type ComponentType } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, selectUser } from '../store/authSlice';
import {
  CatalogueIcon,
  CloseIcon,
  DashboardIcon,
  EquipmentIcon,
  LoginIcon,
  LogoutIcon,
  RequestsIcon,
  SignupIcon,
} from './Icons';

type NavItem = { to: string; label: string; icon: ComponentType };

// Links for each kind of visitor. (Item Details isn't here: you open it from a Catalogue card.)
// The icons only show in the mobile drawer.
const guestLinks: NavItem[] = [
  { to: '/', label: 'Catalogue', icon: CatalogueIcon },
  { to: '/login', label: 'Login', icon: LoginIcon },
  { to: '/signup', label: 'Sign Up', icon: SignupIcon },
];

const studentLinks: NavItem[] = [
  { to: '/', label: 'Catalogue', icon: CatalogueIcon },
  { to: '/my-requests', label: 'My Requests', icon: RequestsIcon },
];

const adminLinks: NavItem[] = [
  { to: '/admin/equipment', label: 'Manage Equipment', icon: EquipmentIcon },
  { to: '/admin/dashboard', label: 'Admin Dashboard', icon: DashboardIcon },
];

// Same width as the mobile breakpoint in index.css.
const MOBILE_QUERY = '(max-width: 720px)';

function Navbar() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Phones only: whether the side drawer is open. On wider screens the links always show.
  const [menuOpen, setMenuOpen] = useState(false);

  const links = !user ? guestLinks : user.role === 'Admin' ? adminLinks : studentLinks;

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    closeMenu();
    dispatch(logout());
    navigate('/login');
  }

  // While the drawer is open: stop the page behind from scrolling, close on Escape,
  // and close if the screen gets wide enough for the desktop navbar.
  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    const mobile = window.matchMedia(MOBILE_QUERY);
    function handleScreenChange() {
      if (!mobile.matches) setMenuOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    mobile.addEventListener('change', handleScreenChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      mobile.removeEventListener('change', handleScreenChange);
    };
  }, [menuOpen]);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={closeMenu}>
          CampusLoop
        </Link>

        {/* Only visible on small screens (see index.css). */}
        <button
          type="button"
          className="navbar-toggle"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>

        {/* Desktop links and user section (hidden on small screens). */}
        <div className="navbar-menu">
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
              {/* Long names are cut off with "..." (see index.css); hover shows the full name. */}
              <span className="navbar-user-info">
                <span className="navbar-user-name" title={user.name}>
                  {user.name}
                </span>
                <span className="navbar-role">({user.role})</span>
              </span>
              <button type="button" className="btn btn-small" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile side drawer: slides in from the left, over the page. Hidden on desktop. */}
      <div
        className={menuOpen ? 'drawer-backdrop drawer-backdrop-open' : 'drawer-backdrop'}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div
        id="mobile-drawer"
        className={menuOpen ? 'drawer drawer-open' : 'drawer'}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="drawer-header">
          <div className="drawer-header-top">
            <Link to="/" className="drawer-brand" onClick={closeMenu}>
              CampusLoop
            </Link>
            <button type="button" className="drawer-close" aria-label="Close menu" onClick={closeMenu}>
              <CloseIcon />
            </button>
          </div>
          {user && (
            <div className="drawer-user">
              <span className="drawer-avatar" aria-hidden="true">
                {user.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="drawer-user-text">
                <span className="drawer-user-name">{user.name}</span>
                <span className="drawer-user-role">{user.role}</span>
              </span>
            </div>
          )}
        </div>

        <nav className="drawer-links">
          {links.map((link) => {
            const LinkIcon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className="drawer-link"
                onClick={closeMenu}
              >
                <LinkIcon />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {user && (
          <div className="drawer-footer">
            <button type="button" className="drawer-link drawer-logout" onClick={handleLogout}>
              <LogoutIcon />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
