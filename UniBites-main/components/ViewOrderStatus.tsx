import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Clock, User, Phone, ChefHat, AlertCircle, CheckCircle2, Package } from "lucide-react";
import { localApi, Order, User as UserType } from "../utils/local/storage";

interface ViewOrderStatusProps {
  userId: string | null;
}

export function ViewOrderStatus({ userId }: ViewOrderStatusProps) {
  const [preparingOrders, setPreparingOrders] = useState<Order[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, UserType>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreparingOrders();
    const interval = setInterval(loadPreparingOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const loadPreparingOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await localApi.orders.getOrders();
      
      // Filter orders that are in preparing status
      const preparing = allOrders.filter(order => 
        order.status === 'preparing' && (!userId || order.userId === userId)
      );
      
      setPreparingOrders(preparing.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
      console.error('Failed to load preparing orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedTime = (order: Order): number => {
    // Calculate estimated time based on items
    let totalTime = 0;
    order.items.forEach(item => {
      // Assume average 5-10 minutes per item type
      totalTime += item.quantity * 5;
    });
    
    // Add extra time based on order creation
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
    
    const remainingTime = Math.max(0, totalTime - elapsedMinutes);
    return remainingTime;
  };

  const getProgressPercentage = (order: Order): number => {
    const estimatedTotal = order.items.reduce((sum, item) => sum + item.quantity * 5, 0);
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
    
    const progress = Math.min(100, (elapsedMinutes / estimatedTotal) * 100);
    return progress;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading kitchen status...</p>
      </div>
    );
  }

  if (preparingOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Orders in Preparation</h3>
        <p className="text-sm text-muted-foreground">
          Orders being prepared will appear here with real-time updates
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-orange-600">
        <ChefHat className="h-5 w-5" />
        <h3 className="font-semibold">Kitchen is working on {preparingOrders.length} order{preparingOrders.length !== 1 ? 's' : ''}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {preparingOrders.map((order) => {
          const customer = usersMap[order.userId];
          const estimatedTime = getEstimatedTime(order);
          const progress = getProgressPercentage(order);
          
          return (
            <Card key={order.id} className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xl px-4 py-2">
                      {order.tokenNumber}
                    </Badge>
                    <div>
                      <CardTitle className="text-lg">Order in Progress</CardTitle>
                      <CardDescription className="text-xs">
                        Started {new Date(order.createdAt).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-orange-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-bold">{estimatedTime} min</span>
                    </div>
                    <p className="text-xs text-muted-foreground">estimated</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Preparation Progress</span>
                    <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <Separator />

                {/* Customer Information */}
                <div className="bg-white/60 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{customer?.name || 'Unknown'}</p>
                    </div>
                    {customer?.phone && (
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Type</p>
                      <Badge variant="outline" className="text-xs">
                        {customer?.userType || 'customer'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup Method</p>
                      <p className="font-medium capitalize">{order.deliveryMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white/60 rounded-lg p-3">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items ({order.items.length})
                  </h4>
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          {item.name}
                        </span>
                        <span className="font-medium">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-yellow-800">Special Instructions</p>
                        <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Total */}
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-lg font-bold text-orange-600">₹{order.finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Updates automatically every 30 seconds • Kitchen staff will notify you when ready</p>
      </div>
    </div>
  );
}
