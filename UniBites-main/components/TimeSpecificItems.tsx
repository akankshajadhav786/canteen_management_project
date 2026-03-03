import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Clock, Timer, Sun, Sunset, Moon, ChefHat, Utensils, Plus, Minus } from 'lucide-react';
import { MenuItem } from '../utils/local/storage';
import { toast } from 'sonner@2.0.3';

interface TimeSpecificItemsProps {
  items: MenuItem[];
  cart: Record<string, number>;
  onAddToCart: (itemId: string) => void;
  onRemoveFromCart: (itemId: string) => void;
}

interface TimeSpecificItem {
  itemId: string;
  name: string;
  availableFrom: string; // "14:00"
  availableTo: string; // "18:00"
  timeSlot: 'morning' | 'afternoon' | 'evening' | 'night';
  reason: string;
  specialNote: string;
  isAvailableNow: boolean;
  timeUntilAvailable?: number; // seconds until available
  timeUntilExpires?: number; // seconds until expires
}

export function TimeSpecificItems({ items, cart, onAddToCart, onRemoveFromCart }: TimeSpecificItemsProps) {
  const [timeSpecificItems, setTimeSpecificItems] = useState<TimeSpecificItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Define time-specific availability
  useEffect(() => {
    const timeBasedItems: TimeSpecificItem[] = [
      {
        itemId: "9", // Pav Bhaji
        name: "Pav Bhaji",
        availableFrom: "14:00",
        availableTo: "18:00",
        timeSlot: 'afternoon',
        reason: "Lunch Special",
        specialNote: "Fresh bhaji prepared with special afternoon masala blend",
        isAvailableNow: false
      },
      {
        itemId: "14", // Cold Coffee
        name: "Cold Coffee",
        availableFrom: "11:00",
        availableTo: "17:00",
        timeSlot: 'afternoon',
        reason: "Beat the Heat",
        specialNote: "Perfect cooling drink during the hot afternoon hours",
        isAvailableNow: false
      },
      {
        itemId: "1", // Aloo Paratha
        name: "Aloo Paratha",
        availableFrom: "07:00",
        availableTo: "11:00",
        timeSlot: 'morning',
        reason: "Fresh Morning Batch",
        specialNote: "Served hot with fresh curd and pickle",
        isAvailableNow: false
      },
      {
        itemId: "10", // Maggi
        name: "Maggi",
        availableFrom: "16:00",
        availableTo: "20:00",
        timeSlot: 'evening',
        reason: "Evening Comfort",
        specialNote: "Perfect evening snack with extra vegetables",
        isAvailableNow: false
      },
      {
        itemId: "12", // Chai
        name: "Chai",
        availableFrom: "06:00",
        availableTo: "22:00",
        timeSlot: 'morning',
        reason: "All Day Special",
        specialNote: "Fresh brewed every hour throughout the day",
        isAvailableNow: false
      }
    ];

    setTimeSpecificItems(timeBasedItems);
  }, []);

  // Update availability status every minute
  useEffect(() => {
    const updateAvailability = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const currentTimeString = now.toTimeString().slice(0, 5); // "HH:MM"
      
      setTimeSpecificItems(prev => 
        prev.map(item => {
          const isCurrentlyAvailable = currentTimeString >= item.availableFrom && currentTimeString <= item.availableTo;
          
          let timeUntilAvailable: number | undefined;
          let timeUntilExpires: number | undefined;
          
          if (!isCurrentlyAvailable && currentTimeString < item.availableFrom) {
            // Calculate seconds until available
            const availableDate = new Date();
            const [hours, minutes] = item.availableFrom.split(':').map(Number);
            availableDate.setHours(hours, minutes, 0, 0);
            timeUntilAvailable = Math.max(0, Math.floor((availableDate.getTime() - now.getTime()) / 1000));
          }
          
          if (isCurrentlyAvailable) {
            // Calculate seconds until expires
            const expiresDate = new Date();
            const [hours, minutes] = item.availableTo.split(':').map(Number);
            expiresDate.setHours(hours, minutes, 0, 0);
            timeUntilExpires = Math.max(0, Math.floor((expiresDate.getTime() - now.getTime()) / 1000));
          }
          
          return {
            ...item,
            isAvailableNow: isCurrentlyAvailable,
            timeUntilAvailable,
            timeUntilExpires
          };
        })
      );
    };

    updateAvailability();
    const interval = setInterval(updateAvailability, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTimeIcon = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return <Sun className="h-4 w-4 text-yellow-600" />;
      case 'afternoon': return <Sun className="h-4 w-4 text-orange-600" />;
      case 'evening': return <Sunset className="h-4 w-4 text-purple-600" />;
      case 'night': return <Moon className="h-4 w-4 text-blue-600" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getTimeSlotColor = (timeSlot: string, isAvailable: boolean) => {
    if (!isAvailable) return 'bg-gray-100 border-gray-300';
    
    switch (timeSlot) {
      case 'morning': return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300';
      case 'afternoon': return 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300';
      case 'evening': return 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300';
      case 'night': return 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300';
      default: return 'bg-gray-50 border-gray-300';
    }
  };

  if (timeSpecificItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ⏰ Time-Special Menu
            </h2>
            <p className="text-sm text-gray-600">
              Special items available at specific times of the day
            </p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <Timer className="h-3 w-3 mr-1" />
          Time-Based
        </Badge>
      </div>

      {/* Time-Specific Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timeSpecificItems.map((timeItem) => {
          const item = items.find(i => i.id === timeItem.itemId);
          if (!item) return null;

          const quantity = cart[item.id] || 0;
          
          return (
            <Card 
              key={timeItem.itemId} 
              className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-lg ${
                getTimeSlotColor(timeItem.timeSlot, timeItem.isAvailableNow)
              }`}
            >
              {/* Availability Badge */}
              <div className="absolute top-3 right-3 z-10">
                {timeItem.isAvailableNow ? (
                  <Badge className="bg-green-500 text-white">
                    <Utensils className="h-3 w-3 mr-1" />
                    Available Now
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-500 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {timeItem.timeUntilAvailable ? 
                      `Available in ${formatTimeRemaining(timeItem.timeUntilAvailable)}` : 
                      'Not Available'
                    }
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  {getTimeIcon(timeItem.timeSlot)}
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </div>
                <p className="text-sm text-gray-600">{item.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Time Information */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Available Time:</span>
                    <span className="text-blue-600 font-semibold">
                      {timeItem.availableFrom} - {timeItem.availableTo}
                    </span>
                  </div>
                  
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <ChefHat className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">{timeItem.reason}</span>
                    </div>
                    <p className="text-xs text-blue-700">{timeItem.specialNote}</p>
                  </div>
                </div>

                {/* Countdown Progress (if available now) */}
                {timeItem.isAvailableNow && timeItem.timeUntilExpires && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 font-medium">Available for:</span>
                      <span className="text-green-600 font-bold">
                        {formatTimeRemaining(timeItem.timeUntilExpires)}
                      </span>
                    </div>
                    <Progress 
                      value={((3600 - timeItem.timeUntilExpires) / 3600) * 100} 
                      className="h-2 bg-green-100"
                    />
                  </div>
                )}

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">₹{item.price}</span>
                  {timeItem.isAvailableNow && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Perfect Timing!
                    </Badge>
                  )}
                </div>

                {/* Add to Cart Controls */}
                <div className="pt-2">
                  {timeItem.isAvailableNow ? (
                    quantity === 0 ? (
                      <Button
                        onClick={() => {
                          onAddToCart(item.id);
                          toast.success(`⏰ Perfect timing! ${item.name} added to cart!`);
                        }}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3"
                        disabled={!item.available}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Cart - ₹{item.price}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            onClick={() => onRemoveFromCart(item.id)}
                            size="sm"
                            variant="outline"
                            className="h-10 w-10 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                          <Button
                            onClick={() => {
                              onAddToCart(item.id);
                              toast.success(`Another ${item.name} added!`);
                            }}
                            size="sm"
                            variant="outline"
                            className="h-10 w-10 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-sm text-green-700">Total</div>
                          <div className="font-bold text-green-800 text-lg">
                            ₹{(item.price * quantity).toFixed(0)}
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      {timeItem.timeUntilAvailable ? 
                        `Available in ${formatTimeRemaining(timeItem.timeUntilAvailable)}` :
                        'Not Available Now'
                      }
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-200 rounded-full">
            <Clock className="h-4 w-4 text-blue-700" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 mb-1">Why Time-Specific Items?</h4>
            <p className="text-sm text-blue-800">
              Some items are prepared fresh at specific times to ensure optimal taste and quality. 
              Morning parathas are best when fresh, afternoon items help beat the heat, and evening snacks 
              provide perfect comfort food timing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}