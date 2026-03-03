import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Flame, 
  Zap, 
  ChefHat,
  Star,
  Activity
} from "lucide-react";

interface QuickStatsProps {
  className?: string;
}

export function QuickStats({ className = "" }: QuickStatsProps) {
  const [stats, setStats] = useState({
    kitchenLoad: 75,
    flashSalesActive: 2,
    groupCartsActive: 1,
    expressItemsReady: 7,
    avgWaitTime: 12,
    todayOrders: 45,
    popularItem: "Samosa",
    customerSatisfaction: 4.8
  });

  const [liveUpdates, setLiveUpdates] = useState({
    lastOrderTime: "2 min ago",
    nextFlashSale: "5 min",
    kitchenStatus: "Busy but efficient! 🔥"
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        kitchenLoad: Math.max(40, Math.min(95, prev.kitchenLoad + (Math.random() - 0.5) * 10)),
        avgWaitTime: Math.max(5, Math.min(20, prev.avgWaitTime + (Math.random() - 0.5) * 3)),
        todayOrders: prev.todayOrders + (Math.random() > 0.7 ? 1 : 0)
      }));
      
      setLiveUpdates(prev => ({
        ...prev,
        lastOrderTime: Math.random() > 0.5 ? "1 min ago" : "3 min ago",
        kitchenStatus: Math.random() > 0.5 ? "Running smoothly! ✨" : "High demand period! 🔥"
      }));
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const getKitchenLoadColor = (load: number) => {
    if (load < 50) return "text-green-600 bg-green-50";
    if (load < 80) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getKitchenLoadStatus = (load: number) => {
    if (load < 50) return "Light Load";
    if (load < 80) return "Optimal";
    return "High Demand";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Live Status Banner */}
      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Status</span>
            </div>
            <Badge variant="outline" className="bg-white">
              {liveUpdates.kitchenStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kitchen Load */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <ChefHat className="h-4 w-4 text-orange-500" />
              <Badge className={getKitchenLoadColor(stats.kitchenLoad)}>
                {getKitchenLoadStatus(stats.kitchenLoad)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{Math.round(stats.kitchenLoad)}%</p>
              <p className="text-xs text-muted-foreground">Kitchen Load</p>
            </div>
          </CardContent>
        </Card>

        {/* Average Wait Time */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <Badge variant="outline" className="text-xs">
                Last: {liveUpdates.lastOrderTime}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{Math.round(stats.avgWaitTime)}m</p>
              <p className="text-xs text-muted-foreground">Avg Wait Time</p>
            </div>
          </CardContent>
        </Card>

        {/* Flash Sales */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Flame className="h-4 w-4 text-red-500" />
              {stats.flashSalesActive > 0 && (
                <Badge className="bg-red-100 text-red-800 animate-pulse">
                  Active
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.flashSalesActive}</p>
              <p className="text-xs text-muted-foreground">Flash Sales</p>
            </div>
          </CardContent>
        </Card>

        {/* Today's Orders */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <Badge variant="outline" className="text-xs">
                +5 from yesterday
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{stats.todayOrders}</p>
              <p className="text-xs text-muted-foreground">Today's Orders</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Express Menu</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">
                Ready
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {stats.expressItemsReady} items ready in ≤5 minutes
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-xs text-muted-foreground">85%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="font-medium">Group Orders</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                {stats.groupCartsActive} Active
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Collaborative ordering in progress
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                <span>8 people participating</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Item & Rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-green-600 fill-current" />
                <span className="font-medium">Most Popular</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                Today
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold">{stats.popularItem}</p>
              <p className="text-sm text-green-700">43 orders today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-600 fill-current" />
                <span className="font-medium">Satisfaction</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                Excellent
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold">{stats.customerSatisfaction}/5.0</p>
              <p className="text-sm text-blue-700">Based on 127 reviews</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}