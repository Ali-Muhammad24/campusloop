import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CataloguePage from './pages/CataloguePage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import MyRequestsPage from './pages/MyRequestsPage';
import ManageEquipmentPage from './pages/ManageEquipmentPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* Every page below is shown inside the Layout (Navbar + page container). */}
      <Route element={<Layout />}>
        {/* Public: anyone can browse. The request form handles logged-out users itself. */}
        <Route path="/" element={<CataloguePage />} />
        <Route path="/equipment/:id" element={<ItemDetailsPage />} />

        {/* Guests only: logged-in users are sent to their home page. */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Students only. */}
        <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
          <Route path="/my-requests" element={<MyRequestsPage />} />
        </Route>

        {/* Admins only. */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin/equipment" element={<ManageEquipmentPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
