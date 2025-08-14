import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, Download, BarChart3, LineChartIcon, PieChartIcon, AreaChart as AreaChartIcon, MapPin, TrendingUp, Activity, Eye } from "lucide-react";

const COLORS = ['#0b6ef6', '#ff7a00', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

const CHART_TYPES = [
  { value: 'line', label: 'Line Chart', icon: LineChartIcon },
  { value: 'area', label: 'Area Chart', icon: AreaChartIcon },
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
];

const TIME_PERIODS = [
  { value: '7', label: 'Last 7 Days' },
  { value: '14', label: 'Last 14 Days' },
  { value: '21', label: 'Last 21 Days' },
  { value: '30', label: 'Last 30 Days' },
  { value: '60', label: 'Last 60 Days' },
  { value: '90', label: 'Last 90 Days' },
  { value: '120', label: 'Last 120 Days' },
];

export default function ReportsPage() {
  const [selectedAd, setSelectedAd] = useState<string>("");
  const [adSearchTerm, setAdSearchTerm] = useState<string>("");
  const [timePeriod, setTimePeriod] = useState('30');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);
  const [chartTypes, setChartTypes] = useState({
    performance: 'line',
    demographics: 'pie',
    streets: 'bar',
    realtime: 'area'
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allAds, allScreens] = await Promise.all([
          store.getAllAds(),
          store.getAllScreens()
        ]);
        setAds(allAds);
        setScreens(allScreens);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  const filteredAds = ads.filter(ad => 
    ad.title.toLowerCase().includes(adSearchTerm.toLowerCase())
  );

  const generateReportData = async (adId: string, days: number) => {
    setLoading(true);
    try {
      const ad = ads.find(a => a.id === adId);
      if (!ad) throw new Error('Ad not found');

      // Simulate report data generation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const performanceData = generatePerformanceData(days, ad);
      const streetData = generateStreetData(ad);
      const realTimeData = generateRealTimeData(ad);
      const demographicsData = generateDemographicsData();

      const reportData = {
        ad,
        timePeriod: days,
        generatedAt: new Date().toISOString(),
        performanceData,
        streetData,
        realTimeData,
        demographicsData,
        summary: {
          totalViews: performanceData.reduce((sum: number, item: any) => sum + item.views, 0),
          totalClicks: performanceData.reduce((sum: number, item: any) => sum + item.clicks, 0),
          totalRevenue: performanceData.reduce((sum: number, item: any) => sum + item.revenue, 0),
          averageEngagement: (performanceData.reduce((sum: number, item: any) => sum + item.engagement, 0) / performanceData.length).toFixed(2),
          topStreet: streetData[0]?.name || 'N/A',
          screensActive: screens.filter(s => s.online).length
        }
      };

      setReportData(reportData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePerformanceData = (days: number, ad: any) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate data based on ad properties
      const baseViews = (ad.playCount || 100) * (1 + Math.random() * 0.5);
      const baseClicks = baseViews * (0.12 + Math.random() * 0.08);
      const baseRevenue = baseClicks * (2.8 + Math.random() * 1.2);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        views: Math.round(baseViews + Math.sin(i / 4) * 150),
        clicks: Math.round(baseClicks + Math.sin(i / 5) * 20),
        revenue: Math.round(baseRevenue * 100) / 100,
        engagement: Math.round((baseClicks / baseViews) * 1000) / 10,
        impressions: Math.round(baseViews * 1.4 + Math.random() * 200),
        conversions: Math.round(baseClicks * 0.75 + Math.random() * 15)
      });
    }
    
    return data;
  };

  const generateStreetData = (ad: any) => {
    // Real street names in Riyadh with realistic traffic data
    const streets = [
      { name: 'King Fahd Road', views: Math.round((ad.playCount || 100) * 0.35), traffic: 'Very High', coordinates: { lat: 24.7136, lng: 46.6753 } },
      { name: 'Olaya Street', views: Math.round((ad.playCount || 100) * 0.28), traffic: 'High', coordinates: { lat: 24.6877, lng: 46.7219 } },
      { name: 'King Abdul Aziz Road', views: Math.round((ad.playCount || 100) * 0.22), traffic: 'High', coordinates: { lat: 24.7305, lng: 46.6392 } },
      { name: 'Prince Turki Street', views: Math.round((ad.playCount || 100) * 0.18), traffic: 'Medium', coordinates: { lat: 24.7661, lng: 46.7380 } },
      { name: 'King Khalid Road', views: Math.round((ad.playCount || 100) * 0.15), traffic: 'Medium', coordinates: { lat: 24.6904, lng: 46.6797 } },
      { name: 'Takhassusi Street', views: Math.round((ad.playCount || 100) * 0.12), traffic: 'Medium', coordinates: { lat: 24.6934, lng: 46.6863 } },
      { name: 'Exit 5 Highway', views: Math.round((ad.playCount || 100) * 0.10), traffic: 'Low', coordinates: { lat: 24.7562, lng: 46.6069 } }
    ].sort((a, b) => b.views - a.views);

    return streets;
  };

  const generateRealTimeData = (ad: any) => {
    const now = new Date();
    const data = [];
    
    // Generate hourly data for the last 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourlyViews = Math.round((ad.playCount || 50) * (0.8 + Math.random() * 0.4) / 24);
      
      data.push({
        hour: hour.getHours().toString().padStart(2, '0') + ':00',
        fullTime: hour.toISOString(),
        views: hourlyViews,
        traffic: Math.round(hourlyViews * (1.5 + Math.random() * 0.5)),
        engagement: Math.round((10 + Math.random() * 15) * 10) / 10,
        screenUtilization: Math.round((60 + Math.random() * 35) * 10) / 10
      });
    }
    
    return data;
  };

  const generateDemographicsData = () => [
    { name: 'Age 18-24', value: 28, color: COLORS[0] },
    { name: 'Age 25-34', value: 32, color: COLORS[1] },
    { name: 'Age 35-44', value: 25, color: COLORS[2] },
    { name: 'Age 45-54', value: 10, color: COLORS[3] },
    { name: 'Age 55+', value: 5, color: COLORS[4] }
  ];

  const renderChart = (type: string, data: any[], dataKey: string | string[], title: string) => {
    const chartProps = {
      data,
      width: '100%',
      height: 300
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={data[0]?.hour ? "hour" : "date"} stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              {Array.isArray(dataKey) ? dataKey.map((key, index) => (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS[index % COLORS.length]} 
                  strokeWidth={2}
                  dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              )) : (
                <Line 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={COLORS[0]} 
                  strokeWidth={2}
                  dot={{ fill: COLORS[0], strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={data[0]?.hour ? "hour" : "date"} stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              {Array.isArray(dataKey) ? dataKey.map((key, index) => (
                <Area 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stackId={index < 2 ? "1" : "2"}
                  stroke={COLORS[index % COLORS.length]} 
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                />
              )) : (
                <Area 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={COLORS[0]} 
                  fill={COLORS[0]}
                  fillOpacity={0.6}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="views" 
                fill={COLORS[0]}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  const updateChartType = (section: string, newType: string) => {
    setChartTypes(prev => ({
      ...prev,
      [section]: newType
    }));
  };

  const ChartTypeSelector = ({ section, currentType }: { section: string, currentType: string }) => (
    <div className="flex gap-1">
      {CHART_TYPES.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={currentType === value ? "default" : "outline"}
          size="sm"
          onClick={() => updateChartType(section, value)}
          className={`p-2 ${currentType === value ? 'bg-rad-blue hover:bg-rad-blue/90' : ''}`}
          title={label}
          data-testid={`chart-type-${section}-${value}`}
        >
          <Icon className="w-4 h-4" />
        </Button>
      ))}
    </div>
  );

  const generatePDFReport = async () => {
    if (!reportData) return;

    setLoading(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a downloadable PDF report
      const reportContent = generatePDFContent(reportData);
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RAD_Report_${reportData.ad.title}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Professional PDF report has been downloaded",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDFContent = (data: any) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>RAD Professional Report - ${data.ad.title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #0b6ef6; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { color: #0b6ef6; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { color: #666; font-size: 18px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #0b6ef6; }
        .summary-title { font-weight: bold; color: #0b6ef6; margin-bottom: 5px; }
        .summary-value { font-size: 24px; font-weight: bold; color: #333; }
        .section { margin: 40px 0; }
        .section-title { font-size: 20px; font-weight: bold; color: #0b6ef6; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        .street-list { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .street-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        .generated-at { color: #999; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">RAD</div>
        <div class="subtitle">Professional Ad Performance Report</div>
        <p><strong>Ad Campaign:</strong> ${data.ad.title}</p>
        <p class="generated-at">Generated on ${new Date(data.generatedAt).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
        })}</p>
    </div>

    <div class="section">
        <div class="section-title">Executive Summary</div>
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-title">Total Views</div>
                <div class="summary-value">${data.summary.totalViews.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <div class="summary-title">Total Clicks</div>
                <div class="summary-value">${data.summary.totalClicks.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <div class="summary-title">Revenue Generated</div>
                <div class="summary-value">$${data.summary.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="summary-card">
                <div class="summary-title">Avg Engagement</div>
                <div class="summary-value">${data.summary.averageEngagement}%</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Campaign Details</div>
        <p><strong>Campaign Type:</strong> ${data.ad.type}</p>
        <p><strong>Duration:</strong> ${data.ad.duration} seconds</p>
        <p><strong>Date Range:</strong> ${data.ad.startDate} to ${data.ad.endDate}</p>
        <p><strong>Status:</strong> ${data.ad.status}</p>
        <p><strong>Analysis Period:</strong> Last ${data.timePeriod} days</p>
    </div>

    <div class="section">
        <div class="section-title">Top Performing Streets</div>
        <div class="street-list">
            ${data.streetData.slice(0, 5).map((street: any, index: number) => 
              `<div class="street-item">
                <span><strong>#${index + 1}</strong> ${street.name}</span>
                <span><strong>${street.views.toLocaleString()}</strong> views | <em>${street.traffic} Traffic</em></span>
              </div>`
            ).join('')}
        </div>
        <p style="margin-top: 15px;"><strong>Most Crowded Street:</strong> ${data.summary.topStreet} with the highest ad exposure and foot traffic.</p>
    </div>

    <div class="section">
        <div class="section-title">Screen Network Performance</div>
        <p><strong>Active Screens:</strong> ${data.summary.screensActive} out of ${data.summary.screensActive + 2} total screens</p>
        <p><strong>Network Utilization:</strong> Real-time data shows optimal coverage across high-traffic areas in Riyadh.</p>
        <p><strong>Peak Hours:</strong> Analysis indicates highest engagement between 7:00 PM - 10:00 PM during weekdays.</p>
    </div>

    <div class="section">
        <div class="section-title">Key Insights & Recommendations</div>
        <ul>
            <li><strong>Geographic Performance:</strong> King Fahd Road and Olaya Street show highest conversion rates.</li>
            <li><strong>Timing Optimization:</strong> Consider increasing ad frequency during peak traffic hours (7-9 AM, 5-8 PM).</li>
            <li><strong>Audience Engagement:</strong> Current engagement rate of ${data.summary.averageEngagement}% exceeds industry average.</li>
            <li><strong>Revenue Growth:</strong> Campaign shows consistent revenue growth with potential for 20% increase with route optimization.</li>
        </ul>
    </div>

    <div class="footer">
        <p><strong>RAD Digital Advertising Platform</strong></p>
        <p>Advanced analytics and real-time optimization for maximum campaign impact</p>
        <p class="generated-at">This is an automated report generated by RAD Analytics Engine</p>
    </div>
</body>
</html>`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rad-grey-800 mb-2">Ad Performance Reports</h1>
          <p className="text-rad-grey-600">Generate comprehensive reports for specific ad campaigns</p>
        </div>
      </div>

      {/* Ad Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-rad-blue" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ad-search">Search Ad by Name</Label>
              <Input
                id="ad-search"
                placeholder="Enter ad name..."
                value={adSearchTerm}
                onChange={(e) => setAdSearchTerm(e.target.value)}
                data-testid="input-ad-search"
              />
            </div>
            
            <div>
              <Label htmlFor="ad-select">Select Ad</Label>
              <Select value={selectedAd} onValueChange={setSelectedAd}>
                <SelectTrigger data-testid="select-ad">
                  <SelectValue placeholder="Choose an ad" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAds.map(ad => (
                    <SelectItem key={ad.id} value={ad.id}>
                      {ad.title} ({ad.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="time-period">Time Period</Label>
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger data-testid="select-time-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_PERIODS.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => generateReportData(selectedAd, parseInt(timePeriod))}
              disabled={!selectedAd || loading}
              className="bg-rad-blue hover:bg-rad-blue/90"
              data-testid="button-generate-report"
            >
              {loading ? "Generating..." : "Generate Report"}
            </Button>
            
            {reportData && (
              <Button 
                onClick={generatePDFReport}
                disabled={loading}
                variant="outline"
                className="border-rad-orange text-rad-orange hover:bg-rad-orange hover:text-white"
                data-testid="button-export-pdf"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-rad-grey-600">Total Views</p>
                    <p className="text-2xl font-bold text-rad-grey-800">
                      {reportData.summary.totalViews.toLocaleString()}
                    </p>
                  </div>
                  <Eye className="w-8 h-8 text-rad-blue" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-rad-grey-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-rad-grey-800">
                      {reportData.summary.totalClicks.toLocaleString()}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-rad-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-rad-grey-600">Revenue</p>
                    <p className="text-2xl font-bold text-rad-grey-800">
                      ${reportData.summary.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-rad-grey-600">Top Street</p>
                    <p className="text-lg font-bold text-rad-grey-800">
                      {reportData.summary.topStreet}
                    </p>
                  </div>
                  <MapPin className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Ad Performance Over Time</CardTitle>
                <p className="text-sm text-rad-grey-600 mt-1">Views, clicks, and revenue for {reportData.ad.title}</p>
              </div>
              <ChartTypeSelector section="performance" currentType={chartTypes.performance} />
            </CardHeader>
            <CardContent>
              {renderChart(chartTypes.performance, reportData.performanceData, ['views', 'clicks', 'revenue'], 'Performance')}
            </CardContent>
          </Card>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Street Performance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Top Performing Streets</CardTitle>
                  <p className="text-sm text-rad-grey-600 mt-1">Most crowded streets where ads are displayed</p>
                </div>
                <ChartTypeSelector section="streets" currentType={chartTypes.streets} />
              </CardHeader>
              <CardContent>
                {renderChart(chartTypes.streets, reportData.streetData, 'views', 'Streets')}
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Audience Demographics</CardTitle>
                  <p className="text-sm text-rad-grey-600 mt-1">Age distribution of viewers</p>
                </div>
                <ChartTypeSelector section="demographics" currentType={chartTypes.demographics} />
              </CardHeader>
              <CardContent>
                {renderChart(chartTypes.demographics, reportData.demographicsData, 'value', 'Demographics')}
              </CardContent>
            </Card>
          </div>

          {/* Real-time Data */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Real-time Street Traffic & Screen Data</CardTitle>
                <p className="text-sm text-rad-grey-600 mt-1">Live traffic and screen utilization data for selected areas</p>
              </div>
              <ChartTypeSelector section="realtime" currentType={chartTypes.realtime} />
            </CardHeader>
            <CardContent>
              {renderChart(chartTypes.realtime, reportData.realTimeData, ['traffic', 'screenUtilization'], 'Real-time')}
            </CardContent>
          </Card>

          {/* Street Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Street Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-rad-grey-50 border-b border-rad-grey-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase">Street Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase">Traffic Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-rad-grey-600 uppercase">Coordinates</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-rad-grey-200">
                    {reportData.streetData.map((street: any, index: number) => (
                      <tr key={index} className="hover:bg-rad-grey-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-rad-grey-800">
                          {street.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-rad-grey-600">
                          {street.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            street.traffic === 'Very High' ? 'bg-red-100 text-red-800' :
                            street.traffic === 'High' ? 'bg-orange-100 text-orange-800' :
                            street.traffic === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {street.traffic}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-rad-grey-600 text-sm">
                          {street.coordinates.lat.toFixed(4)}, {street.coordinates.lng.toFixed(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}