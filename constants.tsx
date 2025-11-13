
import React from 'react';
import type { Portfolio, Section, HeroSectionData, AboutSectionData, SkillsSectionData, ProjectsSectionData, ContactSectionData, Locale } from './types';
import { SectionType } from './types';

export const LOCALES: { code: Locale; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'ua', name: 'Ukrainian' },
  { code: 'pl', name: 'Polish' },
];

export const INITIAL_PORTFOLIO_DATA: Portfolio = {
  id: 'demo-project-1',
  name: 'My 3D Portfolio',
  defaultLocale: 'en',
  enabledLocales: ['en', 'ua'],
  theme: {
    primaryColor: '#7c3aed',
    mode: 'dark',
  },
  sections: [
    {
      id: `hero-${Date.now()}`,
      type: SectionType.Hero,
      effects: { parallax: 0.5, blur: true, has3d: true },
      data: {
        headline: { en: 'Jane Doe - Creative Developer', ua: 'Джейн Доу - Креативний розробник', pl: 'Jane Doe - Kreatywny programista' },
        subheadline: { en: 'Crafting immersive digital experiences with code and creativity.', ua: 'Створення захоплюючих цифрових вражень за допомогою коду та творчості.', pl: 'Tworzenie wciągających doświadczeń cyfrowych za pomocą kodu i kreatywności.' },
        ctaButton: { en: 'Get In Touch', ua: 'Зв\'язатися', pl: 'Skontaktuj się' },
      } as HeroSectionData,
    },
    {
      id: `about-${Date.now()}`,
      type: SectionType.About,
      effects: { parallax: 0.2, blur: false, has3d: false },
      data: {
        title: { en: 'About Me', ua: 'Про мене', pl: 'O mnie' },
        paragraph: { en: 'I am a passionate developer with a love for building beautiful and functional web applications. I specialize in the React ecosystem and enjoy exploring new technologies to push the boundaries of what\'s possible on the web.', ua: 'Я - захоплений розробник, який любить створювати красиві та функціональні веб-додатки. Я спеціалізуюся на екосистемі React і люблю досліджувати нові технології, щоб розширювати межі можливого в Інтернеті.', pl: 'Jestem pasjonatem programowania, który uwielbia tworzyć piękne i funkcjonalne aplikacje internetowe. Specjalizuję się w ekosystemie React i lubię odkrywać nowe technologie, aby przesuwać granice tego, co jest możliwe w internecie.' },
        imageUrl: 'https://picsum.photos/600/800', // Legacy support - will be replaced with avatar when user uploads
        tags: ['React', 'TypeScript', 'UI/UX'],
        layout: 'default',
      } as AboutSectionData,
    },
    {
        id: `skills-${Date.now()}`,
        type: SectionType.Skills,
        effects: { parallax: 0.1, blur: false, has3d: false },
        data: {
            title: { en: 'My Skills', ua: 'Мої навички', pl: 'Moje umiejętności' },
            skills: [
                { id: 's1', name: 'React', level: 95 },
                { id: 's2', name: 'TypeScript', level: 90 },
                { id: 's3', name: 'Node.js', level: 85 },
                { id: 's4', name: 'Three.js', level: 75 },
                { id: 's5', name: 'Tailwind CSS', level: 98 },
                { id: 's6', name: 'Figma', level: 80 },
            ]
        } as SkillsSectionData
    },
    {
        id: `projects-${Date.now()}`,
        type: SectionType.Projects,
        effects: { parallax: 0.3, blur: false, has3d: false },
        data: {
            title: { en: 'Featured Projects', ua: 'Вибрані проекти', pl: 'Wyróżnione projekty' },
            projects: [
                {id: 'p1', title: { en: 'Project Alpha', ua: 'Проект Альфа', pl: 'Projekt Alfa' }, description: { en: 'A cutting-edge e-commerce platform.', ua: 'Сучасна платформа електронної комерції.', pl: 'Nowoczesna platforma e-commerce.' }, imageUrl: 'https://picsum.photos/800/600?random=1', tags: ['React', 'Node.js', 'MongoDB'], link: '#'},
                {id: 'p2', title: { en: 'Project Beta', ua: 'Проект Бета', pl: 'Projekt Beta' }, description: { en: 'Interactive data visualization tool.', ua: 'Інтерактивний інструмент візуалізації даних.', pl: 'Interaktywne narzędzie do wizualizacji danych.' }, imageUrl: 'https://picsum.photos/800/600?random=2', tags: ['D3.js', 'TypeScript'], link: '#'},
                {id: 'p3', title: { en: 'Project Gamma', ua: 'Проект Гамма', pl: 'Projekt Gamma' }, description: { en: 'Mobile-first social networking app.', ua: 'Мобільний соціальний додаток.', pl: 'Aplikacja społecznościowa na urządzenia mobilne.' }, imageUrl: 'https://picsum.photos/800/600?random=3', tags: ['React Native', 'Firebase'], link: '#'},
            ]
        } as ProjectsSectionData,
    },
    {
        id: `contact-${Date.now()}`,
        type: SectionType.Contact,
        effects: { parallax: 0.1, blur: true, has3d: false },
        data: {
            title: { en: 'Contact Me', ua: 'Зв\'яжіться зі мною', pl: 'Skontaktuj się ze mną' },
            email: 'hello@janedoe.dev',
            socialLinks: [
                { id: 'sl1', platform: 'github', url: '#' },
                { id: 'sl2', platform: 'linkedin', url: '#' },
                { id: 'sl3', platform: 'twitter', url: '#' },
                { id: 'sl4', platform: 'telegram', url: '#' },
                { id: 'sl5', platform: 'instagram', url: '#' },
            ]
        } as ContactSectionData,
    }
  ],
};