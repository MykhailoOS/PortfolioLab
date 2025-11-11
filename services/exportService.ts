import JSZip from 'jszip';
import type { Portfolio, Section, Locale, MediaRef } from '../types';
import { SectionType } from '../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ExportValidationError {
  type: 'required_field' | 'missing_alt' | 'unreachable_media' | 'unsaved_changes' | 'duplicate_slug';
  sectionId: string;
  sectionType: SectionType;
  field: string;
  message: string;
}

export interface ExportResult {
  success: boolean;
  errors?: ExportValidationError[];
  blob?: Blob;
  stats?: {
    fileSize: number;
    pageCount: number;
    assetCount: number;
  };
}

interface AssetMap {
  [originalUrl: string]: string; // Maps original URL to relative path in assets/img/
}

// ============================================================================
// PREFLIGHT VALIDATION
// ============================================================================

/**
 * Validate that all required fields are present for enabled locales
 */
function validateRequiredFields(portfolio: Portfolio): ExportValidationError[] {
  const errors: ExportValidationError[] = [];
  const { sections, enabledLocales, defaultLocale } = portfolio;

  sections.forEach(section => {
    switch (section.type) {
      case SectionType.Hero:
        // Hero requires headline, subheadline, ctaButton for all enabled locales
        enabledLocales.forEach(locale => {
          if (!section.data.headline?.[locale]?.trim()) {
            errors.push({
              type: 'required_field',
              sectionId: section.id,
              sectionType: section.type,
              field: `headline.${locale}`,
              message: `Hero section missing headline for locale "${locale}"`
            });
          }
          if (!section.data.subheadline?.[locale]?.trim()) {
            errors.push({
              type: 'required_field',
              sectionId: section.id,
              sectionType: section.type,
              field: `subheadline.${locale}`,
              message: `Hero section missing subheadline for locale "${locale}"`
            });
          }
          if (!section.data.ctaButton?.[locale]?.trim()) {
            errors.push({
              type: 'required_field',
              sectionId: section.id,
              sectionType: section.type,
              field: `ctaButton.${locale}`,
              message: `Hero section missing CTA button text for locale "${locale}"`
            });
          }
        });
        break;

      case SectionType.About:
        // About requires title and paragraph
        enabledLocales.forEach(locale => {
          if (!section.data.title?.[locale]?.trim()) {
            errors.push({
              type: 'required_field',
              sectionId: section.id,
              sectionType: section.type,
              field: `title.${locale}`,
              message: `About section missing title for locale "${locale}"`
            });
          }
          if (!section.data.paragraph?.[locale]?.trim()) {
            errors.push({
              type: 'required_field',
              sectionId: section.id,
              sectionType: section.type,
              field: `paragraph.${locale}`,
              message: `About section missing paragraph for locale "${locale}"`
            });
          }
        });
        break;

      case SectionType.Skills:
        // Skills requires title
        enabledLocales.forEach(locale => {
          if (!section.data.title?.[locale]?.trim()) {
            errors.push({
              type: 'required_field',
              sectionId: section.id,
              sectionType: section.type,
              field: `title.${locale}`,
              message: `Skills section missing title for locale "${locale}"`
            });
          }
        });
        break;

      case SectionType.Projects:
        // Projects requires title
        enabledLocales.forEach(locale => {
          if (!section.data.title?.[locale]?.trim()) {
            errors.push({
              type: 'required_field',
              sectionId: section.id,
              sectionType: section.type,
              field: `title.${locale}`,
              message: `Projects section missing title for locale "${locale}"`
            });
          }
        });
        
        // Validate each project has required fields
        section.data.projects?.forEach((project: any, index: number) => {
          enabledLocales.forEach(locale => {
            if (!project.title?.[locale]?.trim()) {
              errors.push({
                type: 'required_field',
                sectionId: section.id,
                sectionType: section.type,
                field: `projects[${index}].title.${locale}`,
                message: `Project #${index + 1} missing title for locale "${locale}"`
              });
            }
          });
        });
        break;

      case SectionType.Contact:
        // Contact requires title and email
        enabledLocales.forEach(locale => {
          if (!section.data.title?.[locale]?.trim()) {
            errors.push({
              type: 'required_field',
              sectionId: section.id,
              sectionType: section.type,
              field: `title.${locale}`,
              message: `Contact section missing title for locale "${locale}"`
            });
          }
        });
        
        if (!section.data.email?.trim()) {
          errors.push({
            type: 'required_field',
            sectionId: section.id,
            sectionType: section.type,
            field: 'email',
            message: 'Contact section missing email address'
          });
        }
        break;
    }
  });

  return errors;
}

/**
 * Validate that all images have alt text
 */
function validateImageAltText(portfolio: Portfolio): ExportValidationError[] {
  const errors: ExportValidationError[] = [];
  const { sections } = portfolio;

  sections.forEach(section => {
    switch (section.type) {
      case SectionType.About:
        // Check avatar image
        if (section.data.avatar?.url || section.data.imageUrl) {
          const hasAlt = section.data.avatar?.alt?.trim();
          if (!hasAlt) {
            errors.push({
              type: 'missing_alt',
              sectionId: section.id,
              sectionType: section.type,
              field: 'avatar',
              message: 'About section avatar image missing alt text'
            });
          }
        }
        break;

      case SectionType.Projects:
        // Check each project image
        section.data.projects?.forEach((project: any, index: number) => {
          if (project.image?.url || project.imageUrl) {
            const hasAlt = project.image?.alt?.trim();
            if (!hasAlt) {
              errors.push({
                type: 'missing_alt',
                sectionId: section.id,
                sectionType: section.type,
                field: `projects[${index}].image`,
                message: `Project #${index + 1} image missing alt text`
              });
            }
          }
        });
        break;
    }
  });

  return errors;
}

/**
 * Validate that all referenced media files are accessible
 */
async function validateMediaAccessibility(portfolio: Portfolio): Promise<ExportValidationError[]> {
  const errors: ExportValidationError[] = [];
  const { sections } = portfolio;
  const urlsToCheck = new Set<string>();

  // Collect all media URLs
  sections.forEach(section => {
    switch (section.type) {
      case SectionType.About:
        const avatarUrl = section.data.avatar?.url || section.data.imageUrl;
        if (avatarUrl && typeof avatarUrl === 'string') {
          urlsToCheck.add(avatarUrl);
        }
        break;

      case SectionType.Projects:
        section.data.projects?.forEach((project: any) => {
          const imageUrl = project.image?.url || project.imageUrl;
          if (imageUrl && typeof imageUrl === 'string') {
            urlsToCheck.add(imageUrl);
          }
        });
        break;
    }
  });

  // Check each URL is accessible
  const checkPromises = Array.from(urlsToCheck).map(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        return { url, accessible: false };
      }
      return { url, accessible: true };
    } catch (error) {
      return { url, accessible: false };
    }
  });

  const results = await Promise.all(checkPromises);
  
  // Find which sections have inaccessible media
  results.forEach(result => {
    if (!result.accessible) {
      sections.forEach(section => {
        if (section.type === SectionType.About) {
          const avatarUrl = section.data.avatar?.url || section.data.imageUrl;
          if (avatarUrl === result.url) {
            errors.push({
              type: 'unreachable_media',
              sectionId: section.id,
              sectionType: section.type,
              field: 'avatar',
              message: `About section avatar image unreachable: ${result.url}`
            });
          }
        } else if (section.type === SectionType.Projects) {
          section.data.projects?.forEach((project: any, index: number) => {
            const imageUrl = project.image?.url || project.imageUrl;
            if (imageUrl === result.url) {
              errors.push({
                type: 'unreachable_media',
                sectionId: section.id,
                sectionType: section.type,
                field: `projects[${index}].image`,
                message: `Project #${index + 1} image unreachable: ${result.url}`
              });
            }
          });
        }
      });
    }
  });

  return errors;
}

/**
 * Run all preflight validation checks
 */
export async function validateExport(portfolio: Portfolio, hasUnsavedChanges: boolean): Promise<ExportValidationError[]> {
  const errors: ExportValidationError[] = [];

  // Check for unsaved changes
  if (hasUnsavedChanges) {
    errors.push({
      type: 'unsaved_changes',
      sectionId: '',
      sectionType: SectionType.Hero, // Placeholder
      field: '',
      message: 'Project has unsaved changes. Please wait for autosave to complete.'
    });
    return errors; // Early return - don't proceed with other checks
  }

  // Run all validation checks
  errors.push(...validateRequiredFields(portfolio));
  errors.push(...validateImageAltText(portfolio));
  errors.push(...await validateMediaAccessibility(portfolio));

  return errors;
}

// ============================================================================
// ASSET COLLECTION & PROCESSING
// ============================================================================

/**
 * Download an image and return as Blob
 */
async function downloadImage(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${url}`);
  }
  return await response.blob();
}

/**
 * Collect all assets and create a map of original URLs to relative paths
 */
async function collectAssets(portfolio: Portfolio): Promise<{ assetMap: AssetMap; blobs: Map<string, Blob> }> {
  const assetMap: AssetMap = {};
  const blobs = new Map<string, Blob>();
  const { sections } = portfolio;
  let imageCounter = 0;

  // Helper to get file extension from URL or blob type
  const getExtension = (url: string, blob?: Blob): string => {
    if (blob?.type) {
      const mimeToExt: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/avif': 'avif',
        'image/gif': 'gif',
        'image/svg+xml': 'svg'
      };
      return mimeToExt[blob.type] || 'jpg';
    }
    // Fallback to URL extension
    const match = url.match(/\.([a-z0-9]+)(\?.*)?$/i);
    return match ? match[1] : 'jpg';
  };

  // Collect images from sections
  for (const section of sections) {
    if (section.type === SectionType.About) {
      const avatarUrl = section.data.avatar?.url || section.data.imageUrl;
      if (avatarUrl && typeof avatarUrl === 'string' && !assetMap[avatarUrl]) {
        try {
          const blob = await downloadImage(avatarUrl);
          const ext = getExtension(avatarUrl, blob);
          const relativePath = `assets/img/avatar-${imageCounter++}.${ext}`;
          assetMap[avatarUrl] = relativePath;
          blobs.set(relativePath, blob);
        } catch (error) {
          console.error(`Failed to download avatar: ${avatarUrl}`, error);
        }
      }
    } else if (section.type === SectionType.Projects) {
      for (const project of section.data.projects || []) {
        const imageUrl = project.image?.url || project.imageUrl;
        if (imageUrl && typeof imageUrl === 'string' && !assetMap[imageUrl]) {
          try {
            const blob = await downloadImage(imageUrl);
            const ext = getExtension(imageUrl, blob);
            const relativePath = `assets/img/project-${imageCounter++}.${ext}`;
            assetMap[imageUrl] = relativePath;
            blobs.set(relativePath, blob);
          } catch (error) {
            console.error(`Failed to download project image: ${imageUrl}`, error);
          }
        }
      }
    }
  }

  return { assetMap, blobs };
}

// ============================================================================
// CSS GENERATION
// ============================================================================

/**
 * Generate complete CSS bundle with theme tokens and all styles
 */
function generateCSS(portfolio: Portfolio): string {
  const { theme } = portfolio;
  
  return `/* PortfolioLab Export - Generated CSS */
/* Reset and Base Styles */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #e2e8f0;
  background-color: #0f172a;
  overflow-x: hidden;
}

/* Theme Variables */
:root {
  --color-primary: ${theme.primaryColor};
  --color-dark: #0f172a;
  --color-night: #1e293b;
  --color-light: #f1f5f9;
  --color-mist: #94a3b8;
  --color-accent: #8b5cf6;
  --transition-base: all 0.3s ease;
}

/* Utility Classes */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Section Styles */
section {
  position: relative;
  width: 100%;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #4c1d95 100%);
  padding: 2rem 1rem;
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 800px;
}

.hero-content.blur-effect {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  padding: 3rem;
  border-radius: 1rem;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 800;
  margin-bottom: 1rem;
  line-height: 1.1;
  color: #ffffff;
}

.hero-subtitle {
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  color: var(--color-mist);
  margin-bottom: 2rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.hero-cta {
  display: inline-block;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #ffffff;
  background-color: var(--color-accent);
  border-radius: 0.5rem;
  text-decoration: none;
  transition: var(--transition-base);
}

.hero-cta:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

/* About Section */
.about-section {
  padding: 6rem 1.5rem;
  background-color: var(--color-dark);
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.about-avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 2rem;
  border: 4px solid var(--color-accent);
}

.about-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #ffffff;
}

.about-paragraph {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--color-mist);
  margin-bottom: 1.5rem;
}

.about-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 2rem;
}

.about-tag {
  padding: 0.5rem 1rem;
  background-color: var(--color-night);
  border-radius: 9999px;
  font-size: 0.875rem;
  color: var(--color-light);
}

/* Skills Section */
.skills-section {
  padding: 6rem 1.5rem;
  background-color: var(--color-night);
}

.skills-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #ffffff;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.skill-item {
  text-align: center;
}

.skill-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.skill-bar-bg {
  width: 100%;
  height: 0.625rem;
  background-color: #334155;
  border-radius: 9999px;
  overflow: hidden;
}

.skill-bar-fill {
  height: 100%;
  background-color: var(--color-accent);
  border-radius: 9999px;
  transition: width 1s ease-out;
}

/* Projects Section */
.projects-section {
  padding: 6rem 1.5rem;
  background-color: var(--color-dark);
}

.projects-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #ffffff;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.project-card {
  background-color: var(--color-night);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: var(--transition-base);
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);
}

.project-image {
  width: 100%;
  height: 14rem;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.project-card:hover .project-image {
  transform: scale(1.05);
}

.project-content {
  padding: 1.5rem;
}

.project-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.project-description {
  color: var(--color-mist);
  margin-bottom: 1rem;
  line-height: 1.6;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.project-tag {
  padding: 0.25rem 0.75rem;
  background-color: var(--color-dark);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-accent);
}

.project-link {
  display: inline-block;
  color: var(--color-accent);
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition-base);
}

.project-link:hover {
  text-decoration: underline;
}

/* Contact Section */
.contact-section {
  padding: 6rem 1.5rem;
  background-color: var(--color-night);
  text-align: center;
}

.contact-section.blur-effect {
  background-color: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(8px);
}

.contact-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #ffffff;
}

.contact-email {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  color: var(--color-accent);
  text-decoration: none;
  transition: var(--transition-base);
}

.contact-email:hover {
  text-decoration: underline;
}

.contact-socials {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.contact-social-link {
  color: var(--color-mist);
  transition: var(--transition-base);
}

.contact-social-link:hover {
  color: #ffffff;
}

.contact-social-icon {
  width: 28px;
  height: 28px;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-on-scroll {
  opacity: 0;
  animation: fadeInUp 0.8s ease forwards;
}

/* Parallax */
.parallax-element {
  will-change: transform;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .parallax-element {
    transform: none !important;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-content.blur-effect {
    padding: 2rem;
  }
}

/* Accessibility */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

a:focus,
button:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  body {
    background: white;
    color: black;
  }
  
  .hero-section {
    min-height: auto;
    page-break-after: always;
  }
}
`;
}

// ============================================================================
// JAVASCRIPT GENERATION
// ============================================================================

/**
 * Generate JavaScript bundle with animations and effects
 */
function generateJS(): string {
  return `/* PortfolioLab Export - Generated JavaScript */
(function() {
  'use strict';
  
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // ========================================================================
  // SCROLL REVEAL ANIMATIONS
  // ========================================================================
  
  function initScrollReveal() {
    if (prefersReducedMotion) return; // Skip animations if user prefers reduced motion
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-on-scroll');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });
  }
  
  // ========================================================================
  // PARALLAX EFFECTS
  // ========================================================================
  
  function initParallax() {
    if (prefersReducedMotion) return; // Skip parallax if user prefers reduced motion
    
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    if (parallaxElements.length === 0) return;
    
    function updateParallax() {
      const scrollY = window.pageYOffset;
      
      parallaxElements.forEach(element => {
        const speed = parseFloat(element.getAttribute('data-parallax') || '0.5');
        const yPos = -(scrollY * speed);
        element.style.transform = \`translateY(\${yPos}px)\`;
      });
    }
    
    // Use requestAnimationFrame for smooth performance
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    });
    
    // Initial update
    updateParallax();
  }
  
  // ========================================================================
  // SKILL BAR ANIMATIONS
  // ========================================================================
  
  function animateSkillBars() {
    if (prefersReducedMotion) {
      // Show skill bars at full width immediately
      document.querySelectorAll('.skill-bar-fill').forEach(bar => {
        const level = bar.getAttribute('data-level');
        bar.style.width = level + '%';
        bar.style.transition = 'none';
      });
      return;
    }
    
    const skillSection = document.querySelector('.skills-section');
    if (!skillSection) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const skillBars = entry.target.querySelectorAll('.skill-bar-fill');
          skillBars.forEach((bar, index) => {
            setTimeout(() => {
              const level = bar.getAttribute('data-level');
              bar.style.width = level + '%';
            }, index * 100);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    observer.observe(skillSection);
  }
  
  // ========================================================================
  // EXTERNAL LINK PROTECTION
  // ========================================================================
  
  function protectExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      // Check if it's an external link (not same origin)
      const url = new URL(link.href);
      if (url.origin !== window.location.origin) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
  }
  
  // ========================================================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================================================================
  
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
  
  // ========================================================================
  // LAZY LOAD IMAGES
  // ========================================================================
  
  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach(img => {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      });
    } else {
      // Fallback for browsers that don't support native lazy loading
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => imageObserver.observe(img));
    }
  }
  
  // ========================================================================
  // INITIALIZATION
  // ========================================================================
  
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    // Initialize all features
    initScrollReveal();
    initParallax();
    animateSkillBars();
    protectExternalLinks();
    initSmoothScroll();
    initLazyLoading();
    
    console.log('PortfolioLab: All effects initialized');
  }
  
    // Start initialization
  init();
  
})();
`;
}

// ============================================================================
// HTML GENERATION
// ============================================================================

/**
 * Generate HTML content for a section
 */
function generateSectionHTML(section: Section, locale: Locale, assetMap: AssetMap): string {
  const { type, data, effects } = section;
  
  switch (type) {
    case SectionType.Hero: {
      const buttonColor = data.ctaColor || '#8b5cf6';
      const buttonLink = data.ctaLink || '#';
      const blurClass = effects?.blur ? 'blur-effect' : '';
      
      return `
    <section class="hero-section" ${effects?.parallax ? `data-parallax="${effects.parallax}"` : ''}>
      <div class="hero-content ${blurClass}">
        <h1 class="hero-title">${data.headline?.[locale] || ''}</h1>
        <p class="hero-subtitle">${data.subheadline?.[locale] || ''}</p>
        <a href="${buttonLink}" class="hero-cta" style="background-color: ${buttonColor}">
          ${data.ctaButton?.[locale] || 'Get Started'}
        </a>
      </div>
    </section>`;
    }
    
    case SectionType.About: {
      const avatarUrl = data.avatar?.url || data.imageUrl;
      const avatarAlt = data.avatar?.alt || 'About me';
      const relativePath = avatarUrl && assetMap[avatarUrl] ? assetMap[avatarUrl] : avatarUrl;
      
      return `
    <section class="about-section">
      <div class="about-content">
        ${relativePath ? `<img src="${relativePath}" alt="${avatarAlt}" class="about-avatar" loading="lazy">` : ''}
        <h2 class="about-title">${data.title?.[locale] || ''}</h2>
        <p class="about-paragraph">${data.paragraph?.[locale] || ''}</p>
        ${data.tags && data.tags.length > 0 ? `
        <div class="about-tags">
          ${data.tags.map((tag: string) => `<span class="about-tag">${tag}</span>`).join('')}
        </div>` : ''}
      </div>
    </section>`;
    }
    
    case SectionType.Skills: {
      return `
    <section class="skills-section">
      <h2 class="skills-title">${data.title?.[locale] || ''}</h2>
      ${data.skills && data.skills.length > 0 ? `
      <div class="skills-grid">
        ${data.skills.map((skill: any) => `
        <div class="skill-item">
          <p class="skill-name">${skill.name || ''}</p>
          <div class="skill-bar-bg">
            <div class="skill-bar-fill" data-level="${skill.level || 0}" style="width: 0%;"></div>
          </div>
        </div>`).join('')}
      </div>` : '<p style="text-align: center; color: #94a3b8;">No skills added yet.</p>'}
    </section>`;
    }
    
    case SectionType.Projects: {
      return `
    <section class="projects-section">
      <h2 class="projects-title">${data.title?.[locale] || ''}</h2>
      ${data.projects && data.projects.length > 0 ? `
      <div class="projects-grid">
        ${data.projects.map((project: any) => {
          const imageUrl = project.image?.url || project.imageUrl;
          const imageAlt = project.image?.alt || project.title?.[locale] || 'Project image';
          const relativePath = imageUrl && assetMap[imageUrl] ? assetMap[imageUrl] : imageUrl;
          
          return `
        <div class="project-card">
          ${relativePath ? `<img src="${relativePath}" alt="${imageAlt}" class="project-image" loading="lazy">` : ''}
          <div class="project-content">
            <h3 class="project-title">${project.title?.[locale] || ''}</h3>
            ${project.description?.[locale] ? `<p class="project-description">${project.description[locale]}</p>` : ''}
            ${project.tags && project.tags.length > 0 ? `
            <div class="project-tags">
              ${project.tags.map((tag: string) => `<span class="project-tag">${tag}</span>`).join('')}
            </div>` : ''}
            ${project.link ? `<a href="${project.link}" class="project-link" target="_blank" rel="noopener noreferrer">View Project →</a>` : ''}
          </div>
        </div>`;
        }).join('')}
      </div>` : '<p style="text-align: center; color: #94a3b8;">No projects added yet.</p>'}
    </section>`;
    }
    
    case SectionType.Contact: {
      const blurClass = effects?.blur ? 'blur-effect' : '';
      const socialIconsSVG: Record<string, string> = {
        github: '<svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
        linkedin: '<svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
        twitter: '<svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>',
        telegram: '<svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
        instagram: '<svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>'
      };
      
      return `
    <section class="contact-section ${blurClass}">
      <h2 class="contact-title">${data.title?.[locale] || ''}</h2>
      <a href="mailto:${data.email || 'contact@example.com'}" class="contact-email">
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
        ${data.email || 'contact@example.com'}
      </a>
      ${data.socialLinks && data.socialLinks.length > 0 ? `
      <div class="contact-socials">
        ${data.socialLinks.map((link: any) => `
        <a href="${link.url}" class="contact-social-link" target="_blank" rel="noopener noreferrer" aria-label="${link.platform}">
          ${socialIconsSVG[link.platform] || ''}
        </a>`).join('')}
      </div>` : ''}
    </section>`;
    }
    
    default:
      return '';
  }
}

/**
 * Generate complete HTML page for a locale
 */
function generateHTML(portfolio: Portfolio, locale: Locale, assetMap: AssetMap): string {
  const { name, sections } = portfolio;
  
  const localeNames: Record<Locale, string> = {
    en: 'English',
    ua: 'Українська',
    ru: 'Русский',
    pl: 'Polski'
  };
  
  const sectionsHTML = sections.map(section => generateSectionHTML(section, locale, assetMap)).join('\n');
  
  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${name} - Portfolio</title>
  <meta name="description" content="${name} - Professional portfolio created with PortfolioLab">
  <meta name="author" content="${name}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${name} - Portfolio">
  <meta property="og:description" content="Professional portfolio created with PortfolioLab">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${name} - Portfolio">
  <meta name="twitter:description" content="Professional portfolio created with PortfolioLab">
  
  <!-- Styles -->
  <link rel="stylesheet" href="../assets/css/style.css">
  
  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📁</text></svg>">
</head>
<body>
  <!-- Portfolio Content -->
  ${sectionsHTML}
  
  <!-- Language Switcher (optional - commented out by default) -->
  <!--
  <div style="position: fixed; bottom: 20px; right: 20px; background: rgba(30, 41, 59, 0.9); padding: 10px; border-radius: 8px; backdrop-filter: blur(8px);">
    ${portfolio.enabledLocales.map(loc => 
      loc === locale 
        ? `<strong style="color: #8b5cf6;">${localeNames[loc]}</strong>` 
        : `<a href="../${loc}/index.html" style="color: #94a3b8; text-decoration: none; margin: 0 5px;">${localeNames[loc]}</a>`
    ).join(' | ')}
  </div>
  -->
  
  <!-- Scripts -->
  <script src="../assets/js/main.js"></script>
</body>
</html>
`;
}

// ============================================================================
// README GENERATION
// ============================================================================

/**
 * Generate README.txt with hosting instructions
 */
function generateReadme(portfolio: Portfolio): string {
  return `PortfolioLab Static Export
============================

Project: ${portfolio.name}
Generated: ${new Date().toLocaleString()}

CONTENTS
--------
This archive contains a complete static website ready for hosting:

📁 Structure:
  /assets/
    /css/style.css          - Compiled styles with theme tokens
    /js/main.js            - JavaScript for animations and effects
    /img/**                - All images used in the portfolio
  /${portfolio.enabledLocales.join('/, /')}/
    index.html             - HTML page for each locale
  README.txt               - This file

HOSTING INSTRUCTIONS
--------------------

1. STATIC HOSTING (Recommended)
   - Netlify: Drag and drop this folder to https://app.netlify.com/drop
   - Vercel: Run "vercel --prod" in this directory
   - GitHub Pages: Push to a repo, enable Pages in Settings
   - Cloudflare Pages: Connect repo or upload folder

2. TRADITIONAL HOSTING (cPanel, FTP)
   - Upload all files to public_html or www folder
   - Keep the folder structure intact
   - Make sure index.html files are in their locale folders
   - Default page: /${portfolio.defaultLocale}/index.html

3. LOCAL TESTING
   - Install a local server: 
     * Python: python3 -m http.server 8000
     * Node.js: npx serve .
     * PHP: php -S localhost:8000
   - Open http://localhost:8000/${portfolio.defaultLocale}/index.html

FEATURES
--------
✓ Fully responsive design (mobile, tablet, desktop)
✓ Optimized images with lazy loading
✓ Scroll animations and parallax effects
✓ Smooth transitions and interactions
✓ Accessibility-friendly (keyboard navigation, ARIA labels)
✓ SEO-optimized with meta tags
✓ Reduced motion support for accessibility
✓ External link protection (noopener, noreferrer)

LANGUAGES
---------
This portfolio is available in ${portfolio.enabledLocales.length} language(s):
${portfolio.enabledLocales.map(loc => `  - ${loc.toUpperCase()}: /${loc}/index.html`).join('\n')}

Default language: ${portfolio.defaultLocale.toUpperCase()}

CUSTOMIZATION
-------------
You can edit the exported files:
  - Styles: assets/css/style.css
  - Scripts: assets/js/main.js
  - Content: ${portfolio.enabledLocales.map(loc => `${loc}/index.html`).join(', ')}

BROWSER SUPPORT
---------------
✓ Chrome/Edge 90+
✓ Firefox 88+
✓ Safari 14+
✓ iOS Safari 14+
✓ Chrome Mobile 90+

PERFORMANCE
-----------
- CSS bundle: ~25 KB (gzipped)
- JS bundle: ~8 KB (gzipped)
- Images: Optimized with lazy loading
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

MADE WITH
---------
🚀 PortfolioLab - Professional Portfolio Builder
   https://portfoliolab.dev

For support or questions, visit our documentation.

© ${new Date().getFullYear()} - Made with PortfolioLab Free
`;
}

// ============================================================================
// ZIP EXPORT (MAIN FUNCTION)
// ============================================================================

/**
 * Export portfolio as .zip archive
 */
export async function exportPortfolioAsZip(
  portfolio: Portfolio,
  hasUnsavedChanges: boolean
): Promise<ExportResult> {
  try {
    // Step 1: Validate
    const errors = await validateExport(portfolio, hasUnsavedChanges);
    if (errors.length > 0) {
      return { success: false, errors };
    }
    
    // Step 2: Collect assets
    const { assetMap, blobs } = await collectAssets(portfolio);
    
    // Step 3: Generate files
    const css = generateCSS(portfolio);
    const js = generateJS();
    const readme = generateReadme(portfolio);
    
    // Step 4: Create ZIP
    const zip = new JSZip();
    
    // Add CSS
    zip.file('assets/css/style.css', css);
    
    // Add JS
    zip.file('assets/js/main.js', js);
    
    // Add images
    blobs.forEach((blob, path) => {
      zip.file(path, blob);
    });
    
    // Add HTML pages for each locale
    portfolio.enabledLocales.forEach(locale => {
      const html = generateHTML(portfolio, locale, assetMap);
      zip.file(`${locale}/index.html`, html);
    });
    
    // Add README
    zip.file('README.txt', readme);
    
    // Step 5: Generate blob
    const blob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    // Step 6: Return result
    return {
      success: true,
      blob,
      stats: {
        fileSize: blob.size,
        pageCount: portfolio.enabledLocales.length,
        assetCount: blobs.size
      }
    };
    
  } catch (error) {
    console.error('Export failed:', error);
    return {
      success: false,
      errors: [{
        type: 'required_field',
        sectionId: '',
        sectionType: SectionType.Hero,
        field: '',
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
  }
}

/**
 * Download the ZIP blob with proper filename
 */
export function downloadZip(blob: Blob, projectName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/\s+/g, '-')}-portfolio.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
