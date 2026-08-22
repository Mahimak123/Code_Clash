import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import OverviewPage from './pages/OverviewPage';
import LiveFeedPage from './pages/LiveFeedPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TopicsPage from './pages/TopicsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Theme handling with localStorage persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('vibewatch_theme') || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vibewatch_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNavigateToIncident = (id) => {
    setSelectedIncidentId(id);
    setActiveTab('incident-detail');
  };

  const handleBackToIncidents = () => {
    setActiveTab('incidents');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'incident-detail') setSelectedIncidentId(null);
        }}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Workspace Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <Topbar
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <OverviewPage
              selectedBrand={selectedBrand}
              onNavigateToIncident={handleNavigateToIncident}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'live-feed' && (
            <LiveFeedPage
              selectedBrand={selectedBrand}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'incidents' && (
            <IncidentsPage
              selectedBrand={selectedBrand}
              onSelectIncident={handleNavigateToIncident}
            />
          )}

          {activeTab === 'incident-detail' && (
            <IncidentDetailPage
              incidentId={selectedIncidentId}
              onBack={handleBackToIncidents}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage
              selectedBrand={selectedBrand}
            />
          )}

          {activeTab === 'topics' && (
            <TopicsPage
              selectedBrand={selectedBrand}
              onSelectIncident={handleNavigateToIncident}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>
    </div>
  );
}
