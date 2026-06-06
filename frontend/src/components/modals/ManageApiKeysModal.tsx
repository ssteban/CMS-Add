import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Key, Copy, Check, Download, AlertTriangle, Trash2, Plus, X, Loader2, BookOpen } from 'lucide-react';
import type { Project } from '../../context/ProjectContext';
import { API_BASE } from '../../config';

interface ManageApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

interface ApiKeyData {
  id: number;
  keyName: string;
  maskedKey: string;
  createdAt: string;
}

const ManageApiKeysModal = ({ isOpen, onClose, project }: ManageApiKeysModalProps) => {
  const [view, setView] = useState<'list' | 'create_form' | 'new_key' | 'revoke'>('list');
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKeyData | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [newKeyPlain, setNewKeyPlain] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [keyNameInput, setKeyNameInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const fetchApiKeys = async () => {
    if (!project || !token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/proyects/${project.id}/api-keys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setApiKeys(data.keys.map((k: any) => ({
          id: k.id,
          keyName: k.key_name,
          maskedKey: k.masked_key,
          createdAt: k.created_at
        })));
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && project) {
      setView('list');
      setNewKeyPlain('');
      setNewKeyName('');
      setIsCopied(false);
      setKeyNameInput('');
      setKeyToRevoke(null);
      setError('');
      fetchApiKeys();
    }
  }, [isOpen, project]);

  const handleCreateKey = async () => {
    if (!keyNameInput.trim() || !project || !token) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/proyects/${project.id}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key_name: keyNameInput.trim() })
      });
      const data = await res.json();
      if (!res.ok || data.status === 'error') {
        setError(data.detail || 'Error al crear la llave');
        return;
      }
      setNewKeyPlain(data.plain_key);
      setNewKeyName(data.key_name);
      setApiKeys(prev => [...prev, {
        id: data.id,
        keyName: data.key_name,
        maskedKey: data.masked_key,
        createdAt: data.created_at
      }]);
      setKeyNameInput('');
      setView('new_key');
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmRevokeKey = async () => {
    if (!keyToRevoke || !project || !token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/proyects/${project.id}/api-keys/${keyToRevoke.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setApiKeys(prev => prev.filter(k => k.id !== keyToRevoke.id));
      }
    } catch {
      // silent
    } finally {
      setKeyToRevoke(null);
      setView('list');
      setIsLoading(false);
    }
  };

  const cancelRevokeKey = () => {
    setKeyToRevoke(null);
    setView('list');
  };

  const handleRevokeClick = (key: ApiKeyData) => {
    setKeyToRevoke(key);
    setView('revoke');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newKeyPlain);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // silent
    }
  };

  const handleDownload = () => {
    if (!project) return;
    const data = JSON.stringify({
      project: project.name,
      project_url: project.url,
      key_name: newKeyName,
      api_key: newKeyPlain,
      created_at: new Date().toISOString()
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cms_api_key_${newKeyName.replace(/\s+/g, '_').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCloseAndReset = () => {
    setView('list');
    setNewKeyPlain('');
    setIsCopied(false);
    setKeyToRevoke(null);
    setError('');
    setKeyNameInput('');
    onClose();
  };

  const handleDoneWithNewKey = () => {
    setView('list');
    setNewKeyPlain('');
    setIsCopied(false);
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50 shrink-0 relative">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Key size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {view === 'create_form' ? 'Nueva Llave API' :
               view === 'new_key' ? 'Llave Creada' :
               view === 'revoke' ? 'Revocar Llave' :
               'Credenciales API'}
            </h3>
            <p className="text-sm text-slate-500">
              {view === 'new_key' && newKeyName ? (
                <>Llave: <span className="font-semibold text-slate-700">{newKeyName}</span></>
              ) : view === 'revoke' && keyToRevoke ? (
                <>Llave: <span className="font-semibold text-slate-700">{keyToRevoke.keyName}</span></>
              ) : (
                <>Proyecto: <span className="font-semibold text-slate-700">{project.name}</span></>
              )}
            </p>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors absolute top-4 right-4"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* VISTA 1: Lista de Llaves */}
          {view === 'list' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600">Administra las llaves de acceso para consumir el contenido de este proyecto.</p>
                <button
                  onClick={() => setView('create_form')}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                  Generar Llave
                </button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-slate-400" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <Key size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">No hay llaves activas</p>
                  <p className="text-sm text-slate-400 mt-1">Genera una llave para conectar tu frontend estático.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 mb-0.5 truncate">{key.keyName}</p>
                        <p className="font-mono text-xs text-slate-500 mb-1">{key.maskedKey}</p>
                        <p className="text-xs text-slate-400">Creada el {key.createdAt}</p>
                      </div>
                      <button
                        onClick={() => handleRevokeClick(key)}
                        className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-3 shrink-0"
                        title="Revocar llave"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VISTA 2: Formulario Crear Llave */}
          {view === 'create_form' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <label htmlFor="keyName" className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre de la llave
                </label>
                <input
                  id="keyName"
                  type="text"
                  required
                  disabled={isLoading}
                  value={keyNameInput}
                  onChange={(e) => setKeyNameInput(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Ej: Producción, Local, Staging"
                  autoFocus
                />
                <p className="mt-1 text-xs text-slate-400">Asigna un nombre descriptivo para identificar esta llave fácilmente.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => { setView('list'); setError(''); setKeyNameInput(''); }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateKey}
                  disabled={isLoading || !keyNameInput.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Creando...</>
                  ) : (
                    'Crear Llave'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* VISTA 3: Nueva Llave Generada (Mostrar Una Vez) */}
          {view === 'new_key' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {newKeyName && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Llave:</span> {newKeyName}
                  </p>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4 items-start">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={24} />
                <div>
                  <h4 className="font-bold text-amber-800 mb-1">¡Guarda esta clave ahora!</h4>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    Por razones de seguridad, <strong>esta es la única vez que mostraremos la clave completa</strong>. Cópiala o descárgala y guárdala en un lugar seguro (como un archivo .env en tu frontend).
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between border border-slate-800 shadow-inner">
                <code className="text-emerald-400 font-mono text-sm sm:text-base break-all select-all">
                  {newKeyPlain}
                </code>
                <button
                  onClick={handleCopy}
                  className={`ml-4 p-2 rounded-lg flex items-center gap-2 shrink-0 transition-colors ${isCopied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                >
                  {isCopied ? (
                    <><Check size={18} /> <span className="text-sm font-medium hidden sm:inline">Copiado</span></>
                  ) : (
                    <><Copy size={18} /> <span className="text-sm font-medium hidden sm:inline">Copiar</span></>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Descargar como JSON
                </button>
                <button
                  onClick={handleDoneWithNewKey}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                >
                  He guardado mi llave
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/uso"
                  onClick={onClose}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline inline-flex items-center gap-1.5"
                >
                  <BookOpen size={16} />
                  Ver ejemplos de uso en todos los lenguajes
                </Link>
              </div>
            </div>
          )}

          {/* VISTA 4: Confirmar Revocación */}
          {view === 'revoke' && keyToRevoke && (
            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200 py-2">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-slate-900 mb-2">¿Revocar Credencial?</h4>
                <p className="text-sm font-semibold text-slate-700 mb-1">{keyToRevoke.keyName}</p>
                <p className="text-slate-600 max-w-sm mx-auto text-sm">
                  Esta acción no se puede deshacer. La llave <strong className="font-mono text-xs">{keyToRevoke.maskedKey}</strong> perderá el acceso inmediatamente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={cancelRevokeKey}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmRevokeKey}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Revocando...</>
                  ) : (
                    'Sí, revocar llave'
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer (Solo en vista lista) */}
        {view === 'list' && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
            <button
              onClick={handleCloseAndReset}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageApiKeysModal;
