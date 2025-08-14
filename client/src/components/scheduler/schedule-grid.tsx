import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function ScheduleGrid() {
  const [selectedScreen, setSelectedScreen] = useState("all");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { toast } = useToast();

  const ads = store.getAllAds().filter(ad => ad.status === 'active');
  const screens = store.getAllScreens();
  const schedule = store.getSchedule(selectedScreen);

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleSaveSchedule = async () => {
    try {
      await store.saveSchedule(selectedScreen, schedule);
      toast({
        title: "Schedule Saved",
        description: "Schedule has been successfully updated",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive"
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, ad: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(ad));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = async (e: React.DragEvent, time: string, day: string) => {
    e.preventDefault();
    try {
      const adData = JSON.parse(e.dataTransfer.getData("application/json"));
      await store.addToSchedule(selectedScreen, { 
        adId: adData.id, 
        time, 
        day,
        ad: adData 
      });
      
      toast({
        title: "Ad Scheduled",
        description: `${adData.title} added to ${day} at ${time}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add ad to schedule",
        variant: "destructive"
      });
    }
  };

  const getScheduledAd = (time: string, day: string) => {
    return schedule.find(item => 
      item.time === time && 
      item.day.toLowerCase() === day.toLowerCase()
    );
  };

  const removeFromSchedule = async (time: string, day: string) => {
    try {
      await store.removeFromSchedule(selectedScreen, time, day);
      toast({
        title: "Ad Removed",
        description: "Ad removed from schedule",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to remove ad",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-rad-grey-800 mb-4 sm:mb-0">
          Schedule Management
        </h2>
        <div className="flex space-x-3">
          <Select value={selectedScreen} onValueChange={setSelectedScreen}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Screens</SelectItem>
              {screens.map(screen => (
                <SelectItem key={screen.id} value={screen.id}>
                  {screen.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleSaveSchedule}
            className="bg-rad-blue hover:bg-rad-blue/90"
            data-testid="button-save-schedule"
          >
            Save Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Available Ads Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-rad-grey-800">
                Available Ads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ads.length === 0 ? (
                  <div className="text-center text-rad-grey-500 py-8">
                    <i className="fas fa-rectangle-ad text-3xl mb-2"></i>
                    <p>No active ads</p>
                    <p className="text-sm">Create some ads to get started</p>
                  </div>
                ) : (
                  ads.map(ad => (
                    <div
                      key={ad.id}
                      className="p-3 border border-rad-grey-200 rounded-lg cursor-move hover:shadow-md transition-smooth"
                      draggable
                      onDragStart={(e) => handleDragStart(e, ad)}
                      data-testid={`draggable-ad-${ad.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-6 bg-rad-grey-200 rounded flex items-center justify-center">
                          <i className={`fas ${ad.type === 'video' ? 'fa-play' : 'fa-image'} text-xs text-rad-grey-400`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-rad-grey-800 truncate">
                            {ad.title}
                          </p>
                          <p className="text-xs text-rad-grey-600">
                            {ad.duration}s
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-rad-grey-800">
                  Weekly Schedule
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
                    data-testid="button-prev-week"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </Button>
                  <span className="px-3 py-2 text-sm font-medium text-rad-grey-800">
                    {currentWeek.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })} - {new Date(currentWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric'
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
                    data-testid="button-next-week"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-8 gap-1 min-w-full">
                  {/* Header row */}
                  <div className="text-xs font-medium text-rad-grey-600 p-2"></div>
                  {weekDays.map(day => (
                    <div key={day} className="text-xs font-medium text-rad-grey-600 p-2 text-center">
                      {day}
                    </div>
                  ))}

                  {/* Time slots */}
                  {timeSlots.map(time => (
                    <>
                      <div key={`time-${time}`} className="text-xs text-rad-grey-600 p-2 border-r border-rad-grey-200">
                        {time}
                      </div>
                      {weekDays.map(day => {
                        const scheduledAd = getScheduledAd(time, day);
                        return (
                          <div
                            key={`${time}-${day}`}
                            className="p-1 border border-rad-grey-200 min-h-12 bg-rad-grey-50 hover:bg-rad-grey-100 transition-smooth relative"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, time, day)}
                            data-testid={`schedule-slot-${time}-${day}`}
                          >
                            {scheduledAd && (
                              <div 
                                className="bg-rad-blue/20 text-rad-blue text-xs p-1 rounded relative group cursor-pointer"
                                onClick={() => removeFromSchedule(time, day)}
                              >
                                <span className="truncate block">{scheduledAd.ad?.title}</span>
                                <button className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-red-600 text-xs">
                                  <i className="fas fa-times"></i>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
