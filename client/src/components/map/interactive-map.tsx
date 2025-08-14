import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function InteractiveMap() {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [newPointRadius, setNewPointRadius] = useState(200);
  const [fixedPoints, setFixedPoints] = useState<any[]>([]);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const [pointsData, hotspotsData, screensData, routesData] = await Promise.all([
          store.getFixedPoints(),
          store.getHotspots(),
          store.getAllScreens(),
          store.getRoutes()
        ]);
        setFixedPoints(pointsData);
        setHotspots(hotspotsData);
        setScreens(screensData);
        setRoutes(routesData);
      } catch (error) {
        console.error('Failed to load map data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMapData();
  }, []);

  const handleMapClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Simulate lat/lng coordinates (Riyadh area)
    const lat = 24.7136 + (y - 50) * 0.01;
    const lng = 46.6753 + (x - 50) * 0.01;
    
    handleCreatePoint(lat, lng);
  };

  const handleCreatePoint = async (lat: number, lng: number) => {
    try {
      const point = {
        id: `point-${Date.now()}`,
        name: `Point-${fixedPoints.length + 1}`,
        lat,
        lng,
        radius: newPointRadius
      };
      
      await store.createFixedPoint(point);
      
      toast({
        title: "Point Created",
        description: `Fixed point created at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create fixed point",
        variant: "destructive"
      });
    }
  };

  const handleDeletePoint = async (pointId: string) => {
    if (window.confirm("Are you sure you want to delete this point?")) {
      try {
        await store.deleteFixedPoint(pointId);
        toast({
          title: "Point Deleted",
          description: "Fixed point has been deleted",
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete point",
          variant: "destructive"
        });
      }
    }
  };

  const handleRadiusChange = async (pointId: string, radius: number) => {
    try {
      await store.updateFixedPoint(pointId, { radius });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update radius",
        variant: "destructive"
      });
    }
  };

  const handleExportRoutes = async () => {
    try {
      await store.exportRoutes();
      toast({
        title: "Routes Exported",
        description: "Route data has been exported to CSV",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export routes",
        variant: "destructive"
      });
    }
  };

  const handleBindScreens = async (pointId: string, screenIds: string[]) => {
    try {
      await store.bindScreensToPoint(pointId, screenIds);
      toast({
        title: "Screens Bound",
        description: "Screens have been bound to the fixed point",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to bind screens",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-rad-grey-800 mb-4 sm:mb-0">
          Map & Routes
        </h2>
        <Button 
          onClick={handleExportRoutes}
          className="bg-rad-blue hover:bg-rad-blue/90"
          data-testid="button-export-routes"
        >
          Export Routes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div 
                className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 cursor-crosshair overflow-hidden"
                onClick={handleMapClick}
                data-testid="interactive-map"
              >
                {/* Map background - simulating satellite view */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-80"
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #f0f9ff 25%, #ecfdf5 25%), linear-gradient(-45deg, #f0f9ff 25%, #ecfdf5 25%)',
                    backgroundSize: '20px 20px'
                  }}
                ></div>

                {/* Fixed Points */}
                {fixedPoints.map((point, index) => (
                  <div key={point.id}>
                    {/* Point marker */}
                    <div
                      className="absolute w-4 h-4 bg-rad-blue rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-smooth z-10"
                      style={{
                        left: `${((parseFloat(point.lng) - 46.6753) / 0.01 + 50)}%`,
                        top: `${((parseFloat(point.lat) - 24.7136) / 0.01 + 50)}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPoint(point);
                      }}
                      data-testid={`point-marker-${point.id}`}
                    />
                    
                    {/* Radius circle */}
                    <div
                      className="absolute border-2 border-rad-orange rounded-full opacity-30 pointer-events-none"
                      style={{
                        left: `${((parseFloat(point.lng) - 46.6753) / 0.01 + 50)}%`,
                        top: `${((parseFloat(point.lat) - 24.7136) / 0.01 + 50)}%`,
                        width: `${point.radius / 10}px`,
                        height: `${point.radius / 10}px`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>
                ))}

                {/* Route Paths - SVG overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {routes.map((route, index) => (
                    <path
                      key={index}
                      d={route.path}
                      stroke="#ff7a00"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray="5,5"
                      opacity="0.8"
                    />
                  ))}
                </svg>

                {/* Map Controls */}
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg">
                  <button className="p-2 hover:bg-rad-grey-50 transition-smooth border-b border-rad-grey-200">
                    <i className="fas fa-plus text-rad-grey-600"></i>
                  </button>
                  <button className="p-2 hover:bg-rad-grey-50 transition-smooth">
                    <i className="fas fa-minus text-rad-grey-600"></i>
                  </button>
                </div>

                {/* Click instruction */}
                <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-2 rounded-lg text-sm">
                  Click anywhere to create a fixed point
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Fixed Points Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-rad-grey-800">
                Fixed Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="radius">Default Radius (meters)</Label>
                <Input
                  id="radius"
                  type="number"
                  min="50"
                  max="1000"
                  value={newPointRadius}
                  onChange={(e) => setNewPointRadius(parseInt(e.target.value))}
                  data-testid="input-default-radius"
                />
              </div>
              
              <div className="space-y-3">
                {fixedPoints.length === 0 ? (
                  <div className="text-center text-rad-grey-500 py-4">
                    <i className="fas fa-map-marker-alt text-2xl mb-2"></i>
                    <p>No fixed points</p>
                    <p className="text-sm">Click on the map to create one</p>
                  </div>
                ) : (
                  fixedPoints.map(point => (
                    <div key={point.id} className="p-3 border border-rad-grey-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-rad-grey-800">
                          {point.name}
                        </span>
                        <button
                          onClick={() => handleDeletePoint(point.id)}
                          className="text-red-600 hover:text-red-800 transition-smooth"
                          data-testid={`button-delete-point-${point.id}`}
                        >
                          <i className="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                      <p className="text-xs text-rad-grey-600 mb-2">
                        {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-rad-grey-600">Radius:</span>
                        <input
                          type="range"
                          min="50"
                          max="500"
                          value={point.radius}
                          onChange={(e) => handleRadiusChange(point.id, parseInt(e.target.value))}
                          className="flex-1"
                          data-testid={`slider-radius-${point.id}`}
                        />
                        <span className="text-xs text-rad-grey-600 min-w-12">
                          {point.radius}m
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hotspots */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-rad-grey-800">
                Top Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hotspots.length === 0 ? (
                  <div className="text-center text-rad-grey-500 py-4">
                    <i className="fas fa-fire text-2xl mb-2"></i>
                    <p>No hotspots detected</p>
                    <p className="text-sm">Hotspots will appear as routes are tracked</p>
                  </div>
                ) : (
                  hotspots.map((hotspot, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-rad-grey-50 rounded-lg transition-smooth"
                      data-testid={`hotspot-${index}`}
                    >
                      <div>
                        <p className="text-sm font-medium text-rad-grey-800">
                          {hotspot.name}
                        </p>
                        <p className="text-xs text-rad-grey-600">
                          {hotspot.triggers} triggers
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-rad-orange rounded-full"></div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Screen Binding */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-rad-grey-800">
                Screen Binding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <select
                  multiple
                  size={4}
                  className="w-full p-2 border border-rad-grey-200 rounded-lg text-sm"
                  data-testid="select-screens-bind"
                >
                  {screens.map(screen => (
                    <option key={screen.id} value={screen.id}>
                      {screen.name} ({screen.alias})
                    </option>
                  ))}
                </select>
                
                <Button
                  className="w-full bg-rad-blue hover:bg-rad-blue/90"
                  size="sm"
                  disabled={!selectedPoint}
                  onClick={() => {
                    if (selectedPoint) {
                      // Get selected screens from the select element
                      const selectElement = document.querySelector('[data-testid="select-screens-bind"]') as HTMLSelectElement;
                      const selectedScreens = Array.from(selectElement.selectedOptions).map(option => option.value);
                      handleBindScreens(selectedPoint.id, selectedScreens);
                    }
                  }}
                  data-testid="button-bind-screens"
                >
                  Bind Selected
                </Button>
                
                {selectedPoint && (
                  <p className="text-xs text-rad-grey-600">
                    Binding to: {selectedPoint.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
