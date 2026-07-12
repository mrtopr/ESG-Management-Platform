import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Environmental } from './pages/Environmental';
import { Social } from './pages/Social';
import { Governance } from './pages/Governance';
import { Gamification } from './pages/Gamification';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';

export const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Main Content view */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background selection:bg-primary/20">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            <Routes>
              <Route path="/" element={<Navigate to="/environmental" replace />} />
              <Route path="/environmental" element={<Environmental />} />
              <Route path="/social" element={<Social />} />
              <Route path="/governance" element={<Governance />} />
              <Route path="/gamification" element={<Gamification />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/environmental" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};
export default App;
