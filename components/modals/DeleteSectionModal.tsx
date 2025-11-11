import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteSectionModalProps {
  sectionType: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteSectionModal: React.FC<DeleteSectionModalProps> = ({
  sectionType,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 animate-fade-in">
      <div className="bg-brand-dark border border-gray-700 rounded-lg shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">Delete Section</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="text-brand-mist hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-brand-mist mb-2">
            Are you sure you want to delete this <span className="font-semibold text-white">{sectionType}</span> section?
          </p>
          <p className="text-sm text-brand-mist">
            This action cannot be undone. All data in this section will be permanently removed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-brand-night text-brand-mist rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
