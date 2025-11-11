import React from 'react';
import { X, AlertTriangle, CheckCircle2, FileArchive, Download, AlertCircle } from 'lucide-react';
import type { ExportValidationError } from '../../services/exportService';
import { SectionType } from '../../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors?: ExportValidationError[];
  stats?: {
    fileSize: number;
    pageCount: number;
    assetCount: number;
  };
  onRetry?: () => void;
}

// Helper to get human-readable section type names
const getSectionTypeName = (type: SectionType): string => {
  const names: Record<SectionType, string> = {
    [SectionType.Hero]: 'Hero',
    [SectionType.About]: 'About',
    [SectionType.Skills]: 'Skills',
    [SectionType.Projects]: 'Projects',
    [SectionType.Contact]: 'Contact'
  };
  return names[type] || type;
};

// Helper to get error type icon and color
const getErrorStyle = (type: ExportValidationError['type']) => {
  switch (type) {
    case 'required_field':
      return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/20' };
    case 'missing_alt':
      return { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    case 'unreachable_media':
      return { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/20' };
    case 'unsaved_changes':
      return { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/20' };
    default:
      return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-500/20' };
  }
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  errors,
  stats,
  onRetry
}) => {
  if (!isOpen) return null;

  const hasErrors = errors && errors.length > 0;
  const isSuccess = !hasErrors && stats;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 animate-fade-in">
      <div className="bg-brand-dark border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSuccess ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {isSuccess ? (
                <CheckCircle2 className="text-green-500" size={24} />
              ) : (
                <AlertTriangle className="text-red-500" size={24} />
              )}
            </div>
            <h2 className="text-xl font-bold text-white">
              {isSuccess ? 'Export Completed' : 'Export Failed'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-brand-mist hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          {isSuccess && stats ? (
            // Success Report
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-400 mb-4">
                <FileArchive size={20} />
                <p className="text-lg">
                  Your portfolio has been successfully exported!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-brand-night rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{formatFileSize(stats.fileSize)}</p>
                  <p className="text-sm text-brand-mist">File Size</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.pageCount}</p>
                  <p className="text-sm text-brand-mist">Page{stats.pageCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{stats.assetCount}</p>
                  <p className="text-sm text-brand-mist">Asset{stats.assetCount !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* What's Included */}
              <div className="mt-4 p-4 bg-brand-night rounded-lg">
                <h3 className="font-semibold text-white mb-2">What's included:</h3>
                <ul className="space-y-1 text-sm text-brand-mist">
                  <li>✓ Complete HTML pages for all enabled locales</li>
                  <li>✓ Compiled CSS with theme tokens (~25 KB)</li>
                  <li>✓ JavaScript bundle with animations and effects (~8 KB)</li>
                  <li>✓ All images optimized with lazy loading</li>
                  <li>✓ README.txt with hosting instructions</li>
                </ul>
              </div>

              {/* Hosting Tips */}
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                  <Download size={16} />
                  Quick Deploy Options:
                </h3>
                <ul className="space-y-1 text-sm text-brand-mist">
                  <li>• <strong>Netlify:</strong> Drag & drop the extracted folder to app.netlify.com/drop</li>
                  <li>• <strong>Vercel:</strong> Run "vercel --prod" in the extracted directory</li>
                  <li>• <strong>GitHub Pages:</strong> Push to a repo and enable Pages in Settings</li>
                  <li>• <strong>Local Test:</strong> Run "python3 -m http.server" in the directory</li>
                </ul>
              </div>
            </div>
          ) : (
            // Error Report
            <div className="space-y-4">
              <p className="text-brand-mist">
                {errors && errors.some(e => e.type === 'unsaved_changes')
                  ? 'Please wait for autosave to complete before exporting.'
                  : `Found ${errors?.length || 0} issue${errors?.length !== 1 ? 's' : ''} that must be fixed before export:`}
              </p>

              {/* Error List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {errors?.map((error, index) => {
                  const style = getErrorStyle(error.type);
                  const Icon = style.icon;

                  return (
                    <div
                      key={index}
                      className="p-4 bg-brand-night rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${style.bg} flex-shrink-0`}>
                          <Icon className={style.color} size={20} />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">
                              {getSectionTypeName(error.sectionType)} Section
                            </span>
                            {error.field && (
                              <span className="text-xs text-brand-mist bg-gray-700 px-2 py-0.5 rounded font-mono">
                                {error.field}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-brand-mist break-words">
                            {error.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Error Type Summary */}
              {errors && errors.length > 0 && (
                <div className="mt-4 p-4 bg-brand-night rounded-lg">
                  <h3 className="font-semibold text-white mb-2">Issue Summary:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(
                      errors.reduce((acc, err) => {
                        acc[err.type] = (acc[err.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex items-center gap-2 text-brand-mist">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="capitalize">{type.replace(/_/g, ' ')}: {count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-700 flex-shrink-0">
          {isSuccess ? (
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-brand-accent text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              <CheckCircle2 size={18} />
              Done
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-brand-night text-brand-light rounded-lg hover:bg-gray-700 transition-colors font-semibold"
              >
                Close
              </button>
              {onRetry && !errors?.some(e => e.type === 'unsaved_changes') && (
                <button
                  onClick={onRetry}
                  className="flex-1 px-4 py-3 bg-brand-accent text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Retry Export
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
