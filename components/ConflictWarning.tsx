import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ConflictWarningProps {
  onReload: () => void;
  onDismiss: () => void;
}

export const ConflictWarning: React.FC<ConflictWarningProps> = ({ onReload, onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-night rounded-lg p-6 max-w-md w-full border border-yellow-500/50">
        <div className="flex items-start gap-4">
          <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={24} />
          <div className="flex-grow">
            <h3 className="text-xl font-bold mb-2 text-white">Server Version Changed</h3>
            <p className="text-brand-mist mb-4">
              The project has been updated from another device or browser. 
              Your changes have been saved, but you should reload to see the latest version.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors font-semibold"
              >
                <RefreshCw size={16} />
                Reload Project
              </button>
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
