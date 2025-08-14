import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface AdFormProps {
  ad?: any;
  onSubmit: (adData: any) => void;
  onCancel: () => void;
}

export default function AdForm({ ad, onSubmit, onCancel }: AdFormProps) {
  const [formData, setFormData] = useState({
    title: ad?.title || "",
    type: ad?.type || "image",
    duration: ad?.duration || 15,
    countLimit: ad?.countLimit || 100,
    startDate: ad?.startDate || new Date().toISOString().split('T')[0],
    endDate: ad?.endDate || "",
    timeWindows: ad?.timeWindows || [{ start: "08:00", end: "18:00" }],
    description: ad?.description || "",
    asset: ad?.asset || null
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: formData.startDate <= new Date().toISOString().split('T')[0] ? 'active' : 'scheduled'
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate file upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would upload to a server
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({
        ...prev,
        asset: {
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result
        }
      }));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const addTimeWindow = () => {
    setFormData(prev => ({
      ...prev,
      timeWindows: [...prev.timeWindows, { start: "08:00", end: "18:00" }]
    }));
  };

  const removeTimeWindow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timeWindows: prev.timeWindows.filter((_, i) => i !== index)
    }));
  };

  const updateTimeWindow = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      timeWindows: prev.timeWindows.map((window, i) => 
        i === index ? { ...window, [field]: value } : window
      )
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-rad-grey-800">
          {ad ? "Edit Ad" : "Create New Ad"}
        </h2>
        <Button variant="outline" onClick={onCancel} data-testid="button-cancel">
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Ad Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter ad title"
                  required
                  data-testid="input-title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter ad description"
                  data-testid="textarea-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger data-testid="select-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="300"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    required
                    data-testid="input-duration"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="countLimit">Play Limit</Label>
                <Input
                  id="countLimit"
                  type="number"
                  min="1"
                  value={formData.countLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, countLimit: parseInt(e.target.value) }))}
                  required
                  data-testid="input-count-limit"
                />
              </div>
            </CardContent>
          </Card>

          {/* Asset Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Asset Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="asset">Upload File</Label>
                  <div className="mt-2">
                    <div className="border-2 border-dashed border-rad-grey-300 rounded-lg p-6 text-center hover:border-rad-grey-400 transition-smooth">
                      <input
                        type="file"
                        id="asset"
                        accept={formData.type === 'video' ? 'video/*' : 'image/*'}
                        onChange={handleFileUpload}
                        className="hidden"
                        data-testid="input-file-upload"
                      />
                      <label 
                        htmlFor="asset" 
                        className="cursor-pointer"
                      >
                        {isUploading ? (
                          <div>
                            <i className="fas fa-spinner fa-spin text-2xl text-rad-blue mb-2"></i>
                            <p className="text-sm text-rad-grey-600">Uploading...</p>
                          </div>
                        ) : formData.asset ? (
                          <div>
                            <i className="fas fa-check-circle text-2xl text-green-600 mb-2"></i>
                            <p className="text-sm font-medium text-rad-grey-800">{formData.asset.name}</p>
                            <p className="text-xs text-rad-grey-600">
                              {(formData.asset.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div>
                            <i className="fas fa-cloud-upload-alt text-2xl text-rad-grey-400 mb-2"></i>
                            <p className="text-sm text-rad-grey-600">
                              Drop {formData.type} file here or click to browse
                            </p>
                            <p className="text-xs text-rad-grey-500">
                              Max file size: 50MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    data-testid="input-start-date"
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    data-testid="input-end-date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Windows */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Time Windows</CardTitle>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={addTimeWindow}
                  data-testid="button-add-time-window"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Window
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.timeWindows.map((window, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={window.start}
                    onChange={(e) => updateTimeWindow(index, 'start', e.target.value)}
                    data-testid={`input-time-start-${index}`}
                  />
                  <span className="text-rad-grey-600">to</span>
                  <Input
                    type="time"
                    value={window.end}
                    onChange={(e) => updateTimeWindow(index, 'end', e.target.value)}
                    data-testid={`input-time-end-${index}`}
                  />
                  {formData.timeWindows.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeTimeWindow(index)}
                      data-testid={`button-remove-time-window-${index}`}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-rad-blue hover:bg-rad-blue/90"
            data-testid="button-submit"
          >
            {ad ? "Update Ad" : "Create Ad"}
          </Button>
        </div>
      </form>
    </div>
  );
}
