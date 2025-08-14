// Screen data service for RAD Map & Routes
class ScreensService {
  constructor() {
    this.cache = null;
    this.lastFetch = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  async loadData() {
    if (this.cache && this.lastFetch && (Date.now() - this.lastFetch < this.cacheDuration)) {
      return this.cache;
    }

    try {
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
      
      const response = await fetch('/src/data/screens.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.cache = data;
      this.lastFetch = Date.now();
      
      return data;
    } catch (error) {
      console.error('Failed to load screens data:', error);
      throw new Error('Unable to load screen data. Please check your connection.');
    }
  }

  async getScreens() {
    const data = await this.loadData();
    return data.screens || [];
  }

  async getScreenById(screenId) {
    const screens = await this.getScreens();
    const screen = screens.find(s => s.id === screenId);
    if (!screen) {
      throw new Error(`Screen ${screenId} not found`);
    }
    return screen;
  }

  async getDrivers() {
    const data = await this.loadData();
    return data.drivers || [];
  }

  async getDriverById(driverId) {
    const drivers = await this.getDrivers();
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) {
      throw new Error(`Driver ${driverId} not found`);
    }
    return driver;
  }

  async getAds() {
    const data = await this.loadData();
    return data.ads || [];
  }

  async getAdById(adId) {
    const ads = await this.getAds();
    return ads.find(a => a.id === adId);
  }

  async getHistory(screenId, limit = 100) {
    const screen = await this.getScreenById(screenId);
    let history = screen.history || [];
    
    // Sort by timestamp descending
    history = history.sort((a, b) => new Date(b.ts) - new Date(a.ts));
    
    // Apply limit
    if (limit > 0) {
      history = history.slice(0, limit);
    }
    
    return history;
  }

  async getLogs(screenId = null) {
    const data = await this.loadData();
    let logs = data.logs || [];
    
    if (screenId) {
      logs = logs.filter(log => log.screenId === screenId);
    }
    
    // Sort by timestamp descending
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async getUpdates() {
    // Simulate real-time updates
    const screens = await this.getScreens();
    const now = new Date();
    
    return screens.map(screen => {
      // Simulate small position changes for active screens
      if (screen.status === 'active') {
        const latOffset = (Math.random() - 0.5) * 0.001; // ~100m radius
        const lngOffset = (Math.random() - 0.5) * 0.001;
        
        return {
          ...screen,
          lat: screen.lat + latOffset,
          lng: screen.lng + lngOffset,
          lastSeen: now.toISOString(),
          // Add random status updates
          brightness: Math.max(80, Math.min(130, screen.brightness + (Math.random() - 0.5) * 10))
        };
      }
      return screen;
    });
  }

  exportCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  exportGeoJSON(history, screenId) {
    if (!history || history.length === 0) {
      throw new Error('No history data to export');
    }

    const features = history.map(point => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.lng, point.lat]
      },
      properties: {
        timestamp: point.ts,
        screenId: screenId
      }
    }));

    const geoJSON = {
      type: 'FeatureCollection',
      features
    };

    this.downloadFile(
      JSON.stringify(geoJSON, null, 2),
      `screen-${screenId}-route.geojson`,
      'application/geo+json'
    );
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  formatTimestamp(isoString) {
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getStatusColor(status) {
    const colors = {
      active: '#0b6ef6',      // RAD blue
      offline: '#6b7280',     // gray
      maintenance: '#f59e0b'  // amber/orange
    };
    return colors[status] || colors.offline;
  }

  getStatusIcon(status) {
    const icons = {
      active: 'circle',
      offline: 'circle-xmark',
      maintenance: 'circle-exclamation'
    };
    return icons[status] || icons.offline;
  }

  // Privacy helper for phone numbers
  maskPhone(phone, showLast = 4) {
    if (!phone || phone.length <= showLast) return phone;
    const masked = '*'.repeat(phone.length - showLast);
    return masked + phone.slice(-showLast);
  }
}

// Export singleton instance
export const screensService = new ScreensService();

// Named exports for individual functions
export const {
  getScreens,
  getScreenById,
  getDrivers,
  getDriverById,
  getAds,
  getAdById,
  getHistory,
  getLogs,
  getUpdates,
  exportCSV,
  exportGeoJSON,
  formatTimestamp,
  getStatusColor,
  getStatusIcon,
  maskPhone
} = screensService;