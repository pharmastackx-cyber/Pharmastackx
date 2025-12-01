'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the shape of a regular item in the cart
export interface RegularCartItem {
  type: 'medicine';
  id: number;
  name: string;
  image: string;
  price: number;
  pharmacy: string;
  quantity: number;
}

// Define the shape of a prescription order in the cart
export interface PrescriptionCartItem {
  type: 'prescription';
  id: number; // Using timestamp for a unique ID
  fileName: string;
  imageUrl: string; // Base64 Data URL of the image
  message: string;
  status: 'pending'; // To indicate it's under review
  quantity: 1;
}

// A cart item can be one of the two types
export type CartItem = RegularCartItem | PrescriptionCartItem;

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<RegularCartItem, 'quantity' | 'type'>) => void;
  addPrescriptionToCart: (file: File, message: string) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
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

  // Load cart from localStorage on initial render
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Function to add a regular medicine to the cart
  const addToCart = (newItem: Omit<RegularCartItem, 'quantity' | 'type'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.type === 'medicine' && item.id === newItem.id);
      
      if (existingItem) {
        // If item exists, increment quantity
        return prevItems.map(item =>
          item.id === newItem.id && item.type === 'medicine'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If new item, add with quantity 1
        return [...prevItems, { ...newItem, type: 'medicine', quantity: 1 }];
      }
    });
  };

  // Function to add a prescription to the cart
  const addPrescriptionToCart = (file: File, message: string) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const newPrescriptionItem: PrescriptionCartItem = {
            type: 'prescription',
            id: Date.now(), // Unique ID based on timestamp
            fileName: file.name,
            imageUrl,
            message,
            status: 'pending',
            quantity: 1,
        };
        setItems(prevItems => [...prevItems, newPrescriptionItem]);
    };
    reader.readAsDataURL(file);
  };

  const removeFromCart = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        // Only allow quantity updates for regular medicine items
        if (item.type === 'medicine' && item.id === id) {
          return { ...item, quantity };
        }
        // For prescription items or other items, return them unchanged
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate total price, ignoring pending prescriptions
  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      if (item.type === 'medicine') {
        return total + (item.price * item.quantity);
      }
      return total;
    }, 0);
  };

  const value: CartContextType = {
    items,
    addToCart,
    addPrescriptionToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
