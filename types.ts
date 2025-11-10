export enum SectionType {
  Hero = 'hero',
  About = 'about',
  Skills = 'skills',
  Projects = 'projects',
  Contact = 'contact',
}

export type Locale = 'en' | 'ua' | 'ru' | 'pl';

export type DeviceView = 'desktop' | 'tablet' | 'mobile';

export interface MediaRef {
  id?: string; // Optional: used for backward compatibility with Directus
  url: string; // Public URL to the image
  alt: string; // Alt text for accessibility (required when image exists)
  metadata?: {
    filename?: string;
    size?: number; // in bytes
    mime?: string;
    width?: number;
    height?: number;
  };
}

export interface LocalizedString {
  en: string;
  ua: string;
  ru: string;
  pl: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
}

export interface Project {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  image?: MediaRef; // Updated to use MediaRef instead of imageUrl
  imageUrl?: string; // Deprecated: kept for backward compatibility
  tags?: string[]; // Tags/chips for the project
  link: string;
}

export interface Section<T = any> {
  id: string;
  type: SectionType;
  // Specific data for each section type
  data: T;
  // Visual effects configuration
  effects?: {
    parallax: number; // 0-1, intensity
    blur: boolean;
    has3d: boolean;
  };
  // Strapi metadata for persistence
  _strapiId?: number;
  _strapiDocumentId?: string; // Strapi v5 uses documentId for API calls
  _strapiPageId?: number;
  _strapiUpdatedAt?: string;
}

export type HeroSectionData = {
  headline: LocalizedString;
  subheadline: LocalizedString;
  ctaButton: LocalizedString;
  ctaLink?: string; // Link for CTA button
  ctaColor?: string; // Button color (hex)
};

export type AboutSectionData = {
  title: LocalizedString;
  paragraph: LocalizedString;
  avatar?: MediaRef; // Updated to use MediaRef instead of imageUrl
  imageUrl?: string; // Deprecated: kept for backward compatibility
  tags?: string[]; // Tags/chips for the about section
  layout?: 'default' | 'centered' | 'split'; // Layout options
};

export type SkillsSectionData = {
  title: LocalizedString;
  skills: Skill[];
};

export type ProjectsSectionData = {
  title: LocalizedString;
  projects: Project[];
};

export type SocialPlatform = 'github' | 'linkedin' | 'twitter' | 'telegram' | 'instagram';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
}

export type ContactSectionData = {
  title: LocalizedString;
  email: string;
  socialLinks: SocialLink[];
};

export type Portfolio = {
  id: string;
  name: string;
  slug?: string;
  sections: Section[];
  theme: {
    primaryColor: string;
    mode: 'dark' | 'light';
  };
  enabledLocales: Locale[];
  defaultLocale: Locale;
  // Strapi metadata
  _strapiId?: number;
};

// Strapi Project/Page/Block types for Task 2
export interface StrapiProject {
  id: number;
  documentId: string; // Strapi v5 uses documentId for API calls
  name: string;
  slug: string;
  defaultLocale: Locale;
  enabledLocales: Locale[];
  theme?: {
    primaryColor: string;
    mode: 'dark' | 'light';
  };
  status?: 'active' | 'archived'; // Optional - field may not exist in all Strapi setups
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  pages?: StrapiPage[];
}

export interface StrapiPage {
  id: number;
  project?: number | StrapiProject;
  path: string;
  order: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
  blocks?: StrapiBlock[];
}

export interface StrapiBlock {
  id: number;
  documentId: string; // Strapi v5 uses documentId for API calls
  page?: number | StrapiPage;
  type: SectionType;
  order: number;
  data: any; // Section-specific data (HeroSectionData, AboutSectionData, etc.)
  style?: {
    padding?: string;
    margin?: string;
    alignment?: string;
    backgroundColor?: string;
  };
  effects?: {
    parallax: number;
    blur: boolean;
    has3d: boolean;
  };
  createdAt: string;
  updatedAt: string;
}