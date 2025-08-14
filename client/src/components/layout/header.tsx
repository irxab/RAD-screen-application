import { Bell } from "lucide-react";

interface HeaderProps {
  pageTitle: string;
  onMobileMenuToggle: () => void;
  currentUser: any;
}

export default function Header({ pageTitle, onMobileMenuToggle, currentUser }: HeaderProps) {
  return (
    <header className="bg-white border-b border-rad-grey-200 px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 text-rad-grey-600 hover:text-rad-grey-800 transition-smooth"
            onClick={onMobileMenuToggle}
            data-testid="mobile-menu-toggle"
          >
            <i className="fas fa-bars"></i>
          </button>
          <h1 className="text-xl font-semibold text-rad-grey-800">
            {pageTitle}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button 
            className="p-2 text-rad-grey-600 hover:text-rad-grey-800 transition-smooth relative"
            data-testid="notifications-btn"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rad-orange rounded-full"></span>
          </button>
          
          {/* User menu (mobile) */}
          <div className="lg:hidden">
            <button className="flex items-center space-x-2 p-2 text-rad-grey-600 hover:text-rad-grey-800 transition-smooth">
              <div className="w-6 h-6 bg-rad-orange rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {currentUser?.name?.charAt(0) || 'A'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
