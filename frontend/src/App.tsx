import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
        <Route path="/" element={<CataloguePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/equipment/:id" element={<ItemDetailsPage />} />
        <Route path="/my-requests" element={<MyRequestsPage />} />
        <Route path="/admin/equipment" element={<ManageEquipmentPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
