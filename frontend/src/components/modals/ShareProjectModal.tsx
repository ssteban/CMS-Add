import { useState, useEffect, useCallback } from 'react';
import { Loader2, Users, Mail, UserMinus, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../config';
import type { Project } from '../../context/ProjectContext';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

interface Member {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
}

interface Invitation {
  id: number;
  created_at: string;
  username: string;
  email: string;
}

const ShareProjectModal = ({ isOpen, onClose, project }: ShareProjectModalProps) => {
  const { token } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  const refreshAccess = useCallback(async () => {
    if (!token || !project) return;
    setLoadingList(true);
    try {
      const [membersRes, invitationsRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/user/proyects/${project.id}/members`, { headers: authHeaders }),
        fetch(`${API_BASE}/api/v1/user/proyects/${project.id}/invitations`, { headers: authHeaders })
      ]);
      const membersData = await membersRes.json();
      const invitationsData = await invitationsRes.json();
      if (membersRes.ok && membersData.status === 'success') {
        setMembers(membersData.members || []);
      }
      if (invitationsRes.ok && invitationsData.status === 'success') {
        setInvitations(invitationsData.invitations || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingList(false);
    }
  }, [token, project]);

  useEffect(() => {
    if (isOpen && project) {
      refreshAccess();
    } else {
      setMembers([]);
      setInvitations([]);
    }
  }, [isOpen, project, refreshAccess]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/proyects/${project.id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (!res.ok || data.status === 'error') {
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Error al enviar la invitación');
      }

      setSuccess(data.message || 'Invitación enviada');
      setEmail('');
      await refreshAccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (member: Member) => {
    setRemovingId(member.user_id);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/proyects/${project.id}/members/${member.user_id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Error al quitar el acceso');
      }
      setSuccess(`Acceso de ${member.username} retirado`);
      await refreshAccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setRemovingId(null);
    }
  };

  const handleCancelInvitation = async (invitation: Invitation) => {
    setRemovingId(invitation.id);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/proyects/${project.id}/invitations/${invitation.id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        throw new Error(typeof data.detail === 'string' ? data.detail : 'Error al eliminar la invitación');
      }
      setSuccess(`Invitación a ${invitation.username} eliminada`);
      await refreshAccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setRemovingId(null);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setEmail('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
              <Users size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Compartir y Administrar</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Gestiona quién puede editar el contenido de{' '}
            <strong className="text-slate-700 dark:text-slate-300">{project.name}</strong>.
            Solo podrán editar contenido: no podrán eliminar el proyecto ni ver credenciales.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="shareEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Invitar por email
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  id="shareEmail"
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-9 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Ej: usuario@ejemplo.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Users size={18} />
                  Enviar invitación
                </>
              )}
            </button>
          </form>

          {/* Miembros con acceso */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Personas con acceso</p>
            {loadingList && members.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">Cargando...</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-2">Nadie más tiene acceso todavía.</p>
            ) : (
              <ul className="space-y-2">
                {members.map((member) => (
                  <li key={member.user_id} className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{member.username}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{member.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member)}
                      disabled={removingId !== null}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {removingId === member.user_id ? <Loader2 size={13} className="animate-spin" /> : <UserMinus size={13} />}
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Invitaciones pendientes */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Invitaciones pendientes</p>
            {loadingList && invitations.length === 0 ? (
              <p className="text-sm text-slate-400 py-2">Cargando...</p>
            ) : invitations.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-2">No hay invitaciones pendientes.</p>
            ) : (
              <ul className="space-y-2">
                {invitations.map((invitation) => (
                  <li key={invitation.id} className="flex items-center justify-between gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{invitation.username}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{invitation.email}</p>
                    </div>
                    <button
                      onClick={() => handleCancelInvitation(invitation)}
                      disabled={removingId !== null}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {removingId === invitation.id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                      Cancelar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareProjectModal;
