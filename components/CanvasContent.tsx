import React, { Suspense, lazy } from 'react';
import type { Section, Locale, SocialPlatform, SocialLink } from '../types';
import { SectionType } from '../types';
import { Github, Linkedin, Twitter, Mail, Send, Instagram } from 'lucide-react';

// Lazy load the 3D scene
const ThreeScene = lazy(() => import('./canvas/ThreeScene'));

// A hook to check for prefers-reduced-motion
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);
  return prefersReducedMotion;
};


// Individual Section Components
const HeroSection: React.FC<{ data: any; locale: Locale; effects: any }> = ({ data, locale, effects }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const show3D = effects.has3d && !prefersReducedMotion;

  const buttonColor = data.ctaColor || '#8b5cf6';
  const buttonLink = data.ctaLink || '#';

  return (
    <div className="min-h-screen flex items-center justify-center text-center relative overflow-hidden bg-brand-dark text-white p-4">
      {show3D ? (
        <Suspense fallback={<div className="absolute inset-0 bg-brand-night" />}>
          <ThreeScene />
        </Suspense>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-purple-900 opacity-50" />
      )}
      <div className={`relative z-10 p-6 rounded-xl ${effects.blur ? 'bg-black/30 backdrop-blur-lg' : ''}`}>
        <h1 className="text-4xl md:text-7xl font-extrabold mb-4 leading-tight">{data.headline?.[locale]}</h1>
        <p className="text-lg md:text-2xl text-brand-mist max-w-3xl mx-auto mb-8">{data.subheadline?.[locale]}</p>
        <a 
          href={buttonLink}
          style={{ backgroundColor: buttonColor }}
          className="inline-block text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all hover:scale-105"
        >
          {data.ctaButton?.[locale]}
        </a>
      </div>
    </div>
  );
};

const AboutSection: React.FC<{ data: any; locale: Locale }> = ({ data, locale }) => {
    // Support both new MediaRef structure and legacy imageUrl
    const imageUrl = data.avatar?.url || data.imageUrl;
    const imageAlt = data.avatar?.alt || 'About me';
    
    return (
        <div className="py-24 px-6 flex flex-col md:flex-row items-center gap-12">
            {imageUrl && (
                <div className="md:w-1/3">
                    <img 
                        src={imageUrl} 
                        alt={imageAlt} 
                        className="rounded-2xl shadow-2xl object-cover w-full h-auto aspect-[3/4]"
                    />
                </div>
            )}
            <div className={imageUrl ? "md:w-2/3" : "w-full"}>
                <h2 className="text-4xl font-bold mb-4">{data.title?.[locale]}</h2>
                <p className="text-lg text-brand-mist leading-relaxed">{data.paragraph?.[locale]}</p>
                {data.tags && data.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {data.tags.map((tag: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-brand-accent/20 text-brand-accent rounded-full text-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const SkillsSection: React.FC<{ data: any; locale: Locale }> = ({ data, locale }) => (
    <div className="py-24 px-6 bg-brand-night">
        <h2 className="text-4xl font-bold text-center mb-12">{data.title?.[locale]}</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8">
            {data.skills?.map((skill: any) => (
                <div key={skill.id} className="text-center">
                    <p className="font-semibold text-lg mb-2">{skill.name}</p>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${skill.level}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ProjectsSection: React.FC<{ data: any; locale: Locale }> = ({ data, locale }) => {
    return (
        <div className="py-24 px-6">
            <h2 className="text-4xl font-bold text-center mb-12">{data.title?.[locale]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.projects?.map((project: any) => {
                    // Support both new MediaRef structure and legacy imageUrl
                    const imageUrl = project.image?.url || project.imageUrl;
                    const imageAlt = project.image?.alt || project.title?.[locale] || 'Project image';
                    
                    return (
                        <div key={project.id} className="bg-brand-night rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-brand-accent/20">
                            {imageUrl && (
                                <img 
                                    src={imageUrl} 
                                    alt={imageAlt} 
                                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" 
                                />
                            )}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold mb-2">{project.title?.[locale]}</h3>
                                <p className="text-brand-mist mb-4">{project.description?.[locale]}</p>
                                {project.tags && project.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.tags.map((tag: string, index: number) => (
                                            <span key={index} className="px-2 py-1 bg-brand-accent/20 text-brand-accent rounded text-xs">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {project.link && project.link !== '#' && (
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-brand-accent font-semibold hover:underline">
                                        View Project &rarr;
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const socialIconMap: Record<SocialPlatform, React.ReactNode> = {
    github: <Github size={28}/>,
    linkedin: <Linkedin size={28}/>,
    twitter: <Twitter size={28}/>,
    telegram: <Send size={28}/>,
    instagram: <Instagram size={28}/>,
};

const ContactSection: React.FC<{ data: any; locale: Locale, effects: any }> = ({ data, locale, effects }) => (
    <div className={`py-24 px-6 text-center relative ${effects.blur ? 'bg-brand-night/50 backdrop-blur-md' : 'bg-brand-night'}`}>
        <h2 className="text-4xl font-bold mb-4">{data.title?.[locale]}</h2>
        <a href={`mailto:${data.email}`} className="text-2xl text-brand-accent hover:underline inline-flex items-center gap-2">
           <Mail size={24} /> {data.email}
        </a>
        <div className="flex justify-center gap-6 mt-8">
            {data.socialLinks?.map((link: SocialLink) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand-mist hover:text-white transition-colors">
                    {socialIconMap[link.platform] || null}
                </a>
            ))}
        </div>
    </div>
);


const sectionMap: Record<SectionType, React.FC<any>> = {
  [SectionType.Hero]: HeroSection,
  [SectionType.About]: AboutSection,
  [SectionType.Skills]: SkillsSection,
  [SectionType.Projects]: ProjectsSection,
  [SectionType.Contact]: ContactSection,
};

// Main Canvas Content Renderer
export const CanvasContent: React.FC<{
  sections: Section[];
  activeLocale: Locale;
  isExport: boolean;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  handleDragStart?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragEnter?: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  handleDragEnd?: () => void;
}> = ({ sections, activeLocale, isExport, selectedSectionId, onSelectSection, handleDragStart, handleDragEnter, handleDragEnd }) => {
  return (
    <>
      {sections.map((section, index) => {
        const Component = sectionMap[section.type];
        if (!Component) return null;
        
        const wrapperProps = isExport ? {} : {
          onClick: () => onSelectSection?.(section.id),
          draggable: true,
          onDragStart: (e: React.DragEvent<HTMLDivElement>) => handleDragStart?.(e, index),
          onDragEnter: (e: React.DragEvent<HTMLDivElement>) => handleDragEnter?.(e, index),
          onDragEnd: handleDragEnd,
          onDragOver: (e: React.DragEvent<HTMLDivElement>) => e.preventDefault(),
        };

        return (
          <div
            key={section.id}
            id={section.id}
            className={`section-wrapper relative ${!isExport ? 'cursor-pointer hover:outline-dashed hover:outline-2 hover:outline-brand-accent' : ''} ${selectedSectionId === section.id ? 'outline outline-2 outline-brand-accent' : ''}`}
            {...wrapperProps}
          >
            <Component data={section.data} locale={activeLocale} effects={section.effects} />
          </div>
        );
      })}
    </>
  );
};