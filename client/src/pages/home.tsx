import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import PerformanceChart from "@/components/dashboard/performance-chart";
import RecentActivity from "@/components/dashboard/recent-activity";
import EnhancedDashboard from "@/components/dashboard/enhanced-dashboard";
import ReportsPage from "@/components/reports/reports-page";
import AdList from "@/components/ads/ad-list";
import ScheduleGrid from "@/components/scheduler/schedule-grid";
import PlayerPreview from "@/components/player/player-preview";
import InteractiveMap from "@/components/map/interactive-map";
import LogsTable from "@/components/logs/logs-table";
import SettingsPanel from "@/components/settings/settings-panel";
import LoginForm from "@/components/auth/login-form";
import { store } from "@/lib/store";

export default function Home() {
  const [location] = useLocation();
  const [currentView, setCurrentView] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Initialize store and check for authenticated user
    const user = store.getCurrentUser();
    setCurrentUser(user);
    
    // Set view based on hash or path
    const path = location.replace('/', '').replace('#', '') || 'dashboard';
    setCurrentView(path);
  }, [location]);

  // Show login form if user is not authenticated
  if (!currentUser) {
    return <LoginForm onLogin={setCurrentUser} />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'ads':
        return <AdList />;
      case 'scheduler':
        return <ScheduleGrid />;
      case 'player':
        return <PlayerPreview />;
      case 'map':
        return <InteractiveMap />;
      case 'logs':
        return <LogsTable />;
      case 'settings':
        return <SettingsPanel />;
      case 'debug':
        return <SettingsPanel showDebug={true} />;
      case 'enhanced':
        return <EnhancedDashboard />;
      case 'reports':
        return <ReportsPage />;
      default:
        return (
          <>
            <MetricsCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2">
                <PerformanceChart />
              </div>
              <div>
                <RecentActivity />
              </div>
            </div>
          </>
        );
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      enhanced: 'Enhanced Dashboard',
      reports: 'Ad Reports',
      ads: 'Ad Management',
      scheduler: 'Scheduler',
      player: 'Player Preview',
      map: 'Map & Routes',
      logs: 'Activity Logs',
      settings: 'Settings',
      debug: 'Debug Panel'
    } as { [key: string]: string };
    return titles[currentView] || 'RAD';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        currentUser={currentUser}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          pageTitle={getPageTitle()}
          onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          currentUser={currentUser}
        />
        
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <section className="fade-in">
            {renderCurrentView()}
          </section>
        </main>
      </div>
    </div>
  );
}
