import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner@2.0.3";

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (itemId: string, itemName?: string) => void;
  isFavorite: (itemId: string) => boolean;
  favoriteCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ 
  children, 
  userId 
}: { 
  children: React.ReactNode;
  userId?: string;
}) {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage when component mounts or userId changes
  useEffect(() => {
    if (userId) {
      const savedFavorites = localStorage.getItem(`favorites_${userId}`);
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (error) {
          console.error('Failed to parse saved favorites:', error);
          setFavorites([]);
        }
      }
    } else {
      setFavorites([]);
    }
  }, [userId]);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (userId && favorites.length >= 0) {
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
    }
  }, [favorites, userId]);

  const toggleFavorite = (itemId: string, itemName?: string) => {
    if (!userId) {
      toast.error('Please login to add favorites');
      return;
    }

    setFavorites(prev => {
      const isFavorited = prev.includes(itemId);
      
      if (isFavorited) {
        toast.success(itemName ? `${itemName} removed from favorites` : 'Item removed from favorites');
        return prev.filter(id => id !== itemId);
      } else {
        toast.success(itemName ? `${itemName} added to favorites ❤️` : 'Item added to favorites ❤️');
        return [...prev, itemId];
      }
    });
  };

  const isFavorite = (itemId: string) => {
    return favorites.includes(itemId);
  };

  const favoriteCount = favorites.length;

  return (
    <FavoritesContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorite,
      favoriteCount
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}