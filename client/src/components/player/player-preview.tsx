import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function PlayerPreview() {
  const [selectedScreen, setSelectedScreen] = useState("s1");
  const [currentAd, setCurrentAd] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(75);
  const [progress, setProgress] = useState(60);
  const { toast } = useToast();

  const screens = store.getAllScreens();
  const playlist = store.getCurrentPlaylist(selectedScreen);
  const screenStatus = store.getScreenStatus(selectedScreen);

  const handleScreenshot = async () => {
    try {
      await store.captureScreenshot(selectedScreen);
      toast({
        title: "Screenshot Captured",
        description: "Screenshot has been saved to logs",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to capture screenshot",
        variant: "destructive"
      });
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length > 0) {
      setCurrentAd((currentAd + 1) % playlist.length);
      setProgress(0);
    }
  };

  const getCurrentAd = () => {
    return playlist[currentAd];
  };

  const current = getCurrentAd();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-rad-grey-800 mb-4 sm:mb-0">
          Player Preview
        </h2>
        <div className="flex space-x-3">
          <Select value={selectedScreen} onValueChange={setSelectedScreen}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {screens.map(screen => (
                <SelectItem key={screen.id} value={screen.id}>
                  {screen.name} ({screen.alias})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleScreenshot}
            className="bg-rad-blue hover:bg-rad-blue/90"
            data-testid="button-screenshot"
          >
            <i className="fas fa-camera mr-2"></i>
            Screenshot
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Screen */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-black aspect-video relative">
                {current ? (
                  <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                    {/* Simulated ad display */}
                    <div className="text-center text-white">
                      <div className="w-full h-full bg-gradient-to-r from-rad-blue/20 to-rad-orange/20 flex items-center justify-center">
                        <div className="text-center">
                          <i className={`fas ${current.type === 'video' ? 'fa-play-circle' : 'fa-image'} text-6xl mb-4 text-white/80`}></i>
                          <h3 className="text-2xl font-bold mb-2">{current.title}</h3>
                          <p className="text-white/80">Simulated Ad Display</p>
                        </div>
                      </div>

                      {/* Overlay controls */}
                      <div className="absolute bottom-4 left-4 right-4 bg-black/60 rounded-lg p-3">
                        <div className="flex items-center justify-between text-white">
                          <span className="text-sm font-medium">{current.title}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-600 rounded-full h-1">
                              <div 
                                className="bg-rad-blue h-1 rounded-full transition-all duration-1000" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">
                              {Math.floor(current.duration * progress / 100)}s / {current.duration}s
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <i className="fas fa-tv text-4xl mb-4 text-white/50"></i>
                      <p className="text-white/80">No content scheduled</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Player Controls */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={handlePlayPause}
                    size="sm"
                    className="bg-rad-blue hover:bg-rad-blue/90"
                    data-testid="button-play-pause"
                  >
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    variant="outline"
                    size="sm"
                    disabled={playlist.length === 0}
                    data-testid="button-next"
                  >
                    <i className="fas fa-step-forward"></i>
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-rad-grey-600">Volume:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-20"
                    data-testid="slider-volume"
                  />
                  <span className="text-sm text-rad-grey-600 min-w-8">{volume}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Playlist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-rad-grey-800">
                Current Playlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {playlist.length === 0 ? (
                  <div className="text-center text-rad-grey-500 py-4">
                    <i className="fas fa-list text-2xl mb-2"></i>
                    <p>No ads scheduled</p>
                    <p className="text-sm">Check the scheduler to add content</p>
                  </div>
                ) : (
                  playlist.map((ad, index) => (
                    <div
                      key={ad.id}
                      className={`flex items-center space-x-3 p-2 rounded-lg transition-smooth ${
                        index === currentAd 
                          ? 'bg-rad-blue/10 border border-rad-blue/20' 
                          : 'hover:bg-rad-grey-50'
                      }`}
                      data-testid={`playlist-item-${index}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        index === currentAd 
                          ? 'bg-rad-blue animate-pulse' 
                          : 'bg-rad-grey-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-rad-grey-800">
                          {ad.title}
                        </p>
                        <p className="text-xs text-rad-grey-600">
                          {index === currentAd 
                            ? `Playing • ${ad.duration}s` 
                            : `${index < currentAd ? 'Played' : 'Up next'} • ${ad.duration}s`
                          }
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Screen Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-rad-grey-800">
                Screen Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-rad-grey-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    screenStatus.online 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {screenStatus.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-rad-grey-600">Brightness:</span>
                  <span className="text-sm font-medium text-rad-grey-800">
                    {screenStatus.brightness}/255
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-rad-grey-600">Temperature:</span>
                  <span className="text-sm font-medium text-rad-grey-800">
                    {screenStatus.temperature}°C
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-rad-grey-600">Uptime:</span>
                  <span className="text-sm font-medium text-rad-grey-800">
                    {screenStatus.uptime}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
