import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/store";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, TrendingUp, Eye, Activity, BarChart3, LineChartIcon, PieChartIcon, AreaChart as AreaChartIcon } from "lucide-react";

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

export default function EnhancedDashboard() {
  const [metrics, setMetrics] = useState<any>({});
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [timePeriod, setTimePeriod] = useState('30');
  const [chartTypes, setChartTypes] = useState({
    performance: 'line',
    demographics: 'pie',
    engagement: 'bar',
    revenue: 'area'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const dashboardMetrics = store.getDashboardMetrics();
        const performanceData = generatePerformanceData(parseInt(timePeriod));
        
        setMetrics(dashboardMetrics);
        setPerformanceData(performanceData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [timePeriod]);

  const generatePerformanceData = (days: number) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic data with some variance
      const baseViews = 1200 + Math.random() * 800;
      const baseClicks = baseViews * (0.15 + Math.random() * 0.1);
      const baseRevenue = baseClicks * (2.5 + Math.random() * 1.5);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        views: Math.round(baseViews + Math.sin(i / 3) * 200),
        clicks: Math.round(baseClicks + Math.sin(i / 4) * 30),
        revenue: Math.round(baseRevenue * 100) / 100,
        engagement: Math.round((baseClicks / baseViews) * 1000) / 10,
        impressions: Math.round(baseViews * 1.3 + Math.random() * 300),
        conversions: Math.round(baseClicks * 0.8 + Math.random() * 20)
      });
    }
    
    return data;
  };

  const generateDemographicsData = () => [
    { name: 'Age 18-24', value: 25, color: COLORS[0] },
    { name: 'Age 25-34', value: 35, color: COLORS[1] },
    { name: 'Age 35-44', value: 22, color: COLORS[2] },
    { name: 'Age 45-54', value: 12, color: COLORS[3] },
    { name: 'Age 55+', value: 6, color: COLORS[4] }
  ];

  const generateEngagementData = () => {
    return performanceData.slice(-7).map(item => ({
      day: item.date,
      likes: Math.round(item.clicks * 0.6 + Math.random() * 50),
      shares: Math.round(item.clicks * 0.3 + Math.random() * 30),
      comments: Math.round(item.clicks * 0.2 + Math.random() * 20),
      saves: Math.round(item.clicks * 0.4 + Math.random() * 40)
    }));
  };

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
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
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
                  activeDot={{ r: 6, stroke: COLORS[index % COLORS.length] }}
                />
              )) : (
                <Line 
                  type="monotone" 
                  dataKey={dataKey} 
                  stroke={COLORS[0]} 
                  strokeWidth={2}
                  dot={{ fill: COLORS[0], strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: COLORS[0] }}
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
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
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
              <XAxis dataKey={data[0]?.day ? "day" : "date"} stroke="#64748b" fontSize={12} />
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
                <Bar 
                  key={key}
                  dataKey={key} 
                  fill={COLORS[index % COLORS.length]}
                  radius={[2, 2, 0, 0]}
                />
              )) : (
                <Bar 
                  dataKey={dataKey} 
                  fill={COLORS[0]}
                  radius={[2, 2, 0, 0]}
                />
              )}
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-rad-grey-600">Loading enhanced dashboard...</div>
      </div>
    );
  }

  const demographicsData = generateDemographicsData();
  const engagementData = generateEngagementData();

  return (
    <div className="space-y-6">
      {/* Header with Time Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rad-grey-800 mb-2">Enhanced Dashboard</h1>
          <p className="text-rad-grey-600">Comprehensive analytics with flexible visualization</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-48" data-testid="select-time-period">
              <SelectValue placeholder="Select time period" />
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

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rad-grey-600">Total Views</p>
                <p className="text-2xl font-bold text-rad-grey-800">
                  {performanceData.reduce((sum, item) => sum + item.views, 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">+12.5% vs previous period</p>
              </div>
              <div className="p-3 bg-rad-blue/10 rounded-full">
                <Eye className="w-6 h-6 text-rad-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rad-grey-600">Total Clicks</p>
                <p className="text-2xl font-bold text-rad-grey-800">
                  {performanceData.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">+8.3% vs previous period</p>
              </div>
              <div className="p-3 bg-rad-orange/10 rounded-full">
                <Play className="w-6 h-6 text-rad-orange" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rad-grey-600">Revenue</p>
                <p className="text-2xl font-bold text-rad-grey-800">
                  ${performanceData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">+15.7% vs previous period</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rad-grey-600">Avg Engagement</p>
                <p className="text-2xl font-bold text-rad-grey-800">
                  {(performanceData.reduce((sum, item) => sum + item.engagement, 0) / performanceData.length).toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 mt-1">+2.1% vs previous period</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">Ad Performance Over Time</CardTitle>
            <p className="text-sm text-rad-grey-600 mt-1">Daily performance metrics for the selected period</p>
          </div>
          <ChartTypeSelector section="performance" currentType={chartTypes.performance} />
        </CardHeader>
        <CardContent>
          {renderChart(chartTypes.performance, performanceData, ['views', 'clicks', 'revenue'], 'Performance')}
        </CardContent>
      </Card>

      {/* Two-column layout for smaller charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographics Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Audience Demographics</CardTitle>
              <p className="text-sm text-rad-grey-600 mt-1">Age distribution of your audience</p>
            </div>
            <ChartTypeSelector section="demographics" currentType={chartTypes.demographics} />
          </CardHeader>
          <CardContent>
            {renderChart(chartTypes.demographics, demographicsData, 'value', 'Demographics')}
          </CardContent>
        </Card>

        {/* Engagement Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Engagement Metrics</CardTitle>
              <p className="text-sm text-rad-grey-600 mt-1">Social interactions over the last 7 days</p>
            </div>
            <ChartTypeSelector section="engagement" currentType={chartTypes.engagement} />
          </CardHeader>
          <CardContent>
            {renderChart(chartTypes.engagement, engagementData, ['likes', 'shares', 'comments', 'saves'], 'Engagement')}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">Revenue Analysis</CardTitle>
            <p className="text-sm text-rad-grey-600 mt-1">Revenue trends and conversion metrics</p>
          </div>
          <ChartTypeSelector section="revenue" currentType={chartTypes.revenue} />
        </CardHeader>
        <CardContent>
          {renderChart(chartTypes.revenue, performanceData, ['revenue', 'conversions'], 'Revenue')}
        </CardContent>
      </Card>
    </div>
  );
}