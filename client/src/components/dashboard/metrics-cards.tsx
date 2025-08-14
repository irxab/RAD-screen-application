import { Card, CardContent } from "@/components/ui/card";
import { store } from "@/lib/store";

export default function MetricsCards() {
  const metrics = store.getDashboardMetrics();

  const cards = [
    {
      title: "Active Ads",
      value: metrics.activeAds,
      icon: "fas fa-rectangle-ad",
      color: "bg-blue-100 text-blue-600",
      trend: "+12% vs last week",
      trendColor: "text-green-600"
    },
    {
      title: "Plays Today", 
      value: metrics.playsToday.toLocaleString(),
      icon: "fas fa-play",
      color: "bg-green-100 text-green-600",
      trend: "+8% vs yesterday",
      trendColor: "text-green-600"
    },
    {
      title: "Active Screens",
      value: metrics.activeScreens,
      icon: "fas fa-tv", 
      color: "bg-orange-100 text-orange-600",
      trend: "2 offline",
      trendColor: "text-rad-grey-600"
    },
    {
      title: "Pending Reviews",
      value: metrics.pendingReviews,
      icon: "fas fa-clock",
      color: "bg-yellow-100 text-yellow-600", 
      trend: "Requires attention",
      trendColor: "text-rad-orange"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card 
          key={index}
          className="bg-white shadow-sm border border-rad-grey-200 hover:shadow-md transition-smooth"
          data-testid={`metric-card-${card.title.toLowerCase().replace(' ', '-')}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-rad-grey-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-rad-grey-800">
                  {card.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                <i className={card.icon}></i>
              </div>
            </div>
            <div className="mt-4">
              <span className={`text-xs font-medium ${card.trendColor}`}>
                {card.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
