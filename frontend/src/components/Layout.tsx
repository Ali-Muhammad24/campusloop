import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

// Wraps every page: Navbar on top, then the current page inside a centred container.
// <Outlet /> is where React Router puts the page that matches the URL.
function Layout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
