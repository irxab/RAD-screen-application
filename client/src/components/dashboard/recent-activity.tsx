import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/store";

export default function RecentActivity() {
  const activities = store.getRecentActivity();

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'ad_upload': return 'bg-rad-blue';
      case 'screen_online': return 'bg-green-500';
      case 'schedule_update': return 'bg-rad-orange';
      case 'review_pending': return 'bg-yellow-500';
      default: return 'bg-rad-grey-400';
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-rad-grey-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-rad-grey-800">
          Recent Activity
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3" data-testid={`activity-${index}`}>
              <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`}></div>
              <div className="flex-1">
                <p className="text-sm text-rad-grey-800">{activity.message}</p>
                <p className="text-xs text-rad-grey-600">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full mt-4 text-rad-blue hover:text-rad-blue/80"
          data-testid="view-all-activity"
        >
          View all activity
        </Button>
      </CardContent>
    </Card>
  );
}
