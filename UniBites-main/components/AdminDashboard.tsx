import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { 
  BarChart, 
  Line, 
  Plus, 
  Edit2, 
  Trash2, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Zap,
  Archive,
  Eye,
  Phone,
  Mail,
  User,
  Filter,
  Search
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { localApi, MenuItem, Order, User as UserType } from "../utils/local/storage";

// Analytics interface for admin dashboard
interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  popularItems: Array<{ name: string; count: number }>;
  recentOrders: Order[];
}

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
  onMenuUpdate: () => void;
  initialTab?: 'overview' | 'menu' | 'orders' | 'analytics' | 'flashsale' | 'inventory';
}

interface MenuFormData {
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'snacks' | 'beverages';
  available: boolean;
}

export function AdminDashboard({ isOpen, onClose, accessToken, onMenuUpdate, initialTab = 'overview' }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'orders' | 'analytics' | 'flashsale' | 'inventory'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  
  // Menu Management State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isAddingMenuItem, setIsAddingMenuItem] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuFormData, setMenuFormData] = useState<MenuFormData>({
    name: '',
    description: '',
    price: 0,
    category: 'breakfast',
    available: true
  });

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('active');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [usersMap, setUsersMap] = useState<Record<string, UserType>>({});

  // Analytics State
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [popularItems, setPopularItems] = useState<any[]>([]);

  // Flash Sale State
  const [flashSaleActive, setFlashSaleActive] = useState(false);
  const [flashSaleItem, setFlashSaleItem] = useState<string>('');
  const [flashSaleDiscount, setFlashSaleDiscount] = useState(20);
  const [flashSaleDuration, setFlashSaleDuration] = useState(30); // minutes

  // Inventory State
  const [inventoryLevels, setInventoryLevels] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      loadDashboardData();
      // Set active tab when opening with initialTab
      if (initialTab) {
        setActiveTab(initialTab);
      }

      // Auto-refresh orders every 10 seconds for real-time updates
      const interval = setInterval(() => {
        loadOrders();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isOpen, accessToken, initialTab]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadMenuItems(),
        loadOrders(),
        loadAnalytics()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMenuItems = async () => {
    try {
      const items = await localApi.menu.getMenu();
      setMenuItems(items);
      
      // Initialize inventory levels
      const initialInventory: Record<string, number> = {};
      items.forEach(item => {
        initialInventory[item.id] = Math.floor(Math.random() * 50) + 10; // Random inventory 10-60
      });
      setInventoryLevels(initialInventory);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const orders = await localApi.orders.getOrders();
      setOrders(orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      
      // Load user information for each order
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
      console.error('Failed to load orders:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const stats = await localApi.analytics.getDashboardStats();
      
      // Calculate popular items from orders
      const orders = await localApi.orders.getOrders();
      const itemCounts: Record<string, { name: string; count: number }> = {};
      
      orders.forEach(order => {
        order.items.forEach(item => {
          const name = item.name || 'Unknown';
          if (!itemCounts[name]) {
            itemCounts[name] = { name, count: 0 };
          }
          itemCounts[name].count += item.quantity;
        });
      });
      
      const popularItems = Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      setAnalytics({
        totalRevenue: stats.totalRevenue,
        totalOrders: stats.totalOrders,
        popularItems,
        recentOrders: orders.slice(0, 10)
      });
      setPopularItems(popularItems);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await localApi.menu.addMenuItem(menuFormData);
      toast.success('Menu item added successfully');
      setIsAddingMenuItem(false);
      resetMenuForm();
      await loadMenuItems();
      onMenuUpdate();
    } catch (error) {
      console.error('Failed to add menu item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem) return;

    setIsLoading(true);

    try {
      await localApi.menu.updateMenuItem(editingMenuItem.id, menuFormData);
      toast.success('Menu item updated successfully');
      setEditingMenuItem(null);
      resetMenuForm();
      await loadMenuItems();
      onMenuUpdate();
    } catch (error) {
      console.error('Failed to update menu item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await localApi.menu.deleteMenuItem(id);
      toast.success('Menu item deleted successfully');
      await loadMenuItems();
      onMenuUpdate();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete menu item');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      await localApi.orders.updateOrderStatus(orderId, status as any);
      
      // Show different messages based on status change
      if (status === 'confirmed') {
        toast.success(
          <div className="flex flex-col gap-1">
            <div className="font-bold">Order Approved! ✅</div>
            <div className="text-sm">Token {order?.tokenNumber} has been confirmed</div>
          </div>,
          { duration: 5000 }
        );
      } else if (status === 'preparing') {
        toast.info(`Preparing order ${order?.tokenNumber}...`);
      } else if (status === 'ready') {
        toast.success(`Order ${order?.tokenNumber} is ready for pickup! 🎉`);
      } else if (status === 'completed') {
        toast.success(`Order ${order?.tokenNumber} completed!`);
      } else if (status === 'cancelled') {
        toast.error(`Order ${order?.tokenNumber} has been cancelled`);
      } else {
        toast.success('Order status updated successfully');
      }
      
      await loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  const resetMenuForm = () => {
    setMenuFormData({
      name: '',
      description: '',
      price: 0,
      category: 'breakfast',
      available: true
    });
  };

  const startEditingMenuItem = (item: MenuItem) => {
    setEditingMenuItem(item);
    setMenuFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <AlertCircle className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStartFlashSale = () => {
    if (!flashSaleItem) {
      toast.error('Please select an item for the flash sale');
      return;
    }

    setFlashSaleActive(true);
    const selectedItem = menuItems.find(item => item.id === flashSaleItem);
    toast.success(
      `🔥 Flash Sale Started! ${flashSaleDiscount}% off on ${selectedItem?.name} for ${flashSaleDuration} minutes!`,
      { duration: 5000 }
    );

    // Auto-end flash sale after duration
    setTimeout(() => {
      setFlashSaleActive(false);
      toast.info('Flash sale has ended');
    }, flashSaleDuration * 60 * 1000);
  };

  const handleEndFlashSale = () => {
    setFlashSaleActive(false);
    toast.info('Flash sale ended');
  };

  const updateInventory = (itemId: string, change: number) => {
    setInventoryLevels(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const getInventoryStatus = (level: number) => {
    if (level === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (level < 10) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    if (level < 30) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            Admin Dashboard
          </DialogTitle>
          <DialogDescription>
            Manage menu items, track orders, and view analytics
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="flashsale">Flash Sale</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{analytics?.totalRevenue || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{menuItems.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {orders.filter(order => 
                      new Date(order.createdAt).toDateString() === new Date().toDateString()
                    ).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-600" />
                    Active Orders
                  </CardTitle>
                  <CardDescription>
                    Orders currently being prepared or ready for pickup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No active orders at the moment
                      </p>
                    ) : (
                      orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              <Badge className="bg-green-500 text-white">{order.tokenNumber}</Badge>
                              {order.id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ₹{order.finalAmount.toFixed(2)} • {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    Latest orders placed by customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No orders yet. Start by adding menu items!
                      </p>
                    ) : (
                      orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              <Badge variant="outline">{order.tokenNumber}</Badge>
                              {order.id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ₹{order.finalAmount.toFixed(2)} • {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {popularItems.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No order data yet. Popular items will appear here.
                      </p>
                    ) : (
                      popularItems.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">{item.count} orders</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{idx + 1}</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Menu Management Tab */}
          <TabsContent value="menu" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Menu Items</h3>
              <Button onClick={() => setIsAddingMenuItem(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <Badge variant={item.available ? "default" : "secondary"}>
                          {item.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingMenuItem(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">₹{item.price}</span>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add/Edit Menu Item Dialog */}
            <Dialog open={isAddingMenuItem || editingMenuItem !== null} onOpenChange={(open) => {
              if (!open) {
                setIsAddingMenuItem(false);
                setEditingMenuItem(null);
                resetMenuForm();
              }
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={editingMenuItem ? handleEditMenuItem : handleAddMenuItem} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={menuFormData.name}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={menuFormData.description}
                      onChange={(e) => setMenuFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={menuFormData.price}
                        onChange={(e) => setMenuFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={menuFormData.category} onValueChange={(value) => setMenuFormData(prev => ({ ...prev, category: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="snacks">Snacks</SelectItem>
                          <SelectItem value="beverages">Beverages</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="available"
                      checked={menuFormData.available}
                      onCheckedChange={(checked) => setMenuFormData(prev => ({ ...prev, available: checked }))}
                    />
                    <Label htmlFor="available">Available</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      {editingMenuItem ? 'Update' : 'Add'} Item
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setIsAddingMenuItem(false);
                      setEditingMenuItem(null);
                      resetMenuForm();
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">Live Orders Management</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage all customer orders in real-time
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Active: {orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.status)).length}
                </Badge>
                <Button onClick={loadOrders} variant="outline">
                  Refresh
                </Button>
              </div>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="search" className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4" />
                      Search Orders
                    </Label>
                    <Input
                      id="search"
                      placeholder="Search by token, order ID, or customer name..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="statusFilter" className="flex items-center gap-2 mb-2">
                      <Filter className="h-4 w-4" />
                      Filter by Status
                    </Label>
                    <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                      <SelectTrigger id="statusFilter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active Orders</SelectItem>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Table with Token Numbers and Customer Info */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Token #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    // Filter orders based on status and search
                    const filteredOrders = orders.filter(order => {
                      // Status filter
                      if (orderStatusFilter === 'active') {
                        if (!['confirmed', 'preparing', 'ready'].includes(order.status)) {
                          return false;
                        }
                      } else if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) {
                        return false;
                      }
                      
                      // Search filter
                      if (orderSearchQuery) {
                        const query = orderSearchQuery.toLowerCase();
                        const customer = usersMap[order.userId];
                        const customerName = customer?.name?.toLowerCase() || '';
                        const tokenNumber = order.tokenNumber.toLowerCase();
                        const orderId = order.id.toLowerCase();
                        
                        return tokenNumber.includes(query) || 
                               orderId.includes(query) || 
                               customerName.includes(query);
                      }
                      
                      return true;
                    });
                    
                    if (filteredOrders.length === 0) {
                      return (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            {orders.length === 0 
                              ? 'No orders yet. Orders will appear here as customers place them.'
                              : 'No orders match your filters.'}
                          </TableCell>
                        </TableRow>
                      );
                    }
                    
                    return filteredOrders.map((order) => {
                      const customer = usersMap[order.userId];
                      return (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-3 py-1">
                              {order.tokenNumber}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="font-medium flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {customer?.name || 'Unknown User'}
                            </div>
                            <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
                              {customer?.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </span>
                              )}
                              <Badge variant="outline" className="w-fit text-xs">
                                {customer?.userType || 'customer'}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                          </div>
                          <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs mt-1"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <div className="font-semibold">₹{order.finalAmount.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">
                              Base: ₹{order.totalAmount.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              GST: ₹{order.gstAmount.toFixed(2)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            {order.status === 'pending' && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            {order.status === 'confirmed' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-blue-50 hover:bg-blue-100"
                                onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                              >
                                Start Prep
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button 
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                              >
                                Mark Ready
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button 
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                              >
                                ✓ Complete
                              </Button>
                            )}
                            {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  if (confirm(`Cancel order ${order.tokenNumber}?`)) {
                                    handleUpdateOrderStatus(order.id, 'cancelled');
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  })()}
                </TableBody>
              </Table>
            </div>

            {/* Order Details Card */}
            {selectedOrder && (() => {
              const customer = usersMap[selectedOrder.userId];
              return (
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-3">
                          <Badge className="bg-orange-500 text-white text-xl px-4 py-2">
                            {selectedOrder.tokenNumber}
                          </Badge>
                          Order Details
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Order ID: {selectedOrder.id}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                        Close
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Customer Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Name</Label>
                            <p className="font-medium">{customer?.name || 'Unknown User'}</p>
                          </div>
                          {customer?.phone && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Phone</Label>
                              <p className="font-medium flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {customer.phone}
                              </p>
                            </div>
                          )}
                          {customer?.email && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Email</Label>
                              <p className="font-medium flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                {customer.email}
                              </p>
                            </div>
                          )}
                          <div>
                            <Label className="text-xs text-muted-foreground">User Type</Label>
                            <Badge variant="outline">{customer?.userType || 'customer'}</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Order Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Order Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Status</Label>
                            <div>
                              <Badge className={getStatusColor(selectedOrder.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(selectedOrder.status)}
                                  {selectedOrder.status}
                                </span>
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Order Time</Label>
                            <p className="font-medium">
                              {new Date(selectedOrder.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Payment Method</Label>
                            <p className="font-medium">Cash on Pickup</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Delivery Method</Label>
                            <Badge variant="outline">{selectedOrder.deliveryMethod}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Order Items */}
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle className="text-base">Order Items</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead className="text-center">Quantity</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedOrder.items.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-center">× {item.quantity}</TableCell>
                                <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-semibold">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        <Separator className="my-4" />
                        
                        {/* Price Breakdown */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">GST (5%)</span>
                            <span>₹{selectedOrder.gstAmount.toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total Amount</span>
                            <span className="text-orange-600">₹{selectedOrder.finalAmount.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Special Instructions */}
                        {selectedOrder.specialInstructions && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <Label className="text-xs text-muted-foreground flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Special Instructions
                            </Label>
                            <p className="mt-1">{selectedOrder.specialInstructions}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              );
            })()}
          </TabsContent>

          {/* Flash Sale Tab */}
          <TabsContent value="flashsale" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔥 Flash Sale Manager
                </CardTitle>
                <CardDescription>
                  Create time-limited discounts to boost sales and clear inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {flashSaleActive ? (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-orange-800">Flash Sale Active! 🔥</h3>
                        <p className="text-orange-700">
                          {flashSaleDiscount}% off on {menuItems.find(item => item.id === flashSaleItem)?.name}
                        </p>
                      </div>
                      <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                        LIVE
                      </Badge>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Discount</p>
                        <p className="text-2xl font-bold text-orange-600">{flashSaleDiscount}%</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="text-2xl font-bold text-orange-600">{flashSaleDuration} min</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Item</p>
                        <p className="text-lg font-semibold text-orange-600">
                          {menuItems.find(item => item.id === flashSaleItem)?.name}
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleEndFlashSale} variant="destructive" className="w-full">
                      End Flash Sale
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Select Item</Label>
                        <Select value={flashSaleItem} onValueChange={setFlashSaleItem}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an item" />
                          </SelectTrigger>
                          <SelectContent>
                            {menuItems.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} - ₹{item.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Discount Percentage</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="5"
                            max="50"
                            value={flashSaleDiscount}
                            onChange={(e) => setFlashSaleDiscount(parseInt(e.target.value) || 20)}
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Duration (minutes)</Label>
                      <Select value={flashSaleDuration.toString()} onValueChange={(val) => setFlashSaleDuration(parseInt(val))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {flashSaleItem && (
                      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">Flash Sale Preview</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{menuItems.find(item => item.id === flashSaleItem)?.name}</p>
                              <p className="text-sm text-muted-foreground line-through">
                                ₹{menuItems.find(item => item.id === flashSaleItem)?.price}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-red-500 text-white mb-1">{flashSaleDiscount}% OFF</Badge>
                              <p className="text-xl font-bold text-green-600">
                                ₹{((menuItems.find(item => item.id === flashSaleItem)?.price || 0) * (1 - flashSaleDiscount / 100)).toFixed(0)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Button 
                      onClick={handleStartFlashSale} 
                      disabled={!flashSaleItem}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    >
                      🔥 Launch Flash Sale
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Inventory Management</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50">
                  {menuItems.filter(item => (inventoryLevels[item.id] || 0) >= 30).length} In Stock
                </Badge>
                <Badge variant="outline" className="bg-orange-50">
                  {menuItems.filter(item => {
                    const level = inventoryLevels[item.id] || 0;
                    return level > 0 && level < 10;
                  }).length} Low Stock
                </Badge>
                <Badge variant="outline" className="bg-red-50">
                  {menuItems.filter(item => (inventoryLevels[item.id] || 0) === 0).length} Out of Stock
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map(item => {
                const level = inventoryLevels[item.id] || 0;
                const status = getInventoryStatus(level);
                
                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{item.name}</CardTitle>
                          <Badge className={`${status.color} mt-1`}>
                            {status.label}
                          </Badge>
                        </div>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Stock Level</span>
                          <span className="font-bold text-2xl">{level}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              level === 0 ? 'bg-red-500' :
                              level < 10 ? 'bg-orange-500' :
                              level < 30 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, (level / 50) * 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInventory(item.id, -1)}
                          disabled={level === 0}
                        >
                          -1
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateInventory(item.id, -5)}
                          disabled={level < 5}
                        >
                          -5
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateInventory(item.id, 10)}
                          className="flex-1"
                        >
                          +10
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => updateInventory(item.id, 25)}
                        >
                          +25
                        </Button>
                      </div>

                      {level < 10 && level > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-2">
                          <p className="text-xs text-orange-700">
                            ⚠️ Low stock alert - Restock soon
                          </p>
                        </div>
                      )}

                      {level === 0 && (
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <p className="text-xs text-red-700">
                            🚫 Out of stock - Item unavailable to customers
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">₹{analytics?.totalRevenue || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{analytics?.totalOrders || 0}</p>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        ₹{analytics?.totalOrders ? (analytics.totalRevenue / analytics.totalOrders).toFixed(0) : 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {orders.filter(order => 
                          new Date(order.createdAt).toDateString() === new Date().toDateString()
                        ).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Today's Orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Selling Items with Enhanced Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Item Performance Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed insights into menu item popularity and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularItems.slice(0, 8).map((item, index) => {
                      const isTopPerformer = index < 3;
                      const totalOrders = popularItems.reduce((sum, p) => sum + p.orderCount, 0);
                      const marketShare = totalOrders > 0 ? ((item.orderCount / totalOrders) * 100).toFixed(1) : '0';
                      
                      return (
                        <div key={item.itemId} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={isTopPerformer ? "default" : "outline"}
                              className={isTopPerformer ? "bg-yellow-500" : ""}
                            >
                              #{index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="capitalize">{item.category}</span>
                                <span>•</span>
                                <span>{marketShare}% of total orders</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">₹{item.revenue}</p>
                            <p className="text-sm text-muted-foreground">{item.orderCount} orders</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>
                    Sales breakdown by food category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['breakfast', 'lunch', 'snacks', 'beverages'].map(category => {
                      const categoryItems = popularItems.filter(item => item.category === category);
                      const categoryRevenue = categoryItems.reduce((sum, item) => sum + item.revenue, 0);
                      const categoryOrders = categoryItems.reduce((sum, item) => sum + item.orderCount, 0);
                      const totalRevenue = popularItems.reduce((sum, item) => sum + item.revenue, 0);
                      const revenueShare = totalRevenue > 0 ? ((categoryRevenue / totalRevenue) * 100).toFixed(1) : '0';
                      
                      return (
                        <div key={category} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">{category}</h4>
                            <Badge variant="outline">{revenueShare}% revenue share</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Revenue</p>
                              <p className="font-semibold text-green-600">₹{categoryRevenue}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Orders</p>
                              <p className="font-semibold">{categoryOrders}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Smart Business Insights
                  </CardTitle>
                  <CardDescription>
                    AI-powered recommendations based on sales data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-green-600">🚀 Growth Opportunities</h4>
                      <div className="space-y-3">
                        {popularItems.slice(-3).map(item => (
                          <div key={item.itemId} className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-green-700">
                              Low sales ({item.orderCount} orders) - Consider promotion or recipe improvement
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-600">💡 Strategic Recommendations</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="font-medium">Peak Hours Analysis</p>
                          <p className="text-sm text-blue-700">
                            {orders.filter(order => {
                              const hour = new Date(order.createdAt).getHours();
                              return hour >= 12 && hour <= 14;
                            }).length} orders during lunch (12-2 PM) - Consider lunch combos
                          </p>
                        </div>
                        
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="font-medium">Inventory Optimization</p>
                          <p className="text-sm text-blue-700">
                            Top 3 items generate {((popularItems.slice(0, 3).reduce((sum, item) => sum + item.revenue, 0) / 
                            popularItems.reduce((sum, item) => sum + item.revenue, 0)) * 100).toFixed(0)}% of revenue - Focus inventory here
                          </p>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="font-medium">Cross-selling Potential</p>
                          <p className="text-sm text-blue-700">
                            Beverages have high margin - Create combo offers with main dishes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}