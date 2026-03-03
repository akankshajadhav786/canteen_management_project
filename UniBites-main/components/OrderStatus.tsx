import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Bell, 
  Package, 
  Timer, 
  Utensils,
  Flame,
  RefreshCw,
  Smile,
  Angry,
  Zap
} from "lucide-react";
import { Order, localApi } from "../utils/local/storage";
import { toast } from "sonner@2.0.3";

interface OrderStatusProps {
  accessToken: string | null;
  userId: string | null;
}

interface OrderWithStatus extends Order {
  estimatedTime?: number; // minutes
  actualWaitTime?: number; // minutes
  wittyMessage?: string;
  kitchenNotes?: string;
  preparationStage?: string;
}

export function OrderStatus({ accessToken, userId }: OrderStatusProps) {
  const [orders, setOrders] = useState<OrderWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (userId) {
      loadOrders();
      
      // Poll for updates every 30 seconds
      const interval = setInterval(loadOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const loadOrders = async () => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const orders = await localApi.orders.getOrders(userId);
      
      // Enhance orders with status details and witty messages
      const enhancedOrders = orders.map(order => enhanceOrderWithStatus(order));
      
      setOrders(enhancedOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const enhanceOrderWithStatus = (order: Order): OrderWithStatus => {
    const wittyMessages = getWittyMessage(order);
    const estimatedTime = getEstimatedTime(order);
    const preparationStage = getPreparationStage(order);
    
    return {
      ...order,
      estimatedTime,
      wittyMessage: wittyMessages.message,
      kitchenNotes: wittyMessages.notes,
      preparationStage
    };
  };

  const getWittyMessage = (order: Order) => {
    const hasChicken = order.items.some(item => 
      item.name.toLowerCase().includes('chicken')
    );
    const hasChai = order.items.some(item => 
      item.name.toLowerCase().includes('chai') || item.name.toLowerCase().includes('tea')
    );
    const hasMaggi = order.items.some(item => 
      item.name.toLowerCase().includes('maggi')
    );
    const hasSamosa = order.items.some(item => 
      item.name.toLowerCase().includes('samosa')
    );

    switch (order.status) {
      case 'confirmed':
        return {
          message: "🎉 Order confirmed! Kitchen notified",
          notes: "Your order is in queue"
        };
      
      case 'preparing':
        if (hasChicken) {
          return {
            message: "🔥 Your chicken is being roasted!",
            notes: "The chicken looks a bit mad about it 😤"
          };
        }
        if (hasChai) {
          return {
            message: "☕ Tea leaves are dancing in hot water!",
            notes: "Brewing the perfect cup just for you"
          };
        }
        if (hasMaggi) {
          return {
            message: "🍜 Noodles are taking a hot bath!",
            notes: "They're getting nice and soft"
          };
        }
        if (hasSamosa) {
          return {
            message: "🔥 Samosas are getting their golden tan!",
            notes: "Sizzling away in hot oil"
          };
        }
        return {
          message: "👨‍🍳 Chef is working their magic!",
          notes: "Your food is getting the love it deserves"
        };
      
      case 'ready':
        return {
          message: "🎊 Your order is ready for pickup!",
          notes: "Hot and fresh, just the way you like it"
        };
      
      default:
        return {
          message: "📋 Order received",
          notes: "Processing your order"
        };
    }
  };

  const getEstimatedTime = (order: Order): number => {
    const hasComplexItems = order.items.some(item => 
      ['lunch', 'chicken', 'thali'].some(keyword => 
        item.name.toLowerCase().includes(keyword)
      )
    );
    const hasQuickItems = order.items.some(item => 
      ['chai', 'coffee', 'samosa'].some(keyword => 
        item.name.toLowerCase().includes(keyword)
      )
    );

    switch (order.status) {
      case 'confirmed':
        return hasComplexItems ? 15 : hasQuickItems ? 5 : 10;
      case 'preparing':
        return hasComplexItems ? 8 : hasQuickItems ? 2 : 5;
      case 'ready':
        return 0;
      default:
        return 10;
    }
  };

  const getPreparationStage = (order: Order): string => {
    switch (order.status) {
      case 'confirmed':
        return "Order received";
      case 'preparing':
        return "In kitchen";
      case 'ready':
        return "Ready for pickup";
      case 'completed':
        return "Completed";
      case 'cancelled':
        return "Cancelled";
      default:
        return "Processing";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'preparing':
        return <ChefHat className="h-5 w-5 text-orange-500" />;
      case 'ready':
        return <Bell className="h-5 w-5 text-green-500" />;
      case 'completed':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <Package className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return "bg-blue-50 border-blue-200";
      case 'preparing':
        return "bg-orange-50 border-orange-200";
      case 'ready':
        return "bg-green-50 border-green-200";
      case 'completed':
        return "bg-green-50 border-green-200";
      case 'cancelled':
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 25;
      case 'preparing':
        return 60;
      case 'ready':
        return 100;
      case 'completed':
        return 100;
      case 'cancelled':
        return 100;
      default:
        return 0;
    }
  };

  const activeOrders = orders.filter(order => 
    ['confirmed', 'preparing', 'ready'].includes(order.status)
  );
  
  const completedOrders = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  );

  if (!accessToken) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Please login to view order status</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order Tracking</h2>
        <Button
          onClick={loadOrders}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Active Orders ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Utensils className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No active orders</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Place an order to see it here!
                </p>
              </CardContent>
            </Card>
          ) : (
            activeOrders.map((order) => (
              <Card key={order.id} className={`${getStatusColor(order.status)} border-2`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-orange-500 text-white text-xl px-4 py-2">
                        {order.tokenNumber}
                      </Badge>
                      <div>
                        <CardTitle className="text-lg">Token #{order.tokenNumber}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Order ID: {order.id}
                        </p>
                      </div>
                    </div>
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {order.preparationStage}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Witty Status Message */}
                  <div className="bg-white/70 rounded-lg p-4 border">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {order.status === 'preparing' && order.items.some(item => 
                          item.name.toLowerCase().includes('chicken')
                        ) ? (
                          <Angry className="h-5 w-5 text-orange-500" />
                        ) : (
                          <Smile className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{order.wittyMessage}</p>
                        <p className="text-sm text-gray-600 mt-1">{order.kitchenNotes}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {order.estimatedTime && order.estimatedTime > 0 ? (
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            ~{order.estimatedTime} min
                          </span>
                        ) : (
                          "Ready!"
                        )}
                      </span>
                    </div>
                    <Progress value={getProgressValue(order.status)} className="h-2" />
                  </div>

                  {/* Order Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Items</span>
                      <span className="text-sm font-medium">
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span>₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">₹{order.finalAmount.toFixed(0)}</span>
                    </div>
                    <div className="pt-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        💰 Cash on Pickup
                      </Badge>
                    </div>
                  </div>

                  {/* Order Time */}
                  <div className="text-xs text-muted-foreground">
                    Ordered at {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No completed orders</p>
              </CardContent>
            </Card>
          ) : (
            completedOrders.map((order) => (
              <Card key={order.id} className="border">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-6)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{order.finalAmount.toFixed(0)}</p>
                      <Badge variant="outline" className="text-xs">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-xs">
                      💰 Cash on Pickup
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}