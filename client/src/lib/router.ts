export class Router {
  private routes: Map<string, string> = new Map();
  private currentRoute: string = 'dashboard';
  private listeners: ((route: string) => void)[] = [];

  constructor() {
    this.initializeRoutes();
    this.handleHashChange();
    window.addEventListener('hashchange', () => this.handleHashChange());
  }

  private initializeRoutes() {
    this.routes.set('', 'dashboard');
    this.routes.set('dashboard', 'dashboard');
    this.routes.set('ads', 'ads');
    this.routes.set('scheduler', 'scheduler');
    this.routes.set('player', 'player');
    this.routes.set('map', 'map');
    this.routes.set('logs', 'logs');
    this.routes.set('settings', 'settings');
    this.routes.set('debug', 'debug');
  }

  private handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    const route = this.routes.get(hash) || 'dashboard';
    
    if (route !== this.currentRoute) {
      this.currentRoute = route;
      this.notifyListeners();
    }
  }

  public navigate(route: string) {
    if (this.routes.has(route)) {
      window.location.hash = route;
    }
  }

  public getCurrentRoute(): string {
    return this.currentRoute;
  }

  public onRouteChange(callback: (route: string) => void) {
    this.listeners.push(callback);
  }

  public removeRouteListener(callback: (route: string) => void) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentRoute));
  }

  // Static method for one-off route changes
  static navigateTo(route: string) {
    window.location.hash = route;
  }

  // Get route parameters (for future extensibility)
  public getRouteParams(): URLSearchParams {
    const url = new URL(window.location.href);
    return url.searchParams;
  }

  // Check if current route matches
  public isCurrentRoute(route: string): boolean {
    return this.currentRoute === route;
  }
}

export const router = new Router();
