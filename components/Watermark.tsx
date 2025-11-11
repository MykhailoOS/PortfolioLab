import React from 'react';

export const Watermark: React.FC = () => {
  return (
    <div 
      className="fixed bottom-4 left-4 z-[9999] pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-md">
        <p className="text-white/70 text-xs font-medium whitespace-nowrap">
          Made with <span className="text-brand-accent font-semibold">PortfolioLab</span> Free
        </p>
      </div>
    </div>
  );
};
