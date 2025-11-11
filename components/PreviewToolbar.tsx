import React from 'react';
import { Monitor, Tablet, Smartphone, RotateCw, X } from 'lucide-react';
import type { DeviceView } from '../types';

interface PreviewToolbarProps {
  deviceView: DeviceView;
  onDeviceChange: (device: DeviceView) => void;
  isRotated: boolean;
  onRotateToggle: () => void;
  onExit: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  deviceView,
  onDeviceChange,
  isRotated,
  onRotateToggle,
  onExit,
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-brand-dark border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Preview Label */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">Preview Mode</h2>
          <span className="text-xs text-brand-mist bg-brand-night px-2 py-1 rounded">
            Read-only
          </span>
        </div>

        {/* Center: Device Switches */}
        <div className="flex items-center gap-2 bg-brand-night rounded-lg p-1">
          <button
            onClick={() => onDeviceChange('desktop')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              deviceView === 'desktop'
                ? 'bg-brand-accent text-white'
                : 'text-brand-mist hover:text-white hover:bg-gray-700'
            }`}
            aria-label="Preview: Desktop"
            title="Desktop view"
          >
            <Monitor size={18} />
            <span className="text-sm font-medium hidden sm:inline">Desktop</span>
          </button>
          
          <button
            onClick={() => onDeviceChange('tablet')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              deviceView === 'tablet'
                ? 'bg-brand-accent text-white'
                : 'text-brand-mist hover:text-white hover:bg-gray-700'
            }`}
            aria-label="Preview: Tablet"
            title="Tablet view"
          >
            <Tablet size={18} />
            <span className="text-sm font-medium hidden sm:inline">Tablet</span>
          </button>
          
          <button
            onClick={() => onDeviceChange('mobile')}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              deviceView === 'mobile'
                ? 'bg-brand-accent text-white'
                : 'text-brand-mist hover:text-white hover:bg-gray-700'
            }`}
            aria-label="Preview: Mobile"
            title="Mobile view"
          >
            <Smartphone size={18} />
            <span className="text-sm font-medium hidden sm:inline">Mobile</span>
          </button>

          {/* Rotate Button (only for tablet/mobile) */}
          {deviceView !== 'desktop' && (
            <>
              <div className="w-px h-6 bg-gray-700" />
              <button
                onClick={onRotateToggle}
                className={`p-2 rounded transition-colors ${
                  isRotated
                    ? 'bg-brand-accent text-white'
                    : 'text-brand-mist hover:text-white hover:bg-gray-700'
                }`}
                aria-label={`Rotate to ${isRotated ? 'portrait' : 'landscape'}`}
                title={`Rotate to ${isRotated ? 'portrait' : 'landscape'}`}
              >
                <RotateCw size={18} />
              </button>
            </>
          )}
        </div>

        {/* Right: Exit Button */}
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg transition-colors"
          aria-label="Exit preview mode"
          title="Exit Preview (Esc)"
        >
          <X size={18} />
          <span className="text-sm font-medium hidden sm:inline">Exit Preview</span>
        </button>
      </div>
    </div>
  );
};
