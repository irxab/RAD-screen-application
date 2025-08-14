import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface SettingsPanelProps {
  showDebug?: boolean;
}

export default function SettingsPanel({ showDebug = false }: SettingsPanelProps) {
  const [brightness, setBrightness] = useState(185);
  const [autoBrightness, setAutoBrightness] = useState(true);
  const [manualOverride, setManualOverride] = useState(false);
  const [targetVersion, setTargetVersion] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [driverForm, setDriverForm] = useState({
    name: "",
    phone: "",
    alias: ""
  });
  const { toast } = useToast();

  const handleBrightnessChange = async (value: number) => {
    setBrightness(value);
    try {
      await store.updateBrightness('s1', value);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update brightness",
        variant: "destructive"
      });
    }
  };

  const handlePackageUpload = async () => {
    if (!targetVersion.trim()) {
      toast({
        title: "Version Required",
        description: "Please enter a target version",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      await store.simulatePackageUpload(targetVersion);
      toast({
        title: "Upload Simulated",
        description: `Package upgrade to ${targetVersion} simulated successfully`,
        variant: "default"
      });
      setTargetVersion("");
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to simulate package upload",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driverForm.name || !driverForm.phone || !driverForm.alias) {
      toast({
        title: "All Fields Required",
        description: "Please fill in all driver information fields",
        variant: "destructive"
      });
      return;
    }

    try {
      await store.bindDriver(driverForm);
      toast({
        title: "Driver Bound",
        description: `Driver ${driverForm.name} has been successfully bound`,
        variant: "default"
      });
      setDriverForm({ name: "", phone: "", alias: "" });
    } catch (error) {
      toast({
        title: "Binding Failed",
        description: "Failed to bind driver",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: "File Selected",
        description: `${file.name} selected for upload simulation`,
        variant: "default"
      });
    }
  };

  // Debug functions
  const handleResetDatabase = async () => {
    if (window.confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      try {
        await store.resetDatabase();
      } catch (error) {
        toast({
          title: "Reset Failed",
          description: "Failed to reset database",
          variant: "destructive"
        });
      }
    }
  };

  const handleLoadSampleData = async () => {
    try {
      await store.loadSampleData();
    } catch (error) {
      toast({
        title: "Load Failed",
        description: "Failed to load sample data",
        variant: "destructive"
      });
    }
  };

  const handleRunDemo = async () => {
    try {
      await store.runDemoSimulation();
      toast({
        title: "Demo Complete",
        description: "Demo simulation has been completed. Check logs for details.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Demo Failed",
        description: "Failed to run demo simulation",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-rad-grey-800 mb-6">
        {showDebug ? "Debug Panel" : "Settings"}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Display Settings */}
        {!showDebug && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-rad-grey-800">
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Brightness Control */}
              <div>
                <Label htmlFor="brightness" className="text-sm font-medium text-rad-grey-700 mb-2 block">
                  Brightness Level
                </Label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    id="brightness"
                    min="1"
                    max="255"
                    value={brightness}
                    onChange={(e) => handleBrightnessChange(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-rad-grey-200 rounded-lg appearance-none cursor-pointer"
                    data-testid="slider-brightness"
                  />
                  <span className="text-sm font-medium text-rad-grey-800 min-w-12">
                    {brightness}
                  </span>
                </div>
              </div>

              {/* Auto Brightness */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-rad-grey-700">
                    Auto Brightness
                  </Label>
                  <p className="text-xs text-rad-grey-600">
                    Automatically adjust based on ambient light
                  </p>
                </div>
                <Switch
                  checked={autoBrightness}
                  onCheckedChange={setAutoBrightness}
                  data-testid="switch-auto-brightness"
                />
              </div>

              {/* Manual Override */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-rad-grey-700">
                    Manual Override
                  </Label>
                  <p className="text-xs text-rad-grey-600">
                    Allow manual brightness control
                  </p>
                </div>
                <Switch
                  checked={manualOverride}
                  onCheckedChange={setManualOverride}
                  data-testid="switch-manual-override"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Updates */}
        {!showDebug && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-rad-grey-800">
                System Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Version */}
              <div>
                <Label className="text-sm font-medium text-rad-grey-700 mb-2 block">
                  Current Version
                </Label>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-rad-grey-800 bg-rad-grey-50 px-3 py-2 rounded-lg">
                    v2.4.1
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Up to date
                  </span>
                </div>
              </div>

              {/* Package Upload */}
              <div>
                <Label className="text-sm font-medium text-rad-grey-700 mb-2 block">
                  Upload New Version
                </Label>
                <div className="border-2 border-dashed border-rad-grey-300 rounded-lg p-4 text-center hover:border-rad-grey-400 transition-smooth">
                  <input
                    type="file"
                    accept=".zip,.tar.gz"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="package-upload"
                    data-testid="input-package-upload"
                  />
                  <label htmlFor="package-upload" className="cursor-pointer">
                    <i className="fas fa-cloud-upload-alt text-2xl text-rad-grey-400 mb-2"></i>
                    <p className="text-sm text-rad-grey-600">
                      Drop package file here or click to browse
                    </p>
                    <p className="text-xs text-rad-grey-500">
                      Supports .zip and .tar.gz files
                    </p>
                  </label>
                </div>
              </div>

              {/* Version Input */}
              <div>
                <Label htmlFor="targetVersion" className="text-sm font-medium text-rad-grey-700 mb-2 block">
                  Target Version
                </Label>
                <Input
                  id="targetVersion"
                  type="text"
                  placeholder="e.g., v2.5.0"
                  value={targetVersion}
                  onChange={(e) => setTargetVersion(e.target.value)}
                  data-testid="input-target-version"
                />
              </div>

              <Button
                onClick={handlePackageUpload}
                disabled={isUploading}
                className="w-full bg-rad-orange hover:bg-rad-orange/90"
                data-testid="button-simulate-upload"
              >
                {isUploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Uploading...
                  </>
                ) : (
                  "Simulate Upload"
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Driver Binding */}
        {!showDebug && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-rad-grey-800">
                Driver Binding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDriverSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="driverName" className="text-sm font-medium text-rad-grey-700 mb-2 block">
                    Driver Name
                  </Label>
                  <Input
                    id="driverName"
                    type="text"
                    placeholder="Enter driver name"
                    value={driverForm.name}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-driver-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="driverPhone" className="text-sm font-medium text-rad-grey-700 mb-2 block">
                    Phone Number
                  </Label>
                  <Input
                    id="driverPhone"
                    type="tel"
                    placeholder="+966 5XX XXX XXX"
                    value={driverForm.phone}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                    data-testid="input-driver-phone"
                  />
                </div>
                
                <div>
                  <Label htmlFor="driverAlias" className="text-sm font-medium text-rad-grey-700 mb-2 block">
                    Driver Alias
                  </Label>
                  <Input
                    id="driverAlias"
                    type="text"
                    placeholder="e.g., Driver-001"
                    value={driverForm.alias}
                    onChange={(e) => setDriverForm(prev => ({ ...prev, alias: e.target.value }))}
                    data-testid="input-driver-alias"
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-rad-blue hover:bg-rad-blue/90"
                  data-testid="button-bind-driver"
                >
                  Bind Driver
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Debug Panel */}
        {showDebug && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-rad-grey-800">
                Development Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleResetDatabase}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  data-testid="button-reset-database"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Reset Database
                </Button>
                
                <Button
                  onClick={handleLoadSampleData}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-load-sample-data"
                >
                  <i className="fas fa-database mr-2"></i>
                  Load Sample Data
                </Button>
                
                <Button
                  onClick={handleRunDemo}
                  className="bg-rad-orange hover:bg-rad-orange/90 text-white"
                  data-testid="button-run-demo"
                >
                  <i className="fas fa-play mr-2"></i>
                  Run Demo Simulation
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Debug Information</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Storage:</strong> localStorage (RAD_DB)</p>
                  <p><strong>Current User:</strong> {store.getCurrentUser()?.name || 'None'}</p>
                  <p><strong>Data Status:</strong> Persistent in browser</p>
                  <p><strong>Access Debug:</strong> Navigate to #debug in URL</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Warning</h4>
                <p className="text-sm text-yellow-700">
                  Reset Database will permanently delete all data including ads, schedules, and logs. 
                  This action cannot be undone.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
