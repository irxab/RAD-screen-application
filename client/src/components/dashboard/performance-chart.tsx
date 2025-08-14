import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PerformanceChart() {
  return (
    <Card className="bg-white shadow-sm border border-rad-grey-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-rad-grey-800">
            Ad Performance
          </CardTitle>
          <Select defaultValue="7days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-64 bg-rad-grey-50 rounded-lg flex items-center justify-center border-2 border-dashed border-rad-grey-200">
          <div className="text-center">
            <i className="fas fa-chart-line text-3xl text-rad-grey-600 mb-2"></i>
            <p className="text-rad-grey-600 mb-1">Performance Chart</p>
            <p className="text-sm text-rad-grey-600">
              Chart visualization would be implemented here with a library like Chart.js or Recharts
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
