import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { FolderKanban, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };
  
  return (
    <div className="bg-brand-dark text-brand-light font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-brand-night border-b border-gray-700 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          {/* Top row: Title and actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Portfolio Maker Pro</h1>
              <span className="hidden sm:inline text-brand-mist text-sm whitespace-nowrap">Dashboard</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Link 
                to="/"
                className="flex items-center gap-1 sm:gap-2 text-brand-mist hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 text-brand-mist hover:text-white transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
          
          {/* Bottom row: User email (mobile only) */}
          {user && (
            <div className="mt-2 sm:hidden text-brand-mist text-sm truncate">
              {user.email}
            </div>
          )}
          
          {/* Desktop: User email inline */}
          {user && (
            <span className="hidden sm:inline text-brand-mist text-sm ml-2">
              • {user.email}
            </span>
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-brand-night border-b border-gray-700 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex gap-4 sm:gap-6">
          <Link
            to="/dashboard/projects"
            className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 transition-colors ${
              location.pathname.includes('/projects')
                ? 'border-brand-accent text-white'
                : 'border-transparent text-brand-mist hover:text-white'
            }`}
          >
            <FolderKanban size={18} />
            <span className="text-sm sm:text-base">Projects</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-brand-dark">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
