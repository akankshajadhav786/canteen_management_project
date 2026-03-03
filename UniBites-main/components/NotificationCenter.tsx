import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { 
  Bell, 
  BellRing, 
  Flame, 
  Users, 
  Clock, 
  CheckCircle,
  X,
  Settings
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner@2.0.3";
import { User } from "../utils/local/storage";

interface Notification {
  id: string;
  type: 'flash_sale' | 'order_update' | 'group_cart' | 'preorder' | 'general' | 'new_item' | 'combo_deal' | 'favorite_item' | 'time_limited';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
  imageUrl?: string;
  actions?: Array<{
    label: string;
    type: 'primary' | 'secondary';
    action: () => void;
  }>;
}

interface NotificationCenterProps {
  user: User | null;
  accessToken: string | null;
}

export function NotificationCenter({ user, accessToken }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [newItemPopup, setNewItemPopup] = useState<any>(null);

  // Initialize notifications and check push permission
  useEffect(() => {
    if (user) {
      generateMockNotifications();
      checkPushPermission();
      
      // Simulate real-time notifications
      const interval = setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance every 30 seconds
          addNewNotification();
        }
      }, 30000);

      // Simulate new item announcements
      const newItemInterval = setInterval(() => {
        if (Math.random() > 0.95) { // 5% chance every minute
          announceNewItem();
        }
      }, 60000);

      return () => {
        clearInterval(interval);
        clearInterval(newItemInterval);
      };
    }
  }, [user]);

  // Update unread count when notifications change
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const generateMockNotifications = () => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'flash_sale',
        title: '🔥 Flash Sale Alert!',
        message: 'Samosa is now 20% off! Only 5 left in this batch.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        actionRequired: true,
        priority: 'high',
        data: { itemId: '8', discount: 20 },
        actions: [
          { label: 'Add to Cart', type: 'primary', action: () => console.log('Add to cart') },
          { label: 'View Details', type: 'secondary', action: () => console.log('View details') }
        ]
      },
      {
        id: '2',
        type: 'order_update',
        title: 'Order Ready! 🎉',
        message: 'Your order #ORD789 is ready for pickup at the counter.',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        read: false,
        actionRequired: true,
        priority: 'high',
        data: { orderId: 'ORD789' }
      },
      {
        id: '3',
        type: 'group_cart',
        title: 'Group Cart Invitation',
        message: 'Rahul invited you to join a group cart. 3 members already joined!',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: true,
        actionRequired: false,
        priority: 'medium',
        data: { sessionId: 'GC123', inviter: 'Rahul' }
      },
      {
        id: '4',
        type: 'preorder',
        title: 'Preorder Reminder ⏰',
        message: 'Your scheduled Chicken Curry will be ready in 30 minutes.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true,
        actionRequired: false,
        priority: 'medium',
        data: { preorderId: 'PRE456' }
      },
      {
        id: '5',
        type: 'new_item',
        title: '🆕 New Item Alert!',
        message: 'Introducing Masala Dosa - South Indian crispy crepe with authentic flavors!',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        read: false,
        actionRequired: false,
        priority: 'high',
        imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=200&fit=crop',
        data: { itemId: 'new-dosa', firstDayDiscount: 20 },
        actions: [
          { label: 'Try Now (20% Off)', type: 'primary', action: () => console.log('Try new item') },
          { label: 'Learn More', type: 'secondary', action: () => console.log('Learn more') }
        ]
      },
      {
        id: '6',
        type: 'combo_deal',
        title: '🎁 New Combo Deal!',
        message: 'Pav Bhaji + Masala Chai combo now available for ₹55 (Save ₹10)',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        read: false,
        actionRequired: false,
        priority: 'medium',
        data: { comboId: 'pav-chai-combo', savings: 10 }
      },
      {
        id: '7',
        type: 'favorite_item',
        title: '❤️ Your Favorite is Back!',
        message: 'Chicken Curry (your most ordered item) is available again after being sold out!',
        timestamp: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        read: false,
        actionRequired: false,
        priority: 'medium',
        data: { itemId: '5' },
        actions: [
          { label: 'Order Again', type: 'primary', action: () => console.log('Order favorite') }
        ]
      },
      {
        id: '8',
        type: 'time_limited',
        title: '⏰ Limited Time: Afternoon Special',
        message: 'Cold Coffee is available only until 5 PM today. Beat the heat!',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: true,
        actionRequired: false,
        priority: 'low',
        data: { itemId: '14', availableUntil: '17:00' }
      }
    ];

    setNotifications(mockNotifications);
  };

  const checkPushPermission = async () => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  };

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      
      if (permission === 'granted') {
        showPushNotification('🔔 Notifications Enabled!', 'You\'ll now receive real-time updates about orders, deals, and more.');
      }
    }
  };

  const showPushNotification = (title: string, body: string, data?: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/vite.svg', // You can replace with your app icon
        badge: '/vite.svg',
        data,
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  };

  const announceNewItem = () => {
    const newItems = [
      {
        name: 'Paneer Tikka Wrap',
        description: 'Grilled paneer with fresh vegetables in a soft tortilla',
        category: 'snacks',
        price: 65,
        discount: 25
      },
      {
        name: 'Chocolate Shake',
        description: 'Rich and creamy chocolate milkshake with whipped cream',
        category: 'beverages',
        price: 45,
        discount: 20
      },
      {
        name: 'Aloo Tikki Burger',
        description: 'Crispy potato patty burger with mint chutney',
        category: 'snacks',
        price: 55,
        discount: 30
      }
    ];

    const newItem = newItems[Math.floor(Math.random() * newItems.length)];
    
    // Create notification
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'new_item',
      title: `🆕 New Item: ${newItem.name}!`,
      message: `${newItem.description} - Special launch price: ₹${Math.round(newItem.price * (1 - newItem.discount / 100))} (${newItem.discount}% off!)`,
      timestamp: new Date(),
      read: false,
      actionRequired: false,
      priority: 'high',
      data: { 
        itemName: newItem.name,
        originalPrice: newItem.price,
        discountPrice: Math.round(newItem.price * (1 - newItem.discount / 100)),
        discount: newItem.discount
      },
      actions: [
        { 
          label: `Try Now (${newItem.discount}% Off)`, 
          type: 'primary', 
          action: () => {
            setNewItemPopup({
              ...newItem,
              originalPrice: newItem.price,
              discountPrice: Math.round(newItem.price * (1 - newItem.discount / 100))
            });
            markAsRead(notification.id);
          }
        }
      ]
    };

    setNotifications(prev => [notification, ...prev]);
    
    // Show push notification
    showPushNotification(
      `🆕 ${newItem.name} is here!`,
      `Special launch offer: ${newItem.discount}% off! Try it now.`,
      { type: 'new_item', itemName: newItem.name }
    );
  };

  const addNewNotification = () => {
    const randomNotifications = [
      {
        type: 'flash_sale' as const,
        title: '⚡ Express Menu Special!',
        message: 'Maggi is ready in 2 minutes! Limited quantity available.',
        actionRequired: true,
        priority: 'high' as const,
        data: { itemId: '10' }
      },
      {
        type: 'order_update' as const,
        title: 'Order Update 👨‍🍳',
        message: 'Your order is being prepared. Expected ready time: 8 minutes.',
        actionRequired: false,
        priority: 'medium' as const,
        data: { orderId: 'ORD' + Math.random().toString(36).substr(2, 6) }
      },
      {
        type: 'group_cart' as const,
        title: '👥 Group Order Starting',
        message: 'A new group cart was created for lunch. Join now!',
        actionRequired: true,
        priority: 'medium' as const,
        data: { sessionId: 'GC' + Math.random().toString(36).substr(2, 6) }
      },
      {
        type: 'combo_deal' as const,
        title: '🎁 Limited Time Combo!',
        message: 'Get Dal Rice + Chai for just ₹65. Valid for next 2 hours only!',
        actionRequired: false,
        priority: 'medium' as const,
        data: { comboId: 'dal-chai-combo', validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) }
      },
      {
        type: 'favorite_item' as const,
        title: '❤️ Your Favorite Available!',
        message: 'Chicken Curry is freshly prepared and available now!',
        actionRequired: false,
        priority: 'medium' as const,
        data: { itemId: '5' }
      }
    ];

    const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...randomNotification,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show push notification for high priority items
    if (newNotification.priority === 'high') {
      showPushNotification(
        newNotification.title,
        newNotification.message,
        { type: newNotification.type, id: newNotification.id }
      );
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'flash_sale':
        return <Flame className="h-4 w-4 text-red-500" />;
      case 'order_update':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'group_cart':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'preorder':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'new_item':
        return <span className="text-sm">🆕</span>;
      case 'combo_deal':
        return <span className="text-sm">🎁</span>;
      case 'favorite_item':
        return <span className="text-sm">❤️</span>;
      case 'time_limited':
        return <span className="text-sm">⏰</span>;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flash_sale':
        return "bg-red-50 border-red-200";
      case 'order_update':
        return "bg-blue-50 border-blue-200";
      case 'group_cart':
        return "bg-purple-50 border-purple-200";
      case 'preorder':
        return "bg-green-50 border-green-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!user) return null;

  return (
    <>
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                Notifications
              </SheetTitle>
              <SheetDescription>
                Stay updated with your UniBites orders and offers
              </SheetDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] p-6">
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No notifications yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll notify you about orders, offers, and updates
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`group ${getTypeColor(notification.type)} ${
                    !notification.read ? 'border-l-4' : ''
                  } ${
                    notification.priority === 'high' ? 'ring-2 ring-orange-200' : ''
                  } hover:shadow-md transition-all duration-200`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Icon and Priority Indicator */}
                        <div className="relative">
                          {getNotificationIcon(notification.type)}
                          {notification.priority === 'high' && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                            {notification.priority === 'high' && (
                              <Badge variant="destructive" className="text-xs px-1 py-0">
                                High
                              </Badge>
                            )}
                          </div>
                          
                          {/* Image for new items */}
                          {notification.imageUrl && (
                            <div className="mb-2">
                              <img 
                                src={notification.imageUrl} 
                                alt="Notification" 
                                className="w-full h-20 object-cover rounded-md"
                              />
                            </div>
                          )}
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {notification.message}
                          </p>
                          
                          {/* Action Buttons */}
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex gap-2 mb-2">
                              {notification.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant={action.type === 'primary' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    action.action();
                                  }}
                                  className="text-xs h-7"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.actionRequired && (
                              <Badge variant="secondary" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Notification Settings */}
        <div className="border-t p-6 space-y-4">
          {pushPermission === 'default' && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">Enable Push Notifications</p>
              </div>
              <p className="text-xs text-blue-700 mb-3">
                Get instant alerts for orders, deals, and important updates
              </p>
              <Button 
                onClick={requestPushPermission}
                size="sm" 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Enable Notifications
              </Button>
            </div>
          )}
          
          {pushPermission === 'granted' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-900">Notifications Enabled</p>
              </div>
              <p className="text-xs text-green-700">
                You'll receive real-time updates
              </p>
            </div>
          )}
          
          {pushPermission === 'denied' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-900">Notifications Blocked</p>
              </div>
              <p className="text-xs text-red-700">
                Please enable in browser settings to receive updates
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              size="sm"
              onClick={() => announceNewItem()}
            >
              🆕 Test New Item
            </Button>
            <Button variant="outline" className="flex-1" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>

    {/* New Item Popup Modal */}
    <Dialog open={!!newItemPopup} onOpenChange={() => setNewItemPopup(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🆕</span>
            New Item Alert!
          </DialogTitle>
          <DialogDescription>
            Try our latest addition to the menu with a special launch discount
          </DialogDescription>
        </DialogHeader>
        
        {newItemPopup && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{newItemPopup.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {newItemPopup.description}
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-lg line-through text-muted-foreground">
                    ₹{newItemPopup.originalPrice}
                  </p>
                  <p className="text-xs text-muted-foreground">Regular Price</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ₹{newItemPopup.discountPrice}
                  </p>
                  <p className="text-xs text-green-600">
                    {newItemPopup.discount}% OFF Launch Price!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setNewItemPopup(null)}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Button 
                onClick={() => {
                  toast.success(`${newItemPopup.name} added to your favorites!`);
                  setNewItemPopup(null);
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                Try Now ({newItemPopup.discount}% Off)
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}