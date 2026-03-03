import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  ArrowLeft,
  User, 
  Mail, 
  Phone,
  Edit,
  Wallet,
  IndianRupee,
  Flame,
  Bell,
  BellOff
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { localApi, User as UserType } from '../utils/local/storage';

interface UserProfileProps {
  user: UserType;
  accessToken: string;
  onBack: () => void;
}

export function UserProfile({ user, onBack }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(500);
  const [preferences, setPreferences] = useState({
    dietary: 'Vegetarian',
    spiceLevel: 'Medium',
    notifications: true
  });
  const [stats, setStats] = useState({
    ordersThisMonth: 0,
    totalSpent: 0,
    avgRating: 0,
    savings: 0
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    text: string;
    time: string;
  }>>([]);
  const [editedUser, setEditedUser] = useState({
    name: user.name,
    rollNumber: user.rollNumber || '',
    email: user.email,
    phone: user.phone || '',
    course: user.department || '',
    year: '3rd Year'
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load orders from localStorage
      const orders = await localApi.orders.getOrders(user.id);
      
      // Calculate stats
      const now = new Date();
      const thisMonth = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      });
      
      const completedOrders = orders.filter(o => o.status === 'completed');
      const totalSpent = completedOrders.reduce((sum, order) => sum + order.finalAmount, 0);
      const avgRating = 4.8; // Mock rating
      const savings = Math.floor(totalSpent * 0.1); // 10% savings estimate

      setStats({
        ordersThisMonth: thisMonth.length,
        totalSpent,
        avgRating,
        savings
      });

      // Set recent activity
      const recentOrders = orders.slice(0, 3);
      const activity = recentOrders.map(order => {
        const timeDiff = Date.now() - new Date(order.createdAt).getTime();
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        const daysAgo = Math.floor(hoursAgo / 24);
        
        let timeStr = '';
        if (daysAgo > 0) {
          timeStr = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
        } else if (hoursAgo > 0) {
          timeStr = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
        } else {
          timeStr = 'Just now';
        }

        // Get first item name
        const firstItemName = order.items[0]?.name || 'Unknown Item';
        
        return {
          text: `Ordered ${firstItemName}`,
          time: timeStr
        };
      });

      setRecentActivity(activity);
      
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleSaveProfile = () => {
    // Update user in localStorage
    const updatedUser = {
      ...user,
      name: editedUser.name,
      rollNumber: editedUser.rollNumber,
      email: editedUser.email,
      phone: editedUser.phone,
      department: editedUser.course
    };
    
    localApi.auth.setUser(updatedUser);
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const addToWallet = (amount: number) => {
    setWalletBalance(prev => prev + amount);
    
    // Add to recent activity
    const newActivity = {
      text: `Added ₹${amount} to wallet`,
      time: 'Just now'
    };
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 2)]);
    
    toast.success(`₹${amount} added to wallet!`);
  };

  const togglePreference = (key: 'notifications') => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Back to Menu Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Menu
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold">Profile Information</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600 mb-2">Full Name</Label>
                    <Input
                      value={editedUser.name}
                      onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2">Roll Number</Label>
                    <Input
                      value={editedUser.rollNumber}
                      onChange={(e) => setEditedUser({...editedUser, rollNumber: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2">Email</Label>
                    <Input
                      value={editedUser.email}
                      onChange={(e) => setEditedUser({...editedUser, email: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2">Phone Number</Label>
                    <Input
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2">Course</Label>
                    <Input
                      value={editedUser.course}
                      onChange={(e) => setEditedUser({...editedUser, course: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2">Year</Label>
                    <Input
                      value={editedUser.year}
                      onChange={(e) => setEditedUser({...editedUser, year: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <Label className="text-sm text-gray-600">Full Name</Label>
                    <p className="text-gray-400 mt-1">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Roll Number</Label>
                    <p className="text-gray-400 mt-1">{user.rollNumber || 'CS21B1234'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Email</Label>
                    <p className="text-gray-400 mt-1">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Phone Number</Label>
                    <p className="text-gray-400 mt-1">{user.phone || '+91 98765 43210'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Course</Label>
                    <p className="text-gray-400 mt-1">{user.department || 'Computer Science'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Year</Label>
                    <p className="text-gray-400 mt-1">3rd Year</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.ordersThisMonth}</div>
                  <div className="text-sm text-gray-600 mt-1">Orders This Month</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">₹{stats.totalSpent}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Spent</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600">{stats.avgRating}</div>
                  <div className="text-sm text-gray-600 mt-1">Avg Rating</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">₹{stats.savings}</div>
                  <div className="text-sm text-gray-600 mt-1">Savings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Wallet, Preferences, Recent Activity */}
        <div className="space-y-6">
          {/* Wallet */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold">Wallet</h3>
              </div>
              
              <div className="bg-green-50 rounded-xl p-6 mb-4">
                <div className="flex items-baseline justify-center gap-1">
                  <IndianRupee className="h-6 w-6 text-green-600" />
                  <span className="text-4xl font-bold text-green-600">{walletBalance}</span>
                </div>
                <div className="text-center text-sm text-green-700 mt-2">Available Balance</div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => addToWallet(100)}
                >
                  Add ₹100
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => addToWallet(200)}
                >
                  Add ₹200
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => addToWallet(500)}
                >
                  Add ₹500
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">Dietary Preference</Label>
                  <Badge className="bg-green-100 text-green-700 gap-1">
                    🥬 {preferences.dietary}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">Spice Level</Label>
                  <Badge className="bg-orange-100 text-orange-700 gap-1">
                    <Flame className="h-3 w-3" />
                    {preferences.spiceLevel}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-gray-600">Notifications</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePreference('notifications')}
                    className="h-auto p-0"
                  >
                    <Badge className={preferences.notifications ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}>
                      {preferences.notifications ? (
                        <>
                          <Bell className="h-3 w-3 mr-1" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <BellOff className="h-3 w-3 mr-1" />
                          Disabled
                        </>
                      )}
                    </Badge>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{activity.text}</span>
                      <span className="text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
