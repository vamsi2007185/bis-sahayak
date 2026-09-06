import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { UserModeProvider } from './context/UserModeContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import { api } from './services/api';

// Pages
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import VerifyProduct from './pages/VerifyProduct';
import CADScanner from './pages/CADScanner';
import Labs from './pages/Labs';
import Updates from './pages/Updates';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [amendments, setAmendments] = useState([]);
  const [backendOnline, setBackendOnline] = useState(true);

  useEffect(() => {
    // Initial data hydration from backend
    const hydrate = async () => {
      try {
        const [rep, amd] = await Promise.allSettled([
          api.getReports(),
          api.getAmendments()
        ]);
        if (rep.status === 'fulfilled') setReports(rep.value);
        if (amd.status === 'fulfilled') setAmendments(amd.value);
      } catch (err) {
        console.warn('Backend hydration notice:', err);
      }
    };
    hydrate();
  }, []);

  return (
    <LanguageProvider>
      <UserModeProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
          {/* Top Bar */}
          <Navbar 
            onNavigate={setActiveTab} 
            notifications={amendments} 
          />

          <div className="flex-1 flex overflow-hidden">
            {/* Desktop Left Sidebar */}
            <Sidebar 
              activeTab={activeTab} 
              onNavigate={setActiveTab} 
            />

            {/* Main Application View Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
              {activeTab === 'dashboard' && (
                <Dashboard 
                  onNavigate={setActiveTab} 
                  reports={reports} 
                  amendments={amendments} 
                />
              )}
              {activeTab === 'chat' && <Chat />}
              {activeTab === 'verify' && <VerifyProduct />}
              {activeTab === 'cad' && <CADScanner />}
              {activeTab === 'labs' && <Labs />}
              {activeTab === 'updates' && <Updates />}
              {activeTab === 'reports' && <Reports />}
              {activeTab === 'settings' && <Settings />}
            </main>
          </div>

          {/* Mobile Bottom Navigation Bar */}
          <BottomNav 
            activeTab={activeTab} 
            onNavigate={setActiveTab} 
          />
        </div>
      </UserModeProvider>
    </LanguageProvider>
  );
}
