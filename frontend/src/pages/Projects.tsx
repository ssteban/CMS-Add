import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, Plus, ExternalLink, Key } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';
import type { Project } from '../context/ProjectContext';
import CreateProjectModal from '../components/modals/CreateProjectModal';
import ManageApiKeysModal from '../components/modals/ManageApiKeysModal';

const Projects = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Estado para el modal de API Keys
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { projects, addProject } = useProjects();

  const handleOpenApiModal = (project: Project) => {
    setSelectedProject(project);
    setIsApiModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Mis Proyectos</h1>
          <p className="mt-2 text-slate-600">Gestiona y edita el contenido de todas tus páginas web estáticas.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          Crear Proyecto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center animate-in fade-in duration-300">
          <div className="mx-auto w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <FolderKanban size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes proyectos</h2>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Crea tu primer proyecto para empezar a gestionar el contenido de tu web desde este panel.
          </p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Crear Nuevo Proyecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <FolderKanban size={24} />
                </div>
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  {project.createdAt}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h3>
              <a 
                href={project.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-6 flex-grow"
              >
                {project.url}
                <ExternalLink size={12} />
              </a>
              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                <Link 
                  to={`/dashboard/projects/${project.id}/editor`}
                  className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-bold text-center hover:bg-blue-100 transition-colors"
                >
                  Editar Contenido
                </Link>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold text-center hover:bg-green-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={16} />
                  Ver Web
                </a>
                <button 
                  onClick={() => handleOpenApiModal(project)}
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Key size={16} />
                  Credenciales
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={addProject}
      />

      <ManageApiKeysModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        project={selectedProject}
      />
    </div>
  );
};

export default Projects;
