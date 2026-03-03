import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Zap, Clock, Plus, Minus } from "lucide-react";
import { MenuItem } from "../utils/local/storage";

interface ExpressMenuProps {
  items: MenuItem[];
  cart: Record<string, number>;
  onAddToCart: (itemId: string) => void;
  onRemoveFromCart: (itemId: string) => void;
}

// Express items (≤ 5 minutes preparation time)
const EXPRESS_ITEMS = [
  "12", // Chai
  "13", // Coffee  
  "14", // Cold Coffee
  "15", // Fresh Lime
  "8",  // Samosa
  "10", // Maggi
  "11"  // Sandwich
];

export function ExpressMenu({ items, cart, onAddToCart, onRemoveFromCart }: ExpressMenuProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  const expressItems = items.filter(item => EXPRESS_ITEMS.includes(item.id));

  if (expressItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Express Menu</h2>
              <p className="text-sm text-gray-600">Ready in ≤ 5 minutes</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Zap className="h-3 w-3 mr-1" />
            Lightning Fast
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {expressItems.map((item) => {
          const quantity = cart[item.id] || 0;
          
          return (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-yellow-200 hover:border-yellow-300">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="ml-2 flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                      <Clock className="h-3 w-3 text-yellow-600" />
                      <span className="text-xs text-yellow-800 font-medium">≤5min</span>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600 font-medium">Express</span>
                      </div>
                    </div>

                    {quantity === 0 ? (
                      <Button
                        onClick={() => onAddToCart(item.id)}
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md"
                        disabled={!item.available}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => onRemoveFromCart(item.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-yellow-300 hover:bg-yellow-50"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
                        <Button
                          onClick={() => onAddToCart(item.id)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-yellow-300 hover:bg-yellow-50"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Availability Indicator */}
                  {!item.available && (
                    <div className="text-center">
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Currently Unavailable
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Express Menu Benefits */}
      <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-200 rounded-full">
            <Zap className="h-4 w-4 text-yellow-700" />
          </div>
          <div>
            <h4 className="font-semibold text-yellow-900">Why Express Menu?</h4>
            <p className="text-sm text-yellow-800">
              Perfect for quick breaks! These items are pre-prepared or require minimal cooking time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}