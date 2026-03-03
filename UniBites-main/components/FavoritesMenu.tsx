import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart, Plus, Minus, UtensilsCrossed } from "lucide-react";
import { MenuItem } from "../utils/local/storage";
import { useFavorites } from "./FavoritesContext";

interface FavoritesMenuProps {
  items: MenuItem[];
  cart: Record<string, number>;
  onAddToCart: (itemId: string) => void;
  onRemoveFromCart: (itemId: string) => void;
}

export function FavoritesMenu({ 
  items, 
  cart, 
  onAddToCart, 
  onRemoveFromCart 
}: FavoritesMenuProps) {
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const favoriteItems = items.filter(item => favorites.includes(item.id));

  if (favoriteItems.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">No Favorites Yet</h2>
          <p className="text-muted-foreground mb-4">
            Start adding items to your favorites by clicking the ❤️ button on menu items!
          </p>
          <p className="text-sm text-muted-foreground">
            Your favorite items will appear here for quick access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-red-500 fill-current" />
          Your Favorites
        </h2>
        <p className="text-muted-foreground">
          {favoriteItems.length} item{favoriteItems.length !== 1 ? 's' : ''} you love
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favoriteItems.map(item => {
          const quantity = cart[item.id] || 0;
          const isInCart = quantity > 0;

          return (
            <Card key={item.id} className="relative group hover:shadow-lg transition-shadow">
              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(item.id, item.name)}
                className="absolute top-2 right-2 z-10 h-8 w-8 p-0 bg-white/80 hover:bg-white shadow-sm"
              >
                <Heart 
                  className={`h-4 w-4 ${
                    isFavorite(item.id) 
                      ? 'text-red-500 fill-current' 
                      : 'text-muted-foreground'
                  }`} 
                />
              </Button>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">₹{item.price}</span>
                    <Badge 
                      variant={item.available ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {item.available ? "Available" : "Sold Out"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {isInCart ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveFromCart(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[20px] text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddToCart(item.id)}
                          className="h-8 w-8 p-0"
                          disabled={!item.available}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => onAddToCart(item.id)}
                        disabled={!item.available}
                        size="sm"
                        className="h-8"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-pink-50 to-red-50 border border-pink-200 rounded-xl p-6">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-pink-900">Your Taste Profile</h3>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-lg font-bold text-pink-700">{favoriteItems.length}</p>
              <p className="text-pink-600">Favorite Items</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-pink-700">
                ₹{favoriteItems.reduce((avg, item) => avg + item.price, 0) / favoriteItems.length || 0}
              </p>
              <p className="text-pink-600">Avg Price</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-pink-700">
                {[...new Set(favoriteItems.map(item => item.category))].length}
              </p>
              <p className="text-pink-600">Categories</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}