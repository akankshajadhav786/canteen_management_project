import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Heart, 
  Bell, 
  Zap, 
  Users, 
  Clock,
  Gift,
  Star,
  Flame
} from "lucide-react";

export function FeatureShowcase() {
  const features = [
    {
      icon: <Bell className="h-6 w-6 text-blue-500" />,
      title: "Enhanced Notifications",
      description: "Real-time push notifications with action buttons, priority levels, and rich content including images for new items.",
      badges: ["Push Notifications", "Action Buttons", "Priority System"],
      color: "from-blue-50 to-indigo-50 border-blue-200"
    },
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: "Favorites System",
      description: "Save your favorite items for quick access, track taste preferences, and get notified when favorites are back in stock.",
      badges: ["Quick Access", "Taste Profile", "Stock Alerts"],
      color: "from-red-50 to-pink-50 border-red-200"
    },
    {
      icon: <Gift className="h-6 w-6 text-purple-500" />,
      title: "New Item Announcements",
      description: "Interactive popup modals for new menu items with special launch discounts and try-now actions.",
      badges: ["Launch Discounts", "Interactive Popups", "Try Now Actions"],
      color: "from-purple-50 to-violet-50 border-purple-200"
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Smart Notifications",
      description: "Context-aware notifications for flash sales, combo deals, time-limited offers, and group cart invitations.",
      badges: ["Context Aware", "Multiple Types", "Smart Timing"],
      color: "from-yellow-50 to-amber-50 border-yellow-200"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Star className="h-6 w-6 text-amber-500 fill-current" />
          Latest Features Added
        </h2>
        <p className="text-muted-foreground">
          Enhanced user experience with intelligent notifications and personalization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className={`bg-gradient-to-br ${feature.color} hover:shadow-lg transition-shadow`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                {feature.icon}
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {feature.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {feature.badges.map((badge, badgeIndex) => (
                  <Badge key={badgeIndex} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-green-900 flex items-center justify-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Try These Features Now!
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm max-w-2xl mx-auto">
            <div className="space-y-1">
              <p className="font-medium text-green-800">❤️ Click heart icons on menu items to favorite them</p>
              <p className="font-medium text-green-800">🔔 Check notifications for new item alerts</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-green-800">🆕 Test new item popups from notification settings</p>
              <p className="font-medium text-green-800">👀 Switch to "Favorites" view to see saved items</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}