import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

const API_BASE = 'http://127.0.0.1:8000';

export interface Project {
  id: number;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  addProject: (name: string, url: string) => Promise<void>;
  updateProject: (id: number, name: string, url: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProjects = useCallback(async () => {
    if (!token) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/user/proyects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setProjects(data.proyects.map((p: any) => ({
          id: p.id,
          name: p.name,
          url: p.url,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        })));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  const addProject = async (name: string, url: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/v1/user/create-proyects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, url })
    });

    const data = await res.json();

    if (!res.ok || data.status === 'error') {
      throw new Error(data.detail || 'Error al crear el proyecto');
    }

    const p = data.proyect;
    const newProject: Project = {
      id: p.id,
      name: p.name,
      url: p.url,
      createdAt: p.created_at,
      updatedAt: p.updated_at
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = async (id: number, name: string, url: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/v1/user/proyects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, url })
    });

    const data = await res.json();

    if (!res.ok || data.status === 'error') {
      throw new Error(data.detail || 'Error al actualizar el proyecto');
    }

    const p = data.proyect;
    setProjects(prev => prev.map(proj =>
      proj.id === id
        ? { ...proj, name: p.name, url: p.url, createdAt: p.created_at, updatedAt: p.updated_at }
        : proj
    ));
  };

  return (
    <ProjectContext.Provider value={{ projects, loading, addProject, updateProject, refreshProjects }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects debe ser usado dentro de un ProjectProvider');
  }
  return context;
};
