'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  IconButton,
  Divider,
  Avatar,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccessTime,
  Loop,
  CheckCircle,
  Cancel,
  LocalPharmacy,
  LocationOn,
  Phone,
  MoreVert,
  Visibility,
  Edit,
  PhoneCallback,
  CancelPresentation,
} from '@mui/icons-material';
import Navbar from '@/components/Navbar';
import { useOrders } from '@/contexts/OrderContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const mockOrders = {
  processing: [
    {
      id: 'ORD003',
      pharmacy: 'Wellness Pharmacy',
      location: 'Surulere, Lagos',
      items: ['Blood Pressure Monitor', 'Aspirin'],
      total: 12500,
      date: '2025-11-02T14:20:00',
      progress: 65,
      status: 'Being prepared for delivery',
    },
  ],
  completed: [
    {
      id: 'ORD004',
      pharmacy: 'QuickMed Express',
      location: 'Lekki, Lagos',
      items: ['Insulin Pen', 'Test Strips'],
      total: 8900,
      date: '2025-11-01T11:45:00',
      completedDate: '2025-11-01T18:30:00',
      rating: 5,
    },
    {
      id: 'ORD005',
      pharmacy: 'Family Health Store',
      location: 'Yaba, Lagos',
      items: ['Multivitamins', 'Calcium Tablets'],
      total: 3200,
      date: '2025-10-30T16:10:00',
      completedDate: '2025-10-30T20:45:00',
      rating: 4,
    },
  ],
  cancelled: [
    {
      id: 'ORD006',
      pharmacy: 'Metro Pharmacy',
      location: 'Gbagada, Lagos',
      items: ['Pain Relief Gel'],
      total: 1800,
      date: '2025-10-29T12:30:00',
      cancelReason: 'Out of stock',
      cancelledDate: '2025-10-29T14:15:00',
    },
  ],
};

const OrderCard = ({ order, status }: { order: any; status: string }) => {
  const { updateOrderStatus } = useOrders();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusUpdate = (newStatus: 'processing' | 'completed' | 'cancelled') => {
    updateOrderStatus(order.id, newStatus);
    handleMenuClose();
  };

  const handleViewDetails = () => {
    // Could open a modal or navigate to detailed order page
    alert(`Viewing details for order ${order.id}`);
    handleMenuClose();
  };

  const handleContactCustomer = () => {
    // Could open WhatsApp or phone dialer
    window.open('https://wa.me/2349050066638?text=Hi%2C%20regarding%20your%20order%20' + order.id, '_blank');
    handleMenuClose();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending': return <AccessTime />;
      case 'processing': return <Loop />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <AccessTime />;
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.05)',
        '&:hover': {
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease'
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#006D5B', mb: 0.5 }}>
              {order.id}
            </Typography>
            <Chip 
              icon={getStatusIcon()}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              sx={{ 
                bgcolor: getStatusColor(),
                color: 'white',
                fontWeight: 600,
                '& .MuiChip-icon': { color: 'white' }
              }}
              size="small"
            />
          </Box>
          <IconButton 
            size="small" 
            onClick={handleMenuClick}
            aria-controls={menuOpen ? 'order-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
          >
            <MoreVert />
          </IconButton>
          
          <Menu
            id="order-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
            sx={{
              '& .MuiPaper-root': {
                borderRadius: '12px',
                minWidth: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }
            }}
          >
            <MenuItem onClick={handleViewDetails}>
              <ListItemIcon>
                <Visibility fontSize="small" />
              </ListItemIcon>
              <ListItemText>View Details</ListItemText>
            </MenuItem>

            {status === 'processing' && (
              <MenuItem onClick={() => handleStatusUpdate('completed')}>
                <ListItemIcon>
                  <CheckCircle fontSize="small" sx={{ color: '#4CAF50' }} />
                </ListItemIcon>
                <ListItemText>Mark as Completed</ListItemText>
              </MenuItem>
            )}

            {(status === 'processing' || status === 'completed') && (
              <MenuItem onClick={() => handleStatusUpdate('cancelled')}>
                <ListItemIcon>
                  <CancelPresentation fontSize="small" sx={{ color: '#F44336' }} />
                </ListItemIcon>
                <ListItemText>Cancel Order</ListItemText>
              </MenuItem>
            )}

            <MenuItem onClick={handleContactCustomer}>
              <ListItemIcon>
                <PhoneCallback fontSize="small" sx={{ color: '#25D366' }} />
              </ListItemIcon>
              <ListItemText>Contact Customer</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Pharmacy Display - Enhanced for MP orders */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ bgcolor: '#006D5B', mr: 2 }}>
              <LocalPharmacy />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {order.orderType === 'MP' ? `Fulfilling from ${order.pharmacies?.length || 1} pharmacies:` : 'Pharmacy:'}
              </Typography>
              
              {/* Show pharmacies as chips for MP orders, or single pharmacy name for others */}
              {order.pharmacies && order.pharmacies.length > 1 && order.orderType === 'MP' ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {order.pharmacies.map((pharmacy: string, index: number) => (
                    <Chip
                      key={index}
                      label={pharmacy}
                      size="small"
                      icon={<LocalPharmacy fontSize="small" />}
                      sx={{
                        bgcolor: 'rgba(233, 30, 99, 0.1)',
                        color: '#E91E63',
                        fontWeight: 500,
                        '& .MuiChip-icon': { color: '#E91E63' }
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {order.pharmacies ? order.pharmacies[0] : (order.pharmacy || 'Single Pharmacy')}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Order type badge */}
          {order.orderType && (
            <Box sx={{ ml: 7, mb: 1 }}>
              <Chip
                label={
                  order.orderType === 'S' ? 'Single Order' :
                  order.orderType === 'MN' ? 'Multiple Normal' :
                  order.orderType === 'MP' ? 'Multiple Premium' : 'Unknown'
                }
                size="small"
                sx={{
                  bgcolor: 
                    order.orderType === 'S' ? 'rgba(76, 175, 80, 0.1)' :
                    order.orderType === 'MN' ? 'rgba(33, 150, 243, 0.1)' :
                    order.orderType === 'MP' ? 'rgba(233, 30, 99, 0.1)' : 'rgba(0,0,0,0.1)',
                  color: 
                    order.orderType === 'S' ? '#4CAF50' :
                    order.orderType === 'MN' ? '#2196F3' :
                    order.orderType === 'MP' ? '#E91E63' : '#666',
                  fontWeight: 600,
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Items ({order.items.length}):
          </Typography>
          {order.items.map((item: any, index: number) => (
            <Chip 
              key={index}
              label={typeof item === 'string' ? item : `${item.name} (${item.quantity}x)`}
              size="small"
              sx={{ mr: 1, mb: 1, bgcolor: 'rgba(0, 109, 91, 0.1)', color: '#006D5B' }}
            />
          ))}
        </Box>

        {status === 'processing' && order.progress && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {order.status}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={order.progress} 
              sx={{ 
                borderRadius: 2,
                height: 8,
                bgcolor: 'rgba(33, 150, 243, 0.1)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#2196F3',
                  borderRadius: 2
                }
              }}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Order Date
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {new Date(order.date).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#006D5B' }}>
              ₦{order.total.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {status === 'pending' && order.estimatedDelivery && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
            <Typography variant="body2" color="#FF9800" sx={{ fontWeight: 600 }}>
              Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleTimeString('en-NG', {
                hour: '2-digit',
                minute: '2-digit'
              })} today
            </Typography>
          </Box>
        )}

        {status === 'completed' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
            <Typography variant="body2" color="#4CAF50" sx={{ fontWeight: 600 }}>
              Delivered on {new Date(order.completedDate).toLocaleDateString('en-NG')}
            </Typography>
          </Box>
        )}

        {status === 'cancelled' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 2 }}>
            <Typography variant="body2" color="#F44336" sx={{ fontWeight: 600 }}>
              Cancelled: {order.cancelReason}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default function OrdersPage() {
  const { orders } = useOrders();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter orders by status
  const processingOrders = orders.filter(order => order.status === 'processing');
  const completedOrders = orders.filter(order => order.status === 'completed');
  const cancelledOrders = orders.filter(order => order.status === 'cancelled');

  const tabConfig = [
    { label: 'Processing', count: processingOrders.length, color: '#2196F3' },
    { label: 'Completed', count: completedOrders.length, color: '#4CAF50' },
    { label: 'Cancelled', count: cancelledOrders.length, color: '#F44336' },
  ];

  return (
    <>
      <Navbar />
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pt: 10 }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                color: '#006D5B',
                mb: 1,
                background: 'linear-gradient(135deg, #006D5B 0%, #E91E63 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              My Orders
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
              Track and manage all your medication orders
            </Typography>
          </Box>

          {/* Tabs */}
          <Card sx={{ borderRadius: '20px', mb: 3, overflow: 'hidden' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                bgcolor: 'white',
                '& .MuiTabs-indicator': {
                  bgcolor: '#006D5B',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              {tabConfig.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {tab.label}
                      </Typography>
                      <Chip
                        label={tab.count}
                        size="small"
                        sx={{
                          bgcolor: tabValue === index ? tab.color : 'rgba(0,0,0,0.1)',
                          color: tabValue === index ? 'white' : 'text.secondary',
                          minWidth: '18px',
                          height: '16px',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          '& .MuiChip-label': {
                            px: 0.5
                          }
                        }}
                      />
                    </Box>
                  }
                  sx={{
                    textTransform: 'none',
                    color: tabValue === index ? '#006D5B' : 'text.secondary',
                    minHeight: '48px',
                    '&.Mui-selected': {
                      color: '#006D5B',
                      fontWeight: 700
                    }
                  }}
                />
              ))}
            </Tabs>
          </Card>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            {processingOrders.length > 0 ? (
              processingOrders.map((order) => (
                <OrderCard key={order.id} order={order} status="processing" />
              ))
            ) : (
              <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
                <Loop sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No orders being processed
                </Typography>
              </Card>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {completedOrders.length > 0 ? (
              completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} status="completed" />
              ))
            ) : (
              <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
                <CheckCircle sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No completed orders
                </Typography>
              </Card>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {cancelledOrders.length > 0 ? (
              cancelledOrders.map((order) => (
                <OrderCard key={order.id} order={order} status="cancelled" />
              ))
            ) : (
              <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
                <Cancel sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No cancelled orders
                </Typography>
              </Card>
            )}
          </TabPanel>
        </Container>
      </Box>
    </>
  );
}