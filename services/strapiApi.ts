import type { StrapiProject, StrapiPage, StrapiBlock, Locale } from '../types';

// Strapi configuration from environment variables
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

// Helper function to make authenticated requests
async function strapiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${STRAPI_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add JWT from localStorage if available (user session)
  const jwt = localStorage.getItem('auth.jwt');
  if (jwt) {
    headers['Authorization'] = `Bearer ${jwt}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Strapi API Error: ${response.status} ${response.statusText}. ${errorText}`);
  }

  return response.json();
}

// ===== PROJECTS API =====

export interface CreateProjectInput {
  name: string;
  slug?: string;
  defaultLocale?: Locale;
  enabledLocales?: Locale[];
  theme?: {
    primaryColor: string;
    mode: 'dark' | 'light';
  };
}

export interface UpdateProjectInput {
  name?: string;
  status?: 'active' | 'archived';
  theme?: {
    primaryColor: string;
    mode: 'dark' | 'light';
  };
  enabledLocales?: Locale[];
}

export async function getProjects(includeArchived = false): Promise<StrapiProject[]> {
  // Simplified query without filters to avoid permission issues in Strapi v5
  const result = await strapiRequest<{ data: StrapiProject[] }>(
    `/api/projects?sort=updatedAt:desc&pagination[pageSize]=50`
  );
  // Filter archived projects client-side if needed
  const projects = result.data;
  return includeArchived ? projects : projects.filter(p => p.status !== 'archived');
}

export async function getProject(id: number | string, populate = true): Promise<StrapiProject> {
  // Accept both numeric id and documentId string for Strapi v5 compatibility
  if (!populate) {
    const result = await strapiRequest<{ data: StrapiProject }>(
      `/api/projects/${id}`
    );
    return result.data;
  }

  // Load project with full tree: project → pages → blocks
  try {
    // First get the project
    const projectResult = await strapiRequest<{ data: StrapiProject }>(
      `/api/projects/${id}`
    );
    const project = projectResult.data;

    // Then get all pages for this project
    const pages = await getPages(project.id);

    // For each page, get its blocks
    const pagesWithBlocks = await Promise.all(
      pages.map(async (page) => {
        const blocks = await getBlocks(page.id);
        return { ...page, blocks };
      })
    );

    return { ...project, pages: pagesWithBlocks };
  } catch (error) {
    console.error('Failed to load project with relations:', error);
    // Fallback: return project without relations
    const result = await strapiRequest<{ data: StrapiProject }>(
      `/api/projects/${id}`
    );
    return result.data;
  }
}

export async function createProject(input: CreateProjectInput): Promise<StrapiProject> {
  const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, '-');
  const result = await strapiRequest<{ data: StrapiProject }>('/api/projects', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        name: input.name,
        slug,
        defaultLocale: input.defaultLocale || 'en',
        enabledLocales: input.enabledLocales || ['en'],
        theme: input.theme || { primaryColor: '#7c3aed', mode: 'dark' },
        // status field will be added by Strapi if it exists, or omitted if not
      },
    }),
  });
  return result.data;
}

export async function updateProject(
  id: number,
  input: UpdateProjectInput
): Promise<StrapiProject> {
  const result = await strapiRequest<{ data: StrapiProject }>(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data: input }),
  });
  return result.data;
}

export async function deleteProject(id: number): Promise<void> {
  await strapiRequest(`/api/projects/${id}`, {
    method: 'DELETE',
  });
}

export async function archiveProject(id: number): Promise<StrapiProject> {
  return updateProject(id, { status: 'archived' });
}

// ===== PAGES API =====

export interface CreatePageInput {
  project: number;
  path: string;
  order: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface UpdatePageInput {
  path?: string;
  order?: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export async function getPages(projectId: number): Promise<StrapiPage[]> {
  const result = await strapiRequest<{ data: StrapiPage[] }>(
    `/api/pages?filters[project][id][$eq]=${projectId}&sort=order:asc&populate=*`
  );
  return result.data;
}

export async function getPage(id: number): Promise<StrapiPage> {
  const result = await strapiRequest<{ data: StrapiPage }>(
    `/api/pages/${id}?populate[blocks]=*`
  );
  return result.data;
}

export async function createPage(input: CreatePageInput): Promise<StrapiPage> {
  const result = await strapiRequest<{ data: StrapiPage }>('/api/pages', {
    method: 'POST',
    body: JSON.stringify({ data: input }),
  });
  return result.data;
}

export async function updatePage(id: number, input: UpdatePageInput): Promise<StrapiPage> {
  const result = await strapiRequest<{ data: StrapiPage }>(`/api/pages/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ data: input }),
  });
  return result.data;
}

export async function deletePage(id: number): Promise<void> {
  await strapiRequest(`/api/pages/${id}`, {
    method: 'DELETE',
  });
}

// ===== BLOCKS API =====

export interface CreateBlockInput {
  page: number;
  type: string;
  order: number;
  data: any;
  style?: any;
  effects?: {
    parallax: number;
    blur: boolean;
    has3d: boolean;
  };
}

export interface UpdateBlockInput {
  type?: string;
  order?: number;
  data?: any;
  style?: any;
  effects?: {
    parallax: number;
    blur: boolean;
    has3d: boolean;
  };
}

export async function getBlocks(pageId: number): Promise<StrapiBlock[]> {
  const result = await strapiRequest<{ data: StrapiBlock[] }>(
    `/api/blocks?filters[page][id][$eq]=${pageId}&sort=order:asc`
  );
  return result.data;
}

export async function getBlock(id: number): Promise<StrapiBlock> {
  const result = await strapiRequest<{ data: StrapiBlock }>(`/api/blocks/${id}`);
  return result.data;
}

export async function createBlock(input: CreateBlockInput): Promise<StrapiBlock> {
  const result = await strapiRequest<{ data: StrapiBlock }>('/api/blocks', {
    method: 'POST',
    body: JSON.stringify({ data: input }),
  });
  return result.data;
}

export async function updateBlock(
  id: number | string, // Accept both for v5 compatibility (documentId is string)
  input: UpdateBlockInput,
  updatedAt?: string
): Promise<StrapiBlock> {
  // Version conflict check if updatedAt is provided
  const body: any = { data: input };
  if (updatedAt) {
    body.meta = { expectedUpdatedAt: updatedAt };
  }

  const result = await strapiRequest<{ data: StrapiBlock }>(`/api/blocks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return result.data;
}

export async function deleteBlock(id: number): Promise<void> {
  await strapiRequest(`/api/blocks/${id}`, {
    method: 'DELETE',
  });
}

// ===== UTILITY FUNCTIONS =====

export function isStrapiConfigured(): boolean {
  const jwt = localStorage.getItem('auth.jwt');
  return Boolean(STRAPI_URL && jwt);
}

export function getStrapiConfig() {
  const jwt = localStorage.getItem('auth.jwt');
  return {
    url: STRAPI_URL,
    hasToken: Boolean(jwt),
    isConfigured: isStrapiConfigured(),
  };
}
