import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Code, Plus } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
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
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {saved ? 'Guardado' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

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
      />

      <JsonPreview
        fields={fields}
        isOpen={showJsonPreview}
        onClose={() => setShowJsonPreview(false)}
        projectName={project.name}
      />
    </div>
  );
};

export default ProjectEditor;
