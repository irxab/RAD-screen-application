// Google Maps service for RAD Map & Routes
import { screensService } from './screensService.js';

class MapService {
  constructor() {
    this.map = null;
    this.markers = [];
    this.clusterer = null;
    this.activeInfoWindow = null;
    this.polylines = [];
    this.heatmap = null;
    this.isRealTimeEnabled = false;
    this.realTimeInterval = null;
    this.playbackMarker = null;
  }

  async initMap(containerId = 'map') {
    try {
      // Check if Google Maps is loaded
      if (typeof google === 'undefined' || !google.maps) {
        throw new Error('Google Maps API not loaded');
      }

      // Initialize map
      this.map = new google.maps.Map(document.getElementById(containerId), {
        center: { lat: 24.7136, lng: 46.6753 }, // Riyadh center
        zoom: 12,
        gestureHandling: 'greedy',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Load and display screens
      await this.loadScreenMarkers();

      return { map: this.map, markers: this.markers };
    } catch (error) {
      console.error('Map initialization failed:', error);
      this.showMapError(error.message);
      throw error;
    }
  }

  async loadScreenMarkers() {
    try {
      const screens = await screensService.getScreens();
      
      // Clear existing markers
      this.clearMarkers();

      // Create markers for each screen
      this.markers = screens.map(screen => this.createMarker(screen));

      // Set up clustering
      if (google.maps.markerClusterer) {
        this.clusterer = new google.maps.markerClusterer.MarkerClusterer({
          map: this.map,
          markers: this.markers
        });
      }

      // Fit bounds to show all markers
      this.fitBounds();

      return this.markers;
    } catch (error) {
      console.error('Failed to load screen markers:', error);
      throw error;
    }
  }

  createMarker(screen) {
    const marker = new google.maps.Marker({
      position: { lat: screen.lat, lng: screen.lng },
      map: this.map,
      title: `${screen.name} (${screen.alias})`,
      icon: this.getMarkerIcon(screen.status),
      animation: google.maps.Animation.DROP
    });

    // Store screen data on marker
    marker.screenData = screen;
    marker.screenId = screen.id;

    // Add click listener
    marker.addListener('click', () => this.onMarkerClick(marker, screen));

    // Add hover listener for tooltip
    marker.addListener('mouseover', () => this.showTooltip(marker, screen));
    marker.addListener('mouseout', () => this.hideTooltip());

    return marker;
  }

  getMarkerIcon(status) {
    const color = screensService.getStatusColor(status);
    
    // Create custom marker icon
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 8
    };
  }

  async onMarkerClick(marker, screen) {
    // Animate marker
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(() => marker.setAnimation(null), 750);

    // Center map on marker
    this.map.panTo(marker.getPosition());

    // Close any existing info window
    if (this.activeInfoWindow) {
      this.activeInfoWindow.close();
    }

    // Create and show info window
    const content = await this.createInfoWindowContent(screen);
    this.activeInfoWindow = new google.maps.InfoWindow({
      content: content,
      maxWidth: 300
    });

    this.activeInfoWindow.open(this.map, marker);

    // Trigger detail panel open
    this.openDetailPanel(screen);
  }

  async createInfoWindowContent(screen) {
    const driver = await screensService.getDriverById(screen.assignedDriverId);
    const lastSeen = screensService.formatTimestamp(screen.lastSeen);
    
    return `
      <div class="info-window">
        <div class="info-header">
          <h3>${screen.name}</h3>
          <span class="status-badge status-${screen.status}">${screen.status}</span>
        </div>
        <div class="info-body">
          <p><strong>Alias:</strong> ${screen.alias}</p>
          <p><strong>Driver:</strong> ${driver.name}</p>
          <p><strong>Last Seen:</strong> ${lastSeen}</p>
          <button class="btn-view-details" onclick="window.mapService.openDetailPanel('${screen.id}')">
            View Details
          </button>
        </div>
      </div>
    `;
  }

  showTooltip(marker, screen) {
    const lastSeen = screensService.formatTimestamp(screen.lastSeen);
    
    const tooltip = new google.maps.InfoWindow({
      content: `
        <div class="tooltip">
          <strong>${screen.name}</strong><br>
          Last seen: ${lastSeen}
        </div>
      `,
      disableAutoPan: true
    });

    tooltip.open(this.map, marker);
    
    // Auto-hide after 3 seconds
    setTimeout(() => tooltip.close(), 3000);
  }

  hideTooltip() {
    // Handled by auto-hide in showTooltip
  }

  async openDetailPanel(screenId) {
    try {
      const screen = typeof screenId === 'string' ? 
        await screensService.getScreenById(screenId) : screenId;
      
      const driver = await screensService.getDriverById(screen.assignedDriverId);
      const history = await screensService.getHistory(screen.id, 50);
      const logs = await screensService.getLogs(screen.id);
      const ads = await Promise.all(
        screen.assignedAds.map(adId => screensService.getAdById(adId))
      );

      // Show route on map
      this.showRoute(history);

      // Open detail panel UI
      if (window.mapUI) {
        window.mapUI.showDetailPanel(screen, driver, history, logs, ads);
      }
    } catch (error) {
      console.error('Failed to open detail panel:', error);
      this.showError('Failed to load screen details');
    }
  }

  showRoute(history) {
    // Clear existing polylines
    this.clearPolylines();

    if (!history || history.length < 2) return;

    // Create path from history
    const path = history
      .sort((a, b) => new Date(a.ts) - new Date(b.ts))
      .map(point => ({ lat: point.lat, lng: point.lng }));

    // Create polyline
    const polyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#ff7a00', // RAD orange
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: this.map
    });

    this.polylines.push(polyline);

    // Add directional arrows
    this.addDirectionalArrows(polyline);

    // Fit bounds to route
    const bounds = new google.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    this.map.fitBounds(bounds);
  }

  addDirectionalArrows(polyline) {
    const path = polyline.getPath();
    const numPoints = path.getLength();
    
    // Add arrows every 10% of the route
    for (let i = 1; i < numPoints; i += Math.max(1, Math.floor(numPoints / 10))) {
      const start = path.getAt(i - 1);
      const end = path.getAt(i);
      
      const arrow = new google.maps.Marker({
        position: end,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 3,
          strokeColor: '#ff7a00',
          strokeWeight: 2,
          fillColor: '#ff7a00',
          fillOpacity: 1
        },
        zIndex: 1000
      });

      this.polylines.push(arrow);
    }
  }

  toggleHeatmap() {
    if (this.heatmap) {
      this.heatmap.setMap(this.heatmap.getMap() ? null : this.map);
      return this.heatmap.getMap() !== null;
    }

    this.createHeatmap();
    return true;
  }

  async createHeatmap() {
    try {
      const screens = await screensService.getScreens();
      const heatmapData = [];

      // Collect all history points
      for (const screen of screens) {
        const history = await screensService.getHistory(screen.id);
        history.forEach(point => {
          heatmapData.push(new google.maps.LatLng(point.lat, point.lng));
        });
      }

      // Create heatmap layer
      this.heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: this.map,
        radius: 20,
        opacity: 0.6
      });
    } catch (error) {
      console.error('Failed to create heatmap:', error);
    }
  }

  toggleRealTime() {
    this.isRealTimeEnabled = !this.isRealTimeEnabled;

    if (this.isRealTimeEnabled) {
      this.startRealTimeUpdates();
    } else {
      this.stopRealTimeUpdates();
    }

    return this.isRealTimeEnabled;
  }

  startRealTimeUpdates() {
    if (this.realTimeInterval) return;

    this.realTimeInterval = setInterval(async () => {
      try {
        const updatedScreens = await screensService.getUpdates();
        this.updateMarkerPositions(updatedScreens);
      } catch (error) {
        console.error('Real-time update failed:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  stopRealTimeUpdates() {
    if (this.realTimeInterval) {
      clearInterval(this.realTimeInterval);
      this.realTimeInterval = null;
    }
  }

  updateMarkerPositions(screens) {
    screens.forEach(screen => {
      const marker = this.markers.find(m => m.screenId === screen.id);
      if (marker) {
        marker.setPosition({ lat: screen.lat, lng: screen.lng });
        marker.screenData = screen;
      }
    });
  }

  filterMarkers(filters) {
    this.markers.forEach(marker => {
      const screen = marker.screenData;
      let visible = true;

      // Filter by status
      if (filters.status && filters.status !== 'all' && screen.status !== filters.status) {
        visible = false;
      }

      // Filter by driver
      if (filters.driver && screen.assignedDriverId !== filters.driver) {
        visible = false;
      }

      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesName = screen.name.toLowerCase().includes(searchTerm);
        const matchesAlias = screen.alias.toLowerCase().includes(searchTerm);
        if (!matchesName && !matchesAlias) {
          visible = false;
        }
      }

      marker.setVisible(visible);
    });

    // Update clusterer
    if (this.clusterer) {
      this.clusterer.clearMarkers();
      const visibleMarkers = this.markers.filter(m => m.getVisible());
      this.clusterer.addMarkers(visibleMarkers);
    }
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    
    if (this.clusterer) {
      this.clusterer.clearMarkers();
    }
  }

  clearPolylines() {
    this.polylines.forEach(polyline => polyline.setMap(null));
    this.polylines = [];
  }

  fitBounds() {
    if (this.markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    this.markers.forEach(marker => {
      if (marker.getVisible()) {
        bounds.extend(marker.getPosition());
      }
    });

    this.map.fitBounds(bounds);
  }

  showMapError(message) {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="map-error">
          <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Map Loading Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()">Retry</button>
          </div>
        </div>
      `;
    }
  }

  showError(message) {
    if (window.mapUI && window.mapUI.showToast) {
      window.mapUI.showToast(message, 'error');
    } else {
      alert(message);
    }
  }

  // Export methods
  async exportRouteCSV(screenId) {
    try {
      const history = await screensService.getHistory(screenId, 0); // Get all history
      const csvData = history.map(point => ({
        timestamp: point.ts,
        latitude: point.lat,
        longitude: point.lng,
        screenId: screenId
      }));

      screensService.exportCSV(csvData, `screen-${screenId}-route.csv`);
    } catch (error) {
      this.showError('Failed to export route data');
    }
  }

  async exportRouteGeoJSON(screenId) {
    try {
      const history = await screensService.getHistory(screenId, 0);
      screensService.exportGeoJSON(history, screenId);
    } catch (error) {
      this.showError('Failed to export GeoJSON data');
    }
  }

  getDirectionsUrl(lat, lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }
}

// Export singleton instance
export const mapService = new MapService();

// Make it globally available for inline event handlers
if (typeof window !== 'undefined') {
  window.mapService = mapService;
}