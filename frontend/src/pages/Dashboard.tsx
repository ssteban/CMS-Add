import { Globe, FileText, LayoutDashboard, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';

const Dashboard = () => {
  const { projects } = useProjects();

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Bienvenido a tu panel de control. Aquí tienes un resumen de la actividad de tus webs.</p>
      </div>

      {/* Tarjetas de métricas globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-lg">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Proyectos Activos</p>
            <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="bg-indigo-100 text-indigo-600 p-4 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Esquemas Creados</p>
            <p className="text-2xl font-bold text-slate-900">&mdash;</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
          <div className="bg-green-100 text-green-600 p-4 rounded-lg">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Peticiones API (Mes)</p>
            <p className="text-2xl font-bold text-slate-900">&mdash;</p>
          </div>
        </div>
      </div>

      {/* Resumen de actividad / Proyectos recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Proyectos Recientes</h2>
          <Link to="/dashboard/projects" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="p-6">
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">Aún no hay actividad reciente.</p>
              <Link 
                to="/dashboard/projects" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm inline-block"
              >
                Ir a Mis Proyectos
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {projects.slice(0, 3).map((project) => (
                <li key={project.id} className="py-4 flex justify-between items-center group">
                  <div>
                    <p className="font-bold text-slate-900">{project.name}</p>
                    <p className="text-sm text-slate-500">Creado el {project.createdAt}</p>
                  </div>
                  <Link 
                    to={`/dashboard/projects/${project.id}/editor`}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    Editar
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
