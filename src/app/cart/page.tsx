'use client'

import {
  Typography,
  Container,
  Box,
  Paper,
  Button,
  Card,
  CardContent,
  IconButton,
  Divider,
  TextField,
  Chip,
  Avatar,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  LocalShipping,
  Security,
  ShoppingCart,
  ArrowBack,
  CheckCircle,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { useCart } from '../../contexts/CartContext';
import { usePromo } from '../../contexts/PromoContext';
import { useOrders } from '../../contexts/OrderContext';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { activePromo, applyPromo, removePromo, validatePromo, calculateDiscount } = usePromo();
  const { addOrder } = useOrders();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [orderType, setOrderType] = useState('MN'); // MN = Multiple Normal, MP = Multiple Premium
  const [isProcessingFreeOrder, setIsProcessingFreeOrder] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Determine if order is single or multiple based on pharmacies
  const uniquePharmacies = [...new Set(items.map(item => item.pharmacy))];
  const isSingleOrder = uniquePharmacies.length <= 1;
  const actualOrderType = isSingleOrder ? 'S' : orderType;

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    
    const validation = validatePromo(promoCode, subtotal);
    if (!validation.valid) {
      setPromoMessage(validation.message);
      return;
    }
    
    const result = applyPromo(promoCode);
    setPromoMessage(result.message);
    if (result.success) {
      setPromoCode('');
    }
  };

  const handleRemovePromo = () => {
    removePromo();
    setPromoMessage('');
  };
  
  const getDeliveryFee = () => {
    const baseDeliveryFee = deliveryOption === 'standard' ? 1000 : 3000;
    
    if (actualOrderType === 'S') {
      // Single order - standard delivery fee
      return baseDeliveryFee;
    } else if (actualOrderType === 'MN') {
      // Multiple Normal - we consolidate, standard delivery fee
      return baseDeliveryFee;
    } else if (actualOrderType === 'MP') {
      // Multiple Premium - multiply by number of pharmacies
      return baseDeliveryFee * uniquePharmacies.length;
    }
    return baseDeliveryFee;
  };
  
  const deliveryFee = getDeliveryFee();
  
  // Calculate discounts from active promo
  const { discountAmount, deliveryDiscount, finalTotal } = calculateDiscount(subtotal, deliveryFee);
  const total = finalTotal;

  // Auto-process free orders
  useEffect(() => {
    if (total === 0 && items.length > 0 && activePromo && !isProcessingFreeOrder) {
      setIsProcessingFreeOrder(true);
      
      // Create order automatically
      const orderId = addOrder({
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          image: item.image,
          activeIngredients: item.activeIngredients,
          drugClass: item.drugClass,
          price: item.price,
          pharmacy: item.pharmacy,
          quantity: item.quantity
        })),
        subtotal,
        deliveryFee,
        discount: discountAmount,
        deliveryDiscount,
        total: 0,
        promoCode: activePromo.code,
        deliveryOption,
        orderType: actualOrderType as any,
        pharmacies: uniquePharmacies
      });

      // Clear cart and navigate to orders
      setTimeout(() => {
        clearCart();
        removePromo();
        router.push('/orders');
      }, 1000);
    }
  }, [total, items.length, activePromo, isProcessingFreeOrder]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <Navbar />
      
      {/* Page Header */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 2, mb: 0 }}>
        <Container maxWidth="lg">
          <Paper 
            elevation={3} 
            sx={{ 
              width: '100%',
              px: 3, 
              py: 2, 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #006D5B 0%, #004D40 50%, #00332B 100%)',
              border: 'none',
              mb: 0,
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0, 109, 91, 0.3)'
            }}
          >
            <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 600 }}>
              Cart
            </Typography>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 0.5, mb: 3, flex: 1 }}>
        {/* Back to Searching */}
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            href="/find-medicines"
            startIcon={<ArrowBack />}
            sx={{
              color: '#006D5B',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: 'rgba(0, 109, 91, 0.1)'
              }
            }}
          >
            Continue Searching
          </Button>
        </Box>

        {items.length === 0 ? (
          /* Empty Cart */
          <Paper 
            elevation={1} 
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              borderRadius: '16px',
              border: '1px solid #e0e0e0' 
            }}
          >
            <ShoppingCart sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, color: '#666' }}>
              Your cart is empty
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#999' }}>
              Add some medicines to get started
            </Typography>
            <Button
              component={Link}
              href="/find-medicines"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #006D5B 0%, #004D40 100%)',
                borderRadius: '25px',
                px: 4,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #004D40 0%, #00332B 100%)'
                }
              }}
            >
              Browse Medicines
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Cart Items */}
            <Box sx={{ flex: 1 }}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0' 
                }}
              >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#006D5B' }}>
                  Cart Items ({items.length})
                </Typography>
                
                {items.map((item, index) => (
                  <Box key={item.id}>
                    <Box sx={{ py: 2 }}>
                      {/* Top Row - Product Info */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
                        {/* Product Image */}
                        <Avatar
                          src={item.image}
                          sx={{ 
                            width: 50, 
                            height: 50, 
                            bgcolor: '#f5f5f5',
                            borderRadius: '8px'
                          }}
                        />
                        
                        {/* Product Details */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333', fontSize: '0.9rem' }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', mb: 0.5, fontSize: '0.8rem' }}>
                            {item.activeIngredients}
                          </Typography>
                          <Chip 
                            label={item.pharmacy} 
                            size="small" 
                            sx={{ 
                              fontSize: '0.65rem',
                              bgcolor: '#e8f5e8',
                              color: '#006D5B',
                              height: '20px'
                            }} 
                          />
                        </Box>
                        
                        {/* Remove Button */}
                        <IconButton 
                          size="small"
                          onClick={() => removeFromCart(item.id)}
                          sx={{ 
                            color: '#f44336',
                            '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      {/* Bottom Row - Quantity and Price */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Quantity Controls */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton 
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            sx={{ 
                              bgcolor: '#f5f5f5',
                              '&:hover': { bgcolor: '#e0e0e0' },
                              width: 28,
                              height: 28
                            }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          
                          <Typography sx={{ 
                            minWidth: '30px', 
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                          }}>
                            {item.quantity}
                          </Typography>
                          
                          <IconButton 
                            size="small"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            sx={{ 
                              bgcolor: '#f5f5f5',
                              '&:hover': { bgcolor: '#e0e0e0' },
                              width: 28,
                              height: 28
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        {/* Price */}
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#006D5B', fontSize: '1rem' }}>
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {index < items.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
              </Paper>
            </Box>

            {/* Order Summary */}
            <Box sx={{ width: { xs: '100%', md: '400px' } }}>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0',
                  position: 'sticky',
                  top: 20
                }}
              >
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#006D5B' }}>
                  Order Summary
                </Typography>
                
                {/* Order Type */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: '#666', fontSize: '0.85rem', fontWeight: 500 }}>
                    Order Type
                  </Typography>
                  
                  {isSingleOrder ? (
                    /* Single Order - Automatic */
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label="S" 
                          size="small" 
                          sx={{ 
                            bgcolor: '#006D5B', 
                            color: 'white', 
                            fontWeight: 'bold',
                            minWidth: '24px'
                          }} 
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '0.8rem' }}>
                            Single Order
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                            All items from {uniquePharmacies[0] || 'one pharmacy'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ) : (
                    /* Multiple Order - User Choice */
                    <Box>
                      <Paper sx={{ p: 1.5, bgcolor: '#fff3e0', border: '1px solid #ffb74d', borderRadius: '8px', mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#e65100', fontSize: '0.7rem', fontWeight: 500 }}>
                          Items from {uniquePharmacies.length} different pharmacies detected
                        </Typography>
                      </Paper>
                      
                      <RadioGroup
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                        sx={{ gap: 0 }}
                      >
                        <FormControlLabel
                          value="MN"
                          control={<Radio size="small" sx={{ py: 0.5, '&.Mui-checked': { color: '#006D5B' } }} />}
                          label={
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label="MN" 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: '#4caf50', 
                                    color: 'white', 
                                    fontWeight: 'bold',
                                    minWidth: '32px',
                                    fontSize: '0.7rem'
                                  }} 
                                />
                                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                  Multiple Normal
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666' }}>
                                We'll find the best sources for you (1x)
                              </Typography>
                            </Box>
                          }
                          sx={{ mr: 0, mb: 1, alignItems: 'flex-start' }}
                        />
                        <FormControlLabel
                          value="MP"
                          control={<Radio size="small" sx={{ py: 0.5, '&.Mui-checked': { color: '#006D5B' } }} />}
                          label={
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label="MP" 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: '#E91E63', 
                                    color: 'white', 
                                    fontWeight: 'bold',
                                    minWidth: '32px',
                                    fontSize: '0.7rem'
                                  }} 
                                />
                                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                                  Multiple Premium
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666' }}>
                                Fulfill from your selected pharmacies (×{uniquePharmacies.length} delivery fee)
                              </Typography>
                            </Box>
                          }
                          sx={{ mr: 0, alignItems: 'flex-start' }}
                        />
                      </RadioGroup>
                    </Box>
                  )}
                </Box>
                
                {/* Delivery Options */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: '#666', fontSize: '0.85rem', fontWeight: 500 }}>
                    Delivery Option
                  </Typography>
                  <RadioGroup
                    value={deliveryOption}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    sx={{ gap: 0 }}
                  >
                    <FormControlLabel
                      value="standard"
                      control={<Radio size="small" sx={{ py: 0.5, '&.Mui-checked': { color: '#006D5B' } }} />}
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            Standard - ₦1,000
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666' }}>
                            1-2 days delivery
                          </Typography>
                        </Box>
                      }
                      sx={{ mr: 0, mb: 0.5 }}
                    />
                    <FormControlLabel
                      value="express"
                      control={<Radio size="small" sx={{ py: 0.5, '&.Mui-checked': { color: '#006D5B' } }} />}
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                            Express - ₦3,000
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#E91E63' }}>
                            30mins - 3hrs delivery
                          </Typography>
                        </Box>
                      }
                      sx={{ mr: 0 }}
                    />
                  </RadioGroup>
                </Box>

                {/* Promo Code */}
                <Box sx={{ mb: 3 }}>
                  {!activePromo ? (
                    <>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()}
                        InputProps={{
                          endAdornment: (
                            <Button 
                              size="small" 
                              onClick={handleApplyPromo}
                              disabled={!promoCode.trim()}
                              sx={{ 
                                textTransform: 'none',
                                color: '#006D5B',
                                fontWeight: 600
                              }}
                            >
                              Apply
                            </Button>
                          ),
                          sx: {
                            borderRadius: '8px',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#e0e0e0',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#006D5B',
                            }
                          }
                        }}
                      />
                      {promoMessage && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: promoMessage.includes('successfully') ? '#4CAF50' : '#F44336',
                            mt: 1,
                            display: 'block'
                          }}
                        >
                          {promoMessage}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      bgcolor: '#E8F5E8',
                      borderRadius: '8px',
                      border: '1px solid #4CAF50'
                    }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#2E7D32' }}>
                          {activePromo.code} Applied
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activePromo.description}
                        </Typography>
                      </Box>
                      <Button 
                        size="small" 
                        onClick={handleRemovePromo}
                        sx={{ 
                          color: '#F44336',
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />
                
                {/* Price Breakdown */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal ({items.length} items)
                    </Typography>
                    <Typography variant="body2">
                      ₦{subtotal.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  {discountAmount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                        Discount ({activePromo?.code})
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                        -₦{discountAmount.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Delivery Fee ({deliveryOption === 'standard' ? 'Standard' : 'Express'}
                      {actualOrderType === 'MP' ? ` ×${uniquePharmacies.length}` : ''})
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: deliveryDiscount > 0 ? 'text.secondary' : '#006D5B', 
                      fontWeight: 500,
                      textDecoration: deliveryDiscount > 0 ? 'line-through' : 'none'
                    }}>
                      ₦{deliveryFee.toLocaleString()}
                    </Typography>
                  </Box>

                  {deliveryDiscount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#4CAF50' }}>
                        Free Delivery ({activePromo?.code})
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                        -₦{deliveryDiscount.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="caption" sx={{ 
                    color: deliveryOption === 'express' ? '#E91E63' : '#666', 
                    display: 'block', 
                    textAlign: 'right',
                    fontWeight: 500 
                  }}>
                    {deliveryOption === 'standard' ? '1-2 days delivery' : '30mins - 3hrs delivery'}
                    {actualOrderType === 'MP' && ` from ${uniquePharmacies.length} pharmacies`}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Total
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#006D5B' }}>
                    ₦{total.toLocaleString()}
                  </Typography>
                </Box>

                {/* Security Badge */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 3,
                  p: 2,
                  bgcolor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <Security sx={{ color: '#006D5B', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Secure checkout powered by Paystack
                  </Typography>
                </Box>

                {/* Checkout Button */}
                {total === 0 && !isProcessingFreeOrder ? (
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ color: '#4CAF50', fontWeight: 600, mb: 1 }}>
                      🎉 Your order is FREE! Processing automatically...
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={total === 0}
                    sx={{
                      background: total === 0 
                        ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
                        : 'linear-gradient(135deg, #006D5B 0%, #004D40 100%)',
                      borderRadius: '12px',
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 16px rgba(0, 109, 91, 0.3)',
                      '&:hover': {
                        background: total === 0
                          ? 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)'
                          : 'linear-gradient(135deg, #004D40 0%, #00332B 100%)',
                        boxShadow: '0 6px 20px rgba(0, 109, 91, 0.4)'
                      }
                    }}
                  >
                    {total === 0 ? 'Order Confirmed - FREE!' : 'Proceed to Checkout'}
                  </Button>
                )}
              </Paper>
            </Box>
          </Box>
        )}

        {/* Free Order Processing Overlay */}
        {isProcessingFreeOrder && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400, mx: 2 }}>
              <Box sx={{ mb: 3 }}>
                <CheckCircle sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#4CAF50' }}>
                  Order Confirmed! 🎉
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your free order has been processed successfully.
                  Redirecting to orders page...
                </Typography>
              </Box>
            </Card>
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Box sx={{ 
        bgcolor: '#e0e0e0', 
        py: 2, 
        mt: 'auto',
        borderTop: '1px solid #d0d0d0'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Typography 
                variant="body2" 
                component="a"
                href="/privacy-policy"
                sx={{ 
                  color: '#006D5B', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Privacy Policy
              </Typography>
              <Typography 
                variant="body2" 
                component="a"
                href="https://wa.me/2349050066638?text=Hi%2C%20I%20need%20help%20with%20my%20cart%20on%20Pharmastackx"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: '#006D5B', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Need Help?
              </Typography>
              <Typography 
                variant="body2" 
                component="a"
                href="https://wa.me/2349050066638?text=Hello%2C%20I%20would%20like%20to%20get%20in%20touch%20regarding%20Pharmastackx"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: '#006D5B', 
                  fontSize: '0.85rem', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Contact
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}