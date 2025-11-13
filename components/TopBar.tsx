import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Locale, Portfolio, DeviceView } from '../types';
import { LOCALES } from '../constants';
import { Smartphone, Tablet, Monitor, Download, Globe, Loader2, CheckCircle, AlertCircle, ArrowLeft, Eye, FileArchive } from 'lucide-react';
import type { SaveStatus } from '../hooks/useAutosave';
import { exportPortfolioAsZip, downloadZip } from '../services/exportService';
import type { ExportValidationError } from '../services/exportService';
import { ExportReportModal } from './modals/ExportReportModal';
import { GitHubPushModal } from './modals/GitHubPushModal';
import { hasGitHubPAT, getGitHubUser } from '../services/githubService';


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
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);

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

  // Check GitHub connection on mount
  useEffect(() => {
    const checkGitHubConnection = async () => {
      const connected = hasGitHubPAT();
      setIsGitHubConnected(connected);
      
      if (connected) {
        try {
          const user = await getGitHubUser();
          setGithubUsername(user.login);
        } catch (error) {
          console.error('Failed to get GitHub user:', error);
          setIsGitHubConnected(false);
        }
      }
    };
    
    checkGitHubConnection();
  }, [showGitHubModal]); // Re-check when modal closes


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

      <div className="flex items-center gap-2">
        {/* GitHub Push Button */}
        <button
          onClick={() => setShowGitHubModal(true)}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-2 bg-[#24292e] text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-[#1a1e22] transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed relative"
          title={isGitHubConnected ? `Connected as ${githubUsername}` : 'Push to GitHub'}
        >
          {isGitHubConnected && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-brand-dark"></div>
          )}
          <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="hidden sm:inline">{isGitHubConnected ? 'GitHub' : 'GitHub'}</span>
        </button>
        
        {/* Export .zip Button */}
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
      </div>
      
      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={showExportReport}
        onClose={() => setShowExportReport(false)}
        errors={exportErrors}
        stats={exportStats}
        onRetry={handleExport}
      />
      
      {/* GitHub Push Modal */}
      <GitHubPushModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        portfolio={portfolio}
        hasUnsavedChanges={saveStatus === 'saving'}
      />
    </header>
  );
};