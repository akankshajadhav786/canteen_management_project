/**
 * Local Storage System for UniBites
 * Replaces Supabase with browser localStorage
 * Ready for MySQL migration
 */

export interface User {
  id: string;
  email: string;
  name: string;
  userType: 'student' | 'staff' | 'admin';
  phone?: string;
  rollNumber?: string;
  department?: string;
  createdAt: string;
  created_at?: string; // Alias for compatibility
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages';
  available: boolean;
  image?: string;
  preparationTime?: number; // in minutes
  isExpress?: boolean; // Items under 5 minutes
  timeSlots?: string[]; // e.g., ['breakfast', 'lunch', 'dinner']
  comboItems?: string[]; // IDs of items in combo
  comboDiscount?: number; // Discount percentage for combo
}

export interface Order {
  id: string;
  tokenNumber: string; // Unique token for customer pickup
  userId: string;
  items: Array<{ itemId: string; name?: string; quantity: number; price: number }>;
  totalAmount: number;
  gstAmount: number;
  finalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: 'cash';
  deliveryMethod: 'pickup' | 'delivery';
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashSale {
  id: string;
  itemIds: string[];
  discountPercentage: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ComboOffer {
  id: string;
  name: string;
  description: string;
  itemIds: string[];
  originalPrice: number;
  comboPrice: number;
  discountPercentage: number;
  available: boolean;
  category: string;
}

export interface AppSettings {
  enableComboOffers: boolean;
  enableTimeBasedMenu: boolean;
  enableExpressMenu: boolean;
  businessHours: {
    open: string;
    close: string;
  };
}

// Storage Keys
const KEYS = {
  USERS: 'unibites_users',
  PASSWORDS: 'unibites_passwords', // Store hashed passwords separately
  CURRENT_USER: 'unibites_current_user',
  ACCESS_TOKEN: 'unibites_access_token',
  MENU_ITEMS: 'unibites_menu_items',
  ORDERS: 'unibites_orders',
  TOKEN_COUNTER: 'unibites_token_counter',
  FLASH_SALES: 'unibites_flash_sales',
  COMBO_OFFERS: 'unibites_combo_offers',
  FAVORITES: 'unibites_favorites',
  NOTIFICATIONS: 'unibites_notifications',
  SETTINGS: 'unibites_settings',
};

// Helper functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
}

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Simple password hashing (for localStorage - NOT for production!)
// In production, use bcrypt on the backend
const simpleHash = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

// Generate token number (e.g., T001, T002, etc.)
const generateTokenNumber = (): string => {
  const counter = getFromStorage<number>(KEYS.TOKEN_COUNTER, 0) + 1;
  setToStorage(KEYS.TOKEN_COUNTER, counter);
  return `T${counter.toString().padStart(3, '0')}`;
};

// Authentication
export const authStorage = {
  getUser: (): User | null => {
    return getFromStorage<User | null>(KEYS.CURRENT_USER, null);
  },

  setUser: (user: User): void => {
    setToStorage(KEYS.CURRENT_USER, user);
  },

  getToken: (): string | null => {
    return getFromStorage<string | null>(KEYS.ACCESS_TOKEN, null);
  },

  setToken: (token: string): void => {
    setToStorage(KEYS.ACCESS_TOKEN, token);
  },

  clear: (): void => {
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
  },

  signup: async (data: {
    email: string;
    password: string;
    name: string;
    userType: 'student' | 'staff' | 'admin';
    phone?: string;
    rollNumber?: string; // Add rollNumber to signup data
  }): Promise<{ user: User; access_token: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getFromStorage<User[]>(KEYS.USERS, []);
    const passwords = getFromStorage<Record<string, string>>(KEYS.PASSWORDS, {});
    
    // Check if user already exists
    if (users.find(u => u.email === data.email)) {
      throw new Error('User already exists with this email');
    }

    const userId = generateId();
    const newUser: User = {
      id: userId,
      email: data.email,
      name: data.name,
      userType: data.userType,
      phone: data.phone,
      rollNumber: data.rollNumber, // Store rollNumber
      createdAt: new Date().toISOString(),
    };

    // Store user
    users.push(newUser);
    setToStorage(KEYS.USERS, users);

    // Store password hash
    passwords[userId] = simpleHash(data.password);
    setToStorage(KEYS.PASSWORDS, passwords);

    const token = generateId(); // Simple token generation
    
    return {
      user: newUser,
      access_token: token,
    };
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<{ user: User; access_token: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = getFromStorage<User[]>(KEYS.USERS, []);
    const passwords = getFromStorage<Record<string, string>>(KEYS.PASSWORDS, {});
    
    const user = users.find(u => u.email === data.email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Validate password
    const hashedPassword = simpleHash(data.password);
    if (passwords[user.id] !== hashedPassword) {
      throw new Error('Invalid email or password');
    }

    const token = generateId();

    return {
      user,
      access_token: token,
    };
  },
};

// Menu API
export const menuApi = {
  getMenu: async (): Promise<MenuItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return getFromStorage<MenuItem[]>(KEYS.MENU_ITEMS, []);
  },

  addMenuItem: async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    await new Promise(resolve => setTimeout(resolve, 100));

    const items = getFromStorage<MenuItem[]>(KEYS.MENU_ITEMS, []);
    const newItem: MenuItem = {
      ...item,
      id: generateId(),
      image: item.image || `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}`,
    };

    items.push(newItem);
    setToStorage(KEYS.MENU_ITEMS, items);

    return newItem;
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const items = getFromStorage<MenuItem[]>(KEYS.MENU_ITEMS, []);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    items[index] = { ...items[index], ...updates };
    setToStorage(KEYS.MENU_ITEMS, items);
    
    return items[index];
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const items = getFromStorage<MenuItem[]>(KEYS.MENU_ITEMS, []);
    const filtered = items.filter(item => item.id !== id);
    setToStorage(KEYS.MENU_ITEMS, filtered);
  },

  initializeMenu: (items: MenuItem[]): void => {
    const existing = getFromStorage<MenuItem[]>(KEYS.MENU_ITEMS, []);
    if (existing.length === 0) {
      setToStorage(KEYS.MENU_ITEMS, items);
    }
  },
};

// Orders API
export const ordersApi = {
  getOrders: async (userId?: string): Promise<Order[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const orders = getFromStorage<Order[]>(KEYS.ORDERS, []);
    
    if (userId) {
      return orders.filter(order => order.userId === userId);
    }
    
    return orders;
  },

  createOrder: async (orderData: Omit<Order, 'id' | 'tokenNumber' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Order> => {
    await new Promise(resolve => setTimeout(resolve, 100));

    const orders = getFromStorage<Order[]>(KEYS.ORDERS, []);
    const tokenNumber = generateTokenNumber();

    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      tokenNumber: tokenNumber,
      status: 'confirmed', // Orders are now active immediately
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    setToStorage(KEYS.ORDERS, orders);

    // Send notification to admin
    const notifications = getFromStorage<any[]>(KEYS.NOTIFICATIONS, []);
    const adminNotification = {
      id: generateId(),
      type: 'order_update',
      title: '🆕 New Order Received!',
      message: `Order ${tokenNumber} placed by ${orderData.userId} for ₹${orderData.finalAmount.toFixed(2)}. Ready for preparation.`,
      timestamp: new Date(),
      read: false,
      actionRequired: true,
      priority: 'high',
      data: { orderId: newOrder.id, tokenNumber, userId: orderData.userId }
    };
    notifications.push(adminNotification);
    setToStorage(KEYS.NOTIFICATIONS, notifications);

    return newOrder;
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<Order> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const orders = getFromStorage<Order[]>(KEYS.ORDERS, []);
    const index = orders.findIndex(order => order.id === orderId);
    
    if (index === -1) {
      throw new Error('Order not found');
    }
    
    orders[index].status = status;
    orders[index].updatedAt = new Date().toISOString();
    setToStorage(KEYS.ORDERS, orders);
    
    return orders[index];
  },
};

// Flash Sales API
export const flashSalesApi = {
  getActiveSales: async (): Promise<FlashSale[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const sales = getFromStorage<FlashSale[]>(KEYS.FLASH_SALES, []);
    const now = new Date().toISOString();
    
    return sales.filter(sale => 
      sale.isActive && 
      sale.startTime <= now && 
      sale.endTime >= now
    );
  },

  createFlashSale: async (saleData: Omit<FlashSale, 'id'>): Promise<FlashSale> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const sales = getFromStorage<FlashSale[]>(KEYS.FLASH_SALES, []);
    const newSale: FlashSale = {
      ...saleData,
      id: generateId(),
    };
    
    sales.push(newSale);
    setToStorage(KEYS.FLASH_SALES, sales);
    
    return newSale;
  },

  endFlashSale: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const sales = getFromStorage<FlashSale[]>(KEYS.FLASH_SALES, []);
    const index = sales.findIndex(sale => sale.id === id);
    
    if (index !== -1) {
      sales[index].isActive = false;
      setToStorage(KEYS.FLASH_SALES, sales);
    }
  },
};

// Combo Offers API
export const comboOffersApi = {
  getActiveOffers: async (): Promise<ComboOffer[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const offers = getFromStorage<ComboOffer[]>(KEYS.COMBO_OFFERS, []);
    return offers.filter(offer => offer.available);
  },

  createComboOffer: async (offerData: Omit<ComboOffer, 'id'>): Promise<ComboOffer> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const offers = getFromStorage<ComboOffer[]>(KEYS.COMBO_OFFERS, []);
    const newOffer: ComboOffer = {
      ...offerData,
      id: generateId(),
    };
    
    offers.push(newOffer);
    setToStorage(KEYS.COMBO_OFFERS, offers);
    
    return newOffer;
  },

  deleteComboOffer: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const offers = getFromStorage<ComboOffer[]>(KEYS.COMBO_OFFERS, []);
    const filtered = offers.filter(offer => offer.id !== id);
    setToStorage(KEYS.COMBO_OFFERS, filtered);
  },
};

// Favorites API
export const favoritesApi = {
  getFavorites: (userId: string): string[] => {
    const favorites = getFromStorage<Record<string, string[]>>(KEYS.FAVORITES, {});
    return favorites[userId] || [];
  },

  addFavorite: (userId: string, itemId: string): void => {
    const favorites = getFromStorage<Record<string, string[]>>(KEYS.FAVORITES, {});
    if (!favorites[userId]) {
      favorites[userId] = [];
    }
    if (!favorites[userId].includes(itemId)) {
      favorites[userId].push(itemId);
      setToStorage(KEYS.FAVORITES, favorites);
    }
  },

  removeFavorite: (userId: string, itemId: string): void => {
    const favorites = getFromStorage<Record<string, string[]>>(KEYS.FAVORITES, {});
    if (favorites[userId]) {
      favorites[userId] = favorites[userId].filter(id => id !== itemId);
      setToStorage(KEYS.FAVORITES, favorites);
    }
  },
};

// Settings API
export const settingsApi = {
  getSettings: (): AppSettings => {
    return getFromStorage<AppSettings>(KEYS.SETTINGS, {
      enableComboOffers: true,
      enableTimeBasedMenu: true,
      enableExpressMenu: true,
      businessHours: {
        open: '08:00',
        close: '20:00',
      },
    });
  },

  updateSettings: (settings: Partial<AppSettings>): AppSettings => {
    const current = settingsApi.getSettings();
    const updated = { ...current, ...settings };
    setToStorage(KEYS.SETTINGS, updated);
    return updated;
  },
};

// Analytics (mock data for now)
export const analyticsApi = {
  getDashboardStats: async (): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const orders = getFromStorage<Order[]>(KEYS.ORDERS, []);
    const today = new Date().toISOString().split('T')[0];
    
    const todayOrders = orders.filter(order => 
      order.createdAt.startsWith(today)
    );
    
    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.finalAmount, 0),
      todayRevenue: todayOrders.reduce((sum, order) => sum + order.finalAmount, 0),
    };
  },
};

// Export combined API
export const localApi = {
  auth: authStorage,
  menu: menuApi,
  orders: ordersApi,
  flashSales: flashSalesApi,
  comboOffers: comboOffersApi,
  favorites: favoritesApi,
  settings: settingsApi,
  analytics: analyticsApi,
};
