import React, { useState, useEffect } from 'react';
import type { Portfolio } from '../../types';
import {
  hasGitHubPAT,
  getGitHubPAT,
  saveGitHubPAT,
  removeGitHubPAT,
  isValidPAT,
  getGitHubUser,
  listGitHubRepos,
  createGitHubRepo,
  listGitHubBranches,
  createGitHubBranch,
  pushToGitHub,
  saveLastPushSettings,
  getLastPushSettings,
  isValidRepoName,
  isValidBranchName,
  getGitHubPagesURL,
  type GitHubRepo,
  type GitHubBranch,
  type GitHubPushStatus,
  type GitHubPushResult,
  type GitHubUser
} from '../../services/githubService';
import { generateFileMapForGitHub } from '../../services/exportService';

interface GitHubPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: Portfolio;
  hasUnsavedChanges: boolean;
}

type Step = 'pat' | 'repo' | 'branch' | 'options' | 'pushing' | 'result';

export function GitHubPushModal({ isOpen, onClose, portfolio, hasUnsavedChanges }: GitHubPushModalProps) {
  // State
  const [step, setStep] = useState<Step>('pat');
  const [pat, setPat] = useState('');
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [newRepoName, setNewRepoName] = useState('');
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [basePath, setBasePath] = useState<'/' | '/docs'>('/');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pushStatus, setPushStatus] = useState<GitHubPushStatus>('idle');
  const [pushMessage, setPushMessage] = useState('');
  const [pushProgress, setPushProgress] = useState({ current: 0, total: 0 });
  const [pushResult, setPushResult] = useState<GitHubPushResult | null>(null);

  // Initialize
  useEffect(() => {
    if (isOpen) {
      const hasPAT = hasGitHubPAT();
      if (hasPAT) {
        // Load user and skip to repo step
        loadUser();
        setStep('repo');
      } else {
        setStep('pat');
      }
      
      // Load last settings
      const lastSettings = getLastPushSettings(portfolio.id);
      if (lastSettings) {
        setSelectedRepo(lastSettings.repo);
        setSelectedBranch(lastSettings.branch);
        setBasePath(lastSettings.basePath as '/' | '/docs');
      }
    } else {
      // Reset on close
      resetState();
    }
  }, [isOpen, portfolio.id]);

  // Helpers
  const resetState = () => {
    setPat('');
    setUser(null);
    setRepos([]);
    setBranches([]);
    setSelectedRepo('');
    setNewRepoName('');
    setIsPrivateRepo(false);
    setSelectedBranch('');
    setNewBranchName('');
    setBasePath('/');
    setLoading(false);
    setError('');
    setPushStatus('idle');
    setPushMessage('');
    setPushProgress({ current: 0, total: 0 });
    setPushResult(null);
  };

  const loadUser = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = await getGitHubUser();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const loadRepos = async () => {
    setLoading(true);
    setError('');
    try {
      const repoList = await listGitHubRepos();
      setRepos(repoList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async (owner: string, repo: string) => {
    setLoading(true);
    setError('');
    try {
      const branchList = await listGitHubBranches(owner, repo);
      setBranches(branchList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  // Step handlers
  const handleConnectPAT = async () => {
    setError('');
    
    // Validate PAT format
    if (!isValidPAT(pat)) {
      setError('Invalid PAT format. Please check your token.');
      return;
    }
    
    setLoading(true);
    try {
      // Save PAT
      saveGitHubPAT(pat);
      
      // Validate by fetching user
      const userData = await getGitHubUser();
      setUser(userData);
      
      // Move to repo step
      setStep('repo');
      setPat(''); // Clear from memory
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect GitHub');
      removeGitHubPAT(); // Remove invalid PAT
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    removeGitHubPAT();
    setUser(null);
    setStep('pat');
    setRepos([]);
    setBranches([]);
  };

  const handleRepoSelect = async (repoFullName: string) => {
    setSelectedRepo(repoFullName);
    setError('');
    
    // Load branches for selected repo
    const [owner, repo] = repoFullName.split('/');
    await loadBranches(owner, repo);
    
    // Move to branch step
    setStep('branch');
  };

  const handleCreateRepo = async () => {
    setError('');
    
    // Validate repo name
    if (!isValidRepoName(newRepoName)) {
      setError('Invalid repository name');
      return;
    }
    
    setLoading(true);
    try {
      const newRepo = await createGitHubRepo(newRepoName, isPrivateRepo, `Portfolio for ${portfolio.name}`);
      setSelectedRepo(newRepo.full_name);
      
      // Load branches
      await loadBranches(newRepo.owner.login, newRepo.name);
      
      // Move to branch step
      setStep('branch');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  const handleBranchSelect = (branchName: string) => {
    setSelectedBranch(branchName);
    setError('');
    setStep('options');
  };

  const handleCreateBranch = async () => {
    setError('');
    
    // Validate branch name
    if (!isValidBranchName(newBranchName)) {
      setError('Invalid branch name');
      return;
    }
    
    setLoading(true);
    try {
      const [owner, repo] = selectedRepo.split('/');
      const defaultBranch = branches[0]?.name || 'main';
      const success = await createGitHubBranch(owner, repo, newBranchName, defaultBranch);
      
      if (success) {
        setSelectedBranch(newBranchName);
        setStep('options');
      } else {
        setError('Failed to create branch');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    setError('');
    setStep('pushing');
    setPushStatus('validating');
    
    try {
      // Generate file map
      setPushMessage('Generating files...');
      const fileMapResult = await generateFileMapForGitHub(portfolio, hasUnsavedChanges);
      
      if (!fileMapResult.success || !fileMapResult.files) {
        throw new Error(fileMapResult.errors?.[0]?.message || 'Failed to generate files');
      }
      
      // Convert file map to GitHub format
      const filesForGitHub = fileMapResult.files.map(f => ({
        path: f.path,
        content: f.content
      }));
      
      // Push to GitHub
      const [owner, repo] = selectedRepo.split('/');
      const result = await pushToGitHub(
        {
          owner,
          repo,
          branch: selectedBranch,
          basePath,
          message: `chore: portfolio export ${new Date().toISOString()}`
        },
        filesForGitHub,
        (status, message, current, total) => {
          setPushStatus(status);
          setPushMessage(message);
          if (current !== undefined && total !== undefined) {
            setPushProgress({ current, total });
          }
        }
      );
      
      setPushResult(result);
      
      // Save last settings
      if (result.success) {
        saveLastPushSettings({
          projectId: portfolio.id,
          owner,
          repo,
          branch: selectedBranch,
          basePath,
          lastPushAt: new Date().toISOString()
        });
      }
      
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Push failed');
      setPushStatus('error');
      setPushResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      setStep('result');
    }
  };

  const handleClose = () => {
    if (pushStatus === 'uploading') {
      if (confirm('Push is in progress. Are you sure you want to cancel?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Render helpers
  const renderPATStep = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white mb-2">Connect GitHub</h3>
        <p className="text-brand-mist text-sm mb-4">
          Enter your GitHub Personal Access Token (PAT) to push your portfolio to a repository.
        </p>
        <div className="bg-brand-night/50 p-4 rounded-lg mb-4">
          <p className="text-sm text-brand-mist mb-2">
            <strong>How to get a PAT:</strong>
          </p>
          <ol className="text-sm text-brand-mist space-y-1 list-decimal list-inside">
            <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
            <li>Click "Generate new token" (classic)</li>
            <li>Select scopes: <code className="bg-brand-dark px-1 rounded">repo</code></li>
            <li>Copy the token and paste it below</li>
          </ol>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-brand-light mb-2">
          Personal Access Token
        </label>
        <input
          type="password"
          value={pat}
          onChange={(e) => setPat(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className="w-full px-4 py-2 bg-brand-night border border-brand-night rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
      </div>
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          onClick={handleClose}
          className="flex-1 px-4 py-2 bg-brand-night text-white rounded-lg hover:bg-brand-night/80 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleConnectPAT}
          disabled={!pat || loading}
          className="flex-1 px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Connecting...' : 'Connect GitHub'}
        </button>
      </div>
    </div>
  );

  const renderRepoStep = () => {
    if (repos.length === 0 && !loading) {
      loadRepos();
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Select Repository</h3>
          {user && (
            <div className="flex items-center gap-2">
              <img src={user.avatar_url} alt={user.login} className="w-6 h-6 rounded-full" />
              <span className="text-sm text-brand-mist">{user.login}</span>
              <button
                onClick={handleDisconnect}
                className="text-sm text-red-400 hover:text-red-300 transition"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
        
        {/* Create new repo */}
        <div className="bg-brand-night/50 p-4 rounded-lg space-y-3">
          <p className="text-sm font-medium text-white">Create New Repository</p>
          <input
            type="text"
            value={newRepoName}
            onChange={(e) => setNewRepoName(e.target.value)}
            placeholder="my-portfolio"
            className="w-full px-4 py-2 bg-brand-night border border-brand-night rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
          <label className="flex items-center gap-2 text-sm text-brand-mist">
            <input
              type="checkbox"
              checked={isPrivateRepo}
              onChange={(e) => setIsPrivateRepo(e.target.checked)}
              className="w-4 h-4"
            />
            Private repository
          </label>
          <button
            onClick={handleCreateRepo}
            disabled={!newRepoName || loading}
            className="w-full px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create & Continue'}
          </button>
        </div>
        
        {/* Or select existing */}
        <div>
          <p className="text-sm font-medium text-white mb-2">Or Select Existing Repository</p>
          {loading ? (
            <div className="text-center py-4 text-brand-mist">Loading repositories...</div>
          ) : repos.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {repos.map(repo => (
                <button
                  key={repo.id}
                  onClick={() => handleRepoSelect(repo.full_name)}
                  className="w-full p-3 bg-brand-night rounded-lg hover:bg-brand-night/80 transition text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{repo.name}</span>
                    {repo.private && (
                      <span className="text-xs text-brand-mist bg-brand-dark px-2 py-1 rounded">Private</span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-sm text-brand-mist mt-1">{repo.description}</p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-brand-mist">No repositories found</div>
          )}
        </div>
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <button
          onClick={() => setStep('pat')}
          className="w-full px-4 py-2 bg-brand-night text-white rounded-lg hover:bg-brand-night/80 transition"
        >
          ← Back
        </button>
      </div>
    );
  };

  const renderBranchStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Select Branch</h3>
      <p className="text-sm text-brand-mist">Repository: <strong className="text-white">{selectedRepo}</strong></p>
      
      {/* Create new branch */}
      <div className="bg-brand-night/50 p-4 rounded-lg space-y-3">
        <p className="text-sm font-medium text-white">Create New Branch</p>
        <input
          type="text"
          value={newBranchName}
          onChange={(e) => setNewBranchName(e.target.value)}
          placeholder="gh-pages"
          className="w-full px-4 py-2 bg-brand-night border border-brand-night rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
        />
        <button
          onClick={handleCreateBranch}
          disabled={!newBranchName || loading}
          className="w-full px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create & Continue'}
        </button>
      </div>
      
      {/* Or select existing */}
      <div>
        <p className="text-sm font-medium text-white mb-2">Or Select Existing Branch</p>
        {loading ? (
          <div className="text-center py-4 text-brand-mist">Loading branches...</div>
        ) : branches.length > 0 ? (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {branches.map(branch => (
              <button
                key={branch.name}
                onClick={() => handleBranchSelect(branch.name)}
                className="w-full p-3 bg-brand-night rounded-lg hover:bg-brand-night/80 transition text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{branch.name}</span>
                  {branch.protected && (
                    <span className="text-xs text-brand-mist bg-brand-dark px-2 py-1 rounded">Protected</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-brand-mist">No branches found</div>
        )}
      </div>
      
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={() => setStep('repo')}
        className="w-full px-4 py-2 bg-brand-night text-white rounded-lg hover:bg-brand-night/80 transition"
      >
        ← Back
      </button>
    </div>
  );

  const renderOptionsStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Push Options</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">Repository</label>
          <div className="p-3 bg-brand-night rounded-lg text-white">{selectedRepo}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">Branch</label>
          <div className="p-3 bg-brand-night rounded-lg text-white">{selectedBranch}</div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-brand-light mb-2">Base Path</label>
          <div className="flex gap-2">
            <button
              onClick={() => setBasePath('/')}
              className={`flex-1 p-3 rounded-lg transition ${
                basePath === '/' 
                  ? 'bg-brand-accent text-white' 
                  : 'bg-brand-night text-brand-mist hover:bg-brand-night/80'
              }`}
            >
              Root (/)
            </button>
            <button
              onClick={() => setBasePath('/docs')}
              className={`flex-1 p-3 rounded-lg transition ${
                basePath === '/docs' 
                  ? 'bg-brand-accent text-white' 
                  : 'bg-brand-night text-brand-mist hover:bg-brand-night/80'
              }`}
            >
              Docs (/docs)
            </button>
          </div>
          <p className="text-xs text-brand-mist mt-2">
            {basePath === '/' 
              ? 'Files will be pushed to the repository root' 
              : 'Files will be pushed to the /docs folder (GitHub Pages compatible)'}
          </p>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={() => setStep('branch')}
          className="flex-1 px-4 py-2 bg-brand-night text-white rounded-lg hover:bg-brand-night/80 transition"
        >
          ← Back
        </button>
        <button
          onClick={handlePush}
          className="flex-1 px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent/90 transition"
        >
          Push to GitHub 🚀
        </button>
      </div>
    </div>
  );

  const renderPushingStep = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Pushing to GitHub...</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
          <span className="text-white">{pushMessage}</span>
        </div>
        
        {pushStatus === 'uploading' && pushProgress.total > 0 && (
          <div>
            <div className="flex justify-between text-sm text-brand-mist mb-2">
              <span>Uploading files</span>
              <span>{pushProgress.current} / {pushProgress.total}</span>
            </div>
            <div className="w-full h-2 bg-brand-night rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-accent transition-all duration-300"
                style={{ width: `${(pushProgress.current / pushProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderResultStep = () => (
    <div className="space-y-4">
      {pushResult?.success ? (
        <>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Successfully Pushed!</h3>
            <p className="text-brand-mist">Your portfolio has been pushed to GitHub.</p>
          </div>
          
          <div className="bg-brand-night/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-brand-mist">Files updated:</span>
              <span className="text-white font-medium">{pushResult.filesUpdated}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-mist">Repository:</span>
              <span className="text-white font-medium">{selectedRepo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-brand-mist">Branch:</span>
              <span className="text-white font-medium">{selectedBranch}</span>
            </div>
          </div>
          
          {pushResult.commit_url && (
            <a
              href={pushResult.commit_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 bg-brand-accent text-white text-center rounded-lg hover:bg-brand-accent/90 transition"
            >
              View on GitHub →
            </a>
          )}
          
          <div className="bg-brand-night/50 p-4 rounded-lg">
            <p className="text-sm text-brand-mist mb-2">
              <strong className="text-white">Enable GitHub Pages:</strong>
            </p>
            <ol className="text-sm text-brand-mist space-y-1 list-decimal list-inside">
              <li>Go to repository Settings → Pages</li>
              <li>Select source: Deploy from branch</li>
              <li>Select branch: {selectedBranch} {basePath === '/docs' ? '/ docs' : '/ (root)'}</li>
              <li>Click Save and wait for deployment</li>
            </ol>
            <p className="text-xs text-brand-mist mt-3">
              Your site will be available at: <code className="bg-brand-dark px-1 rounded">{getGitHubPagesURL(selectedRepo.split('/')[0], selectedRepo.split('/')[1])}</code>
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Push Failed</h3>
            <p className="text-red-400">{pushResult?.error || error}</p>
          </div>
        </>
      )}
      
      <button
        onClick={handleClose}
        className="w-full px-4 py-2 bg-brand-night text-white rounded-lg hover:bg-brand-night/80 transition"
      >
        Close
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative z-[10001] bg-brand-dark rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-brand-night p-6">
        {/* Close button */}
        {pushStatus !== 'uploading' && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-brand-mist hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* GitHub Logo */}
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <div>
            <h2 className="text-2xl font-bold text-white">Push to GitHub</h2>
            <p className="text-sm text-brand-mist">Deploy your portfolio to GitHub Pages</p>
          </div>
        </div>
        
        {/* Step content */}
        {step === 'pat' && renderPATStep()}
        {step === 'repo' && renderRepoStep()}
        {step === 'branch' && renderBranchStep()}
        {step === 'options' && renderOptionsStep()}
        {step === 'pushing' && renderPushingStep()}
        {step === 'result' && renderResultStep()}
      </div>
    </div>
  );
}
