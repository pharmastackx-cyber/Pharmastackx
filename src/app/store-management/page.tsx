'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, IconButton, TextField, Button,
  Table, TableHead, TableBody, TableRow, TableCell, Paper, useTheme, 
  useMediaQuery, CircularProgress, Tooltip, Select, MenuItem, 
  FormControl, InputLabel, Divider, Collapse, Checkbox, FormControlLabel
} from '@mui/material';
import { Storefront, LocationOn, UploadFile, ExpandMore } from '@mui/icons-material';
import Papa from 'papaparse';
import WhatsAppButton from '../../components/WhatsAppButton';


interface StockItem {
  _id?: string;
  itemName: string;
  activeIngredient: string;
  category: string;
  amount: number | string;
  imageUrl: string;
  businessName: string;
  coordinates: string;
  info: string;
  POM: boolean;  
}

interface Order {
  _id: string;
  customerName: string;
  totalPrice: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'failed';
  items: {
    name: string;
    qty: number;
    amount: number;
    image?: string;
  }[];
  createdAt: string;
}


export default function StoreManagementPage() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [location, setLocation] = useState<string | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [userBusinessName, setUserBusinessName] = useState<string | null>(null);
  const [businessCoordinates, setBusinessCoordinates] = useState<{ latitude?: number; longitude?: number } | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showBulkPreview, setShowBulkPreview] = useState(false);
  const [bulkData, setBulkData] = useState<StockItem[]>([]);
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');


  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof StockItem | ''>( '');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingRowData, setEditingRowData] = useState<StockItem | {}>({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const [formValues, setFormValues] = useState<Omit<StockItem, '_id'>>({
    itemName: '',
    activeIngredient: '',
    category: '',
    amount: '',
    imageUrl: '',
    businessName: '',
    coordinates: '',
    info: '',
    POM: false,
  });
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);



  const fetchStockData = useCallback(async (businessName: string | null) => {
    if (!businessName) {
      setLoadingStock(false);
      setStockData([]); // Clear stock data if no business name
      return;
    }
    setLoadingStock(true);
    try {
      const apiUrl = `/api/stock?businessName=${encodeURIComponent(businessName)}`;
      const stockRes = await fetch(apiUrl);
      if (!stockRes.ok) throw new Error('Failed to fetch stock');
      const stockJson = await stockRes.json();

      const transformedData = stockJson.items.map((product: any) => ({
        _id: product._id,
        itemName: product.itemName || 'N/A',
        activeIngredient: product.activeIngredient || 'N/A',
        category: product.category || 'N/A',
        amount: product.amount || 0,
        imageUrl: product.imageUrl || '',
        businessName: product.businessName || 'N/A',
        coordinates: product.coordinates || 'N/A',
        info: product.info || '',
        POM: product.POM || false,
      }));
      setStockData(transformedData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      alert('Could not load your stock data.');
    }
    setLoadingStock(false);
  }, []);

  const [showIncomplete, setShowIncomplete] = useState(false);

  const isItemIncomplete = (item: StockItem) => {
    // These fields are allowed to be empty or have default values
    const fieldsToExclude: (keyof StockItem)[] = ['_id', 'POM', 'businessName', 'coordinates'];
    
    for (const key in item) {
        if (fieldsToExclude.includes(key as keyof StockItem)) continue;
        
        const value = item[key as keyof StockItem];
        if (value === null || value === undefined || value === '' || value === 'N/A' || (typeof value === 'number' && value === 0)) {
            return true; // Found an incomplete field
        }
    }
    return false; // All fields are complete
  };



  const fetchOrders = useCallback(async (businessName: string | null) => {
    if (!businessName) {
      setLoadingOrders(false);
      setOrders([]); // Clear orders if no business name is available
      return;
    }
    setLoadingOrders(true);
    setOrdersError(null);
    try {
        // Construct URL with both deliveryOption and businessName
        const params = new URLSearchParams({
            deliveryOption: 'express',
            businessName: businessName,
        });

        const response = await fetch(`/api/orders?${params.toString()}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch orders');
        }
        const data = await response.json();

        const transformedOrders = data.map((order: any) => ({
            _id: order._id,
            customerName: order.user?.name || 'N/A',
            totalPrice: order.totalAmount || 0,
            status: order.status?.toLowerCase() || 'pending',
            items: (order.items || []).map((item: any) => ({
              name: item.name || 'Unnamed Item',
              qty: item.qty || 1,
              amount: item.amount || item.price || 0, 
              image: item.image || item.imageUrl || '', 
            })),
            createdAt: new Date(order.createdAt).toLocaleDateString(),
        }));

        setOrders(transformedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        setOrdersError((error as Error).message);
    } finally {
        setLoadingOrders(false);
    }
  }, []);



  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingUser(true);
      try {
        const userRes = await fetch('/api/user/me');
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const userData = await userRes.json();

        let currentBusinessName: string | null = null;
        let currentCoordinates: string | null = null;

        if (userData.user?.businessName) {
            currentBusinessName = userData.user.businessName;
            setUserBusinessName(currentBusinessName);
            setFormValues(prev => ({ ...prev, businessName: currentBusinessName! }));
        }
        if (userData.user?.slug) setUserSlug(userData.user.slug);

        if (userData.user?.businessCoordinates) {
          const { latitude, longitude } = userData.user.businessCoordinates;
          currentCoordinates = `Lat: ${latitude?.toFixed(4)}, Lon: ${longitude?.toFixed(4)}`;
          setBusinessCoordinates({ latitude, longitude });
          setLocation(currentCoordinates);
          setFormValues(prev => ({ ...prev, coordinates: currentCoordinates! }));
        }

        // Fetch both stock and orders data in parallel
        await Promise.all([
          fetchStockData(currentBusinessName),
          fetchOrders(currentBusinessName)

      ]);
      

      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
      setLoadingUser(false);
    };
    fetchInitialData();
  }, [fetchStockData, fetchOrders]);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // This function checks if the click was outside the form area
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowUploadForm(false);
      }
    }

    // We only want to listen for clicks when the form is actually visible
    if (showUploadForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // This is a cleanup step: it removes the listener when the form is closed
    // to prevent memory leaks and unnecessary processing.
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUploadForm]); // This effect will re-run whenever `showUploadForm` changes




  const filteredOrders = orders.filter(order =>
    orderStatusFilter === 'all' || order.status === orderStatusFilter
  );

  const filteredStock = stockData.filter(item => {
    const searchMatch = Object.values(item).join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    const incompleteMatch = !showIncomplete || isItemIncomplete(item);
    return searchMatch && incompleteMatch;
  });

  const sortedStock = [...filteredStock].sort((a, b) => {
    const aIncomplete = isItemIncomplete(a);
    const bIncomplete = isItemIncomplete(b);

    // This will bring incomplete items to the top
    if (aIncomplete && !bIncomplete) return -1;
    if (!aIncomplete && bIncomplete) return 1;
    
    // This is your existing sorting logic
    if (!sortColumn) return 0;
    const valA = String(a[sortColumn] ?? '');
    const valB = String(b[sortColumn] ?? '');
    if (sortDirection === 'asc') {
      return valA.localeCompare(valB);
    } else {
      return valB.localeCompare(valA);
    }
  });


  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStock = sortedStock.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: keyof StockItem) => {
    if (sortColumn === column) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(column); setSortDirection('asc'); }
    setCurrentPage(1);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setSelectedTab(newValue);

  const handleGetLocation = () => {
    if (businessCoordinates?.latitude && businessCoordinates?.longitude) {
      alert('Store location already set. Cannot overwrite.');
      return;
    }
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const coordsString = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

        try {
          const res = await fetch('/api/user/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coordinates: { latitude, longitude } }),
          });
          if (!res.ok) throw new Error('Failed to update location');
          setBusinessCoordinates({ latitude, longitude });
          setLocation(coordsString);
          setFormValues(prev => ({ ...prev, coordinates: coordsString }));
          alert('Location saved!');
        } catch (e) {
          console.error('Error:', e);
          alert('Error saving location.');
        }
      },
      err => alert(`Error getting location: ${err.message}`)
    );
  };

  const handleStoreInfoClick = async () => {
    setLoadingUser(true);
    try {
      const res = await fetch('/api/user/me');
      const data = await res.json();
      if (data.user?.slug) setUserSlug(data.user.slug);
      if (data.user?.businessName) setUserBusinessName(data.user.businessName);
    } catch (e) { console.error('Error fetching user:', e); }
    finally { setLoadingUser(false); }
  };

  const handleUploadClick = () => setShowUploadForm(true);
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormValues({ ...formValues, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const newProduct = { 
            ...formValues, 
            businessName: userBusinessName,
            amount: Number(formValues.amount) || 0
        };
        const response = await fetch('/api/stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to submit form');
        }
        const { product: savedProduct } = await response.json();
        setStockData(prev => [savedProduct, ...prev]);
        alert('Item added successfully!');
        setShowUploadForm(false);
        setFormValues({
          itemName: '',
          activeIngredient: '',
          category: '',
          amount: '',
          imageUrl: '',
          businessName: userBusinessName || '',
          coordinates: location || '',
          info: '',        // ✅ fixed line
          POM: false,
        });
        
        
    } catch (error) {
        console.error('Error submitting form:', error);
        alert(`Error: ${(error as Error).message}`);
    }
    setIsSubmitting(false);
  };

  const normalizeCSVHeaders = (headers: string[]) => {
    const headerMap: Record<string, keyof StockItem> = {
      'item name': 'itemName', 'item': 'itemName', 'product': 'itemName', 'drug': 'itemName', 'medicine name': 'itemName', 'name': 'itemName',
      'active ingredient': 'activeIngredient', 'ingredient': 'activeIngredient', 'compound': 'activeIngredient', 'api': 'activeIngredient', 'substance': 'activeIngredient',
      'category': 'category', 'class': 'category', 'type': 'category', 'drug class': 'category',
      'amount': 'amount', 'price': 'amount', 'cost': 'amount', 'value': 'amount', '₦': 'amount', 'naira': 'amount',
      'image': 'imageUrl', 'photo': 'imageUrl', 'picture': 'imageUrl', 'img': 'imageUrl', 'image url': 'imageUrl',
      'info': 'info', 'description': 'info', 'details': 'info', 'pack size': 'info',
      'pom': 'POM', 'prescription': 'POM', 'prescription required': 'POM',
    };
    const mapping: { [key: string]: keyof StockItem } = {};
    headers.forEach(header => {
        const lower = header.trim().toLowerCase();
        if (headerMap[lower]) {
            mapping[header] = headerMap[lower];
        }
    });
    return mapping;
  };
  
  const normalizeValue = (key: keyof StockItem, rawValue: any) => {
    if (rawValue === null || rawValue === undefined) return '';
    const value = String(rawValue).trim();
    if (key === 'amount') {
      const numeric = value.replace(/[₦$,]/g, '').replace(/k/i, '000').match(/\d+(\.\d+)?/);
      return numeric ? parseFloat(numeric[0]) : 0;
    }
    if (key === 'POM') {
        const lowerCaseValue = value.toLowerCase();
        return ['true', 'yes', 'y', '1', 'pom'].includes(lowerCaseValue);
    }
    return value.replace(/\s+/g, ' ').trim();
  };

    const handleBulkFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const headers = result.meta.fields || [];
        const headerMapping = normalizeCSVHeaders(headers);
        
        const parsedData = result.data.map((row: any) => {
          const normalizedRow: Partial<StockItem> = {};
          for (const header of headers) {
              const mappedKey = headerMapping[header];
              if (mappedKey) {
                  (normalizedRow as any)[mappedKey] = normalizeValue(mappedKey, row[header]);
              }
          }
              

          // Return a complete StockItem object with defaults
          return {
              itemName: '',
              activeIngredient: '',
              category: '',
              amount: 0,
              imageUrl: '',
              ...normalizedRow, // Overwrite defaults with any parsed values
              info: normalizedRow.info || '', // Ensure info is a string
              POM: normalizedRow.POM || false, // Ensure POM is a boolean
              businessName: userBusinessName || 'N/A',
              coordinates: location || 'N/A',
          } as StockItem;
        })
        // 🔥 Filter out any accidental garbage line like the one showing in your preview
        .filter(item => 
          item.itemName && 
          !item.itemName.toLowerCase().includes('src/app/')
        );

        setBulkData(parsedData);
        setShowBulkPreview(true);
      },
       error: (error) => {
        console.error("CSV parsing error:", error);
        alert("Failed to parse CSV file. Please check the format.");
      }
    });
  };


  const handleConfirmBulkUpload = async () => {
    if (!bulkData.length) {
      alert('No data to upload.');
      return;
    }
    setIsSubmitting(true);
    try {
        const payload = {
            products: bulkData,
            fileName: fileInputRef.current?.files?.[0]?.name || 'bulk_upload.csv'
        };
      const response = await fetch('/api/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const { savedProducts } = await response.json();
        setStockData(prev => [...savedProducts, ...prev]);
        alert('Bulk upload successful!');
        setShowBulkPreview(false);
        setBulkData([]);
        if(fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Bulk upload failed');
      }
    } catch (error) {
      console.error('Error during bulk upload:', error);
      alert(`An unexpected error occurred: ${(error as Error).message}`);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to request deletion for this item?')) return;
    console.log(`Deletion requested for product ID: ${productId} by user: ${userBusinessName}`);
    alert('Deletion request sent for admin approval.');
  };

  const handleSave = async (productId: string) => {
    try {
      const response = await fetch(`/api/stock/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRowData),
      });

      if (response.ok) {
        const { product: updatedProduct } = await response.json();
        setStockData(prev => prev.map(item => item._id === productId ? updatedProduct : item));
        alert('Item updated successfully');
        setEditingRowIndex(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert(`An unexpected error occurred: ${(error as Error).message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'processing' | 'completed' | 'cancelled' | 'failed') => {
    const confirmationMessage = `Are you sure you want to change the order status to ${newStatus}?`;
    if (!window.confirm(confirmationMessage)) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update status to ${newStatus}`);
      }

      const updatedOrder = await res.json();

      // Update the order in the local state to reflect the change instantly
      setOrders(prevOrders =>
        prevOrders.map(o => (o._id === orderId ? { ...o, status: updatedOrder.status.toLowerCase() } : o))
      );

      alert(`Order status updated to ${updatedOrder.status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(`Error: ${(error as Error).message}`);
    }
  };

  const OrderActionButtons = ({ order }: { order: Order }) => {
    if (order.status === 'pending') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, p: 1, borderTop: '1px solid #eee' }}>
          <Button size="small" variant="contained" color="success" onClick={() => handleUpdateOrderStatus(order._id, 'processing')}>
            Accept
          </Button>
          <Button size="small" variant="contained" color="error" onClick={() => handleUpdateOrderStatus(order._id, 'cancelled')}>
            Reject
          </Button>
        </Box>
      );
    }
    if (order.status === 'processing') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, p: 1, borderTop: '1px solid #eee' }}>
          <Button size="small" variant="contained" color="primary" onClick={() => handleUpdateOrderStatus(order._id, 'completed')}>
            Completed
          </Button>
          <Button size="small" variant="contained" color="warning" onClick={() => handleUpdateOrderStatus(order._id, 'failed')}>
            Failed
          </Button>
        </Box>
      );
    }
    return null; // Don't show buttons for 'completed', 'cancelled', or 'failed' statuses
  };


  const handleImageFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Optional: Add a check for file size (e.g., limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Please select an image under 2MB.');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    
    reader.onload = () => {
      // The result is the Base64 encoded Data URL
      const result = reader.result as string;
      setFormValues(prev => ({ ...prev, imageUrl: result }));
      setIsUploadingImage(false);
    };

    reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Failed to read the image file.');
        setIsUploadingImage(false);
    };

    reader.readAsDataURL(file);

    // Clear the file input value to allow re-uploading the same file
    if(imageInputRef.current) {
        imageInputRef.current.value = "";
    }
  };

  const handleEditRowImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      // This specifically updates the data for the row being edited
      setEditingRowData(prev => ({ ...prev, imageUrl: result }));
    };

    reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Failed to read the image file.');
    };

    reader.readAsDataURL(file);
  };



  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>Store Management</Typography>
      <Tabs value={selectedTab} onChange={handleTabChange} variant={isMobile ? 'scrollable' : 'standard'} scrollButtons="auto">
        <Tab label="Storefront" />
        <Tab label="Upload" />
        <Tab label="Stock" />
        <Tab label="Orders" />
      </Tabs>

      {selectedTab === 0 && (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
           <Box sx={{ maxWidth: 350, width: '100%', background: 'linear-gradient(90deg, #004d40 0%, #800080 100%)', color: 'white', p: 3, borderRadius: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' } }} onClick={handleStoreInfoClick}>
            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }}><Storefront sx={{ color: 'white' }} /></IconButton>
            <Typography variant="h6">Store Info</Typography>
            {loadingUser ? <CircularProgress size={20} color="inherit" /> : <Typography variant="body2">{userBusinessName ? `Name: ${userBusinessName}` : 'Click to fetch info'}</Typography>}
            {userSlug && <Typography variant="caption">Slug: {userSlug}</Typography>}
          </Box>

          <Box
            sx={{
              maxWidth: 350, 
              width: '100%',
              height: 120,
              background: businessCoordinates
                ? 'linear-gradient(90deg, #9e9e9e 0%, #bdbdbd 100%)'
                : 'linear-gradient(90deg, #006400 0%, #8b008b 100%)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 3,
              cursor: businessCoordinates ? 'default' : 'pointer',
              transition: '0.3s',
              '&:hover': !businessCoordinates ? { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' } : undefined,
            }}
            onClick={!businessCoordinates ? handleGetLocation : undefined}
          >
            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }}><LocationOn sx={{ color: 'white' }} /></IconButton>
            {businessCoordinates ? (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Store Location:</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>{location}</Typography>
              </>
            ) : <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Click to get your location</Typography>}
          </Box>
        </Box>
      )}

      {selectedTab === 1 && (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>

<Typography 
      variant="body2" 
      color="text.secondary" 
      sx={{ 
        mb: 2, 
        maxWidth: 600, 
        textAlign: 'center', 
        fontStyle: 'italic' 
      }}
    >
      This is your upload section where you add medications. You can add them one at a time or in bulk using a CSV file.
      To add in bulk, you may need to export the stock list from your business's point-of-sale system.
      For any challenges, use the WhatsApp icon at the bottom right for support.
    </Typography>

          {!showUploadForm ? (
            <Box sx={{ maxWidth: 350, width: '100%', height: 150, bgcolor: '#1976d2', color: 'white', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' } }} onClick={handleUploadClick}>
              <IconButton sx={{ color: 'white', mb: 1 }}><UploadFile /></IconButton>
              <Typography variant="h6">Upload Single Item</Typography>
              <Typography variant="body2">Click to add a new item.</Typography>
            </Box>
          ) : (
            <Box ref={formRef} component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 350, width: '100%', p: 3, bgcolor: '#e0f7fa', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <TextField label="Item Name" name="itemName" value={formValues.itemName} onChange={handleFormChange} fullWidth required />
              <TextField label="Active Ingredient" name="activeIngredient" value={formValues.activeIngredient} onChange={handleFormChange} fullWidth required />
              <TextField label="Category" name="category" value={formValues.category} onChange={handleFormChange} fullWidth required/>
              <TextField label="Amount" name="amount" type="number" value={formValues.amount} onChange={handleFormChange} fullWidth required/>
              <TextField 
                label="Info (e.g., pack size, quantity)" 
                name="info" 
                value={formValues.info} 
                onChange={handleFormChange} 
                fullWidth 
                multiline 
                rows={2} 
              />
              <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'flex-start', gap: 2 }}>
    <TextField 
      label="Image URL (or upload)" 
      name="imageUrl" 
      value={formValues.imageUrl} 
      onChange={handleFormChange} 
      fullWidth
      multiline
      rows={2} // More space to show a preview of the long data URL
      InputProps={{
        readOnly: isUploadingImage,
        sx: { fontSize: '0.8rem' } // Use a smaller font for the Data URL
      }}
    />
    <Button 
      variant="outlined" 
      component="label"
      disabled={isUploadingImage}
      sx={{ height: 56, flexShrink: 0, width: isMobile ? '100%' : 'auto' }}
    >
      {isUploadingImage ? <CircularProgress size={24} /> : 'Upload'}
      <input 
        type="file" 
        accept="image/*" 
        hidden 
        ref={imageInputRef}
        onChange={handleImageFileSelect}
      />
    </Button>
</Box>

              <TextField label="Business Name" value={userBusinessName || ''} InputProps={{ readOnly: true }} fullWidth />
              <TextField label="Coordinates" value={location || ''} InputProps={{ readOnly: true }} fullWidth />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValues.POM}
                    onChange={(e) => setFormValues({ ...formValues, POM: e.target.checked })}
                    name="POM"
                    color="primary"
                  />
                }
                label="Prescription-Only Medicine (POM)"
              />
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
              </Button>
               <Button variant="outlined" color="secondary" onClick={() => setShowUploadForm(false)} sx={{mt: 1}}>Cancel</Button>
            </Box>
          )}

          <Box sx={{ maxWidth: 350, width: '100%', height: 'auto', background: 'linear-gradient(90deg, #004d40 0%, #800080 100%)', color: 'white', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', p: 3 }}>
            <IconButton sx={{ color: 'white', mb: 1 }}><UploadFile /></IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Bulk Upload</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>Upload multiple items using a CSV file</Typography>
            <Button variant="contained" component="label" color="secondary">
              Choose CSV
              <input type="file" accept=".csv" hidden onChange={handleBulkFileUpload} ref={fileInputRef} />
            </Button>

            {showBulkPreview && (
            <Paper sx={{ mt: 3, width: '100%', overflowX: 'auto', bgcolor: 'white', color: 'black' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Item Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Active Ingredient</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Info</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>POM</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bulkData.slice(0, 5).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.itemName}</TableCell>
                      <TableCell>{row.activeIngredient}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.amount}</TableCell>
                      <TableCell>{row.info}</TableCell>
                      <TableCell>{row.POM ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {bulkData.length > 5 && <Typography sx={{p: 1, fontSize: 12}}>... and {bulkData.length - 5} more rows.</Typography>}
              <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleConfirmBulkUpload} disabled={isSubmitting}>
                  {isSubmitting ? <CircularProgress size={24} /> : 'Confirm Upload'}
              </Button>
            </Paper>

            )}
          </Box>
        </Box>
      )}

      {selectedTab === 2 && (
         <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Current Stock Catalogue</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 900, width: '100%', textAlign: 'center', fontStyle: 'italic' }}>
            These are all medications you have uploaded. A red dot indicates an item with incomplete details that you can edit.
            Use the search bar to find items, click column headers to sort, or toggle the checkbox to only see incomplete products that need your attention.
            </Typography>

             {loadingStock ? <CircularProgress /> :
              <Paper sx={{ maxWidth: 900, width: '100%', overflowX: 'auto', bgcolor: 'white', color: 'black', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', borderRadius: 2, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField
              label="Search items"
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              sx={{ width: isMobile ? '100%' : 300 }}
              />
              <FormControlLabel
              control={
              <Checkbox
          checked={showIncomplete}
          onChange={(e) => setShowIncomplete(e.target.checked)}
          name="showIncomplete"
        />
      }
      label="Show only incomplete items"
    />
</Box>

    
                <Table size="small">
                <TableHead>
  <TableRow>
    <TableCell sx={{ fontWeight: 600 }}>S/N</TableCell>
    {(['itemName', 'activeIngredient', 'category', 'amount', 'imageUrl', 'info', 'POM', 'businessName', 'coordinates'] as (keyof StockItem)[]).map(key => (
      <TableCell
        key={key}
        onClick={() => handleSort(key)}
        sx={{
          cursor: 'pointer',
          fontWeight: 600,
          '&:hover': { color: 'primary.main' },
          ...(key === 'imageUrl' && {
            maxWidth: '150px',
            minWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          })
        }}
      >
        {(key.replace(/([a-z])([A-Z])/g, '$1 $2')).charAt(0).toUpperCase() + (key.replace(/([a-z])([A-Z])/g, '$1 $2')).slice(1)}
        {sortColumn === key && <span style={{ marginLeft: 4, fontSize: 12, color: 'gray' }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
      </TableCell>
    ))}
    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
  </TableRow>
</TableHead>


<TableBody>
  {paginatedStock.map((row, i) => {
    const globalIndex = stockData.findIndex(item => item._id === row._id);
    const serialNumber = startIndex + i + 1;
    return (
      <TableRow key={row._id}>
        {editingRowIndex === globalIndex ? (
          <>
            <TableCell>{serialNumber}</TableCell>
            {(['itemName', 'activeIngredient', 'category', 'amount', 'imageUrl', 'info', 'POM', 'businessName', 'coordinates'] as (keyof StockItem)[]).map(field => (
              <TableCell key={field}>
                {field === 'POM' ? (
                  <Checkbox
                    checked={(editingRowData as any)[field]}
                    onChange={e => setEditingRowData({ ...(editingRowData as any), [field]: e.target.checked })}
                  />

                ) : field === 'imageUrl' ? (
                  <>
                    <TextField
                      label="Image URL"
                      value={(editingRowData as any).imageUrl || ''}
                      onChange={e => setEditingRowData({ ...(editingRowData as any), imageUrl: e.target.value })}
                      variant="standard"
                      fullWidth
                      multiline
                      rows={2}
                      InputProps={{ sx: { fontSize: '0.8rem' } }}
                    />
                    <Button 
                      variant="outlined" 
                      size="small"
                      component="label"
                      fullWidth
                      sx={{ mt: 1 }}
                    >
                      Or Upload from Device
                      <input 
                        type="file" 
                        accept="image/*" 
                        hidden 
                        onChange={handleEditRowImageSelect}
                      />
                    </Button>
                  </>

                ) : (
                  <TextField
                    type={field === 'amount' ? 'number' : 'text'}
                    value={(editingRowData as any)[field] === 'N/A' ? '' : (editingRowData as any)[field]}
                    onChange={e => setEditingRowData({ ...(editingRowData as any), [field]: field === 'amount' ? Number(e.target.value) : e.target.value })}
                    multiline={field === 'info'}
                    rows={field === 'info' ? 2 : 1}
                    variant="standard"
                    fullWidth
                  />
                )}
              </TableCell>
            ))}
            <TableCell>
              <Button variant="contained" size="small" color="success" sx={{ mr: 1 }} onClick={() => handleSave(row._id!)}>Save</Button>
              <Button size="small" onClick={() => setEditingRowIndex(null)}>Cancel</Button>
            </TableCell>
          </>
        ) : (
          <>
            <TableCell>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {isItemIncomplete(row) && (
            <Tooltip title="This item has incomplete details.">
                <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'red',
                    mr: 1,
                }} />
            </Tooltip>
        )}
        {serialNumber}
    </Box>
</TableCell>

            <TableCell>{row.itemName}</TableCell>
            <TableCell>{row.activeIngredient}</TableCell>
            <TableCell>{row.category}</TableCell>
            <TableCell>{typeof row.amount === 'number' ? `₦${row.amount.toFixed(2)}` : row.amount}</TableCell>
            <TableCell>
              <img
                src={row.imageUrl || '/placeholder.png'}
                alt={row.itemName || 'Product image'}
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
                onError={e => (e.currentTarget.src = '/placeholder.png')}
              />
            </TableCell>
            <TableCell>{row.info}</TableCell>
            <TableCell>{row.POM ? 'Yes' : 'No'}</TableCell>
            <TableCell>{row.businessName}</TableCell>
            <TableCell>{row.coordinates}</TableCell>
            <TableCell>
              <Button variant="contained" size="small" sx={{ mr: 1 }} onClick={() => { setEditingRowIndex(globalIndex); setEditingRowData(row); }}>Edit</Button>
              <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(row._id!)}>Delete</Button>
            </TableCell>
          </>
        )}
      </TableRow>
    );
  })}
</TableBody>


                </Table>
    
                <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center', mt: 2, width: '100%', flexDirection: isMobile ? 'column' : 'row' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: isMobile ? 2 : 0 }}>Page {currentPage} of {Math.ceil(filteredStock.length / itemsPerPage)}</Typography>
                  <Box>
                    <Button variant="outlined" size="small" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} sx={{ mr:1 }}>Prev</Button>
                    <Button variant="outlined" size="small" disabled={currentPage===Math.ceil(filteredStock.length/itemsPerPage)} onClick={()=>setCurrentPage(p=>p+1)}>Next</Button>
                  </Box>
                </Box>
    
              </Paper>}
        </Box>
      )}

      {selectedTab === 3 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Orders</Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={orderStatusFilter}
                label="Status"
                onChange={(e) => setOrderStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loadingOrders ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : ordersError ? (
            <Typography color="error" sx={{ textAlign: 'center', p: 4 }}>
              Failed to load orders: {ordersError}
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
              {filteredOrders.map((order) => (
                <Paper key={order._id} sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {order.createdAt}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 0.5 }}>
                          {order.customerName}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          color: 'white',
                          p: '4px 10px',
                          borderRadius: '16px',
                          textAlign: 'center',
                          textTransform: 'capitalize',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          bgcolor:
                            order.status === 'completed' ? 'success.dark' :
                            order.status === 'processing' ? 'info.dark' :
                            order.status === 'cancelled' ? 'error.dark' :
                            'warning.dark',
                        }}
                      >
                        {order.status}
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Collapse in={expandedOrderId === order._id} timeout="auto" unmountOnExit>
                    <Typography variant="body2" color="text.secondary">
                      Items:
                    </Typography>
                    <Box sx={{ my: 1 }}>
                      {order.items.map(item => (
                      <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        
                        <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        style={{ width: 40, height: 40, borderRadius: '4px', objectFit: 'cover' }}
                        onError={e => (e.currentTarget.src = '/placeholder.png')}
                        />

<Box sx={{ flexGrow: 1 }}>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {item.name}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
      {item.qty} x ₦{item.amount.toFixed(2)}
    </Typography>
  </Box>

                      </Box>
                      

                      ))}
                      
                    </Box>
                    </Collapse>
                    
                  </Box>
                  
                  <Box>
                    <Divider />
                    
                    

                    {/* Card Footer: Expander, ID and Total Price */}
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}>
                      <IconButton
                        onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                        aria-expanded={expandedOrderId === order._id}
                        aria-label="show more"
                        size="small"
                        sx={{
                          transform: expandedOrderId === order._id ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: (theme) => theme.transitions.create('transform', {
                            duration: theme.transitions.duration.shortest,
                          }),
                        }}
                      >
                        <ExpandMore />
                      </IconButton>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', ml: 1 }}>
                        <Tooltip title={order._id}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                            ID: {order._id.substring(0, 8)}...
                          </Typography>
                        </Tooltip>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {`₦${order.totalPrice.toFixed(2)}`}
                        </Typography>
                      </Box>
                      
                    </Box>
                    
                  </Box>
                  
                  <OrderActionButtons order={order} />

                </Paper>
              ))}
            </Box>
            
          )}
        </Box>
        
      )}

        <WhatsAppButton />


    </Box>
  );
}
