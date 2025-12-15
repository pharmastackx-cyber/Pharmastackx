'use client';

import React from 'react';
import { usePaystackPayment } from 'react-paystack';
import { Button } from '@mui/material';
import { useSession } from '../context/SessionProvider';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrderContext';
import { useRouter } from 'next/navigation';
import { event } from '../lib/gtag';


interface PaystackButtonProps {
  total: number;
  deliveryOption: 'standard' | 'express' | 'pickup';

  orderType: 'S' | 'MN' | 'MP';
  uniquePharmacies: string[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  deliveryDiscount: number;
  promoCode?: string;
  patientName: string;
  patientAge: string;
  patientCondition: string;
  deliveryPhone: string;
  deliveryEmail: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  isFormValid: boolean;
}

const PaystackButton: React.FC<PaystackButtonProps> = (props) => {
  const { user } = useSession();
  const { items, clearCart } = useCart();
  const { addOrder } = useOrders();
  const router = useRouter();

  const config = {
    reference: new Date().getTime().toString(),
    email: props.deliveryEmail,
    amount: props.total * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = async (reference: any) => {
    if (!user) {
      console.error("User not found. Cannot create order.");
      return;
    }

    try {
      const itemsForBackend = items.map(item => ({
        productId: item.id,
        qty: item.quantity,
      }));


      const orderData = {
      
        patientName: props.patientName,
        
        deliveryEmail: props.deliveryEmail,
        deliveryPhone: props.deliveryPhone,
        
        items: itemsForBackend,
        
        businesses: props.uniquePharmacies,
        orderType: props.orderType,
        deliveryOption: props.deliveryOption,
        
        coupon: props.promoCode,
      };

      // addOrder now handles everything: API call and state update
      await addOrder(orderData);

      // Simple and clean: Clear the cart and navigate
      clearCart();
      router.push('/orders');

    } catch (error) {
      console.error("Failed to create order after payment:", error);
      // Optionally, show an error message to the user
    }
  };

  const onClose = () => {
    console.log('Payment modal closed');
  };

  const handleCheckout = () => {
    event({
      action: 'begin_checkout',
      category: 'ecommerce',
      label: 'Paid Checkout',
      value: props.total,
    });
    initializePayment({ onSuccess, onClose });
  };

  

  const getButtonText = () => {
    if (!user) return 'Please log in to check out';
    if (!props.isFormValid) return 'Please fill in delivery info';
    return 'Proceed to Checkout';
  }

  return (
    <Button
      fullWidth
      variant="contained"
      size="large"
      onClick={handleCheckout}

      disabled={!user || !props.isFormValid}
      sx={{
        background: 'linear-gradient(135deg, #006D5B 0%, #004D40 100%)',
        borderRadius: '12px',
        py: 1.5,
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '1.1rem',
        boxShadow: '0 4px 16px rgba(0, 109, 91, 0.3)',
        '&:hover': {
          background: 'linear-gradient(135deg, #004D40 0%, #00332B 100%)',
          boxShadow: '0 6px 20px rgba(0, 109, 91, 0.4)',
        },
        '&.Mui-disabled': {
          background: '#d0d0d0',
          boxShadow: 'none',
          color: '#888'
        }
      }}
    >
      {getButtonText()}
    </Button>
  );
};

export default PaystackButton;
