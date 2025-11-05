'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OrderItem {
  id: number;
  name: string;
  image: string;
  activeIngredients: string;
  drugClass: string;
  price: number;
  pharmacy: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  deliveryDiscount: number;
  total: number;
  promoCode?: string;
  deliveryOption: 'standard' | 'express';
  orderType: 'S' | 'MN' | 'MP';
  pharmacies: string[];
  status: 'processing' | 'completed' | 'cancelled';
  date: string;
  estimatedDelivery?: string;
  completedDate?: string;
  cancelReason?: string;
  progress?: number;
}

interface OrderContextType {
  orders: Order[];
  addOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([
    // Sample existing orders
    {
      id: 'ORD003',
      items: [
        {
          id: 1,
          name: 'Blood Pressure Monitor',
          image: 'https://example.com/bp-monitor.jpg',
          activeIngredients: 'Digital Monitor',
          drugClass: 'Medical Device',
          price: 10000,
          pharmacy: 'Wellness Pharmacy',
          quantity: 1
        },
        {
          id: 2,
          name: 'Aspirin 100mg',
          image: 'https://example.com/aspirin.jpg',
          activeIngredients: 'Acetylsalicylic Acid',
          drugClass: 'Analgesic',
          price: 2500,
          pharmacy: 'Wellness Pharmacy',
          quantity: 1
        }
      ],
      subtotal: 12500,
      deliveryFee: 1000,
      discount: 0,
      deliveryDiscount: 0,
      total: 13500,
      deliveryOption: 'standard',
      orderType: 'S',
      pharmacies: ['Wellness Pharmacy'],
      status: 'processing',
      date: '2025-11-02T14:20:00',
      progress: 65,
      estimatedDelivery: '2025-11-03T16:00:00'
    }
  ]);

  const addOrder = (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const orderId = `ORD${String(Date.now()).slice(-6)}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      date: new Date().toISOString(),
      status: 'processing',
      estimatedDelivery: new Date(Date.now() + (2 * 60 * 60 * 1000)).toISOString() // 2 hours from now
    };

    setOrders(prev => [newOrder, ...prev]);
    return orderId;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              status,
              completedDate: status === 'completed' ? new Date().toISOString() : order.completedDate,
              progress: status === 'completed' ? 100 : order.progress
            }
          : order
      )
    );
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const value: OrderContextType = {
    orders,
    addOrder,
    updateOrderStatus,
    getOrderById,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};