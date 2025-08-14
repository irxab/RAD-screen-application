import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export default function LogsTable() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [screenFilter, setScreenFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [screens, setScreens] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allScreens, allLogs] = await Promise.all([
          store.getAllScreens(),
          store.getLogs()
        ]);
        setScreens(allScreens);
        setLogs(allLogs);
      } catch (error) {
        console.error('Failed to load logs data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  const itemsPerPage = 10;

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesDateFrom = !dateFrom || log.timestamp >= dateFrom;
    const matchesDateTo = !dateTo || log.timestamp <= dateTo;
    const matchesScreen = screenFilter === "all" || log.screen === screenFilter;
    const matchesEventType = eventTypeFilter === "all" || log.type === eventTypeFilter;
    
    return matchesDateFrom && matchesDateTo && matchesScreen && matchesEventType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handleExportCSV = async () => {
    try {
      await store.exportLogs(filteredLogs);
      toast({
        title: "Export Successful",
        description: "Logs have been exported to CSV",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export logs",
        variant: "destructive"
      });
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'ad_play':
        return 'bg-blue-100 text-blue-800';
      case 'screenshot':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-rad-grey-800 mb-4 sm:mb-0">
          Activity Logs
        </h2>
        <Button 
          onClick={handleExportCSV}
          className="bg-rad-blue hover:bg-rad-blue/90"
          data-testid="button-export-csv"
        >
          <i className="fas fa-download mr-2"></i>
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-testid="input-date-from"
              />
            </div>
            
            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-testid="input-date-to"
              />
            </div>
            
            <div>
              <Label htmlFor="screen">Screen</Label>
              <Select value={screenFilter} onValueChange={setScreenFilter}>
                <SelectTrigger data-testid="select-screen-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Screens</SelectItem>
                  {screens.map(screen => (
                    <SelectItem key={screen.id} value={screen.name}>
                      {screen.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger data-testid="select-event-type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="ad_play">Ad Play</SelectItem>
                  <SelectItem value="screenshot">Screenshot</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-rad-grey-50 border-b border-rad-grey-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase tracking-wider">
                    Screen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-rad-grey-200">
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-rad-grey-500">
                        <i className="fas fa-list text-4xl mb-4"></i>
                        <p>No logs found</p>
                        <p className="text-sm">
                          {filteredLogs.length === 0 && logs.length > 0 
                            ? "Try adjusting your filters" 
                            : "Logs will appear here as activities occur"
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log, index) => (
                    <tr 
                      key={log.id || index}
                      className="hover:bg-rad-grey-50 transition-smooth"
                      data-testid={`log-row-${index}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-rad-grey-800">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(log.type)}`}>
                          {log.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-rad-grey-800">
                        {log.screen}
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-rad-grey-800 max-w-xs truncate">
                        {log.details}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-rad-grey-50 px-6 py-3 border-t border-rad-grey-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-rad-grey-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} results
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    data-testid="button-prev-page"
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={page === currentPage ? "bg-rad-blue" : ""}
                        data-testid={`button-page-${page}`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    data-testid="button-next-page"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
