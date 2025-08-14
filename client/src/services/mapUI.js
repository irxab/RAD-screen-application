// UI service for RAD Map & Routes interface
import { mapService } from './mapService.js';
import { screensService } from './screensService.js';

class MapUI {
  constructor() {
    this.isDetailPanelOpen = false;
    this.currentScreen = null;
    this.searchTimeout = null;
    this.maskPhones = true;
  }

  init() {
    this.setupEventListeners();
    this.setupFilters();
    this.setupToggles();
  }

  setupEventListeners() {
    // Search input with debouncing
    const searchInput = document.getElementById('screen-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.applyFilters();
        }, 300);
      });
    }

    // Filter dropdowns
    const statusFilter = document.getElementById('status-filter');
    const driverFilter = document.getElementById('driver-filter');
    
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.applyFilters());
    }
    
    if (driverFilter) {
      driverFilter.addEventListener('change', () => this.applyFilters());
    }

    // Close detail panel
    const closeBtn = document.getElementById('close-detail-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeDetailPanel());
    }

    // Mobile bottom sheet drag handling
    this.setupBottomSheetDrag();
  }

  async setupFilters() {
    try {
      // Populate driver filter
      const drivers = await screensService.getDrivers();
      const driverFilter = document.getElementById('driver-filter');
      
      if (driverFilter) {
        driverFilter.innerHTML = '<option value="">All Drivers</option>';
        drivers.forEach(driver => {
          const option = document.createElement('option');
          option.value = driver.id;
          option.textContent = driver.name;
          driverFilter.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Failed to setup filters:', error);
    }
  }

  setupToggles() {
    // Clustering toggle
    const clusterToggle = document.getElementById('cluster-toggle');
    if (clusterToggle) {
      clusterToggle.addEventListener('change', (e) => {
        this.toggleClustering(e.target.checked);
      });
    }

    // Heatmap toggle
    const heatmapToggle = document.getElementById('heatmap-toggle');
    if (heatmapToggle) {
      heatmapToggle.addEventListener('change', (e) => {
        this.toggleHeatmap(e.target.checked);
      });
    }

    // Real-time toggle
    const realtimeToggle = document.getElementById('realtime-toggle');
    if (realtimeToggle) {
      realtimeToggle.addEventListener('change', (e) => {
        this.toggleRealTime(e.target.checked);
      });
    }

    // Phone masking toggle
    const phoneMaskToggle = document.getElementById('phone-mask-toggle');
    if (phoneMaskToggle) {
      phoneMaskToggle.addEventListener('change', (e) => {
        this.maskPhones = e.target.checked;
        if (this.currentScreen) {
          this.updateDriverInfo();
        }
      });
    }
  }

  applyFilters() {
    const search = document.getElementById('screen-search')?.value || '';
    const status = document.getElementById('status-filter')?.value || '';
    const driver = document.getElementById('driver-filter')?.value || '';

    const filters = {
      search: search.trim(),
      status: status,
      driver: driver
    };

    mapService.filterMarkers(filters);
  }

  toggleClustering(enabled) {
    if (mapService.clusterer) {
      mapService.clusterer.setMap(enabled ? mapService.map : null);
    }
  }

  toggleHeatmap(enabled) {
    const isEnabled = mapService.toggleHeatmap();
    
    // Update toggle state if different from requested
    const toggle = document.getElementById('heatmap-toggle');
    if (toggle && toggle.checked !== isEnabled) {
      toggle.checked = isEnabled;
    }
  }

  toggleRealTime(enabled) {
    const isEnabled = mapService.toggleRealTime();
    
    // Update toggle state
    const toggle = document.getElementById('realtime-toggle');
    if (toggle && toggle.checked !== isEnabled) {
      toggle.checked = isEnabled;
    }

    // Show status indicator
    this.showToast(
      isEnabled ? 'Real-time updates enabled' : 'Real-time updates disabled',
      'info'
    );
  }

  async showDetailPanel(screen, driver, history, logs, ads) {
    this.currentScreen = screen;
    
    const panel = document.getElementById('detail-panel');
    const overlay = document.getElementById('detail-overlay');
    
    if (!panel) {
      console.error('Detail panel element not found');
      return;
    }

    // Populate panel content
    this.populateDetailPanel(screen, driver, history, logs, ads);

    // Show panel
    panel.classList.add('active');
    if (overlay) overlay.classList.add('active');
    
    this.isDetailPanelOpen = true;

    // Mobile: show as bottom sheet
    if (this.isMobile()) {
      panel.classList.add('mobile-bottom-sheet');
    }

    // Focus management for accessibility
    const firstFocusable = panel.querySelector('button, input, select, textarea, [tabindex]');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  populateDetailPanel(screen, driver, history, logs, ads) {
    // Update header
    this.updateElement('screen-name', screen.name);
    this.updateElement('screen-alias', screen.alias);
    this.updateElement('screen-status', screen.status);
    
    const statusBadge = document.getElementById('screen-status');
    if (statusBadge) {
      statusBadge.className = `status-badge status-${screen.status}`;
    }

    // Update driver info
    this.updateDriverInfo(driver);

    // Update metadata
    this.updateElement('last-seen', screensService.formatTimestamp(screen.lastSeen));
    this.updateElement('hardware', screen.hardware);
    this.updateElement('brightness', `${screen.brightness}%`);
    this.updateElement('screen-notes', screen.notes);

    // Update screenshot
    const screenshot = document.getElementById('last-screenshot');
    if (screenshot && screen.lastScreenshot) {
      screenshot.src = screen.lastScreenshot;
      screenshot.alt = `Last screenshot from ${screen.name}`;
    }

    // Update assigned ads
    this.updateAssignedAds(ads);

    // Update history timeline
    this.updateHistoryTimeline(history);

    // Update logs
    this.updateLogs(logs);

    // Update action buttons
    this.setupActionButtons(screen, driver);
  }

  updateDriverInfo(driver) {
    if (!driver) return;

    this.updateElement('driver-name', driver.name);
    this.updateElement('driver-license', driver.license);
    this.updateElement('driver-vehicle', driver.vehicle);
    this.updateElement('driver-email', driver.email);

    // Phone with masking option
    const phoneElement = document.getElementById('driver-phone');
    if (phoneElement) {
      const phone = this.maskPhones ? 
        screensService.maskPhone(driver.phone, 4) : 
        driver.phone;
      phoneElement.textContent = phone;
      phoneElement.href = `tel:${driver.phone}`;
    }
  }

  updateAssignedAds(ads) {
    const container = document.getElementById('assigned-ads');
    if (!container) return;

    if (!ads || ads.length === 0) {
      container.innerHTML = '<p class="text-muted">No ads assigned</p>';
      return;
    }

    container.innerHTML = ads
      .filter(ad => ad) // Remove null/undefined ads
      .map(ad => `
        <div class="ad-item">
          <div class="ad-info">
            <span class="ad-title">${ad.title}</span>
            <span class="ad-meta">${ad.duration}s • ${ad.type}</span>
          </div>
        </div>
      `).join('');
  }

  updateHistoryTimeline(history) {
    const container = document.getElementById('history-timeline');
    if (!container) return;

    if (!history || history.length === 0) {
      container.innerHTML = '<p class="text-muted">No history available</p>';
      return;
    }

    // Sort history by timestamp (newest first)
    const sortedHistory = [...history].sort((a, b) => new Date(b.ts) - new Date(a.ts));

    container.innerHTML = sortedHistory.slice(0, 10).map((point, index) => `
      <div class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-time">${screensService.formatTimestamp(point.ts)}</div>
          <div class="timeline-location">${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}</div>
        </div>
      </div>
    `).join('');
  }

  updateLogs(logs) {
    const container = document.getElementById('activity-logs');
    if (!container) return;

    if (!logs || logs.length === 0) {
      container.innerHTML = '<p class="text-muted">No recent logs</p>';
      return;
    }

    container.innerHTML = logs.slice(0, 5).map(log => `
      <div class="log-item">
        <div class="log-time">${screensService.formatTimestamp(log.timestamp)}</div>
        <div class="log-event">${log.event.replace('_', ' ')}</div>
        <div class="log-details">${log.details}</div>
      </div>
    `).join('');
  }

  setupActionButtons(screen, driver) {
    // Call driver button
    const callBtn = document.getElementById('call-driver-btn');
    if (callBtn && driver) {
      callBtn.onclick = () => this.callDriver(driver.phone);
    }

    // Directions button
    const directionsBtn = document.getElementById('directions-btn');
    if (directionsBtn) {
      directionsBtn.onclick = () => this.openDirections(screen.lat, screen.lng);
    }

    // Export buttons
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const exportGeoJsonBtn = document.getElementById('export-geojson-btn');
    const exportLogsBtn = document.getElementById('export-logs-btn');

    if (exportCsvBtn) {
      exportCsvBtn.onclick = () => mapService.exportRouteCSV(screen.id);
    }

    if (exportGeoJsonBtn) {
      exportGeoJsonBtn.onclick = () => mapService.exportRouteGeoJSON(screen.id);
    }

    if (exportLogsBtn) {
      exportLogsBtn.onclick = () => this.exportLogs(screen.id);
    }
  }

  closeDetailPanel() {
    const panel = document.getElementById('detail-panel');
    const overlay = document.getElementById('detail-overlay');

    if (panel) panel.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    this.isDetailPanelOpen = false;
    this.currentScreen = null;

    // Return focus to map
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.focus();
    }
  }

  setupBottomSheetDrag() {
    // Implement drag-to-dismiss for mobile bottom sheet
    if (!this.isMobile()) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const panel = document.getElementById('detail-panel');
    if (!panel) return;

    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '<div class="drag-indicator"></div>';
    panel.insertBefore(dragHandle, panel.firstChild);

    dragHandle.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isDragging = true;
      panel.style.transition = 'none';
    });

    dragHandle.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const deltaY = Math.max(0, currentY - startY);
      panel.style.transform = `translateY(${deltaY}px)`;
    });

    dragHandle.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      panel.style.transition = '';

      const deltaY = currentY - startY;
      if (deltaY > 100) {
        this.closeDetailPanel();
      } else {
        panel.style.transform = '';
      }
    });
  }

  callDriver(phone) {
    if (!phone) return;
    window.open(`tel:${phone}`, '_self');
  }

  openDirections(lat, lng) {
    const url = mapService.getDirectionsUrl(lat, lng);
    window.open(url, '_blank');
  }

  async exportLogs(screenId) {
    try {
      const logs = await screensService.getLogs(screenId);
      const csvData = logs.map(log => ({
        timestamp: log.timestamp,
        screenId: log.screenId,
        event: log.event,
        details: log.details
      }));

      screensService.exportCSV(csvData, `screen-${screenId}-logs.csv`);
    } catch (error) {
      this.showToast('Failed to export logs', 'error');
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }

  isMobile() {
    return window.innerWidth <= 768;
  }

  // Keyboard navigation support
  handleKeyPress(event) {
    if (event.key === 'Escape' && this.isDetailPanelOpen) {
      this.closeDetailPanel();
    }
  }
}

// Export singleton instance
export const mapUI = new MapUI();

// Make it globally available
if (typeof window !== 'undefined') {
  window.mapUI = mapUI;
  
  // Setup keyboard listeners
  document.addEventListener('keydown', (e) => mapUI.handleKeyPress(e));
}