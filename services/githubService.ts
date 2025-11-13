// ============================================================================
// SIMPLIFIED GITHUB SERVICE - PAT BASED
// Direct GitHub API calls with Personal Access Token
// No OAuth, no edge functions - just direct API access
// ============================================================================

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  description: string | null;
  html_url: string;
  default_branch: string;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubPushConfig {
  owner: string;
  repo: string;
  branch: string;
  basePath: string; // '/' or '/docs'
  message?: string;
}

export interface GitHubPushResult {
  success: boolean;
  commit_url?: string;
  error?: string;
  filesUpdated?: number;
}

export interface FileForGitHub {
  path: string;
  content: string; // UTF-8 text content
}

export type GitHubPushStatus = 
  | 'idle' 
  | 'validating'
  | 'checking-repo'
  | 'uploading' 
  | 'done' 
  | 'error';

// ============================================================================
// PAT STORAGE (localStorage with basic encryption)
// ============================================================================

const PAT_STORAGE_KEY = 'github_pat';
const SETTINGS_STORAGE_KEY = 'github_last_push';

/**
 * Save GitHub PAT to localStorage (simple XOR encryption)
 */
export function saveGitHubPAT(pat: string): void {
  try {
    // Simple XOR encryption (better than plaintext)
    const encrypted = btoa(pat.split('').map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ 42)
    ).join(''));
    localStorage.setItem(PAT_STORAGE_KEY, encrypted);
  } catch (error) {
    console.error('Failed to save GitHub PAT:', error);
  }
}

/**
 * Get GitHub PAT from localStorage
 */
export function getGitHubPAT(): string | null {
  try {
    const encrypted = localStorage.getItem(PAT_STORAGE_KEY);
    if (!encrypted) return null;
    
    // Decrypt
    const decrypted = atob(encrypted).split('').map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ 42)
    ).join('');
    
    return decrypted;
  } catch (error) {
    console.error('Failed to get GitHub PAT:', error);
    return null;
  }
}

/**
 * Remove GitHub PAT from localStorage
 */
export function removeGitHubPAT(): void {
  localStorage.removeItem(PAT_STORAGE_KEY);
  localStorage.removeItem(SETTINGS_STORAGE_KEY);
}

/**
 * Check if GitHub PAT is saved
 */
export function hasGitHubPAT(): boolean {
  return !!getGitHubPAT();
}

// ============================================================================
// LAST PUSH SETTINGS (localStorage)
// ============================================================================

export interface LastPushSettings {
  projectId: string;
  owner: string;
  repo: string;
  branch: string;
  basePath: string;
  lastPushAt: string;
}

/**
 * Save last push settings for quick re-push
 */
export function saveLastPushSettings(settings: LastPushSettings): void {
  try {
    const allSettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
    allSettings[settings.projectId] = settings;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(allSettings));
  } catch (error) {
    console.error('Failed to save last push settings:', error);
  }
}

/**
 * Get last push settings for project
 */
export function getLastPushSettings(projectId: string): LastPushSettings | null {
  try {
    const allSettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
    return allSettings[projectId] || null;
  } catch (error) {
    console.error('Failed to get last push settings:', error);
    return null;
  }
}

// ============================================================================
// GITHUB API HELPERS
// ============================================================================

/**
 * Make authenticated GitHub API request
 */
async function githubAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const pat = getGitHubPAT();
  if (!pat) throw new Error('GitHub PAT not found. Please connect GitHub first.');
  
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${pat}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }
  
  return await response.json();
}

// ============================================================================
// GITHUB USER INFO
// ============================================================================

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

/**
 * Get authenticated user info (validates PAT)
 */
export async function getGitHubUser(): Promise<GitHubUser> {
  return await githubAPI<GitHubUser>('/user');
}

// ============================================================================
// REPOSITORY OPERATIONS
// ============================================================================

/**
 * List user's repositories
 */
export async function listGitHubRepos(page: number = 1, perPage: number = 30): Promise<GitHubRepo[]> {
  return await githubAPI<GitHubRepo[]>(`/user/repos?page=${page}&per_page=${perPage}&sort=updated`);
}

/**
 * Get specific repository
 */
export async function getGitHubRepo(owner: string, repo: string): Promise<GitHubRepo> {
  return await githubAPI<GitHubRepo>(`/repos/${owner}/${repo}`);
}

/**
 * Create new repository
 */
export async function createGitHubRepo(
  name: string, 
  isPrivate: boolean, 
  description?: string
): Promise<GitHubRepo> {
  return await githubAPI<GitHubRepo>('/user/repos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      private: isPrivate,
      description: description || 'Portfolio created with PortfolioLab',
      auto_init: true // Create with README
    })
  });
}

// ============================================================================
// BRANCH OPERATIONS
// ============================================================================

/**
 * List branches for repository
 */
export async function listGitHubBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
  return await githubAPI<GitHubBranch[]>(`/repos/${owner}/${repo}/branches`);
}

/**
 * Get specific branch
 */
export async function getGitHubBranch(owner: string, repo: string, branch: string): Promise<GitHubBranch> {
  return await githubAPI<GitHubBranch>(`/repos/${owner}/${repo}/branches/${branch}`);
}

/**
 * Create new branch
 */
export async function createGitHubBranch(
  owner: string, 
  repo: string, 
  branchName: string, 
  fromBranch: string = 'main'
): Promise<boolean> {
  try {
    // Get SHA of source branch
    const sourceBranch = await getGitHubBranch(owner, repo, fromBranch);
    
    // Create new reference
    await githubAPI(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: sourceBranch.commit.sha
      })
    });
    
    return true;
  } catch (error) {
    console.error('Failed to create branch:', error);
    return false;
  }
}

// ============================================================================
// PUSH FILES TO GITHUB (Contents API)
// ============================================================================

interface FileContentResponse {
  sha: string;
  content: string;
}

/**
 * Get file from repository (to get SHA for updates)
 */
async function getFileContent(
  owner: string, 
  repo: string, 
  path: string, 
  branch: string
): Promise<FileContentResponse | null> {
  try {
    return await githubAPI<FileContentResponse>(
      `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    );
  } catch (error) {
    return null; // File doesn't exist
  }
}

/**
 * Create or update file in repository
 */
async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  sha?: string
): Promise<void> {
  await githubAPI(`/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: btoa(unescape(encodeURIComponent(content))), // UTF-8 to Base64
      branch,
      ...(sha && { sha }) // Include SHA for updates
    })
  });
}

/**
 * Push multiple files to GitHub repository
 * Uses Contents API (simple but slower for many files)
 */
export async function pushToGitHub(
  config: GitHubPushConfig,
  files: FileForGitHub[],
  onProgress?: (status: GitHubPushStatus, message: string, current?: number, total?: number) => void
): Promise<GitHubPushResult> {
  try {
    onProgress?.('validating', 'Validating GitHub connection...');
    
    // Validate PAT
    const pat = getGitHubPAT();
    if (!pat) {
      throw new Error('GitHub PAT not found. Please connect GitHub first.');
    }
    
    onProgress?.('checking-repo', 'Checking repository...');
    
    // Verify repo and branch exist
    const repo = await getGitHubRepo(config.owner, config.repo);
    const branch = await getGitHubBranch(config.owner, config.repo, config.branch);
    
    if (!branch) {
      throw new Error(`Branch "${config.branch}" not found in repository`);
    }
    
    onProgress?.('uploading', 'Uploading files...', 0, files.length);
    
    // Commit message
    const message = config.message || `chore: portfolio export ${new Date().toISOString()}`;
    
    // Push files one by one (Contents API limitation)
    let filesUpdated = 0;
    for (const file of files) {
      const fullPath = config.basePath === '/' 
        ? file.path 
        : `${config.basePath.replace(/^\//, '')}/${file.path}`.replace(/\/\//g, '/');
      
      // Get existing file SHA if it exists
      const existing = await getFileContent(config.owner, config.repo, fullPath, config.branch);
      
      // Create or update
      await createOrUpdateFile(
        config.owner,
        config.repo,
        fullPath,
        file.content,
        message,
        config.branch,
        existing?.sha
      );
      
      filesUpdated++;
      onProgress?.('uploading', 'Uploading files...', filesUpdated, files.length);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    onProgress?.('done', 'Successfully pushed to GitHub!');
    
    return {
      success: true,
      commit_url: `https://github.com/${config.owner}/${config.repo}/tree/${config.branch}`,
      filesUpdated
    };
    
  } catch (error) {
    console.error('Error pushing to GitHub:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to push to GitHub';
    onProgress?.('error', errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate GitHub PAT format
 */
export function isValidPAT(pat: string): boolean {
  // GitHub PATs start with ghp_, gho_, ghu_, or ghs_
  // Classic PATs are 40 hex characters
  // Fine-grained PATs start with github_pat_
  return (
    /^ghp_[a-zA-Z0-9]{36}$/.test(pat) ||
    /^github_pat_[a-zA-Z0-9_]{82}$/.test(pat) ||
    /^[a-fA-F0-9]{40}$/.test(pat)
  );
}

/**
 * Validate GitHub repository name
 */
export function isValidRepoName(name: string): boolean {
  const regex = /^[a-zA-Z0-9._-]+$/;
  return (
    name.length > 0 &&
    name.length <= 100 &&
    regex.test(name) &&
    !name.startsWith('.') &&
    !name.endsWith('.git')
  );
}

/**
 * Validate GitHub branch name
 */
export function isValidBranchName(name: string): boolean {
  const regex = /^[a-zA-Z0-9/_-]+$/;
  return (
    name.length > 0 &&
    name.length <= 250 &&
    regex.test(name) &&
    !name.startsWith('/') &&
    !name.endsWith('/') &&
    !name.includes('..')
  );
}

/**
 * Get GitHub Pages URL for repository
 */
export function getGitHubPagesURL(owner: string, repo: string): string {
  // Check if it's a user/org page (username.github.io)
  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) {
    return `https://${owner.toLowerCase()}.github.io`;
  }
  
  // Project page
  return `https://${owner.toLowerCase()}.github.io/${repo}`;
}
