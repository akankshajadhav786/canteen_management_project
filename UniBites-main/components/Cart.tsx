import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Clock, ArrowRight } from "lucide-react";
import { MenuItem } from "../utils/local/storage";

interface CartProps {
  items: MenuItem[];
  cart: Record<string, number>;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

const categoryImages = {
  breakfast: "https://images.unsplash.com/photo-1644289450169-bc58aa16bacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBicmVha2Zhc3QlMjBwYXJhdGhhfGVufDF8fHx8MTc1NjQzNzEwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  lunch: "https://images.unsplash.com/photo-1742281257687-092746ad6021?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsdW5jaCUyMHRoYWxpJTIwY3Vycnl8ZW58MXx8fHwxNzU2NDM3MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  snacks: "https://images.unsplash.com/photo-1697155836252-d7f969108b5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzbmFja3MlMjBzYW1vc2F8ZW58MXx8fHwxNzU2NDM3MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  beverages: "https://images.unsplash.com/photo-1648192312898-838f9b322f47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHx0ZWElMjBjaGFpJTIwYmV2ZXJhZ2V8ZW58MXx8fHwxNzU2NDM3MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
};

export function Cart({ items, cart, onUpdateQuantity, onRemoveItem, onCheckout }: CartProps) {
  const cartItems = items.filter(item => item && item.id && cart[item.id] > 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * cart[item.id]), 0);
  const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const gstAmount = totalAmount * 0.05;
  const finalTotal = totalAmount + gstAmount;

  if (cartItems.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <Card className="flex-1 flex flex-col justify-center items-center p-8 text-center border-dashed">
          <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-6 rounded-full mb-4">
            <ShoppingCart className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle className="mb-2">Your cart is empty</CardTitle>
          <CardDescription className="mb-4">
            Add some delicious items from the menu to get started!
          </CardDescription>
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1616205255807-b55f2513eced?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwY2FudGVlbiUyMGZvb2R8ZW58MXx8fHwxNzU2NDM3MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Food"
            className="w-32 h-32 rounded-xl object-cover opacity-50"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 sm:p-4 rounded-t-lg border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-bold text-sm xs:text-base sm:text-lg truncate">Your Order</h2>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 inline mr-1 flex-shrink-0" />
                <span className="truncate">Ready in 15-20 min</span>
              </p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs sm:text-sm flex-shrink-0 ml-2">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4">
        {cartItems.map(item => (
          <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-2 xs:p-3 sm:p-4">
              <div className="flex gap-2 sm:gap-3">
                {/* Item Image */}
                <div className="relative flex-shrink-0">
                  <ImageWithFallback
                    src={item.image || categoryImages[item.category as keyof typeof categoryImages]}
                    alt={item.name}
                    className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-lg object-cover"
                  />
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {cart[item.id]}
                  </Badge>
                </div>
                
                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        ₹{item.price} each
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-6 w-6 sm:h-8 sm:w-8 p-0 ml-2"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, cart[item.id] - 1)}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-full touch-manipulation"
                      >
                        <Minus className="h-2 w-2 sm:h-3 sm:w-3" />
                      </Button>
                      <span className="font-bold w-6 sm:w-8 text-center text-sm sm:text-base">{cart[item.id]}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.id, cart[item.id] + 1)}
                        className="h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-full touch-manipulation"
                      >
                        <Plus className="h-2 w-2 sm:h-3 sm:w-3" />
                      </Button>
                    </div>
                    <div className="font-bold text-green-600 text-xs xs:text-sm sm:text-base">
                      ₹{(item.price * cart[item.id]).toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <div className="border-t bg-white p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between text-xs sm:text-sm">
            <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
            <span>₹{totalAmount.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span>GST (5%)</span>
            <span>₹{gstAmount.toFixed(0)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base sm:text-lg">
            <span>Total</span>
            <span className="text-green-600">₹{finalTotal.toFixed(0)}</span>
          </div>
          
          <Button 
            onClick={onCheckout} 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation min-h-[44px]" 
            size="lg"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden xs:inline">Proceed to Checkout</span>
            <span className="xs:hidden">Checkout</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}