import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Search, 
  X, 
  Filter, 
  Star, 
  Clock,
  DollarSign,
  Zap,
  Flame
} from "lucide-react";
import { MenuItem } from "../utils/local/storage";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";

interface MenuSearchProps {
  items: MenuItem[];
  onItemSelect: (item: MenuItem) => void;
  onAddToCart: (itemId: string) => void;
  className?: string;
}

interface SearchFilters {
  categories: string[];
  priceRange: [number, number];
  availability: 'all' | 'available' | 'unavailable';
  rating: number;
  sortBy: 'name' | 'price' | 'rating' | 'popular';
  sortOrder: 'asc' | 'desc';
}

export function MenuSearch({ items, onItemSelect, onAddToCart, className = "" }: MenuSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    categories: [],
    priceRange: [0, 200],
    availability: 'all',
    rating: 0,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const categories = [...new Set(items.map(item => item.category))];
  const maxPrice = Math.max(...items.map(item => item.price));

  // Express items for special highlighting
  const EXPRESS_ITEMS = ["12", "13", "14", "15", "8", "10", "11"];

  useEffect(() => {
    if (searchQuery.length > 0) {
      filterAndSearchItems();
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchQuery, filters, items]);

  const filterAndSearchItems = () => {
    let results = items.filter(item => {
      // Text search
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = 
        filters.categories.length === 0 || 
        filters.categories.includes(item.category);

      // Price filter
      const matchesPrice = 
        item.price >= filters.priceRange[0] && 
        item.price <= filters.priceRange[1];

      // Availability filter
      const matchesAvailability = 
        filters.availability === 'all' ||
        (filters.availability === 'available' && item.available) ||
        (filters.availability === 'unavailable' && !item.available);

      return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
    });

    // Sort results
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          // Mock rating for demo
          const ratingA = 4 + Math.random();
          const ratingB = 4 + Math.random();
          comparison = ratingA - ratingB;
          break;
        case 'popular':
          // Mock popularity for demo
          const popularA = Math.random();
          const popularB = Math.random();
          comparison = popularA - popularB;
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredItems(results);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowResults(false);
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, maxPrice],
      availability: 'all',
      rating: 0,
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice ||
    filters.availability !== 'all' ||
    filters.rating > 0;

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search menu items, categories, or descriptions..."
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Filter Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2">
                <Filter className="h-3 w-3" />
                {hasActiveFilters && (
                  <Badge className="ml-1 h-4 w-4 p-0 bg-orange-500 text-white text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                  >
                    Reset
                  </Button>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={filters.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFilter('categories', [...filters.categories, category]);
                            } else {
                              updateFilter('categories', filters.categories.filter(c => c !== category));
                            }
                          }}
                        />
                        <Label htmlFor={category} className="text-sm capitalize">
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}</Label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                    max={maxPrice}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'all', label: 'All Items' },
                      { value: 'available', label: 'Available Only' },
                      { value: 'unavailable', label: 'Unavailable Only' }
                    ].map(option => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={filters.availability === option.value}
                          onCheckedChange={() => updateFilter('availability', option.value)}
                        />
                        <Label className="text-sm">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'name', label: 'Name' },
                      { value: 'price', label: 'Price' },
                      { value: 'rating', label: 'Rating' },
                      { value: 'popular', label: 'Popular' }
                    ].map(option => (
                      <Button
                        key={option.value}
                        variant={filters.sortBy === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateFilter('sortBy', option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFilter('sortOrder', 'asc')}
                      className="flex-1"
                    >
                      A-Z
                    </Button>
                    <Button
                      variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateFilter('sortOrder', 'desc')}
                      className="flex-1"
                    >
                      Z-A
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear Button */}
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearSearch}
              className="h-7 px-2"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <p>No items found matching your search</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Found {filteredItems.length} items</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResults(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 hover:bg-muted rounded-lg cursor-pointer transition-colors"
                    onClick={() => {
                      onItemSelect(item);
                      setShowResults(false);
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{item.name}</h4>
                        
                        {/* Special badges */}
                        {EXPRESS_ITEMS.includes(item.id) && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                            <Zap className="h-2 w-2 mr-1" />
                            Express
                          </Badge>
                        )}
                        
                        {!item.available && (
                          <Badge variant="destructive" className="text-xs">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="text-sm font-medium">₹{item.price}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs">{(4 + Math.random()).toFixed(1)}</span>
                        </div>
                        
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.category}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(item.id);
                        setShowResults(false);
                      }}
                      disabled={!item.available}
                      className="ml-3"
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}