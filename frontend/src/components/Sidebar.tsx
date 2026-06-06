import { useState } from 'react';
import { LayoutDashboard, FolderKanban, Settings, LogOut, ChevronLeft, ChevronRight, User, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  onLogoutClick: () => void;
  username?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = ({ onLogoutClick, username = "Usuario", isMobileOpen = false, onMobileClose }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Mis Proyectos', icon: FolderKanban, path: '/dashboard/projects' },
    { name: 'Configuración', icon: Settings, path: '/dashboard/settings' },
  ];

  const sidebarContent = (mobile: boolean) => (
    <>
      {/* Botón para colapsar/expandir (solo desktop) */}
      {!mobile && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-full p-1 shadow-sm hover:text-blue-600 transition-colors z-10"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}

      {/* Botón cerrar (solo móvil) */}
      {mobile && onMobileClose && (
        <button
          onClick={onMobileClose}
          className="absolute top-4 right-4 p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors lg:hidden"
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>
      )}

      {/* Navegación principal */}
      <div className="flex-1 py-6 px-3 flex flex-col gap-2 overflow-y-auto mt-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={mobile ? onMobileClose : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <item.icon size={20} className="shrink-0" />
              {(isExpanded || mobile) && (
                <span className="font-medium whitespace-nowrap overflow-hidden transition-all">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sección inferior (Usuario y Salir) */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-3">
        <div className={`flex items-center gap-3 px-3 py-3 mb-2 rounded-lg text-slate-700 dark:text-slate-300 ${!isExpanded && !mobile && 'justify-center'}`}>
          <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 p-1.5 rounded-full shrink-0">
            <User size={18} />
          </div>
          {(isExpanded || mobile) && (
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{username}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Administrador</p>
            </div>
          )}
        </div>

        <button
          onClick={onLogoutClick}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors ${!isExpanded && !mobile && 'justify-center'}`}
          title="Cerrar Sesión"
        >
          <LogOut size={20} className="shrink-0" />
          {(isExpanded || mobile) && (
            <span className="font-medium whitespace-nowrap overflow-hidden">
              Cerrar Sesión
            </span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent(true)}
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`
          hidden lg:flex ${isExpanded ? 'w-64' : 'w-20'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-full flex-col transition-all duration-300 relative
        `}
      >
        {sidebarContent(false)}
      </aside>
    </>
  );
};

export default Sidebar;
