import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Gift, Plus, Minus, Clock, DollarSign, Percent, Heart, Star } from 'lucide-react';
import { MenuItem } from '../utils/local/storage';
import { toast } from 'sonner@2.0.3';

interface ComboOffersProps {
  items: MenuItem[];
  cart: Record<string, number>;
  onAddToCart: (itemId: string) => void;
  onRemoveFromCart: (itemId: string) => void;
}

interface ComboOffer {
  id: string;
  name: string;
  description: string;
  itemIds: string[];
  originalPrice: number;
  comboPrice: number;
  discount: number;
  discountPercentage: number;
  category: 'meal' | 'snack' | 'beverage' | 'breakfast';
  isTimeBound: boolean;
  availableFrom?: string;
  availableTo?: string;
  popularity: 'hot' | 'new' | 'trending';
  tags: string[];
}

export function ComboOffers({ items, cart, onAddToCart, onRemoveFromCart }: ComboOffersProps) {
  const [comboOffers, setComboOffers] = useState<ComboOffer[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const combos: ComboOffer[] = [
      {
        id: 'combo-1',
        name: 'Complete Breakfast Combo',
        description: 'Perfect start to your day with fresh paratha, chai, and a side',
        itemIds: ['1', '12'], // Aloo Paratha + Chai
        originalPrice: 55,
        comboPrice: 45,
        discount: 10,
        discountPercentage: 18,
        category: 'breakfast',
        isTimeBound: true,
        availableFrom: '07:00',
        availableTo: '11:00',
        popularity: 'hot',
        tags: ['Morning Special', 'Energy Boost']
      },
      {
        id: 'combo-2',
        name: 'Snack Attack Combo',
        description: 'Best of both worlds - crispy samosa with refreshing drink',
        itemIds: ['8', '15'], // Samosa + Fresh Lime
        originalPrice: 35,
        comboPrice: 28,
        discount: 7,
        discountPercentage: 20,
        category: 'snack',
        isTimeBound: false,
        popularity: 'trending',
        tags: ['Crispy', 'Refreshing']
      },
      {
        id: 'combo-3',
        name: 'Hearty Lunch Deal',
        description: 'Satisfying meal with dal rice and a refreshing beverage',
        itemIds: ['4', '14'], // Dal Rice + Cold Coffee
        originalPrice: 95,
        comboPrice: 75,
        discount: 20,
        discountPercentage: 21,
        category: 'meal',
        isTimeBound: true,
        availableFrom: '12:00',
        availableTo: '16:00',
        popularity: 'hot',
        tags: ['Filling', 'Nutritious']
      },
      {
        id: 'combo-4',
        name: 'Street Food Special',
        description: 'Mumbai street food experience with pav bhaji and masala chai',
        itemIds: ['9', '12'], // Pav Bhaji + Chai
        originalPrice: 65,
        comboPrice: 55,
        discount: 10,
        discountPercentage: 15,
        category: 'meal',
        isTimeBound: true,
        availableFrom: '14:00',
        availableTo: '18:00',
        popularity: 'hot',
        tags: ['Street Food', 'Spicy']
      },
      {
        id: 'combo-5',
        name: 'Evening Comfort Combo',
        description: 'Perfect evening snack with hot maggi and refreshing lime water',
        itemIds: ['10', '15'], // Maggi + Fresh Lime
        originalPrice: 55,
        comboPrice: 45,
        discount: 10,
        discountPercentage: 18,
        category: 'snack',
        isTimeBound: true,
        availableFrom: '16:00',
        availableTo: '20:00',
        popularity: 'new',
        tags: ['Comfort Food', 'Light']
      },
      {
        id: 'combo-6',
        name: 'Study Fuel Combo',
        description: 'Keep your energy up with grilled sandwich and cold coffee',
        itemIds: ['11', '14'], // Sandwich + Cold Coffee
        originalPrice: 75,
        comboPrice: 62,
        discount: 13,
        discountPercentage: 17,
        category: 'snack',
        isTimeBound: false,
        popularity: 'trending',
        tags: ['Brain Food', 'Caffeine']
      }
    ];

    setComboOffers(combos);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const isComboAvailable = (combo: ComboOffer) => {
    if (!combo.isTimeBound) return true;
    
    const currentTimeString = currentTime.toTimeString().slice(0, 5);
    return currentTimeString >= combo.availableFrom! && currentTimeString <= combo.availableTo!;
  };

  const getComboItemsInCart = (combo: ComboOffer) => {
    const itemsInCart = combo.itemIds.filter(itemId => cart[itemId] > 0);
    const minQuantity = Math.min(...combo.itemIds.map(itemId => cart[itemId] || 0));
    return { itemsInCart, completeComboCount: minQuantity };
  };

  const addComboToCart = (combo: ComboOffer) => {
    combo.itemIds.forEach(itemId => {
      onAddToCart(itemId);
    });
    toast.success(`🎁 ${combo.name} combo added! You saved ₹${combo.discount}!`);
  };

  const removeComboFromCart = (combo: ComboOffer) => {
    combo.itemIds.forEach(itemId => {
      onRemoveFromCart(itemId);
    });
  };

  const getPopularityIcon = (popularity: string) => {
    switch (popularity) {
      case 'hot': return { icon: <Star className="h-3 w-3 fill-current" />, color: 'bg-red-500 text-white' };
      case 'new': return { icon: <Gift className="h-3 w-3" />, color: 'bg-green-500 text-white' };
      case 'trending': return { icon: <Heart className="h-3 w-3" />, color: 'bg-purple-500 text-white' };
      default: return { icon: <Star className="h-3 w-3" />, color: 'bg-gray-500 text-white' };
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breakfast': return 'from-yellow-500 to-orange-500';
      case 'meal': return 'from-green-500 to-blue-500';
      case 'snack': return 'from-purple-500 to-pink-500';
      case 'beverage': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  if (comboOffers.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Gift className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Combo Offers</h2>
            <p className="text-sm text-muted-foreground">
              Save more with our meal combinations
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          Up to 21% off
        </Badge>
      </div>

      {/* Combo Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comboOffers.map((combo) => {
          const available = isComboAvailable(combo);
          const { completeComboCount } = getComboItemsInCart(combo);
          const popularityInfo = getPopularityIcon(combo.popularity);
          
          // Get combo items details
          const comboItems = combo.itemIds.map(id => items.find(item => item.id === id)).filter(Boolean);
          
          return (
            <Card 
              key={combo.id} 
              className={`relative transition-all hover:shadow-md ${
                available 
                  ? 'bg-white' 
                  : 'bg-muted/50'
              }`}
            >
              {/* Popularity Badge */}
              <div className="absolute top-3 right-3">
                <Badge className={popularityInfo.color} variant="secondary">
                  {popularityInfo.icon}
                  <span className="ml-1 capitalize text-xs">{combo.popularity}</span>
                </Badge>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-base pr-20">{combo.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{combo.description}</p>
                
                {/* Time availability */}
                {combo.isTimeBound && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock className="h-3.5 w-3.5 text-orange-600" />
                    <span className="text-xs text-muted-foreground">
                      {combo.availableFrom} - {combo.availableTo}
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Combo Items */}
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Includes:</p>
                  {comboItems.map((item, index) => (
                    <div key={item?.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">• {item?.name}</span>
                      <span className="text-muted-foreground">₹{item?.price}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground line-through">₹{combo.originalPrice}</span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {combo.discountPercentage}% OFF
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Combo Price</span>
                    <span className="text-xl font-semibold text-orange-600">₹{combo.comboPrice}</span>
                  </div>
                </div>

                {/* Add to Cart Controls */}
                <div className="pt-1">
                  {available ? (
                    completeComboCount === 0 ? (
                      <Button
                        onClick={() => addComboToCart(combo)}
                        className="w-full"
                        variant="default"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Combo
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 p-2 bg-muted/50 rounded-md">
                          <Button
                            onClick={() => removeComboFromCart(combo)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <div className="flex-1 text-center">
                            <div className="font-semibold">{completeComboCount} combo{completeComboCount > 1 ? 's' : ''}</div>
                            <div className="text-xs text-muted-foreground">
                              ₹{(combo.comboPrice * completeComboCount).toFixed(0)}
                            </div>
                          </div>
                          <Button
                            onClick={() => addComboToCart(combo)}
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <Button
                      disabled
                      className="w-full"
                      variant="outline"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Not Available Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 rounded-md">
            <Gift className="h-4 w-4 text-orange-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1.5">About Combos</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Save money with thoughtfully paired items. Our combos offer balanced nutrition with complete meal combinations. Some combos are time-specific for optimal freshness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}