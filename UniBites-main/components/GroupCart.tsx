import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { 
  Users, 
  Plus, 
  Minus, 
  Share2, 
  Copy, 
  DollarSign,
  Check,
  Clock,
  UserPlus,
  ShoppingCart,
  Split,
  CreditCard,
  QrCode
} from "lucide-react";
import { MenuItem, User } from "../utils/local/storage";
import { toast } from "sonner@2.0.3";

interface GroupCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  user: User | null;
}

interface GroupCartMember {
  userId: string;
  name: string;
  email: string;
  items: Record<string, number>;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  upiId?: string;
}

interface GroupCartSession {
  sessionId: string;
  adminId: string;
  adminName: string;
  members: GroupCartMember[];
  totalAmount: number;
  status: 'collecting' | 'payment' | 'completed';
  expiresAt: string;
  shareCode: string;
}

export function GroupCart({ isOpen, onClose, items, user }: GroupCartProps) {
  const [groupSession, setGroupSession] = useState<GroupCartSession | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [currentTab, setCurrentTab] = useState<'create' | 'join' | 'active'>('create');

  // Mock UPI IDs for demonstration
  const mockUpiIds = {
    student: "student@paytm",
    staff: "staff@gpay", 
    admin: "admin@phonepe"
  };

  const createGroupCart = async () => {
    if (!user) {
      toast.error("Please login to create a group cart");
      return;
    }

    setIsCreating(true);
    
    try {
      // Simulate API call to create group cart session
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSession: GroupCartSession = {
        sessionId: `gc_${Date.now()}`,
        adminId: user.id,
        adminName: user.name,
        members: [{
          userId: user.id,
          name: user.name,
          email: user.email,
          items: {},
          totalAmount: 0,
          paymentStatus: 'pending',
          upiId: mockUpiIds[user.userType] || `${user.name.toLowerCase().replace(' ', '')}@upi`
        }],
        totalAmount: 0,
        status: 'collecting',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        shareCode: Math.random().toString(36).substring(2, 8).toUpperCase()
      };

      setGroupSession(newSession);
      setIsAdmin(true);
      setCurrentTab('active');
      
      toast.success("Group cart created! Share the code with friends.");
    } catch (error) {
      toast.error("Failed to create group cart");
    } finally {
      setIsCreating(false);
    }
  };

  const joinGroupCart = async () => {
    if (!user || !joinCode) {
      toast.error("Please enter a valid join code");
      return;
    }

    setIsJoining(true);
    
    try {
      // Simulate API call to join group cart
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock joining an existing session
      const existingSession: GroupCartSession = {
        sessionId: `gc_${Date.now() - 60000}`,
        adminId: "admin_user_id",
        adminName: "Cart Admin",
        members: [
          {
            userId: "admin_user_id",
            name: "Cart Admin",
            email: "admin@example.com",
            items: { "12": 2, "8": 1 }, // Chai and Samosa
            totalAmount: 35,
            paymentStatus: 'pending',
            upiId: "admin@phonepe"
          },
          {
            userId: user.id,
            name: user.name,
            email: user.email,
            items: {},
            totalAmount: 0,
            paymentStatus: 'pending',
            upiId: mockUpiIds[user.userType] || `${user.name.toLowerCase().replace(' ', '')}@upi`
          }
        ],
        totalAmount: 35,
        status: 'collecting',
        expiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 minutes left
        shareCode: joinCode
      };

      setGroupSession(existingSession);
      setIsAdmin(false);
      setCurrentTab('active');
      
      toast.success("Joined group cart successfully!");
    } catch (error) {
      toast.error("Failed to join group cart. Check your code.");
    } finally {
      setIsJoining(false);
    }
  };

  const addItemToGroupCart = (itemId: string) => {
    if (!groupSession || !user) return;

    setGroupSession(prev => {
      if (!prev) return prev;
      
      const updatedMembers = prev.members.map(member => {
        if (member.userId === user.id) {
          const newItems = { ...member.items };
          newItems[itemId] = (newItems[itemId] || 0) + 1;
          
          const item = items.find(i => i.id === itemId);
          const newTotalAmount = member.totalAmount + (item?.price || 0);
          
          return {
            ...member,
            items: newItems,
            totalAmount: newTotalAmount
          };
        }
        return member;
      });

      const newTotalAmount = updatedMembers.reduce((sum, member) => sum + member.totalAmount, 0);

      return {
        ...prev,
        members: updatedMembers,
        totalAmount: newTotalAmount
      };
    });

    toast.success("Item added to group cart");
  };

  const removeItemFromGroupCart = (itemId: string) => {
    if (!groupSession || !user) return;

    setGroupSession(prev => {
      if (!prev) return prev;
      
      const updatedMembers = prev.members.map(member => {
        if (member.userId === user.id && member.items[itemId]) {
          const newItems = { ...member.items };
          const item = items.find(i => i.id === itemId);
          
          if (newItems[itemId] > 1) {
            newItems[itemId] -= 1;
          } else {
            delete newItems[itemId];
          }
          
          const newTotalAmount = member.totalAmount - (item?.price || 0);
          
          return {
            ...member,
            items: newItems,
            totalAmount: Math.max(0, newTotalAmount)
          };
        }
        return member;
      });

      const newTotalAmount = updatedMembers.reduce((sum, member) => sum + member.totalAmount, 0);

      return {
        ...prev,
        members: updatedMembers,
        totalAmount: newTotalAmount
      };
    });
  };

  const initiatePayment = () => {
    if (!groupSession || !isAdmin) return;

    setGroupSession(prev => prev ? { ...prev, status: 'payment' } : prev);
    toast.success("Payment phase initiated! Everyone can now pay their share.");
  };

  const markPaymentComplete = (userId: string) => {
    setGroupSession(prev => {
      if (!prev) return prev;
      
      const updatedMembers = prev.members.map(member => {
        if (member.userId === userId) {
          return { ...member, paymentStatus: 'paid' as const };
        }
        return member;
      });

      const allPaid = updatedMembers.every(member => member.paymentStatus === 'paid');
      const newStatus = allPaid ? 'completed' : prev.status;

      return {
        ...prev,
        members: updatedMembers,
        status: newStatus
      };
    });

    if (userId === user?.id) {
      toast.success("Payment completed! ✅");
    }
  };

  const copyShareCode = () => {
    if (groupSession) {
      navigator.clipboard.writeText(groupSession.shareCode);
      toast.success("Share code copied to clipboard!");
    }
  };

  const getTimeRemaining = () => {
    if (!groupSession) return "";
    
    const remaining = new Date(groupSession.expiresAt).getTime() - Date.now();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentUserMember = groupSession?.members.find(m => m.userId === user?.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Group Cart & Split Payment
          </DialogTitle>
          <DialogDescription>
            Create a shared cart with friends and split the payment
          </DialogDescription>
        </DialogHeader>

        {!groupSession ? (
          <div className="space-y-6 py-4">
            {/* Tab Selection */}
            <div className="flex gap-2">
              <Button
                variant={currentTab === 'create' ? 'default' : 'outline'}
                onClick={() => setCurrentTab('create')}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Group Cart
              </Button>
              <Button
                variant={currentTab === 'join' ? 'default' : 'outline'}
                onClick={() => setCurrentTab('join')}
                className="flex-1"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join Group Cart
              </Button>
            </div>

            {currentTab === 'create' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Group Cart</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Create a group cart and get a share code</li>
                      <li>• Share the code with friends to join</li>
                      <li>• Everyone adds their items to the cart</li>
                      <li>• Split payment using individual UPI IDs</li>
                      <li>• Order is placed when everyone pays</li>
                    </ul>
                  </div>
                  
                  <Button
                    onClick={createGroupCart}
                    disabled={isCreating || !user}
                    className="w-full"
                  >
                    {isCreating ? (
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {isCreating ? 'Creating...' : 'Create Group Cart'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {currentTab === 'join' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Join Existing Group Cart</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Group Cart Code</Label>
                    <Input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Enter 6-character code"
                      maxLength={6}
                    />
                  </div>
                  
                  <Button
                    onClick={joinGroupCart}
                    disabled={isJoining || !joinCode || !user}
                    className="w-full"
                  >
                    {isJoining ? (
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    {isJoining ? 'Joining...' : 'Join Group Cart'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Group Cart Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Group Cart</h3>
                    <p className="text-sm text-gray-600">
                      Admin: {groupSession.adminName} • {groupSession.members.length} members
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyShareCode}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        {groupSession.shareCode}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Expires in {getTimeRemaining()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Banner */}
            {groupSession.status === 'collecting' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Collecting items • Add your items to the cart
                  </span>
                </div>
              </div>
            )}

            {groupSession.status === 'payment' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-800">
                    Payment phase • Pay your share using UPI
                  </span>
                </div>
              </div>
            )}

            {groupSession.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    All payments completed! Order is being placed.
                  </span>
                </div>
              </div>
            )}

            {/* Members Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Members ({groupSession.members.length})</span>
                  <span className="text-lg font-bold">₹{groupSession.totalAmount.toFixed(0)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupSession.members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.upiId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{member.totalAmount.toFixed(0)}</p>
                      <Badge
                        variant={member.paymentStatus === 'paid' ? 'default' : 'secondary'}
                        className={
                          member.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {member.paymentStatus === 'paid' ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {member.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* My Items */}
            {currentUserMember && (
              <Card>
                <CardHeader>
                  <CardTitle>My Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.keys(currentUserMember.items).length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No items added yet. Browse the menu to add items!
                    </p>
                  ) : (
                    Object.entries(currentUserMember.items).map(([itemId, quantity]) => {
                      const item = items.find(i => i.id === itemId);
                      if (!item) return null;

                      return (
                        <div key={itemId} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItemFromGroupCart(itemId)}
                              className="h-7 w-7 p-0"
                              disabled={groupSession.status !== 'collecting'}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium">{quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addItemToGroupCart(itemId)}
                              className="h-7 w-7 p-0"
                              disabled={groupSession.status !== 'collecting'}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {isAdmin && groupSession.status === 'collecting' && (
                <Button
                  onClick={initiatePayment}
                  className="flex-1"
                  disabled={groupSession.totalAmount === 0}
                >
                  <Split className="h-4 w-4 mr-2" />
                  Start Payment Phase
                </Button>
              )}

              {groupSession.status === 'payment' && currentUserMember?.paymentStatus === 'pending' && (
                <Button
                  onClick={() => markPaymentComplete(user?.id || '')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Pay ₹{currentUserMember.totalAmount.toFixed(0)} via UPI
                </Button>
              )}

              <Button variant="outline" onClick={onClose}>
                {groupSession.status === 'completed' ? 'Close' : 'Leave Group'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}