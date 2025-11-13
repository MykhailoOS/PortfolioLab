
import React from 'react';
import type { Section, Locale, LocalizedString, Skill, Project, SocialLink, SocialPlatform } from '../types';
import { SectionType } from '../types';
import { X, Plus, Trash2 } from 'lucide-react';
import { getBlockSchema, ProjectItemSchema, validateField } from '../schemas/blockSchemas';
import { SchemaField } from './fields/SchemaField';

const LocalizedInput: React.FC<{
  label: string;
  value: LocalizedString;
  field: string;
  activeLocale: Locale;
  onChange: (field: string, newValue: LocalizedString) => void;
  isTextarea?: boolean;
}> = ({ label, value, field, activeLocale, onChange, isTextarea = false }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(field, { ...value, [activeLocale]: e.target.value });
  };

  const commonProps = {
    id: field,
    value: value?.[activeLocale] || '',
    onChange: handleChange,
    className: "w-full p-2 bg-brand-night border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
  };

  return (
    <div className="mb-4">
      <label htmlFor={field} className="block text-sm font-medium text-brand-mist mb-1">{label}</label>
      {isTextarea || (value[activeLocale]?.length || 0) > 60 ? <textarea {...commonProps} rows={4} /> : <input type="text" {...commonProps} />}
    </div>
  );
};

const SimpleInput: React.FC<{
  label: string;
  value: string;
  field: string;
  onChange: (field: string, newValue: string) => void;
  placeholder?: string;
}> = ({ label, value, field, onChange, placeholder }) => {
    return (
        <div className="mb-4">
            <label htmlFor={field} className="block text-sm font-medium text-brand-mist mb-1">{label}</label>
            <input 
                type="text" 
                id={field}
                value={value || ''}
                onChange={(e) => onChange(field, e.target.value)}
                placeholder={placeholder}
                className="w-full p-2 bg-brand-night border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
        </div>
    );
};


// FIX: Export the Inspector component to make it available for import in other modules.
export const Inspector: React.FC<{
  section: Section | undefined;
  onUpdate: (sectionId: string, data: any) => void;
  onUpdateMetadata?: (sectionId: string, metadata: Partial<Section>) => void;
  onDelete?: (sectionId: string) => void;
  activeLocale: Locale;
  onClose: () => void;
}> = ({ section, onUpdate, onUpdateMetadata, onDelete, activeLocale, onClose }) => {
  if (!section) {
    return (
      <div className="w-full h-full bg-brand-dark p-4 flex flex-col text-brand-mist">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-xl font-bold">Inspector</h2>
            <button onClick={onClose} className="md:hidden text-brand-mist hover:text-white"><X size={24} /></button>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <p>Select a section to edit its properties.</p>
          </div>
      </div>
    );
  }

  const handleDataChange = (field: string, newValue: any) => {
    onUpdate(section.id, { ...section.data, [field]: newValue });
  };
  
  const handleLocalizedChange = (field: string, newValue: LocalizedString) => {
    onUpdate(section.id, { ...section.data, [field]: newValue });
  };
  
  const renderFields = () => {
    const data = section.data;

    switch (section.type) {
        case SectionType.Hero:
            return (
                <>
                    <LocalizedInput label="Headline" field="headline" value={data.headline} activeLocale={activeLocale} onChange={handleLocalizedChange} />
                    <LocalizedInput label="Subheadline" field="subheadline" value={data.subheadline} activeLocale={activeLocale} onChange={handleLocalizedChange} isTextarea/>
                    <LocalizedInput label="CTA Button" field="ctaButton" value={data.ctaButton} activeLocale={activeLocale} onChange={handleLocalizedChange} />
                    
                    <SimpleInput 
                        label="Button Link" 
                        field="ctaLink" 
                        value={data.ctaLink || ''} 
                        onChange={handleDataChange}
                        placeholder="https://example.com or #contact"
                    />
                    
                    <div className="mb-4">
                        <label htmlFor="ctaColor" className="block text-sm font-medium text-brand-mist mb-1">Button Color</label>
                        <div className="flex gap-2">
                            <input 
                                type="color" 
                                id="ctaColor"
                                value={data.ctaColor || '#8b5cf6'}
                                onChange={(e) => handleDataChange('ctaColor', e.target.value)}
                                className="w-16 h-10 border border-gray-600 rounded cursor-pointer"
                            />
                            <input 
                                type="text" 
                                value={data.ctaColor || '#8b5cf6'}
                                onChange={(e) => handleDataChange('ctaColor', e.target.value)}
                                placeholder="#8b5cf6"
                                className="flex-1 p-2 bg-brand-night border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            />
                        </div>
                    </div>
                </>
            );

        case SectionType.About:
            const aboutSchema = getBlockSchema(SectionType.About);
            if (!aboutSchema) return <p>No schema found for About section.</p>;
            
            return (
                <>
                    {aboutSchema.fields.map((fieldSchema) => (
                        <SchemaField
                            key={fieldSchema.name}
                            schema={fieldSchema}
                            value={data[fieldSchema.name]}
                            onChange={(value) => handleDataChange(fieldSchema.name, value)}
                            activeLocale={activeLocale}
                        />
                    ))}
                </>
            );

        case SectionType.Skills:
            const handleSkillChange = (index: number, field: keyof Skill, value: string | number) => {
                const newSkills = [...data.skills];
                newSkills[index] = { ...newSkills[index], [field]: value };
                handleDataChange('skills', newSkills);
            };
            const addSkill = () => {
                const newSkills = [...data.skills, { id: `s-${Date.now()}`, name: 'New Skill', level: 50 }];
                handleDataChange('skills', newSkills);
            };
            const removeSkill = (index: number) => {
                const newSkills = data.skills.filter((_: any, i: number) => i !== index);
                handleDataChange('skills', newSkills);
            };
            return (
                <>
                    <LocalizedInput label="Title" field="title" value={data.title} activeLocale={activeLocale} onChange={handleLocalizedChange} />
                    <div className="space-y-4 mt-4">
                        {data.skills.map((skill: Skill, index: number) => (
                            <div key={skill.id} className="p-3 bg-brand-night rounded-md border border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold">{skill.name || `Skill ${index + 1}`}</p>
                                    <button onClick={() => removeSkill(index)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                                </div>
                                <SimpleInput label="Skill Name" field="name" value={skill.name} onChange={(_, val) => handleSkillChange(index, 'name', val)} />
                                <label className="block text-sm font-medium text-brand-mist mb-1">Level ({skill.level}%)</label>
                                <input type="range" min="0" max="100" value={skill.level} onChange={(e) => handleSkillChange(index, 'level', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-accent"/>
                            </div>
                        ))}
                    </div>
                    <button onClick={addSkill} className="mt-4 w-full flex items-center justify-center gap-2 p-2 bg-brand-accent/20 text-brand-accent rounded-md hover:bg-brand-accent/30">
                        <Plus size={18}/> Add Skill
                    </button>
                </>
            );

        case SectionType.Projects:
            const projectsSchema = getBlockSchema(SectionType.Projects);
            if (!projectsSchema) return <p>No schema found for Projects section.</p>;
            
            const handleProjectChange = (index: number, field: string, value: any) => {
                const newProjects = [...data.projects];
                newProjects[index] = { ...newProjects[index], [field]: value };
                handleDataChange('projects', newProjects);
            };
            const addProject = () => {
                const newProject = { 
                    id: `p-${Date.now()}`, 
                    title: { en: 'New Project', ua: 'Новий проект', pl: 'Nowy projekt' }, 
                    description: { en: 'A brief description.', ua: 'Короткий опис.', pl: 'Krótki opis.' }, 
                    tags: [],
                    link: '#' 
                };
                handleDataChange('projects', [...data.projects, newProject]);
            };
            const removeProject = (index: number) => {
                handleDataChange('projects', data.projects.filter((_: any, i: number) => i !== index));
            };
            return (
                <>
                    {/* Section-level fields */}
                    {projectsSchema.fields.map((fieldSchema) => (
                        <SchemaField
                            key={fieldSchema.name}
                            schema={fieldSchema}
                            value={data[fieldSchema.name]}
                            onChange={(value) => handleDataChange(fieldSchema.name, value)}
                            activeLocale={activeLocale}
                        />
                    ))}
                    
                    {/* Project items */}
                    <div className="space-y-4 mt-4">
                        {data.projects.map((project: Project, index: number) => (
                           <div key={project.id} className="p-3 bg-brand-night rounded-md border border-gray-700">
                               <div className="flex justify-between items-center mb-2">
                                    <p className="font-semibold">{project.title[activeLocale] || `Project ${index + 1}`}</p>
                                    <button onClick={() => removeProject(index)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                                </div>
                                
                                {/* Render fields from ProjectItemSchema */}
                                {ProjectItemSchema.map((fieldSchema) => (
                                    <SchemaField
                                        key={fieldSchema.name}
                                        schema={fieldSchema}
                                        value={project[fieldSchema.name as keyof Project]}
                                        onChange={(value) => handleProjectChange(index, fieldSchema.name, value)}
                                        activeLocale={activeLocale}
                                    />
                                ))}
                           </div>
                        ))}
                    </div>
                    <button onClick={addProject} className="mt-4 w-full flex items-center justify-center gap-2 p-2 bg-brand-accent/20 text-brand-accent rounded-md hover:bg-brand-accent/30">
                        <Plus size={18}/> Add Project
                    </button>
                </>
            )

        case SectionType.Contact:
            const SOCIAL_PLATFORMS: SocialPlatform[] = ['github', 'linkedin', 'twitter', 'telegram', 'instagram'];
            
            const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
                const newLinks = [...data.socialLinks];
                newLinks[index] = { ...newLinks[index], [field]: value };
                handleDataChange('socialLinks', newLinks);
            };

            const addSocialLink = () => {
                const newLink: SocialLink = { id: `sl-${Date.now()}`, platform: 'github', url: '#' };
                handleDataChange('socialLinks', [...data.socialLinks, newLink]);
            };

            const removeSocialLink = (index: number) => {
                handleDataChange('socialLinks', data.socialLinks.filter((_: any, i: number) => i !== index));
            };

            return (
                <>
                    <LocalizedInput label="Title" field="title" value={data.title} activeLocale={activeLocale} onChange={handleLocalizedChange} />
                    <SimpleInput label="Email" field="email" value={data.email} onChange={handleDataChange} />
                    
                    <h3 className="text-lg font-semibold mt-6 mb-2">Social Links</h3>
                    <div className="space-y-4">
                        {data.socialLinks.map((link: SocialLink, index: number) => (
                            <div key={link.id} className="p-3 bg-brand-night rounded-md border border-gray-700">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-medium text-brand-mist capitalize">{link.platform}</label>
                                    <button onClick={() => removeSocialLink(index)} className="text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-brand-mist mb-1">Platform</label>
                                        <select 
                                            value={link.platform} 
                                            onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                                            className="w-full p-2 bg-brand-night border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent capitalize"
                                        >
                                            {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-xs text-brand-mist mb-1">URL</label>
                                        <input 
                                            type="text" 
                                            value={link.url}
                                            onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                                            className="w-full p-2 bg-brand-night border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                     <button onClick={addSocialLink} className="mt-4 w-full flex items-center justify-center gap-2 p-2 bg-brand-accent/20 text-brand-accent rounded-md hover:bg-brand-accent/30">
                        <Plus size={18}/> Add Social Link
                    </button>
                </>
            )
        default:
            return <p>No editable fields for this section type.</p>;
    }
  }

  return (
    <div className="w-full h-full bg-brand-dark md:border-l md:border-gray-700 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold">{section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section</h2>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button 
              onClick={() => onDelete(section.id)} 
              className="text-red-500 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded"
              title="Delete section"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button onClick={onClose} className="md:hidden text-brand-mist hover:text-white">
            <X size={24} />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {renderFields()}
      </div>
    </div>
  );
};