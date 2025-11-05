"use client";
import React, { useState } from "react";


const mockOrders: Order[] = [
  {
    id: '1001',
    user: { name: 'John Doe', phone: '08012345678', email: 'john@example.com' },
    orderType: 'Single Order',
    deliveryOption: 'Standard Delivery',
    items: [ { name: 'Amoxicillin', qty: 2 }, { name: 'Paracetamol', qty: 1 } ],
    businesses: [
      { name: 'PharmaPlus', phone: '08011112222', email: 'pharmaplus@email.com' },
      { name: 'MediStore', phone: '08033334444', email: 'medistore@email.com' }
    ],
    totalAmount: 4500,
    status: 'pending',
    timeAccepted: '2025-11-04 10:15',
    timeDispatched: '',
    deliveryAgent: { name: 'Agent A', phone: '08055556666', email: 'agentA@email.com' },
    timePickup: '',
    timeDelivered: ''
  },
  {
    id: '1002',
    user: { name: 'Jane Smith', phone: '08087654321', email: 'jane@example.com' },
    orderType: 'Multiple Premium',
    deliveryOption: 'Express Delivery',
    items: [ { name: 'Ibuprofen', qty: 3 } ],
    businesses: [ { name: 'HealthMart', phone: '08022223333', email: 'healthmart@email.com' } ],
    totalAmount: 7000,
    status: 'processing',
    timeAccepted: '2025-11-04 11:00',
    timeDispatched: '2025-11-04 11:30',
    deliveryAgent: { name: 'Agent B', phone: '08077778888', email: 'agentB@email.com' },
    timePickup: '2025-11-04 11:45',
    timeDelivered: ''
  }
];

type Order = {
  id: string;
  user: { name: string; phone: string; email: string };
  orderType: string;
  deliveryOption: string;
  items: { name: string; qty: number }[];
  businesses: { name: string; phone: string; email: string }[];
  totalAmount: number;
  status: string;
  timeAccepted: string;
  timeDispatched: string;
  deliveryAgent: { name: string; phone: string; email: string };
  timePickup: string;
  timeDelivered: string;
};
import { Box, Typography, Tabs, Tab, Paper, Grid, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';

import Navbar from "@/components/Navbar";

export default function OrderManagementPage() {

  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [orderType, setOrderType] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("");
  const [tab, setTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };


  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  // Move order to completed
  const handleCompleteOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
    setSelectedOrder(null);
  };
  // Move order to cancelled
  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    setSelectedOrder(null);
  };
  const handleCloseOrder = () => {
    setSelectedOrder(null);
  };

  return (
    <>
      <Navbar />
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1B5E20", mb: 3 }}>
          Order Management
        </Typography>
        <Tabs value={tab} onChange={handleTabChange} aria-label="order management tabs" sx={{ mb: 2 }}>
          <Tab label="Dashboard" id="order-tab-0" aria-controls="order-tabpanel-0" />
          <Tab label="Processing" id="order-tab-1" aria-controls="order-tabpanel-1" />
          <Tab label="Completed" id="order-tab-2" aria-controls="order-tabpanel-2" />
          <Tab label="Cancelled" id="order-tab-3" aria-controls="order-tabpanel-3" />
        </Tabs>
        {tab === 0 && (
          <Paper sx={{ p: 3, minHeight: 300, overflow: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1B5E20' }}>All Orders (Extended List)</Typography>
            <Box sx={{ mb: 2 }}>
              <Button variant="outlined" color="primary" onClick={() => {
                // CSV export logic
                const columns = [
                  'S/N', 'Order ID', 'Status', 'Time & Date', 'User', 'Order Type', 'Delivery Option', 'Items', 'Businesses Involved', 'Total Amount', 'Fulfilled By', 'Time Accepted', 'Time Dispatched', 'Delivered By', 'Time of Pickup', 'Time of Delivery'
                ];
                const rows = orders.map((order, idx) => [
                  idx + 1,
                  order.id,
                  order.status.charAt(0).toUpperCase() + order.status.slice(1),
                  order.timeAccepted,
                  `${order.user.name} (${order.user.phone}, ${order.user.email})`,
                  order.orderType,
                  order.deliveryOption,
                  order.items.map(i => `${i.name} (qty: ${i.qty})`).join(', '),
                  order.businesses.map(b => b.name).join(', '),
                  `₦${order.totalAmount.toLocaleString()}`,
                  (() => {
                    if (
                      order.orderType.toLowerCase().includes('multiple premium') &&
                      order.deliveryOption.toLowerCase().includes('express')
                    ) {
                      return order.businesses.map(b => `${b.name} (${b.phone}, ${b.email})`).join('; ');
                    }
                    const b = order.businesses[0];
                    return b ? `${b.name} (${b.phone}, ${b.email})` : 'N/A';
                  })(),
                  order.timeAccepted,
                  order.timeDispatched,
                  `${order.deliveryAgent.name} (${order.deliveryAgent.phone}, ${order.deliveryAgent.email})`,
                  order.timePickup,
                  order.timeDelivered
                ]);
                const csvContent = [columns, ...rows].map(row => row.map(String).map(cell => '"' + cell.replace(/"/g, '""') + '"').join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'orders.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}>
                Download CSV
              </Button>
            </Box>
            <Box sx={{ width: '100%', height: 500 }}>
              <DataGrid
                rows={orders.map((order, idx) => ({
                  id: order.id,
                  sn: idx + 1,
                  timeAndDate: order.timeAccepted,
                  user: `${order.user.name} (${order.user.phone}, ${order.user.email})`,
                  orderType: order.orderType,
                  deliveryOption: order.deliveryOption,
                  status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
                  items: order.items.map(i => `${i.name} (qty: ${i.qty})`).join(', '),
                  businesses: order.businesses.map(b => b.name).join(', '),
                  totalAmount: `₦${order.totalAmount.toLocaleString()}`,
                  fulfilledBy: (() => {
                    if (
                      order.orderType.toLowerCase().includes('multiple premium') &&
                      order.deliveryOption.toLowerCase().includes('express')
                    ) {
                      return order.businesses.map(b => `${b.name} (${b.phone}, ${b.email})`).join('; ');
                    }
                    const b = order.businesses[0];
                    return b ? `${b.name} (${b.phone}, ${b.email})` : 'N/A';
                  })(),
                  timeAccepted: order.timeAccepted,
                  timeDispatched: order.timeDispatched,
                  deliveredBy: `${order.deliveryAgent.name} (${order.deliveryAgent.phone}, ${order.deliveryAgent.email})`,
                  timePickup: order.timePickup,
                  timeDelivered: order.timeDelivered,
                }))}
                columns={[
                  { field: 'sn', headerName: 'S/N', width: 70 },
                  { field: 'id', headerName: 'Order ID', width: 120 },
                  { field: 'status', headerName: 'Status', width: 120 },
                  { field: 'timeAndDate', headerName: 'Time & Date', width: 150 },
                  { field: 'user', headerName: 'User', width: 220 },
                  { field: 'orderType', headerName: 'Order Type', width: 140 },
                  { field: 'deliveryOption', headerName: 'Delivery Option', width: 140 },
                  { field: 'items', headerName: 'Items', width: 220 },
                  { field: 'businesses', headerName: 'Businesses Involved', width: 180 },
                  { field: 'totalAmount', headerName: 'Total Amount', width: 120 },
                  { field: 'fulfilledBy', headerName: 'Fulfilled By', width: 220 },
                  { field: 'timeAccepted', headerName: 'Time Accepted', width: 150 },
                  { field: 'timeDispatched', headerName: 'Time Dispatched', width: 150 },
                  { field: 'deliveredBy', headerName: 'Delivered By', width: 220 },
                  { field: 'timePickup', headerName: 'Time of Pickup', width: 150 },
                  { field: 'timeDelivered', headerName: 'Time of Delivery', width: 150 },
                ]}
                pageSize={10}
                rowsPerPageOptions={[10, 25, 50]}
                disableSelectionOnClick
                autoHeight={false}
              />
            </Box>
          </Paper>
        )}
        {/* Shared search/sort bar and filter logic */}
        {(() => {
          const renderSearchSortBar = () => (
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by user, order ID, or item..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 220, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}
              />
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}
              />
              <select
                value={orderType}
                onChange={e => setOrderType(e.target.value)}
                style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16, minWidth: 180 }}
              >
                <option value="">All Order Types</option>
                <option value="single order">Single Order</option>
                <option value="multiple normal">Multiple Normal</option>
                <option value="multiple premium">Multiple Premium</option>
              </select>
              <select
                value={deliveryOption}
                onChange={e => setDeliveryOption(e.target.value)}
                style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16, minWidth: 180 }}
              >
                <option value="">All Delivery Options</option>
                <option value="standard delivery">Standard Delivery</option>
                <option value="express delivery">Express Delivery</option>
              </select>
            </Box>
          );

          const filterOrders = (ordersArr, statusArr) =>
            ordersArr
              .filter(o => statusArr.includes(o.status))
              .filter(order => {
                const q = search.toLowerCase();
                const matchesSearch =
                  order.user.name.toLowerCase().includes(q) ||
                  order.id.toLowerCase().includes(q) ||
                  order.items.some(i => i.name.toLowerCase().includes(q));
                let matchesDate = true;
                if (filterDate) {
                  const orderDate = order.timeAccepted.split(' ')[0];
                  matchesDate = orderDate === filterDate;
                }
                let matchesType = true;
                if (orderType) {
                  matchesType = order.orderType.toLowerCase().includes(orderType);
                }
                let matchesDelivery = true;
                if (deliveryOption) {
                  matchesDelivery = order.deliveryOption.toLowerCase().includes(deliveryOption);
                }
                return matchesSearch && matchesDate && matchesType && matchesDelivery;
              });

          if (tab === 1) {
            return (
              <>
                <Typography variant="h6" sx={{ mb: 2, color: '#1B5E20' }}>Processing Orders</Typography>
                {renderSearchSortBar()}
                <Grid container spacing={2}>
                  {filterOrders(orders, ['pending', 'processing']).map(order => (
                    <Grid key={order.id} xs={12} sm={6} md={4} item>
                      <Card sx={{ cursor: 'pointer', borderLeft: '4px solid #E91E63', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }}>
                        <CardContent onClick={() => handleOpenOrder(order)} sx={{ pb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Order #{order.id}</Typography>
                          <Typography variant="body2">{order.user.name}</Typography>
                          <Typography variant="body2">{order.orderType} • {order.deliveryOption}</Typography>
                          <Typography variant="body2">
                            Items: {order.items.length} 
                            ({order.items.map(i => i.name).join(', ')}) • ₦{order.totalAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Status: {order.status}</Typography>
                        </CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pb: 1, pr: 2 }}>
                          <Button size="small" color="success" variant="contained" onClick={() => handleCompleteOrder(order.id)}>Complete</Button>
                          <Button size="small" color="error" variant="outlined" onClick={() => handleCancelOrder(order.id)}>Cancel</Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                <Dialog open={!!selectedOrder} onClose={handleCloseOrder} maxWidth="md" fullWidth>
                  <DialogTitle>Order Details</DialogTitle>
                  <DialogContent dividers>
                    {selectedOrder && (
                      <Stack spacing={2}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Order #{selectedOrder.id}</Typography>
                        <Typography><b>Time & Date:</b> {selectedOrder.timeAccepted}</Typography>
                        <Typography><b>User:</b> {selectedOrder.user.name} ({selectedOrder.user.phone}, {selectedOrder.user.email})</Typography>
                        <Typography><b>Order Type:</b> {selectedOrder.orderType}</Typography>
                        <Typography><b>Delivery Option:</b> {selectedOrder.deliveryOption}</Typography>
                        <Typography><b>Items:</b> {selectedOrder.items.length}</Typography>
                        <ul style={{ marginTop: 0, marginBottom: 8 }}>
                          {selectedOrder.items.map((item, idx) => (
                            <li key={idx}>{item.name} (qty: {item.qty})</li>
                          ))}
                        </ul>
                        <Typography><b>Businesses Involved:</b> {selectedOrder.businesses.map(b => b.name).join(', ')}</Typography>
                        <Typography><b>Total Amount:</b> ₦{selectedOrder.totalAmount.toLocaleString()}</Typography>
                        {/* Mock logic for Fulfilled By */}
                        <Typography><b>Fulfilled By:</b> {
                          (() => {
                            // Multiple Premium Express: fulfilled by all businesses involved
                            if (
                              selectedOrder.orderType.toLowerCase().includes('multiple premium') &&
                              selectedOrder.deliveryOption.toLowerCase().includes('express')
                            ) {
                              return selectedOrder.businesses.map(b => `${b.name} (${b.phone}, ${b.email})`).join('; ');
                            }
                            // Other types: fulfilled by a single business (mock: first business)
                            const b = selectedOrder.businesses[0];
                            return b ? `${b.name} (${b.phone}, ${b.email})` : 'N/A';
                          })()
                        }</Typography>
                        <Typography><b>Time Accepted:</b> {selectedOrder.timeAccepted}</Typography>
                        <Typography><b>Time Dispatched:</b> {selectedOrder.timeDispatched}</Typography>
                        <Typography><b>Delivered By:</b> {selectedOrder.deliveryAgent.name} ({selectedOrder.deliveryAgent.phone}, {selectedOrder.deliveryAgent.email})</Typography>
                        <Typography><b>Time of Pickup:</b> {selectedOrder.timePickup}</Typography>
                        <Typography><b>Time of Delivery:</b> {selectedOrder.timeDelivered}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button color="success" variant="contained" onClick={() => handleCompleteOrder(selectedOrder.id)}>Complete</Button>
                          <Button color="error" variant="outlined" onClick={() => handleCancelOrder(selectedOrder.id)}>Cancel</Button>
                        </Box>
                      </Stack>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseOrder}>Close</Button>
                  </DialogActions>
                </Dialog>
              </>
            );
          }
          if (tab === 2) {
            return (
              <>
                <Typography variant="h6" sx={{ mb: 2, color: '#1B5E20' }}>Completed Orders</Typography>
                {renderSearchSortBar()}
                <Grid container spacing={2}>
                  {filterOrders(orders, ['completed']).map(order => (
                    <Grid key={order.id} xs={12} sm={6} md={4} item>
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Order #{order.id}</Typography>
                          <Typography variant="body2">{order.user.name}</Typography>
                          <Typography variant="body2">{order.orderType} • {order.deliveryOption}</Typography>
                          <Typography variant="body2">
                            Items: {order.items.length} 
                            ({order.items.map(i => i.name).join(', ')}) • ₦{order.totalAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Status: {order.status}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            );
          }
          return null;
        })()}
        {tab === 2 && (
          <Paper sx={{ p: 3, minHeight: 300 }}>
            <Typography variant="h6" sx={{ mb: 2, color: '#1B5E20' }}>Completed Orders</Typography>
            <Grid container spacing={2}>
              {orders.filter(o => o.status === 'completed').map(order => (
                <Grid key={order.id} xs={12} sm={6} md={4} item>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Order #{order.id}</Typography>
                      <Typography variant="body2">{order.user.name}</Typography>
                      <Typography variant="body2">{order.orderType} • {order.deliveryOption}</Typography>
                      <Typography variant="body2">
                        Items: {order.items.length} 
                        ({order.items.map(i => i.name).join(', ')}) • ₦{order.totalAmount.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Status: {order.status}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
        {tab === 3 && (() => {
          const renderSearchSortBar = () => (
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by user, order ID, or item..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, minWidth: 220, padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}
              />
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}
              />
              <select
                value={orderType}
                onChange={e => setOrderType(e.target.value)}
                style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16, minWidth: 180 }}
              >
                <option value="">All Order Types</option>
                <option value="single order">Single Order</option>
                <option value="multiple normal">Multiple Normal</option>
                <option value="multiple premium">Multiple Premium</option>
              </select>
              <select
                value={deliveryOption}
                onChange={e => setDeliveryOption(e.target.value)}
                style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', fontSize: 16, minWidth: 180 }}
              >
                <option value="">All Delivery Options</option>
                <option value="standard delivery">Standard Delivery</option>
                <option value="express delivery">Express Delivery</option>
              </select>
            </Box>
          );
          const filterOrders = (ordersArr, statusArr) =>
            ordersArr
              .filter(o => statusArr.includes(o.status))
              .filter(order => {
                const q = search.toLowerCase();
                const matchesSearch =
                  order.user.name.toLowerCase().includes(q) ||
                  order.id.toLowerCase().includes(q) ||
                  order.items.some(i => i.name.toLowerCase().includes(q));
                let matchesDate = true;
                if (filterDate) {
                  const orderDate = order.timeAccepted.split(' ')[0];
                  matchesDate = orderDate === filterDate;
                }
                let matchesType = true;
                if (orderType) {
                  matchesType = order.orderType.toLowerCase().includes(orderType);
                }
                let matchesDelivery = true;
                if (deliveryOption) {
                  matchesDelivery = order.deliveryOption.toLowerCase().includes(deliveryOption);
                }
                return matchesSearch && matchesDate && matchesType && matchesDelivery;
              });
          return (
            <>
              <Typography variant="h6" sx={{ mb: 2, color: '#1B5E20' }}>Cancelled Orders</Typography>
              {renderSearchSortBar()}
              <Grid container spacing={2}>
                {filterOrders(orders, ['cancelled']).map(order => (
                  <Grid key={order.id} xs={12} sm={6} md={4} item>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Order #{order.id}</Typography>
                        <Typography variant="body2">{order.user.name}</Typography>
                        <Typography variant="body2">{order.orderType} • {order.deliveryOption}</Typography>
                        <Typography variant="body2">
                          Items: {order.items.length} 
                          ({order.items.map(i => i.name).join(', ')}) • ₦{order.totalAmount.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Status: {order.status}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          );
        })()}
      </Box>
    </>
  );
}
