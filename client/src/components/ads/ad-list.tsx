import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import AdForm from "./ad-form";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function AdList() {
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const ads = store.getAllAds();
  
  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || ad.type === typeFilter;
    const matchesStatus = statusFilter === "all" || ad.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateAd = () => {
    setEditingAd(null);
    setShowForm(true);
  };

  const handleEditAd = (ad: any) => {
    setEditingAd(ad);
    setShowForm(true);
  };

  const handleDeleteAd = async (adId: string) => {
    if (window.confirm("Are you sure you want to delete this ad?")) {
      try {
        await store.deleteAd(adId);
        toast({
          title: "Ad Deleted",
          description: "The ad has been successfully deleted",
          variant: "default"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete ad",
          variant: "destructive"
        });
      }
    }
  };

  const handleFormSubmit = async (adData: any) => {
    try {
      if (editingAd) {
        await store.updateAd(editingAd.id, adData);
        toast({
          title: "Ad Updated",
          description: "The ad has been successfully updated",
          variant: "default"
        });
      } else {
        await store.createAd(adData);
        toast({
          title: "Ad Created", 
          description: "The ad has been successfully created",
          variant: "default"
        });
      }
      setShowForm(false);
      setEditingAd(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save ad",
        variant: "destructive"
      });
    }
  };

  if (showForm) {
    return (
      <AdForm
        ad={editingAd}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingAd(null);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-rad-grey-800 mb-4 sm:mb-0">
          Ad Management
        </h2>
        <Button 
          onClick={handleCreateAd}
          className="bg-rad-blue hover:bg-rad-blue/90"
          data-testid="button-create-ad"
        >
          <i className="fas fa-plus mr-2"></i>
          Create Ad
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search ads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-ads"
              />
            </div>
            <div className="flex space-x-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ads Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-rad-grey-50 border-b border-rad-grey-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase tracking-wider">
                    Ad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase tracking-wider">
                    Plays
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-rad-grey-200">
                {filteredAds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-rad-grey-500">
                        <i className="fas fa-rectangle-ad text-4xl mb-4"></i>
                        <p>No ads found</p>
                        <p className="text-sm">Create your first ad to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAds.map((ad) => (
                    <tr 
                      key={ad.id}
                      className="hover:bg-rad-grey-50 transition-smooth"
                      data-testid={`ad-row-${ad.id}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-8 bg-rad-grey-200 rounded object-cover mr-3 flex items-center justify-center">
                            <i className={`fas ${ad.type === 'video' ? 'fa-play' : 'fa-image'} text-rad-grey-400`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-rad-grey-800">
                              {ad.title}
                            </p>
                            <p className="text-xs text-rad-grey-600">
                              {ad.startDate} - {ad.endDate}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ad.type === 'video' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ad.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-rad-grey-800">
                        {ad.duration}s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-rad-grey-800">
                        {ad.playCount || 0}/{ad.countLimit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ad.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : ad.status === 'scheduled'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditAd(ad)}
                          className="text-rad-blue hover:text-rad-blue/80 transition-smooth"
                          data-testid={`button-edit-${ad.id}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="text-red-600 hover:text-red-800 transition-smooth"
                          data-testid={`button-delete-${ad.id}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
