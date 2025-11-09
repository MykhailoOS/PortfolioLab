
import React from 'react';
import type { Section, Locale, DeviceView } from '../types';
import { CanvasContent } from './CanvasContent';

const DEVICE_WIDTHS: Record<DeviceView, string> = {
  desktop: 'w-full max-w-5xl',
  tablet: 'w-[768px]',
  mobile: 'w-[375px]',
};


export const Canvas: React.FC<{
  sections: Section[];
  onSelectSection: (sectionId: string) => void;
  selectedSectionId: string | null;
  activeLocale: Locale;
  onReorder: (startIndex: number, endIndex: number) => void;
  deviceView: DeviceView;
}> = ({ sections, onSelectSection, selectedSectionId, activeLocale, onReorder, deviceView }) => {
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      onReorder(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };
  
  const canvasWidthClass = DEVICE_WIDTHS[deviceView];

  return (
    <div className="w-full min-h-full bg-gray-900 relative p-4 md:p-8 flex justify-center">
      <div className={`${canvasWidthClass} mx-auto transition-all duration-300 ease-in-out shadow-2xl bg-brand-dark rounded-md`}>
        <CanvasContent 
            sections={sections} 
            activeLocale={activeLocale} 
            isExport={false}
            onSelectSection={onSelectSection}
            selectedSectionId={selectedSectionId}
            handleDragStart={handleDragStart}
            handleDragEnter={handleDragEnter}
            handleDragEnd={handleDragEnd}
        />
      </div>
    </div>
  );
};