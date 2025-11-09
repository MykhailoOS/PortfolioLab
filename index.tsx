
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import { Dashboard } from './pages/Dashboard';
import { ProjectsList } from './pages/ProjectsList';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/projects" replace />} />
            <Route path="projects" element={<ProjectsList />} />
          </Route>

          {/* Protected Editor Route */}
          <Route
            path="/editor/:projectId"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />

          {/* Default: Redirect to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
