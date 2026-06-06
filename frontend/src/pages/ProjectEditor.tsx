import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Code, Plus, CheckCircle2, Loader2, X, AlertTriangle, Play, BookOpen } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import { API_BASE } from '../config';
import FieldList from '../components/fields/FieldList';
import JsonPreview from '../components/fields/JsonPreview';
import type { ComponentField } from '../components/fields/FieldRow';

const ProjectEditor = () => {
  const { id } = useParams();
  const { projects } = useProjects();

  const project = projects.find(p => p.id === Number(id));

  const [fields, setFields] = useState<ComponentField[]>([]);
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

  const token = localStorage.getItem('token');

  const publishJson = useMemo(() => {
    const validFields = fields.filter((f) => f.key_name.trim());
    const data = validFields.map((f) => ({
      key: f.key_name,
      value: f.key_value,
      type: f.key_type,
    }));
    return JSON.stringify({
      website: project?.name || 'Proyecto',
      total_fields: data.length,
      data,
    }, null, 2);
  }, [fields, project?.name]);

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
          const serverFields: ComponentField[] = (data.fields || []).map((f: any) => ({
            id: String(f.id),
            key_name: f.key_name,
            key_value: f.key_value,
            key_type: f.key_type,
          }));
          setFields(serverFields);
        }
      } catch {
        // silent
      } finally {
        setIsLoadingFields(false);
      }
    };

    fetchFields();
  }, [id, token]);

  const fieldCount = useMemo(() => fields.filter((f) => f.key_name.trim()).length, [fields]);

  const addField = () => {
    const newField: ComponentField = {
      id: crypto.randomUUID(),
      key_name: '',
      key_value: '',
      key_type: 'text',
    };
    setFields((prev) => [...prev, newField]);
  };

  const updateField = (id: string, data: Partial<ComponentField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f)));
  };

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    setFields((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleSave = async () => {
    if (!id || !token) return;
    setIsSaving(true);
    setError('');

    const fieldsData = fields
      .filter((f) => f.key_name.trim())
      .map((f) => ({
        key_name: f.key_name,
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

      const serverFields: ComponentField[] = (data.fields || []).map((f: any) => ({
        id: String(f.id),
        key_name: f.key_name,
        key_value: f.key_value,
        key_type: f.key_type,
      }));

      setFields(serverFields);
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
        <h2 className="text-2xl font-bold text-slate-900">Proyecto no encontrado</h2>
        <Link to="/dashboard/projects" className="text-blue-600 hover:underline mt-4 inline-block">
          Volver a Mis Proyectos
        </Link>
      </div>
    );
  }

  if (isLoadingFields) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/projects"
            className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Editor: {project.name}</h1>
            <p className="text-sm text-slate-500">
              {fieldCount > 0
                ? `${fieldCount} campo(s) definido(s)`
                : 'Añade campos para construir el esquema'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowJsonPreview(true)}
            className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors flex items-center justify-center gap-2"
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

      {publishSuccess && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
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
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="mb-6">
        <button
          type="button"
          onClick={addField}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Añadir Campo
        </button>
      </div>

      <FieldList
        fields={fields}
        onUpdate={updateField}
        onDelete={deleteField}
        onAdd={addField}
        onReorder={handleReorder}
      />

      <JsonPreview
        fields={fields}
        isOpen={showJsonPreview}
        onClose={() => setShowJsonPreview(false)}
        projectName={project.name}
      />

      {/* Modal de prueba del endpoint */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm transition-opacity px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Endpoint Funcionando</h3>
                  <p className="text-sm text-slate-500">JSON publicado obtenido desde el servidor</p>
                </div>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <pre className="bg-slate-900 text-emerald-400 rounded-xl p-5 text-sm font-mono leading-relaxed overflow-x-auto whitespace-pre max-h-[60vh]">
                <code>{testResultJson}</code>
              </pre>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-white font-medium transition-colors"
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
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 shrink-0">
              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-full">
                <AlertTriangle size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">¿Publicar JSON?</h3>
                <p className="text-sm text-slate-500">
                  Se guardará el JSON final en la base de datos y sobrescribirá la publicación anterior.
                </p>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                Vista previa del JSON
              </p>
              <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre max-h-64">
                <code>{publishJson}</code>
              </pre>
              <p className="text-xs text-slate-400 mt-2">
                {fieldCount} campo(s) —{" "}
                {new TextEncoder().encode(publishJson).length > 1024
                  ? `${(new TextEncoder().encode(publishJson).length / 1024).toFixed(1)} KB`
                  : `${new TextEncoder().encode(publishJson).length} bytes`}
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 shrink-0 bg-slate-50">
              <button
                onClick={() => setShowPublishModal(false)}
                disabled={isPublishing}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
