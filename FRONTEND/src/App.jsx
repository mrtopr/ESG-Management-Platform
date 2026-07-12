import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Environmental } from './pages/Environmental';
import { Social } from './pages/Social';
import { Governance } from './pages/Governance';
import { Gamification } from './pages/Gamification';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { Leaf } from 'lucide-react';

export const App = () => {
  const { user, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center shadow-xl shadow-primary/20 animate-bounce">
          <Leaf className="w-6 h-6 text-primary-foreground" />
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold font-display animate-pulse">
          Loading EcoSphere...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background selection:bg-primary/20">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/environmental" element={<Environmental />} />
              <Route path="/social" element={<Social />} />
              <Route path="/governance" element={<Governance />} />
              <Route path="/gamification" element={<Gamification />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};
export default App;
