import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginView from './components/LoginView';

// Nav views
import DashboardView from './components/DashboardView';
import UsersView from './components/UsersView';
import RolesView from './components/RolesView';
import ProjectsView from './components/ProjectsView';
import SessionsView from './components/SessionsView';
import AuditsView from './components/AuditsView';
import EmailTemplatesView from './components/EmailTemplatesView';
import CrudGeneratorView from './components/CrudGeneratorView';
import DynamicCrudView from './components/DynamicCrudView';

interface UserSession {
  id: string;
  username: string;
  email: string;
  name: string;
  roleId: string;
  departmentId?: string;
}

export default function App() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Layout states
  const [collapsed, setCollapsed] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedCrudModelId, setSelectedCrudModelId] = useState<string | null>(null);
  const [generatedModels, setGeneratedModels] = useState<any[]>([]);

  // Check existing session token on mount
  useEffect(() => {
    const checkSession = async () => {
      const storedToken = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          headers: { 'Authorization': storedToken }
        });

        if (res.ok) {
          const data = await res.json();
          setAuthToken(storedToken);
          setUser(data.user);
          // Set in session store
          sessionStorage.setItem('admin_token', storedToken);
        } else {
          // Token stale
          sessionStorage.removeItem('admin_token');
          localStorage.removeItem('admin_token');
        }
      } catch (e) {
        console.warn('Session verification server unreachable.', e);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Fetch registered scaffolded CRUD models on login or creation
  const fetchCrudModels = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/crud-generator/models', {
        headers: { 'Authorization': authToken }
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedModels(data || []);
      }
    } catch (e) {
      console.error('Error fetching dynamic models.', e);
    }
  };

  useEffect(() => {
    fetchCrudModels();
  }, [authToken]);

  const handleLoginSuccess = (token: string, loggedInUser: UserSession) => {
    setAuthToken(token);
    setUser(loggedInUser);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token');
    setAuthToken(null);
    setUser(null);
    setCurrentTab('dashboard');
    setSelectedCrudModelId(null);
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/crud-generator/models/${modelId}`, {
        method: 'DELETE',
        headers: { 'Authorization': authToken }
      });
      if (res.ok) {
        // Refresh models
        fetchCrudModels();
        if (selectedCrudModelId === modelId) {
          setSelectedCrudModelId(null);
          setCurrentTab('dashboard');
        }
      } else {
        alert('Failed purging generated model.');
      }
    } catch (e) {
      console.error('Scaffold purge API error', e);
    }
  };

  if (loading) {
    return (
      <div id="boot_splash" className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans">
        <div className="relative flex flex-col items-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-sm font-bold text-slate-305 text-gray-300 mt-6 tracking-wide select-none uppercase">Bootstrapping enterprise sandbox container...</p>
          <span className="text-[10px] text-gray-500 mt-1 font-mono">Listening on port 3000 • Reverse Proxy active</span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!authToken || !user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Render the corresponding tab
  const renderContentView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView user={user} onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'users':
        return <UsersView />;
      case 'roles':
        return <RolesView />;
      case 'projects':
        return <ProjectsView />;
      case 'sessions':
        return <SessionsView />;
      case 'audits':
        return <AuditsView />;
      case 'emails':
        return <EmailTemplatesView />;
      case 'crud-generator':
        return <CrudGeneratorView onModelCreated={fetchCrudModels} generatedModels={generatedModels} />;
      case 'custom_crud':
        return selectedCrudModelId ? (
          <DynamicCrudView modelId={selectedCrudModelId} generatedModels={generatedModels} />
        ) : (
          <DashboardView user={user} onNavigate={(tab) => setCurrentTab(tab)} />
        );
      default:
        return <DashboardView user={user} onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-[#f4f6f9]">
      
      {/* Sidebar Component */}
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedCrudModelId={selectedCrudModelId}
        setSelectedCrudModelId={setSelectedCrudModelId}
        user={user}
        generatedModels={generatedModels}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onDeleteModel={handleDeleteModel}
      />

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Navigation Top Header */}
        <Header 
          user={user}
          onLogout={handleLogout}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* Dynamic Inner Body Scroll wrapper */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 scrollbar">
          <div className="max-w-7xl mx-auto h-full animate-fadeIn">
            {renderContentView()}
          </div>
        </main>

      </div>
    </div>
  );
}
