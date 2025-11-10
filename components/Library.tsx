

import React from 'react';
import type { Section, LocalizedString } from '../types';
import { SectionType } from '../types';
import { PlusCircle, Star, User, Code, Briefcase, Mail } from 'lucide-react';

const sectionTemplates: { name: string; type: SectionType, icon: React.ReactNode }[] = [
  { name: 'Hero', type: SectionType.Hero, icon: <Star size={20}/> },
  { name: 'About', type: SectionType.About, icon: <User size={20}/> },
  { name: 'Skills', type: SectionType.Skills, icon: <Code size={20}/> },
  { name: 'Projects', type: SectionType.Projects, icon: <Briefcase size={20}/> },
  { name: 'Contact', type: SectionType.Contact, icon: <Mail size={20}/> },
];

// A helper to create a fully populated LocalizedString
const createLocalizedString = (text: string): LocalizedString => ({
  en: text,
  ua: text,
  ru: text,
  pl: text,
});

const createDefaultData = (type: SectionType) => {
    switch(type) {
      case SectionType.Hero: 
        return { 
          headline: createLocalizedString('New Headline'), 
          subheadline: createLocalizedString('New Subheadline'), 
          ctaButton: createLocalizedString('Click Me')
        };
      case SectionType.About: 
        return { 
          title: createLocalizedString('About Section'), 
          paragraph: createLocalizedString('Some text about you.'), 
          imageUrl: 'https://picsum.photos/600/800'
        };
      case SectionType.Skills: 
        return { 
          title: createLocalizedString('Skills'), 
          skills: []
        };
      case SectionType.Projects: 
        return { 
          title: createLocalizedString('Projects'), 
          projects: []
        };
      case SectionType.Contact: 
        return { 
          title: createLocalizedString('Contact'), 
          email: 'your@email.com', 
          socialLinks: []
        };
      default: return {};
    }
  }


export const Library: React.FC<{ onAddSection: (section: Section) => void }> = ({ onAddSection }) => {
  const handleAdd = (type: SectionType) => {
    const newSection: Section = {
      id: `${type}-${Date.now()}`,
      type,
      effects: { parallax: 0, blur: false, has3d: type === SectionType.Hero },
      data: createDefaultData(type),
    };
    onAddSection(newSection);
  };
  
  return (
    <aside className="w-[320px] h-full bg-brand-dark border-r border-gray-700 p-4 flex flex-col overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 flex-shrink-0">Library</h2>
      <div className="space-y-2">
        {sectionTemplates.map((template) => (
          <button
            key={template.type}
            onClick={() => handleAdd(template.type)}
            className="w-full flex items-center gap-3 p-3 text-left bg-brand-night hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="p-2 bg-gray-700 rounded-md text-brand-accent">
                {template.icon}
            </div>
            <div>
                <p className="font-semibold">{template.name}</p>
                <p className="text-sm text-brand-mist">Add a new {template.name} section</p>
            </div>
            <PlusCircle size={20} className="ml-auto text-brand-mist" />
          </button>
        ))}
      </div>
    </aside>
  );
};