import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Project, createProject } from '../../services/supabaseApi';

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { createProject } = await import('../../services/supabaseApi');
      const project = await createProject(name.trim());
      onCreated(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-night rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-brand-mist hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-brand-mist mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="projectName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Portfolio"
              className="w-full p-2 bg-brand-dark border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent text-white"
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-2 bg-brand-accent text-white rounded hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
