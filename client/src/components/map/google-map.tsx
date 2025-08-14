import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, Navigation, Download, MapPin, Activity, Clock, Monitor } from "lucide-react";

// Declare global Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    mapService: any;
    mapUI: any;
    openScreenDetails: (screenId: string) => void;
  }
}

export default function GoogleMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<any>(null);
  const [screenData, setScreenData] = useState<any[]>([]);
  const [driverData, setDriverData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    driver: ''
  });
  const [toggles, setToggles] = useState({
    clustering: true,
    heatmap: false,
    realtime: false,
    phoneMask: true
  });
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [currentScreenDetails, setCurrentScreenDetails] = useState<any>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadGoogleMaps();
    loadScreenData();
  }, []);

  const loadScreenData = async () => {
    try {
      const response = await fetch('/src/data/screens.json');
      const data = await response.json();
      setScreenData(data.screens || []);
      setDriverData(data.drivers || []);
    } catch (error) {
      console.error('Failed to load screen data:', error);
    }
  };

  const loadGoogleMaps = async () => {
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    try {
      // Fetch API key from server
      const response = await fetch('/api/config/maps-key');
      const data = await response.json();
      
      if (!response.ok || !data.apiKey) {
        setMapError('Google Maps API key not configured on server.');
        setIsLoading(false);
        return;
      }

      const apiKey = data.apiKey;
      window.initMap = initializeMap;

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,visualization&callback=initMap`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setMapError('Failed to load Google Maps API. Please check your API key and network connection.');
        setIsLoading(false);
      };

      document.head.appendChild(script);
    } catch (error) {
      setMapError('Failed to fetch API configuration from server.');
      setIsLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current) return;

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 24.7136, lng: 46.6753 },
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

      // Create markers for screens
      createScreenMarkers(map);
      
      setIsMapReady(true);
      setIsLoading(false);
    } catch (error) {
      console.error('Map initialization failed:', error);
      setMapError('Failed to initialize Google Maps');
      setIsLoading(false);
    }
  };

  const createScreenMarkers = (map: any) => {
    screenData.forEach(screen => {
      const marker = new window.google.maps.Marker({
        position: { lat: screen.lat, lng: screen.lng },
        map: map,
        title: `${screen.name} (${screen.alias})`,
        icon: getMarkerIcon(screen.status),
        animation: window.google.maps.Animation.DROP
      });

      // Info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createInfoWindowContent(screen)
      });

      marker.addListener('click', () => {
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 750);
        
        infoWindow.open(map, marker);
        map.panTo(marker.getPosition());
        
        openScreenDetails(screen);
      });
    });
  };

  const getMarkerIcon = (status: string) => {
    const colors = {
      active: '#0b6ef6',
      offline: '#6b7280',
      maintenance: '#f59e0b'
    };

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: colors[status as keyof typeof colors] || colors.offline,
      fillOpacity: 0.8,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 8
    };
  };

  const createInfoWindowContent = (screen: any) => {
    const driver = driverData.find(d => d.id === screen.assignedDriverId);
    const lastSeen = new Date(screen.lastSeen).toLocaleString();
    
    return `
      <div style="padding: 8px; max-width: 250px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 14px; font-weight: bold;">${screen.name}</h3>
          <span style="background: ${getStatusColor(screen.status)}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">${screen.status}</span>
        </div>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Alias:</strong> ${screen.alias}</p>
        <p style="margin: 4px 0; font-size: 12px;"><strong>Driver:</strong> ${driver?.name || 'Unassigned'}</p>
        <p style="margin: 4px 0 8px 0; font-size: 12px;"><strong>Last Seen:</strong> ${lastSeen}</p>
        <button onclick="window.openScreenDetails('${screen.id}')" style="background: #0b6ef6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">View Details</button>
      </div>
    `;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: '#0b6ef6',
      offline: '#6b7280',
      maintenance: '#f59e0b'
    };
    return colors[status as keyof typeof colors] || colors.offline;
  };

  const openScreenDetails = (screen: any) => {
    const driver = driverData.find(d => d.id === screen.assignedDriverId);
    setSelectedScreen(screen);
    setCurrentScreenDetails({ screen, driver });
    setDetailPanelOpen(true);
  };

  // Make function globally available for info window buttons
  useEffect(() => {
    window.openScreenDetails = (screenId: string) => {
      const screen = screenData.find(s => s.id === screenId);
      if (screen) {
        openScreenDetails(screen);
      }
    };
  }, [screenData, driverData]);

  const callDriver = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const openDirections = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const exportRoute = (format: 'csv' | 'geojson') => {
    if (!selectedScreen) return;

    const history = selectedScreen.history || [];
    const filename = `screen-${selectedScreen.id}-route.${format}`;

    if (format === 'csv') {
      const csvData = [
        'timestamp,latitude,longitude,screenId',
        ...history.map((point: any) => 
          `${point.ts},${point.lat},${point.lng},${selectedScreen.id}`
        )
      ].join('\n');

      downloadFile(csvData, filename, 'text/csv');
    } else if (format === 'geojson') {
      const geoJSON = {
        type: 'FeatureCollection',
        features: history.map((point: any) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [point.lng, point.lat]
          },
          properties: {
            timestamp: point.ts,
            screenId: selectedScreen.id
          }
        }))
      };

      downloadFile(JSON.stringify(geoJSON, null, 2), filename, 'application/geo+json');
    }

    toast({
      title: "Export Complete",
      description: `Route data exported as ${format.toUpperCase()}`,
      variant: "default"
    });
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
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
  };

  const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const maskPhone = (phone: string, showLast = 4) => {
    if (!phone || phone.length <= showLast) return phone;
    const masked = '*'.repeat(phone.length - showLast);
    return masked + phone.slice(-showLast);
  };

  if (mapError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-rad-grey-800 mb-2">Map & Routes</h1>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <MapPin className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-rad-grey-800 mb-2">Map Loading Error</h3>
            <p className="text-rad-grey-600 mb-4">{mapError}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rad-grey-800 mb-2">Map & Routes</h1>
          <p className="text-rad-grey-600">Real-time screen locations and route tracking</p>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Map Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="screen-search">Search Screens</Label>
              <Input
                id="screen-search"
                placeholder="Search by name or alias..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                data-testid="input-screen-search"
              />
            </div>
            
            <div>
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="driver-filter">Filter by Driver</Label>
              <Select value={filters.driver} onValueChange={(value) => setFilters(prev => ({ ...prev, driver: value }))}>
                <SelectTrigger data-testid="select-driver-filter">
                  <SelectValue placeholder="All Drivers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Drivers</SelectItem>
                  {driverData.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full bg-rad-blue hover:bg-rad-blue/90" disabled={!isMapReady}>
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="cluster-toggle"
                checked={toggles.clustering}
                onCheckedChange={(checked) => setToggles(prev => ({ ...prev, clustering: checked }))}
              />
              <Label htmlFor="cluster-toggle">Clustering</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="heatmap-toggle"
                checked={toggles.heatmap}
                onCheckedChange={(checked) => setToggles(prev => ({ ...prev, heatmap: checked }))}
              />
              <Label htmlFor="heatmap-toggle">Heatmap</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="realtime-toggle"
                checked={toggles.realtime}
                onCheckedChange={(checked) => setToggles(prev => ({ ...prev, realtime: checked }))}
              />
              <Label htmlFor="realtime-toggle">Real-time</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="phone-mask-toggle"
                checked={toggles.phoneMask}
                onCheckedChange={(checked) => setToggles(prev => ({ ...prev, phoneMask: checked }))}
              />
              <Label htmlFor="phone-mask-toggle">Mask Phones</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map and Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className={`${detailPanelOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-rad-blue" />
                    <p className="text-rad-grey-600">Loading Google Maps...</p>
                  </div>
                </div>
              )}
              <div ref={mapRef} className="w-full h-full rounded-lg" />
            </CardContent>
          </Card>
        </div>

        {/* Detail Panel */}
        {detailPanelOpen && currentScreenDetails && (
          <div className="lg:col-span-1">
            <Card className="h-[600px] overflow-y-auto">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{currentScreenDetails.screen.name}</CardTitle>
                    <p className="text-sm text-rad-grey-600">{currentScreenDetails.screen.alias}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    currentScreenDetails.screen.status === 'active' ? 'bg-green-100 text-green-800' :
                    currentScreenDetails.screen.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {currentScreenDetails.screen.status}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setDetailPanelOpen(false)}
                >
                  ×
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Driver Info */}
                {currentScreenDetails.driver && (
                  <div className="p-3 bg-rad-grey-50 rounded-lg">
                    <h4 className="font-medium text-rad-grey-800 mb-2 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Driver Information
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {currentScreenDetails.driver.name}</p>
                      <p><strong>Phone:</strong> 
                        <button
                          onClick={() => callDriver(currentScreenDetails.driver.phone)}
                          className="ml-2 text-rad-blue hover:underline"
                        >
                          {toggles.phoneMask ? 
                            maskPhone(currentScreenDetails.driver.phone) : 
                            currentScreenDetails.driver.phone
                          }
                        </button>
                      </p>
                      <p><strong>Vehicle:</strong> {currentScreenDetails.driver.vehicle}</p>
                      <p><strong>License:</strong> {currentScreenDetails.driver.license}</p>
                    </div>
                  </div>
                )}

                {/* Screen Metadata */}
                <div className="space-y-2">
                  <h4 className="font-medium text-rad-grey-800 flex items-center">
                    <Monitor className="w-4 h-4 mr-2" />
                    Screen Details
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Hardware:</strong> {currentScreenDetails.screen.hardware}</p>
                    <p><strong>Brightness:</strong> {currentScreenDetails.screen.brightness}%</p>
                    <p><strong>Last Seen:</strong> {formatTimestamp(currentScreenDetails.screen.lastSeen)}</p>
                    <p><strong>Assigned Ads:</strong> {currentScreenDetails.screen.assignedAds.length}</p>
                  </div>
                </div>

                {/* Route History */}
                <div className="space-y-2">
                  <h4 className="font-medium text-rad-grey-800 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Recent History
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {currentScreenDetails.screen.history?.slice(0, 5).map((point: any, index: number) => (
                      <div key={index} className="text-xs p-2 bg-rad-grey-50 rounded">
                        <div className="font-medium">{formatTimestamp(point.ts)}</div>
                        <div className="text-rad-grey-600">{point.lat.toFixed(4)}, {point.lng.toFixed(4)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={() => callDriver(currentScreenDetails.driver.phone)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call Driver
                  </Button>
                  
                  <Button
                    onClick={() => openDirections(currentScreenDetails.screen.lat, currentScreenDetails.screen.lng)}
                    className="w-full bg-rad-blue hover:bg-rad-blue/90"
                    size="sm"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Directions
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => exportRoute('csv')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      CSV
                    </Button>
                    
                    <Button
                      onClick={() => exportRoute('geojson')}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      GeoJSON
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Screen List */}
      <Card>
        <CardHeader>
          <CardTitle>All Screens ({screenData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenData.map(screen => {
              const driver = driverData.find(d => d.id === screen.assignedDriverId);
              return (
                <div
                  key={screen.id}
                  className="p-4 border border-rad-grey-200 rounded-lg hover:bg-rad-grey-50 cursor-pointer transition-smooth"
                  onClick={() => openScreenDetails(screen)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-rad-grey-800">{screen.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      screen.status === 'active' ? 'bg-green-100 text-green-800' :
                      screen.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {screen.status}
                    </span>
                  </div>
                  <p className="text-sm text-rad-grey-600 mb-1">Alias: {screen.alias}</p>
                  <p className="text-sm text-rad-grey-600 mb-1">Driver: {driver?.name || 'Unassigned'}</p>
                  <p className="text-sm text-rad-grey-600">Last seen: {formatTimestamp(screen.lastSeen)}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}