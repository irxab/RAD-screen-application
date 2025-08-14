import { User2 } from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  currentUser: any;
  isMobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export default function Sidebar({ 
  currentView, 
  onViewChange, 
  currentUser, 
  isMobileMenuOpen,
  onCloseMobileMenu 
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-chart-pie' },
    { id: 'enhanced', label: 'Enhanced Dashboard', icon: 'fas fa-chart-line' },
    { id: 'reports', label: 'Ad Reports', icon: 'fas fa-file-chart-column' },
    { id: 'ads', label: 'Ad Management', icon: 'fas fa-rectangle-ad' },
    { id: 'scheduler', label: 'Scheduler', icon: 'fas fa-calendar-alt' },
    { id: 'player', label: 'Player Preview', icon: 'fas fa-play' },
    { id: 'map', label: 'Map & Routes', icon: 'fas fa-map-marked-alt' },
    { id: 'logs', label: 'Logs', icon: 'fas fa-list-ul' },
    { id: 'settings', label: 'Settings', icon: 'fas fa-cog' },
  ];

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onCloseMobileMenu}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-rad-grey-200
          transform transition-transform duration-300 ease-in-out lg:transform-none
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-rad-grey-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-rad-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-rad-grey-800">RAD</span>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            className="ml-auto p-2 text-rad-grey-600 hover:text-rad-grey-800 lg:hidden"
            onClick={onCloseMobileMenu}
            data-testid="close-mobile-menu"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              data-testid={`nav-${item.id}`}
              className={`
                w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-smooth
                ${currentView === item.id 
                  ? 'bg-rad-blue text-white' 
                  : 'text-rad-grey-600 hover:bg-rad-grey-50'
                }
              `}
            >
              <i className={`${item.icon} mr-3`}></i>
              {item.label}
            </button>
          ))}
        </nav>
        
        {/* User Profile */}
        <div className="px-4 py-4 border-t border-rad-grey-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-rad-orange rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {currentUser?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-rad-grey-800 truncate">
                {currentUser?.name || 'Admin RAD'}
              </p>
              <p className="text-xs text-rad-grey-600 truncate">
                {currentUser?.email || 'admin@rad.test'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
