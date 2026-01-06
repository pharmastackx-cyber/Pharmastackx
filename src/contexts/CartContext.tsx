
'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface CartItem {
  id: string; // Changed to string to accommodate product IDs
  name: string;
  image: string;
  activeIngredients: string;
  drugClass: string;
  price: number;
  pharmacy: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  requestId: string | null;
  quoteId: string | null;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setRequestInfo: (requestId: string, quoteId: string) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);

  // Effect to load cart and request info from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      const storedRequestId = localStorage.getItem('requestId');
      const storedQuoteId = localStorage.getItem('quoteId');

      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
      if (storedRequestId) {
        setRequestId(storedRequestId);
      }
      if (storedQuoteId) {
        setQuoteId(storedQuoteId);
      }
    } catch (error) {
      console.error("Failed to parse cart data from localStorage", error);
      // If parsing fails, clear the corrupted data
      localStorage.removeItem('cart');
      localStorage.removeItem('requestId');
      localStorage.removeItem('quoteId');
    }
  }, []);

  // Effect to save cart and request info to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      if (requestId) {
        localStorage.setItem('requestId', requestId);
      } else {
        localStorage.removeItem('requestId');
      }
      if (quoteId) {
        localStorage.setItem('quoteId', quoteId);
      } else {
        localStorage.removeItem('quoteId');
      }
    } catch (error) {
      console.error("Failed to save cart data to localStorage", error);
    }
  }, [items, requestId, quoteId]);

  const setRequestInfo = (reqId: string, qId: string) => {
    // When setting request info, we should probably clear the cart
    // to avoid mixing catalog items and quote items.
    setItems([]); 
    setRequestId(reqId);
    setQuoteId(qId);
  };

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...newItem, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setRequestId(null);
    setQuoteId(null);
    // Also remove from local storage immediately
    localStorage.removeItem('cart');
    localStorage.removeItem('requestId');
    localStorage.removeItem('quoteId');
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value: CartContextType = {
    items,
    requestId,
    quoteId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setRequestInfo,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
