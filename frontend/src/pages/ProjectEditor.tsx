import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Code, Plus, CheckCircle2, Loader2, X, AlertTriangle, Play, BookOpen, FolderOpen, ChevronRight, RefreshCw, Pencil } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { API_BASE } from '../config';
import FieldList from '../components/fields/FieldList';
import JsonPreview from '../components/fields/JsonPreview';
import ModuleCard from '../components/modules/ModuleCard';
import {
  parseModules,
  flattenModules,
  serializeModulesForCompare,
  buildPublishJson,
  GENERAL_MODULE_ID,
} from '../components/modules/moduleModel';
import type { Module } from '../components/modules/moduleModel';
import type { ComponentField } from '../components/fields/FieldRow';

const SYNC_INTERVAL_MS = 5 * 60 * 1000;

const mapServerFields = (fields: any[]): ComponentField[] =>
  (fields || []).map((f: any) => ({
    id: String(f.id),
    key_name: f.key_name,
    key_label: f.key_label ?? '',
    key_value: f.key_value,
    key_type: f.key_type,
  }));

const ProjectEditor = () => {
  const { id } = useParams();
  const { projects } = useProjects();

  const project = projects.find(p => p.id === Number(id));

  const [modules, setModules] = useState<Module[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(true);
  const [error, setError] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testResultJson, setTestResultJson] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [showSyncBanner, setShowSyncBanner] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
  const [dragOverModuleIndex, setDragOverModuleIndex] = useState<number | null>(null);
  const [editingModuleName, setEditingModuleName] = useState(false);
  const [draftModuleName, setDraftModuleName] = useState('');

  const token = localStorage.getItem('token');

  const lastServerSnapshotRef = useRef('');
  const modulesRef = useRef(modules);
  useEffect(() => {
    modulesRef.current = modules;
  }, [modules]);

  const activeModule = useMemo(
    () => modules.find((m) => m.id === activeModuleId) || null,
    [modules, activeModuleId]
  );

  useEffect(() => {
    setEditingModuleName(false);
  }, [activeModuleId]);

  const fieldCount = useMemo(
    () => modules.reduce((sum, m) => sum + m.fields.filter((f) => f.key_name.trim()).length, 0),
    [modules]
  );

  const moduleOptions = useMemo(
    () => modules.map((m) => ({ id: m.id, name: m.name })),
    [modules]
  );

  const publishJson = useMemo(
    () => JSON.stringify(buildPublishJson(modules, project?.name || 'Proyecto'), null, 2),
    [modules, project?.name]
  );

  useEffect(() => {
    if (!id || !token) {
      setIsLoadingFields(false);
      return;
    }

    const fetchFields = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/user/proyects/${id}/fields`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok && data.status === 'success') {
          const serverFields = mapServerFields(data.fields);
          const parsed = parseModules(serverFields);
          setModules(parsed);
          lastServerSnapshotRef.current = serializeModulesForCompare(parsed);
        }
      } catch {
        // silent
      } finally {
        setIsLoadingFields(false);
      }
    };

    fetchFields();
  }, [id, token]);

  useEffect(() => {
    if (!id || !token) return;

    const checkForUpdates = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/user/proyects/${id}/fields`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') return;

        const serverFields = mapServerFields(data.fields);
        const serverModules = parseModules(serverFields);
        const serverSnap = serializeModulesForCompare(serverModules);

        if (serverSnap === lastServerSnapshotRef.current) {
          setShowSyncBanner(false);
          return;
        }

        const localSnap = serializeModulesForCompare(modulesRef.current);
        if (localSnap === lastServerSnapshotRef.current) {
          setModules(serverModules);
          lastServerSnapshotRef.current = serverSnap;
          setShowSyncBanner(false);
        } else {
          setShowSyncBanner(true);
        }
      } catch {
        // silent
      }
    };

    const timer = setInterval(checkForUpdates, SYNC_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [id, token]);

  const handleReloadFromServer = async () => {
    if (!id || !token) return;
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/proyects/${id}/fields`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        const serverFields = mapServerFields(data.fields);
        const parsed = parseModules(serverFields);
        setModules(parsed);
        lastServerSnapshotRef.current = serializeModulesForCompare(parsed);
        setShowSyncBanner(false);
        setActiveModuleId((current) =>
          current && !parsed.some((m) => m.id === current) ? null : current
        );
      }
    } catch {
      // silent
    } finally {
      setIsSyncing(false);
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: crypto.randomUUID(),
      name: `Módulo ${modules.filter((m) => m.id !== GENERAL_MODULE_ID).length + 1}`,
      fields: [],
    };
    setModules((prev) => [...prev, newModule]);
    setActiveModuleId(newModule.id);
  };

  const renameModule = (moduleId: string, name: string) => {
    setModules((prev) => prev.map((m) => (m.id === moduleId ? { ...m, name } : m)));
  };

  const startEditModuleName = () => {
    if (!activeModule || activeModule.id === GENERAL_MODULE_ID) return;
    setDraftModuleName(activeModule.name);
    setEditingModuleName(true);
  };

  const saveModuleName = () => {
    if (!activeModule) return;
    const name = draftModuleName.trim();
    if (name && name !== activeModule.name) {
      renameModule(activeModule.id, name);
    }
    setEditingModuleName(false);
  };

  const cancelEditModuleName = () => {
    setEditingModuleName(false);
  };

  const deleteModule = (moduleId: string) => {
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
    if (activeModuleId === moduleId) {
      setActiveModuleId(null);
    }
  };

  const handleModuleReorder = (fromIndex: number, toIndex: number) => {
    setModules((prev) => {
      if (prev[fromIndex]?.id === GENERAL_MODULE_ID || prev[toIndex]?.id === GENERAL_MODULE_ID) {
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleModuleDragEnd = () => {
    if (draggedModuleIndex !== null && dragOverModuleIndex !== null && draggedModuleIndex !== dragOverModuleIndex) {
      handleModuleReorder(draggedModuleIndex, dragOverModuleIndex);
    }
    setDraggedModuleIndex(null);
    setDragOverModuleIndex(null);
  };

  const addField = (moduleId: string) => {
    const newField: ComponentField = {
      id: crypto.randomUUID(),
      key_name: '',
      key_label: '',
      key_value: '',
      key_type: 'text',
    };
    setModules((prev) =>
      prev.map((m) => (m.id === moduleId ? { ...m, fields: [...m.fields, newField] } : m))
    );
  };

  const updateField = (moduleId: string, fieldId: string, data: Partial<ComponentField>) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, fields: m.fields.map((f) => (f.id === fieldId ? { ...f, ...data } : f)) }
          : m
      )
    );
  };

  const deleteField = (moduleId: string, fieldId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, fields: m.fields.filter((f) => f.id !== fieldId) } : m
      )
    );
  };

  const reorderFields = (moduleId: string, fromIndex: number, toIndex: number) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id !== moduleId) return m;
        const fields = [...m.fields];
        const [moved] = fields.splice(fromIndex, 1);
        fields.splice(toIndex, 0, moved);
        return { ...m, fields };
      })
    );
  };

  const moveField = (fromModuleId: string, fieldId: string, toModuleId: string) => {
    setModules((prev) => {
      const field = prev.find((m) => m.id === fromModuleId)?.fields.find((f) => f.id === fieldId);
      if (!field) return prev;
      return prev.map((m) => {
        if (m.id === fromModuleId) return { ...m, fields: m.fields.filter((f) => f.id !== fieldId) };
        if (m.id === toModuleId) return { ...m, fields: [...m.fields, field] };
        return m;
      });
    });
  };

  const handleSave = async () => {
    if (!id || !token) return;
    setIsSaving(true);
    setError('');

    const fieldsData = flattenModules(modules)
      .filter((f) => f.key_type === 'separator' || f.key_name.trim())
      .map((f) => ({
        key_name: f.key_type === 'separator' ? (f.key_name.trim() || 'Módulo') : f.key_name,
        key_label: f.key_label ?? '',
        key_value: f.key_value,
        key_type: f.key_type,
      }));

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/proyects/${id}/fields`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fields: fieldsData })
      });

      const data = await res.json();

      if (!res.ok || data.status === 'error') {
        throw new Error(data.detail || 'Error al guardar campos');
      }

      const serverFields = mapServerFields(data.fields);
      const parsed = parseModules(serverFields);
      setModules(parsed);
      lastServerSnapshotRef.current = serializeModulesForCompare(parsed);
      setActiveModuleId((current) =>
        current && !parsed.some((m) => m.id === current) ? null : current
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!id || !token) return;
    setIsTesting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/proyects/${id}/published-json`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al obtener JSON publicado');
      }

      const text = await res.text();
      const formatted = JSON.stringify(JSON.parse(text), null, 2);
      setTestResultJson(formatted);
      setShowTestModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsTesting(false);
    }
  };

  const handlePublish = async () => {
    if (!id || !token) return;
    setIsPublishing(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/proyects/${id}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok || data.status === 'error') {
        throw new Error(data.detail || 'Error al publicar JSON');
      }

      setPublishSuccess(true);
      setShowPublishModal(false);
      setTimeout(() => setPublishSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Proyecto no encontrado</h2>
        <Link to="/dashboard/projects" className="text-blue-600 hover:underline mt-4 inline-block">
          Volver a Mis Proyectos
        </Link>
      </div>
    );
  }

  if (isLoadingFields) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-slate-400 dark:text-slate-500" />
      </div>
    );
  }

  const subtitle = activeModule
    ? `${activeModule.fields.length} campo(s) en "${activeModule.name}"`
    : modules.length > 0
      ? `${modules.length} módulo(s) · ${fieldCount} campo(s)`
      : 'Añade módulos para organizar el contenido';

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/dashboard/projects"
            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            {activeModule ? (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveModuleId(null)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                >
                  <ChevronRight size={14} className="rotate-180" />
                  Módulos
                </button>
                <span className="text-slate-400">/</span>
                {editingModuleName ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={draftModuleName}
                      onChange={(e) => setDraftModuleName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveModuleName();
                        if (e.key === 'Escape') cancelEditModuleName();
                      }}
                      onBlur={saveModuleName}
                      autoFocus
                      className="px-2 py-1 border border-blue-400 rounded-lg text-xl font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={saveModuleName}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"
                      title="Guardar nombre"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={cancelEditModuleName}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      title="Cancelar"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 min-w-0">
                    <h1
                      onDoubleClick={startEditModuleName}
                      className="text-2xl font-bold text-slate-900 dark:text-slate-100 inline-flex items-center gap-2 truncate cursor-text"
                    >
                      <FolderOpen size={22} className="text-blue-500 shrink-0" />
                      <span className="truncate">{activeModule.name}</span>
                    </h1>
                    {activeModule.id !== GENERAL_MODULE_ID && (
                      <button
                        type="button"
                        onClick={startEditModuleName}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors shrink-0"
                        title="Renombrar módulo"
                      >
                        <Pencil size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Editor: {project.name}</h1>
            )}
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowJsonPreview(true)}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Code size={18} />
            Ver JSON
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <><Loader2 size={18} className="animate-spin" /> Guardando</>
            ) : saved ? (
              <><CheckCircle2 size={18} /> Guardado</>
            ) : (
              <><Save size={18} /> Guardar</>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            disabled={isPublishing || publishSuccess}
            className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPublishing ? (
              <><Loader2 size={18} className="animate-spin" /> Publicando</>
            ) : publishSuccess ? (
              <><CheckCircle2 size={18} /> Publicado</>
            ) : (
              <>Publicar</>
            )}
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting}
            className="flex-1 sm:flex-none bg-slate-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            title="Obtener JSON publicado desde el endpoint"
          >
            {isTesting ? (
              <><Loader2 size={18} className="animate-spin" /> Probando</>
            ) : (
              <><Play size={18} /> Probar</>
            )}
          </button>
        </div>
      </div>

      {showSyncBanner && (
        <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
          <AlertTriangle size={18} className="shrink-0" />
          <span className="flex-1">Este proyecto fue actualizado desde otra sesión.</span>
          <button
            type="button"
            onClick={handleReloadFromServer}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors inline-flex items-center gap-1.5 shrink-0 disabled:opacity-60"
          >
            {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Recargar
          </button>
        </div>
      )}

      {publishSuccess && (
        <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 size={18} className="shrink-0" />
          <span className="flex-1">JSON publicado exitosamente.</span>
          <Link
            to="/uso"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <BookOpen size={16} />
            Ver ejemplos de uso
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!activeModule ? (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((m, index) => (
              <ModuleCard
                key={m.id}
                module={m}
                onEnter={() => setActiveModuleId(m.id)}
                onRename={(name) => renameModule(m.id, name)}
                onDelete={() => deleteModule(m.id)}
                onDragStart={() => setDraggedModuleIndex(index)}
                onDragEnd={handleModuleDragEnd}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedModuleIndex !== null && draggedModuleIndex !== index) {
                    setDragOverModuleIndex(index);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedModuleIndex !== null && draggedModuleIndex !== index) {
                    handleModuleReorder(draggedModuleIndex, index);
                  }
                  setDraggedModuleIndex(null);
                  setDragOverModuleIndex(null);
                }}
                isDragging={draggedModuleIndex === index}
                isDragOver={dragOverModuleIndex === index}
              />
            ))}
            <button
              type="button"
              onClick={addModule}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-5 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all flex flex-col items-center justify-center gap-2 min-h-[140px] font-medium"
            >
              <Plus size={24} />
              Añadir Módulo
            </button>
          </div>
          {modules.length === 0 && (
            <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-6">
              Los campos sueltos sin módulo aparecerán en "General".
            </p>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setActiveModuleId(null)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Volver a Módulos
            </button>
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={() => addField(activeModule.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Añadir Campo
            </button>
          </div>

          <FieldList
            fields={activeModule.fields}
            onUpdate={(fieldId, data) => updateField(activeModule.id, fieldId, data)}
            onDelete={(fieldId) => deleteField(activeModule.id, fieldId)}
            onAdd={() => addField(activeModule.id)}
            onReorder={(from, to) => reorderFields(activeModule.id, from, to)}
            modules={moduleOptions}
            currentModuleId={activeModule.id}
            onMove={(fieldId, toModuleId) => moveField(activeModule.id, fieldId, toModuleId)}
          />
        </div>
      )}

      <JsonPreview
        modules={modules}
        isOpen={showJsonPreview}
        onClose={() => setShowJsonPreview(false)}
        projectName={project.name}
      />

      {/* Modal de prueba del endpoint */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Endpoint Funcionando</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">JSON publicado obtenido desde el servidor</p>
                </div>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <pre className="bg-slate-900 text-emerald-400 rounded-xl p-5 text-sm font-mono leading-relaxed overflow-x-auto whitespace-pre max-h-[60vh]">
                <code>{testResultJson}</code>
              </pre>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end shrink-0 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de publicación */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 shrink-0">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-full">
                <AlertTriangle size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">¿Publicar JSON?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Se guardará el JSON final en la base de datos y sobrescribirá la publicación anterior.
                </p>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Vista previa del JSON
              </p>
              <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre max-h-64">
                <code>{publishJson}</code>
              </pre>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                {fieldCount} campo(s) —{" "}
                {new TextEncoder().encode(publishJson).length > 1024
                  ? `${(new TextEncoder().encode(publishJson).length / 1024).toFixed(1)} KB`
                  : `${new TextEncoder().encode(publishJson).length} bytes`}
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-3 shrink-0 bg-slate-50 dark:bg-slate-900">
              <button
                onClick={() => setShowPublishModal(false)}
                disabled={isPublishing}
                className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPublishing ? (
                  <><Loader2 size={18} className="animate-spin" /> Publicando...</>
                ) : (
                  'Sí, publicar JSON'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectEditor;
