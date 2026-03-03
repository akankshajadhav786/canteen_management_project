import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { 
  Users,
  Clock,
  Zap,
  Flame,
  Timer,
  ShoppingCart,
  ChefHat,
  Star,
  Calendar,
  Bell,
  Activity
} from "lucide-react";
import { User, localApi } from "../utils/local/storage";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { AdminQuickActions } from "./AdminQuickActions";
import { ViewOrderStatus } from "./ViewOrderStatus";
import { KitchenDashboard } from "./KitchenDashboard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface DashboardProps {
  user: User;
  accessToken: string;
  onOpenAdminDashboard?: (tab?: 'overview' | 'menu' | 'orders' | 'analytics' | 'flashsale' | 'inventory') => void;
}

export function Dashboard({ user, accessToken, onOpenAdminDashboard }: DashboardProps) {
  const [stats, setStats] = useState({
    activeOrders: 0,
    todayOrders: 12,
    weeklyRevenue: 2340,
    popularItem: "Samosa",
    flashSalesActive: 2,
    groupCartsActive: 1,
    preordersScheduled: 5,
    kitchenLoadPercentage: 75
  });

  // Modal states
  const [isViewOrdersOpen, setIsViewOrdersOpen] = useState(false);
  const [isKitchenDashboardOpen, setIsKitchenDashboardOpen] = useState(false);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "flash_sale",
      message: "Flash Sale started: 20% off Samosa",
      time: "2 minutes ago",
      icon: Flame
    },
    {
      id: 2,
      type: "group_cart",
      message: "3 members joined group cart #GC789",
      time: "5 minutes ago",
      icon: Users
    },
    {
      id: 3,
      type: "preorder",
      message: "Preorder scheduled for Chicken Curry at 2:00 PM",
      time: "8 minutes ago",
      icon: Timer
    },
    {
      id: 4,
      type: "order",
      message: "Order #ORD456 marked as ready",
      time: "12 minutes ago",
      icon: Bell
    }
  ]);

  // Chart data for analytics
  const orderTrendsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Orders',
        data: [45, 52, 38, 62, 48, 55, 41],
        backgroundColor: 'rgba(249, 115, 22, 0.8)',
        borderColor: 'rgba(249, 115, 22, 1)',
        borderWidth: 1,
      },
    ],
  };

  const categoryData = {
    labels: ['Breakfast', 'Lunch', 'Snacks', 'Beverages'],
    datasets: [
      {
        data: [25, 40, 20, 15],
        backgroundColor: [
          '#f59e0b',
          '#10b981',
          '#8b5cf6',
          '#3b82f6',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-orange-100 mt-1">
              {user.userType === 'admin' ? 'Manage your UniBites operations' : 'What would you like to eat today?'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
            <div className="text-orange-100">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Show AdminQuickActions for admin users */}
      {user.userType === 'admin' && (
        <AdminQuickActions
          onViewOrders={() => setIsViewOrdersOpen(true)}
          onSchedulePreorder={() => console.log("Schedule preorder")}
          onCreateGroupCart={() => console.log("Create group cart")}
          onCreateFlashSale={() => onOpenAdminDashboard?.('flashsale')}
          onKitchenDashboard={() => setIsKitchenDashboardOpen(true)}
        />
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold">{stats.activeOrders}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Orders</p>
                <p className="text-2xl font-bold">{stats.todayOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flash Sales</p>
                <p className="text-2xl font-bold">{stats.flashSalesActive}</p>
              </div>
              <Flame className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kitchen Load</p>
                <p className="text-2xl font-bold">{stats.kitchenLoadPercentage}%</p>
              </div>
              <ChefHat className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Express Menu Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Available Items</span>
                  <Badge variant="secondary">7 items</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Prep Time</span>
                  <span className="font-medium">≤ 5 minutes</span>
                </div>
                <Progress value={85} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Express menu is 85% ready for quick orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Group Cart Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Active Group Carts</span>
                  <Badge variant="secondary">{stats.groupCartsActive}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Participants</span>
                  <span className="font-medium">8 people</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Group ordering is gaining popularity
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Order Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={orderTrendsData} options={chartOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Doughnut data={categoryData} />
              </CardContent>
            </Card>
          </div>

          {/* Popular Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Most Popular Items This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Samosa", orders: 145, revenue: 2175, category: "Snacks" },
                  { name: "Chai", orders: 132, revenue: 1320, category: "Beverages" },
                  { name: "Chicken Curry", orders: 89, revenue: 10680, category: "Lunch" },
                  { name: "Maggi", orders: 76, revenue: 2660, category: "Snacks" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.orders} orders</p>
                      <p className="text-sm text-muted-foreground">₹{item.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your UniBites system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="mt-1">
                      <activity.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                Upcoming Preorders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { item: "Chicken Curry", time: "2:00 PM", date: "Today" },
                  { item: "Veg Thali", time: "1:30 PM", date: "Today" },
                  { item: "Pav Bhaji", time: "12:00 PM", date: "Tomorrow" },
                ].map((preorder, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{preorder.item}</p>
                      <p className="text-sm text-muted-foreground">{preorder.date} at {preorder.time}</p>
                    </div>
                    <Badge variant="outline">Scheduled</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Order Status Modal */}
      <Dialog open={isViewOrdersOpen} onOpenChange={setIsViewOrdersOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-6 w-6 text-orange-600" />
              Orders in Preparation
            </DialogTitle>
            <DialogDescription>
              Track orders currently being prepared in the kitchen with real-time updates
            </DialogDescription>
          </DialogHeader>
          <ViewOrderStatus userId={user.userType === 'admin' ? null : user.id} />
        </DialogContent>
      </Dialog>

      {/* Kitchen Dashboard Modal - Admin Only */}
      {user.userType === 'admin' && (
        <KitchenDashboard 
          isOpen={isKitchenDashboardOpen} 
          onClose={() => setIsKitchenDashboardOpen(false)} 
        />
      )}
    </div>
  );
}