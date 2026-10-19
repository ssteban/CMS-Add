import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Menu, BookOpen, Code, Bell, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import { API_BASE } from '../config';

interface NavbarProps {
  isAuthenticated?: boolean;
  onMenuToggle?: () => void;
}

interface Notification {
  id: number;
  created_at: string;
  project_id: number;
  project_name: string;
  inviter: string;
}

const Navbar = ({ isAuthenticated = false, onMenuToggle }: NavbarProps) => {
  const { token } = useAuth();
  const { refreshProjects } = useProjects();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setNotifications(data.notifications || []);
      }
    } catch {
      // silently fail
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setNotifications([]);
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token, fetchNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleRespond = async (notification: Notification, accept: boolean) => {
    if (!token) return;
    setRespondingId(notification.id);
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/user/notifications/${notification.id}/${accept ? 'accept' : 'decline'}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        if (accept) {
          await refreshProjects();
        }
      }
    } catch {
      // silently fail
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <nav className="bg-slate-900 text-white w-full border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            {isAuthenticated && onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Abrir menú"
              >
                <Menu size={24} />
              </button>
            )}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="font-extrabold text-2xl tracking-tighter text-blue-400">CMS</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(prev => !prev)}
                  className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label="Notificaciones"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Notificaciones</p>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No tienes notificaciones nuevas</p>
                      </div>
                    ) : (
                      <ul className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                        {notifications.map((n) => (
                          <li key={n.id} className="px-4 py-3">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              <strong className="text-slate-900 dark:text-slate-100">{n.inviter}</strong> te invitó a
                              editar <strong className="text-slate-900 dark:text-slate-100">{n.project_name}</strong>
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleRespond(n, true)}
                                disabled={respondingId === n.id}
                                className="flex-1 inline-flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <Check size={14} />
                                Aceptar
                              </button>
                              <button
                                onClick={() => handleRespond(n, false)}
                                disabled={respondingId === n.id}
                                className="flex-1 inline-flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold py-1.5 px-2 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <X size={14} />
                                Rechazar
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
            <a
              href="https://github.com/ssteban/CMS-Add"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              aria-label="Ver en GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium hidden sm:block">GitHub</span>
            </a>
            <Link
              to="/docs"
              className="bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <BookOpen size={18} />
              <span className="text-sm font-medium hidden sm:block">Docs</span>
            </Link>
            {isAuthenticated ? (
              <a
                href="/uso"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <Code size={18} />
                <span className="text-sm font-medium hidden sm:block">Uso</span>
              </a>
            ) : (
              <Link
                to="/uso"
                className="bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <Code size={18} />
                <span className="text-sm font-medium hidden sm:block">Uso</span>
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" className="bg-transparent border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
