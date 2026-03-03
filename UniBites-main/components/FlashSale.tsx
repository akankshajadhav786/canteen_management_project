import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Flame, Clock, Zap, Plus, Minus, ChefHat, Timer } from "lucide-react";
import { MenuItem } from "../utils/local/storage";
import { toast } from "sonner@2.0.3";

interface FlashSaleProps {
  items: MenuItem[];
  cart: Record<string, number>;
  onAddToCart: (itemId: string) => void;
  onRemoveFromCart: (itemId: string) => void;
}

interface FlashSaleItem {
  itemId: string;
  originalPrice: number;
  discountPercentage: number;
  discountedPrice: number;
  remainingTime: number; // in seconds
  remainingQuantity: number;
  totalQuantity: number;
  reason: string; // Why this flash sale is happening
  kitchenStatus: string; // Kitchen context
  saleId: string; // Unique sale identifier
  timeSlot: string; // Morning, Afternoon, Evening
}

export function FlashSale({ items, cart, onAddToCart, onRemoveFromCart }: FlashSaleProps) {
  const [flashSaleItems, setFlashSaleItems] = useState<FlashSaleItem[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Simulate multiple flash sales per day based on kitchen batches and time slots
  useEffect(() => {
    const generateFlashSales = () => {
      const currentHour = new Date().getHours();
      let timeSlot = 'Morning';
      let timeSlotSales: any[] = [];

      // Determine time slot and appropriate sales
      if (currentHour >= 6 && currentHour < 12) {
        timeSlot = 'Morning';
        timeSlotSales = [
          {
            itemId: "2", // Poha
            originalPrice: 25,
            discountPercentage: 20,
            remainingTime: 300,
            remainingQuantity: 6,
            totalQuantity: 10,
            reason: "Morning Rush Special",
            kitchenStatus: "Pan is hot, spices ready! Perfect for breakfast rush 🌅"
          },
          {
            itemId: "12", // Chai
            originalPrice: 10,
            discountPercentage: 30,
            remainingTime: 180,
            remainingQuantity: 15,
            totalQuantity: 20,
            reason: "Fresh Tea Batch",
            kitchenStatus: "Tea leaves brewing, milk boiling - morning perfect! ☕"
          }
        ];
      } else if (currentHour >= 12 && currentHour < 17) {
        timeSlot = 'Afternoon';
        timeSlotSales = [
          {
            itemId: "9", // Pav Bhaji
            originalPrice: 55,
            discountPercentage: 18,
            remainingTime: 420,
            remainingQuantity: 4,
            totalQuantity: 8,
            reason: "Lunch Batch Ready",
            kitchenStatus: "Bhaji simmering, pavs buttered - lunch rush time! 🥖"
          },
          {
            itemId: "14", // Cold Coffee
            originalPrice: 35,
            discountPercentage: 25,
            remainingTime: 240,
            remainingQuantity: 8,
            totalQuantity: 12,
            reason: "Beat The Heat",
            kitchenStatus: "Coffee brewing, ice ready - perfect afternoon cooler! ❄️"
          },
          {
            itemId: "8", // Samosa
            originalPrice: 15,
            discountPercentage: 22,
            remainingTime: 180,
            remainingQuantity: 7,
            totalQuantity: 12,
            reason: "Hot Oil Special",
            kitchenStatus: "Oil at perfect temperature, ready for crispy goodness! 🔥"
          }
        ];
      } else {
        timeSlot = 'Evening';
        timeSlotSales = [
          {
            itemId: "10", // Maggi
            originalPrice: 35,
            discountPercentage: 20,
            remainingTime: 300,
            remainingQuantity: 5,
            totalQuantity: 8,
            reason: "Evening Comfort",
            kitchenStatus: "Water boiling, vegetables chopped - evening snack time! 🍜"
          },
          {
            itemId: "11", // Sandwich
            originalPrice: 40,
            discountPercentage: 15,
            remainingTime: 360,
            remainingQuantity: 6,
            totalQuantity: 10,
            reason: "Grill Master Special",
            kitchenStatus: "Grill heated, sandwich station ready! 🥪"
          }
        ];
      }

      // Randomly select 1-3 sales from the time slot
      const activeFlashSales = timeSlotSales
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .map((sale, index) => ({
          ...sale,
          discountedPrice: Math.round(sale.originalPrice * (1 - sale.discountPercentage / 100)),
          saleId: `${timeSlot.toLowerCase()}-${Date.now()}-${index}`,
          timeSlot
        }));

      setFlashSaleItems(activeFlashSales);
    };

    // Generate flash sales on mount
    generateFlashSales();

    // Regenerate flash sales every 3-7 minutes (randomized)
    const randomInterval = (3 + Math.random() * 4) * 60 * 1000;
    const flashSaleInterval = setInterval(generateFlashSales, randomInterval);

    return () => clearInterval(flashSaleInterval);
  }, []);

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
      setFlashSaleItems(prev => 
        prev.map(item => ({
          ...item,
          remainingTime: Math.max(0, item.remainingTime - 1)
        })).filter(item => item.remainingTime > 0)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (remaining: number, total: number) => {
    return ((total - remaining) / total) * 100;
  };

  if (flashSaleItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Flash Sale Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg animate-pulse">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              🔥 Hot Batch Flash Sale
            </h2>
            <p className="text-sm text-gray-600">
              Kitchen batches in progress - limited time offers!
            </p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white animate-bounce">
          <Zap className="h-3 w-3 mr-1" />
          Limited Time
        </Badge>
      </div>

      {/* Flash Sale Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {flashSaleItems.map((flashSale) => {
          const item = items.find(i => i.id === flashSale.itemId);
          if (!item) return null;

          const quantity = cart[item.id] || 0;
          const progressPercentage = getProgressPercentage(flashSale.remainingQuantity, flashSale.totalQuantity);

          return (
            <Card key={flashSale.itemId} className="group relative overflow-hidden border-2 border-red-200 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 animate-pulse"></div>
              
              {/* Countdown badge */}
              <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse">
                <Timer className="h-3 w-3" />
                {formatTime(flashSale.remainingTime)}
              </div>

              <CardContent className="p-6 relative z-10">
                <div className="space-y-4">
                  {/* Item Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                          {flashSale.reason}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      
                      {/* Kitchen Status */}
                      <div className="flex items-center gap-2 p-2 bg-orange-100 rounded-lg">
                        <ChefHat className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-800 font-medium">
                          {flashSale.kitchenStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-green-600">
                        ₹{flashSale.discountedPrice}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{flashSale.originalPrice}
                      </span>
                      <Badge className="bg-red-500 text-white">
                        {flashSale.discountPercentage}% OFF
                      </Badge>
                    </div>
                    <p className="text-xs text-green-600 font-medium">
                      You save ₹{flashSale.originalPrice - flashSale.discountedPrice}!
                    </p>
                  </div>

                  {/* Availability Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Only {flashSale.remainingQuantity} left in {flashSale.timeSlot.toLowerCase()} batch!
                      </span>
                      <span className="text-xs text-red-600 font-bold">
                        {Math.round(progressPercentage)}% claimed
                      </span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-2 bg-red-100"
                    />
                  </div>

                  {/* Add to Cart */}
                  <div className="pt-2">
                    {quantity === 0 ? (
                      <Button
                        onClick={() => {
                          onAddToCart(item.id);
                          toast.success(`🔥 Flash sale item added! You saved ₹${flashSale.originalPrice - flashSale.discountedPrice}!`);
                        }}
                        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 shadow-lg transform transition-all duration-200 hover:scale-105"
                        disabled={!item.available || flashSale.remainingQuantity === 0}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Grab Flash Deal - ₹{flashSale.discountedPrice}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            onClick={() => onRemoveFromCart(item.id)}
                            size="sm"
                            variant="outline"
                            className="h-10 w-10 p-0 border-red-300 hover:bg-red-50"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                          <Button
                            onClick={() => {
                              onAddToCart(item.id);
                              toast.success(`🔥 Another flash sale item added!`);
                            }}
                            size="sm"
                            variant="outline"
                            className="h-10 w-10 p-0 border-red-300 hover:bg-red-50"
                            disabled={flashSale.remainingQuantity === 0}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Flash sale total */}
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-sm text-green-700">Flash Sale Total</div>
                          <div className="font-bold text-green-800 text-lg">
                            ₹{(flashSale.discountedPrice * quantity).toFixed(0)}
                          </div>
                          <div className="text-xs text-green-600">
                            Regular price: ₹{(flashSale.originalPrice * quantity).toFixed(0)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Urgency messaging */}
                  <div className="flex items-center justify-center gap-2 p-2 bg-red-100 rounded-lg">
                    <Clock className="h-4 w-4 text-red-600 animate-pulse" />
                    <span className="text-sm text-red-800 font-medium">
                      Ready in ≤5 min • {flashSale.remainingQuantity} left • {formatTime(flashSale.remainingTime)} remaining
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Flash Sale Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-200 rounded-full">
            <Flame className="h-4 w-4 text-orange-700" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-orange-900 mb-1">How Flash Sales Work</h4>
            <p className="text-sm text-orange-800">
              When our kitchen is already preparing batches of popular items, we offer flash discounts to optimize 
              cooking efficiency. The oil is hot, water is boiling - perfect time for extra portions at great prices!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}