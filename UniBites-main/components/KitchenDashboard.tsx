import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  ChefHat, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  Package, 
  AlertCircle,
  Bell,
  TrendingUp,
  Activity
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { localApi, Order, User as UserType } from "../utils/local/storage";

interface KitchenDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KitchenDashboard({ isOpen, onClose }: KitchenDashboardProps) {
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([]);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, UserType>>({});
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadKitchenOrders();
      const interval = setInterval(loadKitchenOrders, 15000); // Refresh every 15 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const loadKitchenOrders = async () => {
    try {
      const allOrders = await localApi.orders.getOrders();
      
      // Filter orders
      const preparing = allOrders.filter(order => order.status === 'preparing');
      const ready = allOrders.filter(order => order.status === 'ready');
      
      setPreparingOrders(preparing.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ));
      
      setReadyOrders(ready.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));

      // Load user information
      const users = localStorage.getItem('unibites_users');
      if (users) {
        const usersList: UserType[] = JSON.parse(users);
        const usersMapTemp: Record<string, UserType> = {};
        usersList.forEach(user => {
          usersMapTemp[user.id] = user;
        });
        setUsersMap(usersMapTemp);
      }
    } catch (error) {
      console.error('Failed to load kitchen orders:', error);
    }
  };

  const handleMarkAsReady = async (orderId: string, tokenNumber: string) => {
    try {
      setLoading(true);
      await localApi.orders.updateOrderStatus(orderId, 'ready');
      
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-bold">Order Ready! 🎉</div>
          <div className="text-sm">Token {tokenNumber} is ready for pickup</div>
        </div>,
        { duration: 5000 }
      );
      
      await loadKitchenOrders();
    } catch (error) {
      console.error('Failed to mark order as ready:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async (orderId: string, tokenNumber: string) => {
    try {
      setLoading(true);
      await localApi.orders.updateOrderStatus(orderId, 'completed');
      
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-bold">Order Completed! ✅</div>
          <div className="text-sm">Token {tokenNumber} has been picked up</div>
        </div>,
        { duration: 5000 }
      );
      
      await loadKitchenOrders();
    } catch (error) {
      console.error('Failed to complete order:', error);
      toast.error('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedTime = (order: Order): number => {
    let totalTime = 0;
    order.items.forEach(item => {
      totalTime += item.quantity * 5;
    });
    
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
    
    return Math.max(0, totalTime - elapsedMinutes);
  };

  const getProgressPercentage = (order: Order): number => {
    const estimatedTotal = order.items.reduce((sum, item) => sum + item.quantity * 5, 0);
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
    
    return Math.min(100, (elapsedMinutes / estimatedTotal) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-orange-600" />
            Kitchen Dashboard
          </DialogTitle>
          <DialogDescription>
            Manage active orders and notify customers when ready
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Kitchen Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">In Preparation</p>
                    <p className="text-2xl font-bold text-orange-600">{preparingOrders.length}</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ready for Pickup</p>
                    <p className="text-2xl font-bold text-green-600">{readyOrders.length}</p>
                  </div>
                  <Bell className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Active</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {preparingOrders.length + readyOrders.length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="preparing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preparing" className="gap-2">
                <Activity className="h-4 w-4" />
                In Preparation ({preparingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="ready" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Ready for Pickup ({readyOrders.length})
              </TabsTrigger>
            </TabsList>

            {/* Preparing Orders */}
            <TabsContent value="preparing" className="space-y-4 mt-6">
              {preparingOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Orders in Preparation</h3>
                    <p className="text-sm text-muted-foreground">
                      New orders will appear here once approved
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {preparingOrders.map((order) => {
                    const customer = usersMap[order.userId];
                    const estimatedTime = getEstimatedTime(order);
                    const progress = getProgressPercentage(order);
                    
                    return (
                      <Card key={order.id} className="border-2 border-orange-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xl px-4 py-2">
                              {order.tokenNumber}
                            </Badge>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-orange-600">
                                <Clock className="h-4 w-4" />
                                <span className="font-bold">{estimatedTime} min</span>
                              </div>
                              <p className="text-xs text-muted-foreground">remaining</p>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {/* Progress */}
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          {/* Customer Info */}
                          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-2 font-medium">
                              <User className="h-4 w-4" />
                              {customer?.name || 'Unknown'}
                            </div>
                            {customer?.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>

                          {/* Items */}
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 font-medium mb-2">
                              <Package className="h-4 w-4" />
                              {order.items.length} Items
                            </div>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>{item.name}</span>
                                  <span className="font-medium">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Special Instructions */}
                          {order.specialInstructions && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="text-xs font-semibold text-yellow-800">Note</p>
                                  <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleMarkAsReady(order.id, order.tokenNumber)}
                            disabled={loading}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark as Ready
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Ready Orders */}
            <TabsContent value="ready" className="space-y-4 mt-6">
              {readyOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Orders Ready</h3>
                    <p className="text-sm text-muted-foreground">
                      Completed orders will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {readyOrders.map((order) => {
                    const customer = usersMap[order.userId];
                    
                    return (
                      <Card key={order.id} className="border-2 border-green-200 bg-green-50/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-green-600 hover:bg-green-700 text-white text-xl px-4 py-2">
                              {order.tokenNumber}
                            </Badge>
                            <Badge variant="outline" className="text-green-700 border-green-700">
                              READY
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {/* Customer Info */}
                          <div className="bg-white rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-2 font-medium">
                              <User className="h-4 w-4" />
                              {customer?.name || 'Unknown'}
                            </div>
                            {customer?.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </div>
                            )}
                          </div>

                          {/* Items */}
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center gap-2 font-medium mb-2">
                              <Package className="h-4 w-4" />
                              {order.items.length} Items
                            </div>
                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>{item.name}</span>
                                  <span className="font-medium">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Total */}
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold">Total</span>
                              <span className="text-lg font-bold text-green-600">
                                ₹{order.finalAmount.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Cash on Pickup
                            </p>
                          </div>

                          {/* Action Button */}
                          <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleCompleteOrder(order.id, order.tokenNumber)}
                            disabled={loading}
                          >
                            ✓ Mark as Picked Up
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
