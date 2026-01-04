'use client';

import {
  Typography,
  Container,
  Box,
  Paper,
  Button,
  Card,
  IconButton,
  Divider,
  TextField,
  Chip,
  Avatar,
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
  PersonPinCircle,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';
import { usePromo } from '../contexts/PromoContext';
import { useOrders } from '../contexts/OrderContext';
import { useSession } from '../context/SessionProvider';
import { useRouter } from 'next/navigation';
import dynamicImport from "next/dynamic";
import { event } from '../lib/gtag';
import { Business } from '@/types';

const PaystackButton = dynamicImport(
  () => import("./PaystackButton"),
  { ssr: false }
);

export const dynamic = "force-dynamic";

const STANDARD_DELIVERY_FEE = 900;
const EXPRESS_DELIVERY_FEE = 2000;

export default function CartContent() {
  const { user } = useSession();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  
  const { activePromo, applyPromo, removePromo, validatePromo, calculateDiscount } = usePromo();
  const { addOrder } = useOrders();
  const router = useRouter();

  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'express' | 'pickup'>('standard');

  const [orderType, setOrderType] = useState('MN');
  const [isProcessingFreeOrder, setIsProcessingFreeOrder] = useState(false);

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientCondition, setPatientCondition] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryEmail, setDeliveryEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');

  useEffect(() => {
    if (user) {
      // Always set the email for any logged-in user
      setDeliveryEmail(user.email || '');

      // Check for professional user roles
      const professionalRoles = ['clinic', 'pharmacy', 'pharmacist'];
      if (professionalRoles.includes(user.role)) {
        const businessUser = user as Business; // Cast to Business to access address
        if (businessUser.address) {
          setDeliveryPhone(businessUser.phone || '');
          setDeliveryAddress(businessUser.address.street || '');
          setDeliveryCity(businessUser.address.city || '');
          setDeliveryState(businessUser.address.state || '');
        }
      }
    }
  }, [user]);

    const isAddressRequired = deliveryOption !== 'pickup';
const isFormValid =
  patientName.trim() !== '' &&
  patientAge.trim() !== '' &&
  deliveryPhone.trim() !== '' &&
  deliveryEmail.trim() !== '' &&
  (!isAddressRequired || (
    deliveryAddress.trim() !== '' &&
    deliveryCity.trim() !== '' &&
    deliveryState.trim() !== ''
  ));


  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
    if (result.success) setPromoCode('');
  };

  const handleRemovePromo = () => {
    removePromo();
    setPromoMessage('');
  };

    const getDeliveryFee = () => {
    if (deliveryOption === 'pickup') return 0;
    const baseDeliveryFee = deliveryOption === 'standard' ? STANDARD_DELIVERY_FEE : EXPRESS_DELIVERY_FEE;
    if (actualOrderType === 'S' || actualOrderType === 'MN') return baseDeliveryFee;
    if (actualOrderType === 'MP') return baseDeliveryFee * uniquePharmacies.length;
    return baseDeliveryFee;
};


const deliveryFee = getDeliveryFee();
const sfcPercentage = deliveryOption === 'pickup' ? 25 : 20;
const sfcAmount = subtotal * (sfcPercentage / 100);
const { discountAmount, deliveryDiscount, sfcDiscount, finalTotal } = calculateDiscount(subtotal, deliveryFee, sfcAmount);
const total = finalTotal;

  

  useEffect(() => {
    if (total === 0 && items.length > 0 && activePromo && !isProcessingFreeOrder && isFormValid && user) {
      
      // --- Start of new code ---
      // Fire the 'begin_checkout' event for free orders
      event({
        action: 'begin_checkout',
        category: 'ecommerce',
        label: 'Free Checkout', // Differentiate from paid checkouts
        value: 0 // The value is zero
      });
      // --- End of new code ---

      setIsProcessingFreeOrder(true);
      
      const itemsForBackend = items.map(item => ({
        productId: item.id,
        qty: item.quantity,
      }));

      addOrder({
        patientName,
        patientAge,
        patientCondition,
        deliveryEmail,
        deliveryPhone,
        deliveryAddress,
        deliveryCity,
        deliveryState,
        items: itemsForBackend,
        coupon: activePromo.code,
        deliveryOption,
        orderType: actualOrderType as any,
        businesses: uniquePharmacies,
      }).then(() => {
        setTimeout(() => {
            clearCart();
            removePromo();
            router.push('/orders');
        }, 1500);
      });
    }
  }, [total, items.length, activePromo, isProcessingFreeOrder, isFormValid, user, addOrder, actualOrderType, clearCart, deliveryOption, patientAge, patientCondition, patientName, deliveryAddress, deliveryCity, deliveryEmail, deliveryPhone, deliveryState, removePromo, router, uniquePharmacies]);


  return (
    <Box sx={{ flex: 1 }}>
        {items.length === 0 ? (
          <Paper elevation={1} sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
            <ShoppingCart sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, color: '#666' }}>Your cart is empty</Typography>
            <Button component={Link} href="/find-medicines" variant="contained" sx={{ background: 'linear-gradient(135deg, #006D5B 0%, #004D40 100%)' }}>
              Browse Medicines
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              <Paper elevation={1} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: '#006D5B' }}>Cart Items ({items.length})</Typography>
              
              
                {items.map((item, index) => (
                  <Box key={item.id}>
                    <Divider sx={{ my: 2, display: index === 0 ? 'none' : 'block' }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Top Row: Image, Name, Quantity */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={item.image} sx={{ width: 50, height: 50, borderRadius: '8px', flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                            {item.name}
                          </Typography>
                          <Chip label={item.pharmacy} size="small" sx={{ fontSize: '0.7rem', bgcolor: '#e8f5e8', color: '#006D5B', mt: 0.5 }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, ml: 1 }}>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Remove /></IconButton>
                          <Typography sx={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Add /></IconButton>
                        </Box>
                      </Box>

                      {/* Bottom Row: Price, Delete */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, mt: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#006D5B' }}>
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </Typography>
                        <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ color: '#f44336' }}>
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                ))}

              </Paper>

              <Paper elevation={1} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#006D5B', display: 'flex', alignItems: 'center', gap: 1}}>
                  <PersonPinCircle /> Delivery & Patient Information
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField fullWidth required size="small" label="Patient Name" value={patientName} onChange={(e) => setPatientName(e.target.value)} /></Box>
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField fullWidth required size="small" label="Patient Age" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} /></Box>
                  <Box sx={{ width: '100%' }}><TextField fullWidth size="small" label="Patient Condition (Optional)" value={patientCondition} onChange={(e) => setPatientCondition(e.target.value)} /></Box>
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField fullWidth required size="small" label="Delivery Phone Number" value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} /></Box>
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField fullWidth required size="small" label="Email Address" value={deliveryEmail} onChange={(e) => setDeliveryEmail(e.target.value)} /></Box>
                  <Box sx={{ width: '100%' }}><TextField fullWidth required={deliveryOption !== 'pickup'} size="small" label="Delivery Address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} /></Box>
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField fullWidth required={deliveryOption !== 'pickup'} size="small" label="City" value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} /></Box>
                  <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}><TextField fullWidth required={deliveryOption !== 'pickup'} size="small" label="State" value={deliveryState} onChange={(e) => setDeliveryState(e.target.value)} /></Box>
                </Box>
              </Paper>
            </Box>

            <Box sx={{ width: { xs: '100%', md: '400px' } }}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: '16px', border: '1px solid #e0e0e0', position: 'sticky', top: 20 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#006D5B' }}>Order Summary</Typography>

                {/* === FULLY CORRECTED ORDER TYPE SECTION === */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: '#666', fontSize: '0.85rem', fontWeight: 500 }}>Order Type</Typography>
                  {isSingleOrder ? (
                    <Paper sx={{ p: 2, bgcolor: '#f8f9fa', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label="S" size="small" sx={{ bgcolor: '#006D5B', color: 'white', fontWeight: 'bold', minWidth: '24px' }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#333', fontSize: '0.8rem' }}>Single Order</Typography>
                          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>All items from {uniquePharmacies[0] || 'one pharmacy'}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ) : (
                    <Box>
                      <Paper sx={{ p: 1.5, bgcolor: '#fff3e0', border: '1px solid #ffb74d', borderRadius: '8px', mb: 2 }}><Typography variant="caption" sx={{ color: '#e65100', fontSize: '0.7rem', fontWeight: 500 }}>Items from {uniquePharmacies.length} different pharmacies detected</Typography></Paper>
                      <RadioGroup value={orderType} onChange={(e) => setOrderType(e.target.value)} sx={{ gap: 0 }}>
                        <FormControlLabel value="MN" control={<Radio size="small" sx={{ py: 0.5, '&.Mui-checked': { color: '#006D5B' } }} />} label={<Box><Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>Multiple Normal</Typography><Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666' }}> All items from one location (1x)</Typography></Box>} sx={{ mr: 0, mb: 1, alignItems: 'flex-start' }} />
                        <FormControlLabel value="MP" control={<Radio size="small" sx={{ py: 0.5, '&.Mui-checked': { color: '#006D5B' } }} />} label={<Box><Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>Multiple Premium</Typography><Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666' }}> Each item from your selected location (×{uniquePharmacies.length} delivery fee)</Typography></Box>} sx={{ mr: 0, alignItems: 'flex-start' }} />
                      </RadioGroup>
                    </Box>
                  )}
                </Box>
                
                {/* Delivery Options */}
<Box sx={{ mb: 2 }}>
  <Typography variant="body2" sx={{ mb: 1, color: '#666', fontSize: '0.85rem', fontWeight: 500 }}>Delivery Option</Typography>
  <RadioGroup value={deliveryOption} onChange={(e) => setDeliveryOption(e.target.value as 'standard' | 'express' | 'pickup')} sx={{ gap: 0 }}>
    <FormControlLabel 
        value="standard" 
        control={<Radio size="small" sx={{ py: 0.5, '&.Mui-checked': { color: '#006D5B' } }} />} 
        label={
            <Box>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                    Standard - ₦{STANDARD_DELIVERY_FEE.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666' }}>
                    You will get your items tomorrow
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
                    Express - ₦{EXPRESS_DELIVERY_FEE.toLocaleString()}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#E91E63' }}>
                    30mins - 3hrs delivery
                </Typography>
            </Box>
        } 
        sx={{ mr: 0, mb: 0.5 }} 
    />
    <FormControlLabel
      value="pickup"
      control={<Radio size="small" sx={{ py: 0.5, '&.Mui-checked': { color: '#006D5B' } }} />}
      label={
        <Box>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
          Free Delivery (Pickup from Pharmacy)
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#666' }}>
          You will receive the pharmacy's location and phone number to arrange pickup.
          </Typography>
        </Box>
      }
      sx={{ mr: 0 }}
    />
  </RadioGroup>
</Box>

{deliveryOption === 'pickup' && (
  <Paper sx={{ p: 2, mt: 2, mb: 3, border: '1px solid #006D5B', bgcolor: '#e8f5e8' }}>
    <Typography sx={{ fontWeight: 600, color: '#004D40', mb: 1 }}>
      {uniquePharmacies.length > 1 ? 'Pickup Locations' : 'Pickup Location'}
    </Typography>
    {uniquePharmacies.map((pharmacy, index) => (
      <Box key={index} sx={{ mb: index === uniquePharmacies.length - 1 ? 0 : 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>- {pharmacy}</Typography>
      </Box>
    ))}
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
      Full details will be provided on the Orders page after checkout.
    </Typography>
  </Paper>
)}
                {/* Promo Code */}
                <Box sx={{ mb: 3 }}>
                  {!activePromo ? (
                    <>
                      <TextField fullWidth size="small" placeholder="Enter promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleApplyPromo()} InputProps={{ endAdornment: ( <Button size="small" onClick={handleApplyPromo} disabled={!promoCode.trim()} sx={{ textTransform: 'none', color: '#006D5B', fontWeight: 600 }}> Apply </Button> ), sx: { borderRadius: '8px' } }} />
                      {promoMessage && <Typography variant="caption" sx={{ color: promoMessage.includes('successfully') ? '#4CAF50' : '#F44336', mt: 1, display: 'block' }}>{promoMessage}</Typography>}
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#E8F5E8', borderRadius: '8px', border: '1px solid #4CAF50' }}>
                      <Box><Typography variant="body2" sx={{ fontWeight: 600, color: '#2E7D32' }}>{activePromo.code} Applied</Typography><Typography variant="caption" color="text.secondary">{activePromo.description}</Typography></Box>
                      <Button size="small" onClick={handleRemovePromo} sx={{ color: '#F44336', textTransform: 'none', fontWeight: 600 }}>Remove</Button>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">Subtotal ({items.length} items)</Typography><Typography variant="body2">₦{subtotal.toLocaleString()}</Typography></Box>
                  {discountAmount > 0 && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#4CAF50' }}><Typography variant="body2" color="#4CAF50">Discount ({activePromo?.code})</Typography><Typography variant="body2" color="#4CAF50" sx={{ fontWeight: 600 }}>-₦{discountAmount.toLocaleString()}</Typography></Box>}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}><Typography variant="body2" color="text.secondary">Delivery Fee</Typography><Typography variant="body2" sx={{ color: deliveryDiscount > 0 ? 'text.secondary' : '#006D5B', fontWeight: 500, textDecoration: deliveryDiscount > 0 ? 'line-through' : 'none' }}>₦{deliveryFee.toLocaleString()}</Typography></Box>
                  {deliveryDiscount > 0 && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#4CAF50' }}><Typography variant="body2" color="#4CAF50">Free Delivery ({activePromo?.code})</Typography><Typography variant="body2" color="#4CAF50" sx={{ fontWeight: 600 }}>-₦{deliveryDiscount.toLocaleString()}</Typography></Box>}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
  <Typography variant="body2" color="text.secondary">Service Fee (SFC)</Typography>
  <Typography variant="body2" sx={{ fontWeight: 500 }}>
    {sfcPercentage}%
  </Typography>
</Box>
{sfcDiscount > 0 && (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: '#4CAF50' }}>
    <Typography variant="body2" color="#4CAF50">SFC Discount ({activePromo?.code})</Typography>
    <Typography variant="body2" color="#4CAF50" sx={{ fontWeight: 600 }}>
      -₦{sfcDiscount.toLocaleString()}
    </Typography>
  </Box>
)}


                <Divider sx={{ mb: 2 }} />

                
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#006D5B' }}>₦{total.toLocaleString()}</Typography>
                </Box>

                

                {total === 0 && !isProcessingFreeOrder ? (
                   <Button 
                     fullWidth 
                     variant="contained" 
                     disabled={!isFormValid || !user} 
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
                          color: '#888', 
                          boxShadow: 'none'
                        }
                     }}>
                    {!user ? 'Please log in to proceed' : !isFormValid ? 'Please fill in delivery info' : 'Processing Free Order...'}
                  </Button>
                ) : (
                  <PaystackButton
                    total={total}
                    deliveryOption={deliveryOption}
                    orderType={actualOrderType as 'S' | 'MN' | 'MP'}
                    uniquePharmacies={uniquePharmacies}
                    subtotal={subtotal}
                    deliveryFee={deliveryFee}
                    sfcAmount={sfcAmount}
                    sfcDiscount={sfcDiscount}
                    discountAmount={discountAmount}
                    deliveryDiscount={deliveryDiscount}
                    promoCode={activePromo?.code}
                    patientName={patientName}
                    patientAge={patientAge}
                    patientCondition={patientCondition}
                    deliveryPhone={deliveryPhone}
                    deliveryEmail={deliveryEmail}
                    deliveryAddress={deliveryAddress}
                    deliveryCity={deliveryCity}
                    deliveryState={deliveryState}
                    isFormValid={isFormValid}
                  />
                )}
              </Paper>
            </Box>
          </Box>
        )}

        {isProcessingFreeOrder && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <Card sx={{ p: 4, textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#4CAF50' }}>Order Confirmed!</Typography>
                <Typography>Your free order has been processed. Redirecting...</Typography>
            </Card>
          </Box>
        )}
    </Box>
  );
}
