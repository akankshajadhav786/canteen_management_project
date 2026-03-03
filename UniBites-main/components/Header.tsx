import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ShoppingCart, User, UtensilsCrossed, Clock, Star, Menu, LogOut, Settings, UserCircle, BarChart3 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  userType: 'student' | 'staff' | 'admin';
}

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  user?: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onAdminDashboard?: () => void;
}

export function Header({ cartItemCount, onCartClick, user, onLoginClick, onLogout, onAdminDashboard }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-3 sm:px-4 py-2 xs:py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg">
                <UtensilsCrossed className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  <span className="hidden sm:inline">College Canteen</span>
                  <span className="sm:hidden">Canteen</span>
                </h1>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Open 8:00 AM - 8:00 PM</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Rating - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="font-medium">4.8</span>
            </div>
            
            {/* User Authentication */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-orange-100 gap-2">
                    <div className="bg-gradient-to-br from-orange-200 to-amber-200 p-1 rounded-full">
                      <UserCircle className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="hidden sm:inline max-w-20 truncate">{user.name.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.userType === 'student' ? `Roll: ${user.rollNumber}` : `ID: ${user.rollNumber}`}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.userType === 'admin' && onAdminDashboard && (
                    <DropdownMenuItem onClick={onAdminDashboard} className="cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onLoginClick}
                className="hover:bg-orange-100 gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            )}
            
            {/* Cart Button */}
            <Button 
              variant="default" 
              size="sm" 
              onClick={onCartClick} 
              className="relative bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500 animate-pulse"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}