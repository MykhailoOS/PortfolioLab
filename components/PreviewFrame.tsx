import React, { useEffect } from 'react';
import type { DeviceView } from '../types';

const DEVICE_SIZES = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' },
};

interface PreviewFrameProps {
  deviceView: DeviceView;
  isRotated: boolean;
  children: React.ReactNode;
}

export const PreviewFrame: React.FC<PreviewFrameProps> = ({
  deviceView,
  isRotated,
  children,
}) => {
  const size = DEVICE_SIZES[deviceView];
  
  // Apply rotation for tablet/mobile
  const shouldRotate = isRotated && deviceView !== 'desktop';
  const width = shouldRotate ? size.height : size.width;
  const height = shouldRotate ? size.width : size.height;

  // Force external links to open in new tab
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);
        
        // If external link without target, add it
        if (url.origin !== window.location.origin && !link.target) {
          e.preventDefault();
          window.open(link.href, '_blank', 'noopener,noreferrer');
        }
        
        // If internal link (same origin), prevent navigation in preview
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          e.preventDefault();
          // Show tooltip or notification that preview is read-only
          console.log('Internal navigation is disabled in Preview mode');
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center overflow-auto pt-16">
      <div
        className="bg-brand-dark shadow-2xl transition-all duration-300 overflow-auto"
        style={{
          width,
          height: deviceView === 'desktop' ? '100%' : height,
          maxWidth: '100%',
          maxHeight: deviceView === 'desktop' ? '100%' : 'calc(100vh - 5rem)',
        }}
      >
        <div className="preview-content pointer-events-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
