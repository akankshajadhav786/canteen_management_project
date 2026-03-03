import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Settings, 
  Clock,
  Users,
  Zap,
  Timer,
  Bell
} from "lucide-react";
import { User as UserType } from "../utils/local/storage";

interface EnhancedHeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  user: UserType | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onAdminDashboard?: () => void;
  onGroupCartClick: () => void;
  onPreorderClick: () => void;
  onOrderStatusClick: () => void;
  onProfileClick: () => void;
  activeOrders?: number;
  onViewOrderStatus?: () => void;
  onKitchenDashboard?: () => void;
}

export function EnhancedHeader({ 
  cartItemCount, 
  onCartClick, 
  user, 
  onLoginClick, 
  onLogout, 
  onAdminDashboard,
  onGroupCartClick,
  onPreorderClick,
  onOrderStatusClick,
  onProfileClick,
  activeOrders = 0,
  onViewOrderStatus,
  onKitchenDashboard
}: EnhancedHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 md:py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg shadow-md">
              <div className="h-6 w-6 md:h-8 md:w-8 bg-white rounded-sm flex items-center justify-center">
                <span className="text-orange-500 font-bold text-sm md:text-base">U</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-gray-900">UniBites</h1>
              <p className="text-xs md:text-sm text-gray-600">Smart • Fast • Delicious</p>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            {user && (
              <>
                {/* Order Status */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOrderStatusClick}
                  className="relative hidden sm:flex"
                >
                  <Bell className="h-4 w-4 mr-1" />
                  <span className="hidden md:inline">Orders</span>
                  {activeOrders > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 text-white text-xs">
                      {activeOrders}
                    </Badge>
                  )}
                </Button>

                {/* Preorder */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreorderClick}
                  className="hidden md:flex"
                >
                  <Timer className="h-4 w-4 mr-1" />
                  Schedule
                </Button>

                {/* Group Cart */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onGroupCartClick}
                  className="relative"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Group</span>
                </Button>
              </>
            )}

            {/* Shopping Cart */}
            <Button
              variant="outline"
              size="sm"
              onClick={onCartClick}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Cart</span>
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-orange-500 text-white text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{user.userType}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onProfileClick}
                    className="hidden sm:flex"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  
                  {user.userType === 'admin' && onAdminDashboard && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onAdminDashboard}
                      className="hidden sm:flex"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Logout</span>
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={onLoginClick} size="sm">
                <User className="h-4 w-4 mr-1" />
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Action Bar */}
        {user && (
          <div className="flex sm:hidden items-center gap-2 pb-3 border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onOrderStatusClick}
              className="flex-1 relative"
            >
              <Bell className="h-4 w-4 mr-1" />
              Orders
              {activeOrders > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-red-500 text-white text-xs">
                  {activeOrders}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPreorderClick}
              className="flex-1"
            >
              <Timer className="h-4 w-4 mr-1" />
              Schedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onProfileClick}
              className="flex-1"
            >
              <User className="h-4 w-4 mr-1" />
              Profile
            </Button>
            {user.userType === 'admin' && onAdminDashboard && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAdminDashboard}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-1" />
                Admin
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}