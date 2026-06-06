import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Palette, AlertTriangle, Save, Loader2, CheckCircle2, Eye, EyeOff, Key, FolderKanban, Sun, Moon, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';

const Settings = () => {
  const { token, username } = useAuth();

  // Perfil
  const [profileUsername, setProfileUsername] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileCreatedAt, setProfileCreatedAt] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Seguridad - Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  // Preferencias - Tema
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  // Peligro
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!token) return;
    setProfileLoading(true);
    fetch(`${API_BASE}/api/v1/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setProfileUsername(data.profile.username);
          setProfileEmail(data.profile.email);
          setProfileCreatedAt(data.profile.created_at);
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSaveProfile = async () => {
    if (!token) return;
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: profileUsername, email: profileEmail })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError(data.detail || 'Error al guardar');
      }
    } catch {
      setProfileError('Error de conexión');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!token || !currentPassword || !newPassword) return;
    setPwSaving(true);
    setPwError('');
    setPwSuccess(false);

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: currentPassword, new_password: newPassword })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPwSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => setPwSuccess(false), 3000);
      } else {
        setPwError(data.detail || 'Error al cambiar contraseña');
      }
    } catch {
      setPwError('Error de conexión');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Configuración</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Administra tu cuenta y preferencias.</p>
      </div>

      {/* Perfil */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
            <User size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Perfil</h2>
        </div>

        {profileLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-slate-400 dark:text-slate-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre de usuario</label>
              <input
                type="text"
                value={profileUsername}
                onChange={e => setProfileUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={profileEmail}
                onChange={e => setProfileEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            {profileCreatedAt && (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Miembro desde {new Date(profileCreatedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}

            {profileSuccess && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                <CheckCircle2 size={16} /> Perfil actualizado
              </div>
            )}
            {profileError && (
              <p className="text-red-600 text-sm">{profileError}</p>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {profileSaving ? (
                <><Loader2 size={18} className="animate-spin" /> Guardando</>
              ) : (
                <><Save size={18} /> Guardar cambios</>
              )}
            </button>
          </div>
        )}
      </section>

      {/* Seguridad */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg">
              <Lock size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Seguridad</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Cambiar contraseña */}
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">Cambiar contraseña</h3>
            <div className="space-y-4 max-w-md">
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña actual</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                  >
                    {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                  >
                    {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {pwSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle2 size={16} /> Contraseña actualizada
                </div>
              )}
              {pwError && (
                <p className="text-red-600 text-sm">{pwError}</p>
              )}

              <button
                onClick={handleChangePassword}
                disabled={pwSaving || !currentPassword || !newPassword}
                className="px-6 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {pwSaving ? (
                  <><Loader2 size={18} className="animate-spin" /> Actualizando</>
                ) : (
                  <><Lock size={18} /> Actualizar contraseña</>
                )}
              </button>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-700" />

          {/* API Keys */}
          <div>
            <div className="flex items-center gap-3">
              <Key size={18} className="text-slate-500 dark:text-slate-400" />
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">API Keys</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-3">
              Gestiona las llaves de acceso para tus proyectos desde la sección de proyectos.
            </p>
            <Link
              to="/dashboard/projects"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors text-sm"
            >
              <FolderKanban size={16} />
              Ir a Mis Proyectos
            </Link>
          </div>
        </div>
      </section>

      {/* Preferencias */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
            <Palette size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Preferencias</h2>
        </div>

        <div className="flex items-center justify-between max-w-md">
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">Tema</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Alterna entre modo claro y oscuro</p>
          </div>
          <button
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className={`p-3 rounded-xl transition-colors ${
              theme === 'dark'
                ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </section>

      {/* Zona de Peligro */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <h2 className="text-xl font-bold text-red-700">Zona de Peligro</h2>
        </div>

        <div className="flex items-center justify-between max-w-md">
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">Eliminar cuenta</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Esta acción no se puede deshacer</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
          >
            Eliminar cuenta
          </button>
        </div>
      </section>

      {/* Modal eliminar cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">¿Eliminar cuenta?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Esta acción eliminará permanentemente tu cuenta y todos tus proyectos asociados.
                No hay forma de recuperarla.
              </p>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
