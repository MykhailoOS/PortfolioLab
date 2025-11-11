import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Locale, Portfolio, DeviceView } from '../types';
import { LOCALES } from '../constants';
import { Smartphone, Tablet, Monitor, Download, Globe, Loader2, CheckCircle, AlertCircle, ArrowLeft, Eye, FileArchive } from 'lucide-react';
import type { SaveStatus } from '../hooks/useAutosave';
import { exportPortfolioAsZip, downloadZip } from '../services/exportService';
import type { ExportValidationError } from '../services/exportService';
import { ExportReportModal } from './modals/ExportReportModal';


export const TopBar: React.FC<{
  projectName: string;
  activeLocale: Locale;
  setActiveLocale: (locale: Locale) => void;
  enabledLocales: Locale[];
  portfolio: Portfolio;
  deviceView: DeviceView;
  setDeviceView: (view: DeviceView) => void;
  saveStatus?: SaveStatus;
  saveError?: string | null;
  onBackToDashboard?: () => Promise<void>;
  isPreviewMode?: boolean;
  onTogglePreview?: () => void;
}> = ({ projectName, activeLocale, setActiveLocale, enabledLocales, portfolio, deviceView, setDeviceView, saveStatus = 'idle', saveError = null, onBackToDashboard, isPreviewMode = false, onTogglePreview }) => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [isLocaleMenuOpen, setIsLocaleMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [showExportReport, setShowExportReport] = useState(false);
  const [exportErrors, setExportErrors] = useState<ExportValidationError[] | undefined>();
  const [exportStats, setExportStats] = useState<{ fileSize: number; pageCount: number; assetCount: number } | undefined>();
  const localeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (localeMenuRef.current && !localeMenuRef.current.contains(event.target as Node)) {
        setIsLocaleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleExport = async () => {
    setIsExporting(true);
    setExportErrors(undefined);
    setExportStats(undefined);
    
    try {
      // Check if there are unsaved changes
      const hasUnsavedChanges = saveStatus === 'saving';
      
      // Run export with validation
      const result = await exportPortfolioAsZip(portfolio, hasUnsavedChanges);
      
      if (result.success && result.blob && result.stats) {
        // Success - download the file
        downloadZip(result.blob, portfolio.name);
        
        // Show success report
        setExportStats(result.stats);
        setShowExportReport(true);
      } else if (result.errors) {
        // Validation errors - show report
        setExportErrors(result.errors);
        setShowExportReport(true);
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportErrors([{
        type: 'required_field',
        sectionId: '',
        sectionType: portfolio.sections[0]?.type || 'hero' as any,
        field: '',
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
      setShowExportReport(true);
    } finally {
      setIsExporting(false);
    }
  };
  
  const getButtonClass = (view: DeviceView) => {
    return `p-2 rounded-md transition-colors ${
      deviceView === view ? 'bg-brand-accent text-white' : 'text-brand-mist hover:text-white hover:bg-gray-700'
    }`;
  };

  const handleBackToDashboard = async () => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    try {
      if (onBackToDashboard) {
        await onBackToDashboard();
      }
      navigate('/dashboard/projects');
    } catch (error) {
      console.error('Error navigating back:', error);
      setIsNavigating(false);
    }
  };

  return (
    <header className="h-16 bg-brand-dark border-b border-gray-700 flex items-center justify-between px-4 md:px-6 w-full z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={handleBackToDashboard}
          disabled={isNavigating || saveStatus === 'saving'}
          className="flex items-center gap-2 text-brand-mist hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Back to Dashboard"
        >
          {isNavigating ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <ArrowLeft size={20} />
          )}
          <span className="hidden sm:inline">{isNavigating ? 'Saving...' : 'Dashboard'}</span>
        </button>
        
        <div className="h-6 w-px bg-gray-700 hidden sm:block" />
        
        <h1 className="text-base sm:text-lg font-bold text-white truncate max-w-[150px] sm:max-w-none">{projectName}</h1>
        
        {/* Save Status Indicator */}
        {saveStatus !== 'idle' && (
          <div className="flex items-center gap-2 text-sm">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="animate-spin h-4 w-4 text-brand-accent" />
                <span className="text-brand-mist">Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-500">Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-500" title={saveError || 'Save failed'}>Error</span>
              </>
            )}
          </div>
        )}
        
        {/* Locale Switcher */}
        <div className="relative" ref={localeMenuRef}>
          <button onClick={() => setIsLocaleMenuOpen(!isLocaleMenuOpen)} className="flex items-center gap-2 text-brand-mist hover:text-white transition-colors">
            <Globe size={18} />
            <span className="uppercase">{activeLocale}</span>
          </button>
          <div className={`absolute top-full mt-2 left-0 bg-brand-night rounded-md shadow-lg p-2 transition-opacity duration-200 w-32 z-20 ${isLocaleMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            {enabledLocales.map((locale) => (
              <button 
                key={locale}
                onClick={() => {
                  setActiveLocale(locale as Locale);
                  setIsLocaleMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-md text-sm ${activeLocale === locale ? 'bg-brand-accent text-white' : 'hover:bg-gray-700'}`}
              >
                {LOCALES.find(l => l.code === locale)?.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Device Preview & Preview Toggle */}
      <div className="flex items-center gap-2">
        {/* Device switches - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 p-1 bg-brand-night rounded-lg">
          <button onClick={() => setDeviceView('desktop')} className={getButtonClass('desktop')} aria-label="Desktop view">
              <Monitor size={20} />
          </button>
          <button onClick={() => setDeviceView('tablet')} className={getButtonClass('tablet')} aria-label="Tablet view">
              <Tablet size={20} />
          </button>
          <button onClick={() => setDeviceView('mobile')} className={getButtonClass('mobile')} aria-label="Mobile view">
              <Smartphone size={20} />
          </button>
        </div>
        
        {/* Preview Toggle Button - visible on all devices */}
        {onTogglePreview && (
          <button
            onClick={onTogglePreview}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-colors ${
              isPreviewMode
                ? 'bg-brand-accent text-white'
                : 'bg-brand-night text-brand-mist hover:text-white hover:bg-gray-700'
            }`}
            aria-label={isPreviewMode ? 'Exit Preview Mode' : 'Enter Preview Mode'}
          >
            <Eye size={18} />
            <span className="hidden sm:inline">{isPreviewMode ? 'Edit' : 'Preview'}</span>
          </button>
        )}
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting || saveStatus === 'saving'}
        className="flex items-center gap-2 bg-brand-accent text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        title={saveStatus === 'saving' ? 'Waiting for autosave to complete...' : 'Export as .zip archive'}
      >
        {isExporting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span className="hidden sm:inline">Exporting...</span>
          </>
        ) : (
          <>
            <FileArchive size={18} />
            <span className="hidden sm:inline">Export .zip</span>
          </>
        )}
      </button>
      
      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={showExportReport}
        onClose={() => setShowExportReport(false)}
        errors={exportErrors}
        stats={exportStats}
        onRetry={handleExport}
      />
    </header>
  );
};