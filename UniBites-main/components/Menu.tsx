import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Plus, Minus, Coffee, UtensilsCrossed, Cookie, Sunrise, Clock, Star } from "lucide-react";
import { MenuItem } from "../utils/local/storage";

interface MenuProps {
  items: MenuItem[];
  cart: Record<string, number>;
  onAddToCart: (itemId: string) => void;
  onRemoveFromCart: (itemId: string) => void;
}

const categoryInfo = {
  breakfast: {
    icon: Sunrise,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    borderColor: "border-amber-200"
  },
  lunch: {
    icon: UtensilsCrossed,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
    borderColor: "border-green-200"
  },
  snacks: {
    icon: Cookie,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
    borderColor: "border-purple-200"
  },
  beverages: {
    icon: Coffee,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
    borderColor: "border-blue-200"
  }
};

const categoryImages = {
  breakfast: "https://images.unsplash.com/photo-1644289450169-bc58aa16bacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBicmVha2Zhc3QlMjBwYXJhdGhhfGVufDF8fHx8MTc1NjQzNzEwNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  lunch: "https://images.unsplash.com/photo-1742281257687-092746ad6021?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsdW5jaCUyMHRoYWxpJTIwY3Vycnl8ZW58MXx8fHwxNzU2NDM3MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  snacks: "https://images.unsplash.com/photo-1697155836252-d7f969108b5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzbmFja3MlMjBzYW1vc2F8ZW58MXx8fHwxNzU2NDM3MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  beverages: "https://images.unsplash.com/photo-1648192312898-838f9b322f47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWElMjBjaGFpJTIwYmV2ZXJhZ2V8ZW58MXx8fHwxNzU2NDM3MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
};

export function Menu({ items, cart, onAddToCart, onRemoveFromCart }: MenuProps) {
  // Enhanced null safety: ensure items and cart are always defined
  const safeItems = items || [];
  const safeCart = cart || {};
  
  // More comprehensive validation of menu items
  const validItems = safeItems.filter(item => {
    if (!item) return false;
    if (typeof item !== 'object') return false;
    if (!item.id || typeof item.id !== 'string') return false;
    if (!item.name || typeof item.name !== 'string') return false;
    if (!item.category || typeof item.category !== 'string') return false;
    if (typeof item.price !== 'number' || item.price < 0) return false;
    if (typeof item.available !== 'boolean') return false;
    return true;
  });

  // Safely extract categories with additional validation
  const categories = [...new Set(validItems
    .map(item => item?.category)
    .filter(category => category && typeof category === 'string')
  )];

  // Enhanced empty state with better messaging
  if (!validItems.length) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Menu Loading...</h2>
          <p className="text-muted-foreground mb-4">
            Please wait while we load our delicious menu items.
          </p>
          <div className="flex justify-center">
            <div className="animate-pulse flex space-x-1">
              <div className="rounded-full bg-muted h-2 w-2"></div>
              <div className="rounded-full bg-muted h-2 w-2"></div>
              <div className="rounded-full bg-muted h-2 w-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categories.map(category => {
        // Enhanced null safety for category info
        const info = categoryInfo[category as keyof typeof categoryInfo];
        if (!info) {
          console.warn(`Unknown category: ${category}`);
          return null;
        }
        const IconComponent = info?.icon || UtensilsCrossed;
        
        return (
          <div key={category} className="space-y-6">
            {/* Category Header */}
            <div className={`${info.bgColor} ${info.borderColor} border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`bg-gradient-to-br ${info.color} p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg`}>
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold capitalize">{category}</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {validItems.filter(item => item?.category === category && item?.available === true).length} items available
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <ImageWithFallback
                    src={categoryImages[category as keyof typeof categoryImages]}
                    alt={`${category} category`}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl object-cover shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Menu Items - Enhanced responsive grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
              {validItems
                .filter(item => item?.category === category)
                .map(item => (
                  <Card key={item.id} className={`group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden ${!item.available ? 'opacity-60' : 'hover:-translate-y-1 active:scale-[0.98]'}`}>
                    {/* Item Image */}
                    <div className="relative h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name || 'Menu item'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Price Badge */}
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                        <Badge className="bg-white text-black shadow-lg font-bold px-2 sm:px-3 py-1 text-xs sm:text-sm">
                          ₹{item.price || 0}
                        </Badge>
                      </div>
                      
                      {/* Availability Badge */}
                      {!item.available && (
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                          <Badge variant="destructive" className="shadow-lg text-xs sm:text-sm">
                            Out of Stock
                          </Badge>
                        </div>
                      )}
                      
                      {/* Item Name Overlay */}
                      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                        <h3 className="text-white font-bold text-base sm:text-lg">{item.name}</h3>
                      </div>
                    </div>

                    <CardContent className="p-3 sm:p-4">
                      <CardDescription className="mb-3 sm:mb-4 text-xs sm:text-sm line-clamp-2">
                        {item.description || 'Delicious item from our menu'}
                      </CardDescription>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3 sm:mb-4">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs sm:text-sm font-medium">4.{Math.floor(Math.random() * 5) + 3}</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">({Math.floor(Math.random() * 50) + 10} reviews)</span>
                      </div>

                      {item.available ? (
                        <div className="space-y-3">
                          {(safeCart[item.id] || 0) > 0 ? (
                            <div className="flex items-center justify-center gap-2 xs:gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onRemoveFromCart(item.id)}
                                className="h-7 w-7 xs:h-8 xs:w-8 p-0 rounded-full touch-manipulation"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="font-bold text-base xs:text-lg w-6 xs:w-8 text-center">
                                {safeCart[item.id] || 0}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddToCart(item.id)}
                                className="h-7 w-7 xs:h-8 xs:w-8 p-0 rounded-full touch-manipulation"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => onAddToCart(item.id)}
                              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 touch-manipulation"
                              size="sm"
                            >
                              <Plus className="h-3 w-3 xs:h-4 xs:w-4 mr-1 xs:mr-2" />
                              <span className="hidden xs:inline">Add to Cart</span>
                              <span className="xs:hidden text-xs">Add</span>
                            </Button>
                          )}
                          
                          {(safeCart[item.id] || 0) > 0 && (
                            <div className="text-center">
                              <div className="text-xs text-muted-foreground">Total</div>
                              <div className="font-bold text-green-600">
                                ₹{((item.price || 0) * (safeCart[item.id] || 0)).toFixed(0)}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button disabled className="w-full" variant="secondary" size="sm">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Currently Unavailable</span>
                          <span className="sm:hidden">Unavailable</span>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}