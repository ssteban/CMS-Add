import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LogoutModal from '../components/modals/LogoutModal';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { username, logout } = useAuth();

  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutModalOpen(false);
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Navbar Superior */}
      <div className="shrink-0 z-20">
        <Navbar
          isAuthenticated={true}
          onMenuToggle={() => setIsMobileSidebarOpen((prev) => !prev)}
        />
      </div>

      {/* Contenedor Principal (Sidebar + Contenido) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Lateral */}
        <Sidebar
          onLogoutClick={() => setIsLogoutModalOpen(true)}
          username={username || "Usuario"}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Área de Contenido Principal */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Modal de confirmación de cierre de sesión */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </div>
  );
};

export default DashboardLayout;
