import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Edit2, Trash2, AlertCircle } from 'lucide-react';
import type { Project } from '../services/supabaseApi';
import { getProjects, deleteProject } from '../services/supabaseApi';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import { RenameProjectModal } from '../components/modals/RenameProjectModal';

export const ProjectsList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [renamingProject, setRenamingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      // Show error to user
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/editor/${projectId}`);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Delete this project permanently? This action cannot be undone!')) return;
    
    try {
      await deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      setDeletingProjectId(null);
    } catch (err) {
      alert('Failed to delete project: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Projects</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-brand-night rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Projects</h2>
        </div>
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 flex items-start gap-4">
          <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-red-400 mb-2">Failed to load projects</h3>
            <p className="text-sm text-brand-mist mb-4">{error}</p>
            <button
              onClick={loadProjects}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Projects</h2>
          <p className="text-brand-mist mt-1 text-sm sm:text-base">Manage your portfolio projects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold whitespace-nowrap"
        >
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-brand-night rounded-lg p-8 sm:p-12 text-center">
          <FolderOpen size={48} className="mx-auto text-brand-mist mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-brand-mist mb-6 text-sm sm:text-base">Create your first portfolio project to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-accent text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            <Plus size={20} />
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-brand-night rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-brand-accent transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">{project.name}</h3>
                  <p className="text-xs sm:text-sm text-brand-mist truncate">ID: {project.id.slice(0, 8)}...</p>
                </div>
                {project.status && (
                  <div className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ml-2 ${
                    project.status === 'draft'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {project.status}
                  </div>
                )}
              </div>

              <div className="text-xs sm:text-sm text-brand-mist mb-4 space-y-1">
                <div className="truncate">
                  <span className="hidden sm:inline">Updated: </span>{formatDate(project.updated_at)}
                </div>
                <div className="truncate">
                  <span className="hidden sm:inline">Created: </span>{formatDate(project.created_at)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenProject(project.id)}
                  className="flex-grow flex items-center justify-center gap-2 px-3 py-2 bg-brand-accent text-white rounded hover:bg-purple-700 transition-colors font-semibold text-sm"
                >
                  <FolderOpen size={16} />
                  <span>Open</span>
                </button>
                <button
                  onClick={() => setRenamingProject(project)}
                  className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  title="Rename"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeletingProjectId(project.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(project) => {
            setProjects([project, ...projects]);
            setShowCreateModal(false);
            handleOpenProject(project.id);
          }}
        />
      )}

      {renamingProject && (
        <RenameProjectModal
          project={renamingProject}
          onClose={() => setRenamingProject(null)}
          onRenamed={(updatedProject) => {
            setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
            setRenamingProject(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingProjectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-night rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Delete Project?</h3>
            <p className="text-brand-mist mb-6">
              This will permanently delete the project and all its pages and blocks. This action cannot be undone!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deletingProjectId)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-semibold"
              >
                Delete Permanently
              </button>
              <button
                onClick={() => setDeletingProjectId(null)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
