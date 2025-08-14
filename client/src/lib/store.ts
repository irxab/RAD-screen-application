import sampleData from '@/data/sample-data.json';

export class Store {
  private data: any = {};
  private storageKey = 'RAD_DB';
  private currentUser: any = null;

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.data = JSON.parse(saved);
      } else {
        this.data = { ...sampleData };
        this.saveData();
      }
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      this.data = { ...sampleData };
    }
  }

  private saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }

  private generateId(prefix: string = 'id') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Simulate async operations
  private async delay(ms: number = 200) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication
  async login(email: string, password: string) {
    await this.delay();
    const user = this.data.users?.find((u: any) => u.email === email);
    if (user) {
      this.currentUser = user;
      return user;
    }
    throw new Error('Invalid credentials');
  }

  setCurrentUser(user: any) {
    this.currentUser = user;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
  }

  // Dashboard metrics
  getDashboardMetrics() {
    const ads = this.data.ads || [];
    const screens = this.data.screens || [];
    const logs = this.data.logs || [];

    return {
      activeAds: ads.filter((ad: any) => ad.status === 'active').length,
      playsToday: logs.filter((log: any) => 
        log.type === 'ad_play' && 
        new Date(log.timestamp).toDateString() === new Date().toDateString()
      ).length || 1247,
      activeScreens: screens.filter((screen: any) => screen.online).length,
      pendingReviews: ads.filter((ad: any) => ad.status === 'scheduled').length
    };
  }

  getRecentActivity() {
    const logs = this.data.logs || [];
    return logs.slice(-4).reverse().map((log: any) => ({
      type: log.type,
      message: this.formatActivityMessage(log),
      timestamp: this.formatTimestamp(log.timestamp)
    }));
  }

  private formatActivityMessage(log: any) {
    switch (log.type) {
      case 'ad_play':
        return `Ad "${log.details.split(' - ')[0]}" played on ${log.screen}`;
      case 'screenshot':
        return `Screenshot captured on ${log.screen}`;
      case 'system':
        return `${log.details} on ${log.screen}`;
      default:
        return log.details;
    }
  }

  private formatTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return date.toLocaleDateString();
  }

  // Ads management
  async getAllAds() {
    await this.delay();
    return this.data.ads || [];
  }

  async createAd(adData: any) {
    await this.delay();
    const ad = {
      ...adData,
      id: this.generateId('ad'),
      playCount: 0,
      status: adData.startDate <= new Date().toISOString().split('T')[0] ? 'active' : 'scheduled'
    };
    
    if (!this.data.ads) this.data.ads = [];
    this.data.ads.push(ad);
    this.saveData();
    
    // Log the creation
    await this.addLog({
      type: 'system',
      screen: 'System',
      details: `New ad "${ad.title}" created`,
      status: 'success'
    });
    
    return ad;
  }

  async updateAd(adId: string, updates: any) {
    await this.delay();
    const index = this.data.ads?.findIndex((ad: any) => ad.id === adId);
    if (index >= 0) {
      this.data.ads[index] = { ...this.data.ads[index], ...updates };
      this.saveData();
      
      await this.addLog({
        type: 'system',
        screen: 'System',
        details: `Ad "${this.data.ads[index].title}" updated`,
        status: 'success'
      });
      
      return this.data.ads[index];
    }
    throw new Error('Ad not found');
  }

  async deleteAd(adId: string) {
    await this.delay();
    const ad = this.data.ads?.find((a: any) => a.id === adId);
    if (ad) {
      this.data.ads = this.data.ads?.filter((a: any) => a.id !== adId);
      // Also remove from schedules
      this.data.schedules = this.data.schedules?.filter((s: any) => s.adId !== adId);
      this.saveData();
      
      await this.addLog({
        type: 'system',
        screen: 'System',
        details: `Ad "${ad.title}" deleted`,
        status: 'success'
      });
    } else {
      throw new Error('Ad not found');
    }
  }

  // Screens management
  async getAllScreens() {
    await this.delay();
    return this.data.screens || [];
  }

  async getScreenStatus(screenId: string) {
    await this.delay();
    const screen = this.data.screens?.find((s: any) => s.id === screenId);
    if (screen) {
      return {
        online: screen.online,
        brightness: screen.brightness,
        temperature: screen.temperature,
        uptime: screen.online ? '23h 45m' : '0h 0m'
      };
    }
    return { online: false, brightness: 0, temperature: 0, uptime: '0h 0m' };
  }

  // Scheduling
  async getSchedule(screenId: string) {
    await this.delay();
    let schedules = this.data.schedules || [];
    
    if (screenId !== 'all') {
      schedules = schedules.filter((s: any) => s.screenId === screenId);
    }
    
    // Populate with ad details
    return schedules.map((schedule: any) => {
      const ad = this.data.ads?.find((a: any) => a.id === schedule.adId);
      return {
        ...schedule,
        ad
      };
    });
  }

  async addToSchedule(screenId: string, scheduleData: any) {
    await this.delay();
    const schedule = {
      id: this.generateId('sch'),
      screenId,
      adId: scheduleData.adId,
      time: scheduleData.time,
      day: scheduleData.day
    };
    
    if (!this.data.schedules) this.data.schedules = [];
    this.data.schedules.push(schedule);
    this.saveData();
    
    return schedule;
  }

  async removeFromSchedule(screenId: string, time: string, day: string) {
    await this.delay();
    this.data.schedules = this.data.schedules?.filter((s: any) => 
      !(s.screenId === screenId && s.time === time && s.day === day)
    );
    this.saveData();
  }

  async saveSchedule(screenId: string, scheduleItems: any[]) {
    await this.delay();
    // This would save the entire schedule for a screen
    await this.addLog({
      type: 'system',
      screen: screenId,
      details: 'Schedule updated',
      status: 'success'
    });
  }

  // Player
  async getCurrentPlaylist(screenId: string) {
    await this.delay();
    const schedules = await this.getSchedule(screenId);
    const currentHour = new Date().getHours().toString().padStart(2, '0') + ':00';
    const currentDay = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
    
    // Get ads scheduled for current time
    const currentAds = schedules
      .filter((s: any) => s.time <= currentHour && s.day === currentDay)
      .map((s: any) => s.ad)
      .filter(Boolean);
    
    return currentAds.length > 0 ? currentAds : [this.data.ads?.[0]].filter(Boolean);
  }

  async captureScreenshot(screenId: string) {
    await this.delay();
    await this.addLog({
      type: 'screenshot',
      screen: screenId,
      details: `Screenshot captured by ${this.currentUser?.name || 'User'}`,
      status: 'success'
    });
  }

  // Map and Routes
  async getFixedPoints() {
    await this.delay();
    return this.data.fixedPoints || [];
  }

  async createFixedPoint(pointData: any) {
    await this.delay();
    const point = {
      ...pointData,
      id: this.generateId('fp')
    };
    
    if (!this.data.fixedPoints) this.data.fixedPoints = [];
    this.data.fixedPoints.push(point);
    this.saveData();
    
    return point;
  }

  async updateFixedPoint(pointId: string, updates: any) {
    await this.delay();
    const index = this.data.fixedPoints?.findIndex((p: any) => p.id === pointId);
    if (index >= 0) {
      this.data.fixedPoints[index] = { ...this.data.fixedPoints[index], ...updates };
      this.saveData();
      return this.data.fixedPoints[index];
    }
    throw new Error('Fixed point not found');
  }

  async deleteFixedPoint(pointId: string) {
    await this.delay();
    this.data.fixedPoints = this.data.fixedPoints?.filter((p: any) => p.id !== pointId);
    this.saveData();
  }

  async getHotspots() {
    await this.delay();
    // Simulate hotspot calculation
    return [
      { name: 'King Fahd Road', triggers: 247 },
      { name: 'Olaya District', triggers: 189 },
      { name: 'Riyadh Park Mall', triggers: 156 },
      { name: 'Kingdom Tower', triggers: 134 }
    ];
  }

  async getRoutes() {
    await this.delay();
    return this.data.routes || [];
  }

  async exportRoutes() {
    await this.delay();
    const routes = this.data.routes || [];
    const csv = this.generateCSV(routes, ['id', 'name', 'coordinates']);
    this.downloadCSV(csv, 'routes.csv');
  }

  async bindScreensToPoint(pointId: string, screenIds: string[]) {
    await this.delay();
    // In a real implementation, this would create bindings
    await this.addLog({
      type: 'system',
      screen: 'System',
      details: `${screenIds.length} screens bound to fixed point`,
      status: 'success'
    });
  }

  // Logs
  async getLogs() {
    await this.delay();
    return (this.data.logs || []).sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async addLog(logData: any) {
    const log = {
      ...logData,
      id: this.generateId('log'),
      timestamp: new Date().toISOString()
    };
    
    if (!this.data.logs) this.data.logs = [];
    this.data.logs.push(log);
    this.saveData();
    
    return log;
  }

  async exportLogs(logs: any[] = []) {
    await this.delay();
    const logsToExport = logs.length > 0 ? logs : await this.getLogs();
    const csv = this.generateCSV(logsToExport, ['timestamp', 'type', 'screen', 'details', 'status']);
    this.downloadCSV(csv, 'logs.csv');
  }

  // Settings
  async updateBrightness(screenId: string, brightness: number) {
    await this.delay();
    const screen = this.data.screens?.find((s: any) => s.id === screenId);
    if (screen) {
      screen.brightness = brightness;
      this.saveData();
      
      await this.addLog({
        type: 'system',
        screen: screen.name,
        details: `Brightness adjusted to ${brightness}`,
        status: 'success'
      });
    }
  }

  async simulatePackageUpload(version: string) {
    await this.delay(2000); // Longer delay to simulate upload
    await this.addLog({
      type: 'system',
      screen: 'System',
      details: `Package upgrade simulated to ${version}`,
      status: 'success'
    });
  }

  async bindDriver(driverData: any) {
    await this.delay();
    await this.addLog({
      type: 'system',
      screen: 'System',
      details: `Driver ${driverData.name} bound with alias ${driverData.alias}`,
      status: 'success'
    });
  }

  // Debug functions
  async resetDatabase() {
    await this.delay();
    this.data = {};
    this.saveData();
    location.reload();
  }

  async loadSampleData() {
    await this.delay();
    this.data = { ...sampleData };
    this.saveData();
    location.reload();
  }

  async runDemoSimulation() {
    await this.delay();
    // Simulate some ad plays
    for (let i = 0; i < 5; i++) {
      await this.addLog({
        type: 'ad_play',
        screen: `Screen-${String(Math.floor(Math.random() * 3) + 1).padStart(3, '0')}`,
        details: `Demo ad ${i + 1} - 15s duration`,
        status: 'success'
      });
    }
    
    await this.addLog({
      type: 'system',
      screen: 'System',
      details: 'Demo simulation completed',
      status: 'success'
    });
  }

  // Utility functions
  private generateCSV(data: any[], fields: string[]) {
    const headers = fields.join(',');
    const rows = data.map(item => 
      fields.map(field => {
        const value = item[field];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value || '';
      }).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  private downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

export const store = new Store();
