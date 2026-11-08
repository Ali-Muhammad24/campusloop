import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Wraps every page: Navbar on top, the current page inside a centred container, Footer at the bottom.
// <Outlet /> is where React Router puts the page that matches the URL.
// .app-shell is a full-height column, so the footer stays at the bottom even on short pages.
function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
