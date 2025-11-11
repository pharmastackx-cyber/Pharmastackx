'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of an Order object
// This should match the data coming from your API
export interface Order {
  _id: string; // MongoDB typically uses _id
  id: string; // You might have a separate friendly ID
  date: string;
  status: 'Pending' | 'Accepted' | 'Dispatched' | 'In Transit' | 'Completed' | 'Cancelled';
  
  // User & Patient Information
  user: { name: string; phone: string; email: string };
  
  // Delivery Information (assuming it comes with the order object)
  deliveryAddress?: string;

  // Order Contents
  items: { name: string; qty: number }[];
  businesses: { name: string }[];
  orderType: string;
  deliveryOption: string;
  
  // Financials
  totalAmount: number;

  // Timestamps from the backend
  createdAt: string;
  acceptedAt?: string;
  dispatchedAt?: string;
  pickedUpAt?: string;
  completedAt?: string;
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  addOrder: (orderData: any) => Promise<string>; // Keeping this flexible for now
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial orders from the database when the provider mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // This function is for creating a NEW order (from PaystackButton)
  const addOrder = async (orderData: any) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.message || 'Failed to save order to the database');
      }

      const newOrder = await response.json();
      setOrders(prev => [newOrder, ...prev]); // Add new order to the top of the list
      return newOrder._id; // Return the database ID

    } catch (error) {
      console.error('Error saving order:', error);
      throw error; // Re-throw to be caught by the calling function if needed
    }
  };

  // This function now saves status changes to the backend
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();

      // Update the local state with the returned order data
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, ...updatedOrder } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      // Optionally, you could add state to show an error in the UI
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order._id === orderId);
  };

  const value: OrderContextType = {
    orders,
    loading,
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
