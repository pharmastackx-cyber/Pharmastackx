'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface CartItem {
  id: string; 
  name: string;
  image: string;
  activeIngredients: string;
  drugClass: string;
  price: number;
  pharmacy: string;
  quantity: number;
  isQuoteItem?: boolean; // Optional: Indicates if the item is from a quote
  quoteId?: string;      // Optional: The ID of the quote it came from
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

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedRequestId = localStorage.getItem('requestId');
    const savedQuoteId = localStorage.getItem('quoteId');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    if (savedRequestId) {
      setRequestId(savedRequestId);
    }
    if (savedQuoteId) {
        setQuoteId(savedQuoteId);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
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
  }, [requestId, quoteId]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
    // Also set request/quote info if it's a quote item
    if (item.isQuoteItem && item.quoteId) {
        const associatedRequestId = localStorage.getItem('currentRequestId')
        if(associatedRequestId){
            setRequestInfo(associatedRequestId, item.quoteId);
        }    
    }
  };

  const removeFromCart = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setItems(prevItems => prevItems.map(item => item.id === id ? { ...item, quantity } : item));
    }
  };

  const clearCart = () => {
    setItems([]);
    setRequestId(null);
    setQuoteId(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('requestId');
    localStorage.removeItem('quoteId');
  };

  const setRequestInfo = (reqId: string, qId: string) => {
    setRequestId(reqId);
    setQuoteId(qId);
  };

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };
  
  const getTotalPrice = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };
  

  return (
    <CartContext.Provider value={{ items, requestId, quoteId, addToCart, removeFromCart, updateQuantity, clearCart, setRequestInfo, getTotalItems, getTotalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
