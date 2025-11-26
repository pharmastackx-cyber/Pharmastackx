'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, IconButton, TextField, Button,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, useTheme, 
  useMediaQuery, CircularProgress, Tooltip, Select, MenuItem, 
  FormControl, InputLabel, Divider, Collapse, Checkbox, FormControlLabel,
  Container, Alert, AlertTitle, Link, Chip, Grid, Stack, Modal,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  InputAdornment,
  Fade,
  Backdrop,Switch
} from '@mui/material';

import { Storefront, LocationOn, UploadFile, ExpandMore, Inventory, CheckCircle, Warning,  } from '@mui/icons-material';
import Papa from 'papaparse';
import WhatsAppButton from '../../components/WhatsAppButton';
import { ContentCopy, Download, QrCode2 } from '@mui/icons-material';
import { toPng } from 'html-to-image';
import { toDataURL as toQRDataURL } from 'qrcode';
import * as XLSX from 'xlsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';




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
  slug: string;
  isPublished: boolean;
  hasSuggestion?: boolean;
}

interface IBulkUpload {
  _id: string;
  csvName: string;
  itemCount: number;
  uploadedAt: string;
}

interface UploadHistoryItem {
  _id: string;
  name: string; 
  itemCount: number;
  uploadedAt: string;
  type: 'Single' | 'Bulk';
  status: 'Successful' | 'Partial' | 'Failed';
  businessName?: string;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isStockManager, setIsStockManager] = useState(false);

    // For Admin: holds the activity logs
    const [activityLogs, setActivityLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);
    const [logsError, setLogsError] = useState<string | null>(null);
    // For the Activity Log Insights feature
    const [logInsights, setLogInsights] = useState<string[] | null>(null);

  const [location, setLocation] = useState<string | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [userBusinessName, setUserBusinessName] = useState<string | null>(null);
  const [businessCoordinates, setBusinessCoordinates] = useState<{ latitude?: number; longitude?: number } | null>(null);

  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const flyerRef = useRef<HTMLDivElement>(null);


  const [loadingUser, setLoadingUser] = useState(false);
  const [isLocationSet, setIsLocationSet] = useState(false); //  <-- ADD THIS LINE
  const [showUploadForm, setShowUploadForm] = useState(false);
    // For Admin: holds the business they have selected from the dropdown
    const [selectedBusinessForUpload, setSelectedBusinessForUpload] = useState<string | null>(null);


  const [showBulkPreview, setShowBulkPreview] = useState(false);
  const [bulkData, setBulkData] = useState<StockItem[]>([]);
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionData, setSuggestionData] = useState<StockItem | null>(null);
  const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);
  
  const allBusinesses = useMemo(() => {
    if (!isAdmin || !stockData) return [];
    
    // Use a Map to easily store unique businesses with their data
    const businessesMap = new Map<string, { slug: string; coordinates: string }>();
    stockData.forEach(item => {
      // If the businessName exists and is not already in our map, add it
      if (item.businessName && !businessesMap.has(item.businessName)) {
        businessesMap.set(item.businessName, { slug: item.slug, coordinates: item.coordinates });
      }
    });

    // Convert the Map into an array of objects
    const businessList = Array.from(businessesMap.entries()).map(([name, data]) => ({
      businessName: name,
      slug: data.slug,
      coordinates: data.coordinates,
    }));
    
    // Return the list sorted alphabetically by business name
    return businessList.sort((a, b) => a.businessName.localeCompare(b.businessName));

  }, [isAdmin, stockData]);




  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    message: string;
    warnings: { message: string; item: any }[];
    errors: { message: string; item: any }[];
  } | null>(null);
  const [uploadSuccessInfo, setUploadSuccessInfo] = useState<{ count: number } | null>(null);

  

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
  const successAlertRef = useRef<HTMLDivElement>(null);


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
    slug: '',
    isPublished: false,
  });
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  /**
   * A utility function to send logs to the backend.
   * This is a "fire-and-forget" function and will not block the UI.
   * @param action - A short code for the action, e.g., 'CREATE_ITEM'
   * @param status - 'SUCCESS', 'FAILURE', 'INFO', or 'PARTIAL'
   * @param details - A human-readable sentence with more context
   * @param target - The optional entity that was affected
   */
  const logAction = useCallback(async (
    action: string,
    status: 'SUCCESS' | 'FAILURE' | 'INFO' | 'PARTIAL',
    details: string,
    target?: { type: string; id?: string; name?: string }
  ) => {
    try {
      // We don't need to wait for the response, just send it.
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, status, details, target }),
      });
    } catch (error) {
      // This should not happen, but if it does, log it to the console for debugging.
      // We don't want to interrupt the user's workflow for a logging failure.
      console.error('Failed to send log to server:', error);
    }
  }, []); // This function has no dependencies and will not cause re-renders.

      // --- START: FINAL CORRECTED LOG INSIGHTS HANDLERS ---
  const handleGenerateUserActivity = () => {
    if (!activityLogs.length) {
      setLogInsights(['No logs available to analyze.']);
      return;
    }
    const userActivity = activityLogs.reduce((acc, log) => {
      const userName = log.actor?.name || 'Unknown User';
      acc[userName] = (acc[userName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // THE FIX: Explicitly cast the result of Object.entries to the correct type.
    const insights = (Object.entries(userActivity) as [string, number][])
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([name, count]) => `${name}: ${count} actions`);
    
    setLogInsights(['--- User Activity ---', ...insights]);
  };

  const handleGenerateActionCounts = () => {
    if (!activityLogs.length) {
      setLogInsights(['No logs available to analyze.']);
      return;
    }
    const actionCounts = activityLogs.reduce((acc, log) => {
      const actionName = log.action || 'UNKNOWN_ACTION';
      acc[actionName] = (acc[actionName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // THE FIX: Explicitly cast the result of Object.entries here as well.
    const insights = (Object.entries(actionCounts) as [string, number][])
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([name, count]) => `${name}: ${count} times`);
      
    setLogInsights(['--- Action Counts ---', ...insights]);
  };

  const handleGenerateStatusSummary = () => {
    if (!activityLogs.length) {
      setLogInsights(['No logs available to analyze.']);
      return;
    }
    const statusCounts = activityLogs.reduce((acc, log) => {
      const status = log.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = activityLogs.length;
    // THE FIX: And finally, cast the result here too.
    const insights = (Object.entries(statusCounts) as [string, number][])
      .map(([name, count]) => {
          const percentage = ((count / total) * 100).toFixed(1);
          return `${name}: ${count} (${percentage}%)`;
      });
      
    setLogInsights(['--- Status Summary ---', `Total Actions: ${total}`, ...insights]);
  };
  // --- END: FINAL CORRECTED LOG INSIGHTS HANDLERS ---

  

  

  const fetchStockData = useCallback(async (businessName: string | null, isAdmin: boolean = false) => {
    if (!isAdmin && !businessName) {
      setLoadingStock(false);
      setStockData([]); // Clear stock data if no business name
      return;
    }
    setLoadingStock(true);
    try {
      const apiUrl = isAdmin ? '/api/stock' : `/api/stock?businessName=${encodeURIComponent(businessName!)}`;
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
        isPublished: product.isPublished || false,
        hasSuggestion: product.hasSuggestion || false,
      }));
      setStockData(transformedData);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      alert('Could not load your stock data.');
    }
    setLoadingStock(false);
  }, []);


  const [showIncomplete, setShowIncomplete] = useState(false);
  const [showUnpublishedOnly, setShowUnpublishedOnly] = useState(false);


  const isItemIncomplete = (item: StockItem) => {
    // These fields are allowed to be empty or have default values
    const fieldsToExclude: (keyof StockItem)[] = ['_id', 'POM', 'businessName', 'coordinates'];
    
    for (const key in item) {
        if (fieldsToExclude.includes(key as keyof StockItem)) continue;
        
        const value = item[key as keyof StockItem];
        if (value === null || value === undefined || value === '' || value === 'N/A' || (typeof value === 'number' && value === 0)) {
            return true; // Found an incomplete field
        }
    }  };

    // A mapping of field names to the user-friendly, specific error messages.
    const errorMessages: { [key: string]: string } = {
      itemName: 'Please provide an item name.',
      activeIngredient: 'Please include the active ingredient.',
      category: 'Please include a category.',
      amount: 'Price must be a number greater than zero.',
      imageUrl: 'Please upload an image.',
      info: 'Please add info (e.g., "1 sachet", "100ml bottle").',
    };
  
    /**
     * Validates a stock item and returns an array of specific error messages.
     * @param item The StockItem object to validate.
     * @returns An array of strings, where each string is a detailed error message. An empty array means the item is complete.
     */
    const getIncompleteFieldsList = (item: StockItem): string[] => {
      const errors: string[] = [];
      
      // Check for missing, empty, or placeholder string values.
      if (!item.itemName || item.itemName.trim() === '' || item.itemName === 'N/A') {
        errors.push(errorMessages.itemName);
      }
      if (!item.activeIngredient || item.activeIngredient.trim() === '' || item.activeIngredient === 'N/A') {
        errors.push(errorMessages.activeIngredient);
      }
      if (!item.category || item.category.trim() === '' || item.category === 'N/A') {
        errors.push(errorMessages.category);
      }
      if (!item.imageUrl || item.imageUrl.trim() === '') {
        errors.push(errorMessages.imageUrl);
      }
      if (!item.info || item.info.trim() === '' || item.info === 'N/A') {
        errors.push(errorMessages.info);
      }
  
      // Specifically check the amount.
      const amountAsNumber = typeof item.amount === 'string' ? parseFloat(item.amount) : item.amount;
      if (typeof amountAsNumber !== 'number' || isNaN(amountAsNumber) || amountAsNumber <= 0) {
        errors.push(errorMessages.amount);
      }
  
      return errors;
    };
  
    const [autoFillingId, setAutoFillingId] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
    const [isEditingTile, setIsEditingTile] = useState(false);
    const [tileEditData, setTileEditData] = useState<StockItem | null>(null);
    const [tileImageFile, setTileImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);





  const fetchOrders = useCallback(async (businessName: string | null, isAdmin: boolean = false) => {
    if (!isAdmin && !businessName) {
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
        });

        if (!isAdmin && businessName) {
            params.set('businessName', businessName);
        }

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
        
        const role = userData.user?.role || 'vendor';
        const isAdminUser = role === 'admin';
        const isStockManagerUser = role === 'stockManager';

        setIsAdmin(isAdminUser);
        setUserRole(role);
        setIsStockManager(isStockManagerUser);

        // Treat both 'admin' and 'stockManager' as having admin-level data access
        const hasAdminDataPermissions = isAdminUser || isStockManagerUser;

        // If the user is a Stock Manager, force their view to the Stock tab.
        if (isStockManagerUser) {
          setSelectedTab(2); // The index for the "Stock" tab
        }

        let currentBusinessName: string | null = null;
        if (userData.user?.businessName) {
            currentBusinessName = userData.user.businessName;
            setUserBusinessName(currentBusinessName);
            setFormValues(prev => ({ ...prev, businessName: currentBusinessName! }));
        }
        if (userData.user?.slug) setUserSlug(userData.user.slug);

        if (userData.user?.businessCoordinates) {
          const { latitude, longitude } = userData.user.businessCoordinates;
          if (latitude && longitude) {
            const currentCoordinates = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
            setBusinessCoordinates({ latitude, longitude });
            setLocation(currentCoordinates);
            setFormValues(prev => ({ ...prev, coordinates: currentCoordinates! }));
            setIsLocationSet(true);
          } else {
            setIsLocationSet(false);
          }
        } else {
          setIsLocationSet(false);
        }

        // Fetch data using admin permissions if the user is an admin OR a stock manager
        await Promise.all([
          fetchStockData(currentBusinessName, hasAdminDataPermissions),
          fetchOrders(currentBusinessName, hasAdminDataPermissions)
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

  useEffect(() => {
    // Fetches upload history from the database
    const fetchHistory = async () => {
      // For non-admins, don't fetch if business name isn't available yet.
      // For admins, we can fetch immediately.
      if (!isAdmin && !userBusinessName) {
        setUploadHistory([]);
        return;
      }

      setLoadingHistory(true);
      try {
        // Admin gets all uploads, vendors get only their own.
        const apiUrl = isAdmin 
            ? '/api/bulk-upload' 
            : `/api/bulk-upload?businessName=${encodeURIComponent(userBusinessName!)}`;
            
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        
        // The API response for an admin must include the businessName on each record.
        const formattedHistory: UploadHistoryItem[] = data.uploads.map((upload: any) => ({
          _id: upload._id,
          name: upload.csvName,
          itemCount: upload.itemCount,
          uploadedAt: upload.uploadedAt,
          type: 'Bulk' as 'Bulk',
          status: 'Successful', // All historical records from DB are successful uploads
          businessName: upload.businessName || 'N/A', // Get businessName from API response
        }));
        
        setUploadHistory(formattedHistory);
      } catch (error) {
        console.error('Error fetching upload history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    // We only fetch the history when the Upload tab is visible.
    if (selectedTab === 1) {
      fetchHistory();
    }
    // Re-run if the tab, user, or admin status changes.
  }, [selectedTab, userBusinessName, isAdmin]);


      // Generate QR code when slug is available
  useEffect(() => {
    if (userSlug) {
      const storeUrl = `https://${userSlug}.psx.ng`;
      toQRDataURL(storeUrl, { width: 150, margin: 2 })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error('Failed to generate QR code:', err));
    }
  }, [userSlug]);

    
    useEffect(() => {
      if (uploadSuccessInfo && successAlertRef.current) {
        successAlertRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, [uploadSuccessInfo]);
  
      // This effect fetches logs when an admin selects the Activity Log tab.
  useEffect(() => {
    const fetchLogs = async () => {
      if (!isAdmin) return; // Should not run for non-admins
      setLoadingLogs(true);
      setLogsError(null);
      try {
        const response = await fetch('/api/logs');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch activity logs.');
        }
        const data = await response.json();
        setActivityLogs(data);
      } catch (error) {
        setLogsError((error as Error).message);
      } finally {
        setLoadingLogs(false);
      }
    };

    // The new tab is at index 4
    if (selectedTab === 4) {
      fetchLogs();
    }
  }, [selectedTab, isAdmin]);

  useEffect(() => {
    // Log the initial page view once user information is available.
    if (userBusinessName || (isAdmin && userBusinessName !== null)) {
        logAction('PAGE_VIEW', 'INFO', 'User viewed the Store Management page.');
    }
  }, [logAction, userBusinessName, isAdmin]);



  const filteredOrders = orders.filter(order =>
    orderStatusFilter === 'all' || order.status === orderStatusFilter
  );

  const filteredStock = stockData.filter(item => {
    const searchMatch = Object.values(item).join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    const incompleteMatch = !showIncomplete || isItemIncomplete(item);
    const unpublishedMatch = !showUnpublishedOnly || item.isPublished === false;
    return searchMatch && incompleteMatch && unpublishedMatch;
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

  const totalProducts = stockData.length;
  const publishedItems = stockData.filter(item => item.isPublished).length;
  const needsAttention = stockData.filter(item => isItemIncomplete(item)).length;
  


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
      if (!window.confirm('Are you sure you want to overwrite your existing store location? This action is required for accurate tracking but please ensure you are at your store location.')) {
        logAction('UPDATE_LOCATION', 'INFO', 'User cancelled overwriting their location.');
        return;
      }
    }
    if (!navigator.geolocation) {
      logAction('UPDATE_LOCATION', 'FAILURE', 'User attempted to get location, but Geolocation is not supported by their browser.');
      alert('Geolocation is not supported by your browser.');
      return;
    }
    alert('Getting your location... Please accept the browser prompt.');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        const coordsString = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;
        try {
          const res = await fetch('/api/user/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coordinates: { latitude, longitude } }),
          });
          if (!res.ok) throw new Error('Failed to update location on the server.');
          setBusinessCoordinates({ latitude, longitude });
          setLocation(coordsString);
          setFormValues(prev => ({ ...prev, coordinates: coordsString }));
          setIsLocationSet(true);
          alert('Location updated successfully!');
          logAction('UPDATE_LOCATION', 'SUCCESS', `User updated their location to: ${coordsString}`);
        } catch (e) {
          console.error('Error saving location:', e);
          alert('An error occurred while saving your location.');
          logAction('UPDATE_LOCATION', 'FAILURE', `Failed to save new location. Error: ${(e as Error).message}`);
        }
      },
      err => {
        console.error('Geolocation error:', err);
        alert(`Error getting location: ${err.message}. Please ensure you have enabled location services.`);
        logAction('UPDATE_LOCATION', 'FAILURE', `User denied geolocation permission or an error occurred: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
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
    let targetBusinessName = userBusinessName;
    try {
      let targetSlug = userSlug;
      let targetCoordinates = location;

      if (isAdmin && selectedBusinessForUpload) {
        const selectedBiz = allBusinesses.find(b => b.businessName === selectedBusinessForUpload);
        if (selectedBiz) {
          targetBusinessName = selectedBiz.businessName;
          targetSlug = selectedBiz.slug;
          targetCoordinates = selectedBiz.coordinates;
        } else {
            targetBusinessName = selectedBusinessForUpload;
            targetSlug = '';
            targetCoordinates = '';
        }
      }

      const newProduct = {
          ...formValues,
          businessName: targetBusinessName,
          coordinates: targetCoordinates,
          amount: Number(formValues.amount) || 0,
          slug: targetSlug,
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
      setUploadSuccessInfo({ count: 1 });
      setUploadResult(null);
      setShowUploadForm(false);
      
      const logDetails = isAdmin && selectedBusinessForUpload 
        ? `Admin created item '${savedProduct.itemName}' for business '${targetBusinessName}'.`
        : `User created item '${savedProduct.itemName}'.`;
      logAction('CREATE_ITEM', 'SUCCESS', logDetails, { type: 'Product', id: savedProduct._id, name: savedProduct.itemName });

      setFormValues({ itemName: '', activeIngredient: '', category: '', amount: '', imageUrl: '', businessName: userBusinessName || '', coordinates: location || '', info: '', POM: false, slug: '' , isPublished: false });
      
  } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${(error as Error).message}`);
      const logDetails = isAdmin && selectedBusinessForUpload
        ? `Admin failed to create item '${formValues.itemName}' for business '${targetBusinessName}'. Error: ${(error as Error).message}`
        : `User failed to create item '${formValues.itemName}'. Error: ${(error as Error).message}`;
      logAction('CREATE_ITEM', 'FAILURE', logDetails, { type: 'Product', name: formValues.itemName });
  } finally {
      setIsSubmitting(false);
  }
  };


  const normalizeCSVHeaders = (headers: string[]) => {
    const headerMap: Record<string, keyof StockItem> = {
      'item name': 'itemName', 'item': 'itemName', 'product': 'itemName', 'drug': 'itemName', 'medicine name': 'itemName', 'name': 'itemName',
      'active ingredient': 'activeIngredient', 'ingredient': 'activeIngredient', 'compound': 'activeIngredient', 'api': 'activeIngredient', 'substance': 'activeIngredient',
      'category': 'category', 'class': 'category', 'type': 'category', 'drug class': 'category',
      'amount': 'amount', 'price': 'amount', 'cost': 'amount', 'value': 'amount', '₦': 'amount', 'naira': 'amount', 'selling price': 'amount',
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

    const processData = (data: any[]) => {
        if (!data.length) {
            alert("The uploaded file is empty or could not be read.");
            return;
        }
        const headers = Object.keys(data[0]);
        const headerMapping = normalizeCSVHeaders(headers);

        const parsedData = data.map((row: any) => {
          const normalizedRow: Partial<StockItem> = {};
          for (const header of headers) {
              const mappedKey = headerMapping[header];
              if (mappedKey) {
                  (normalizedRow as any)[mappedKey] = normalizeValue(mappedKey, row[header]);
              }
          }
          return {
              itemName: '',
              activeIngredient: '',
              category: '',
              amount: 0,
              imageUrl: '',
              ...normalizedRow,
              info: normalizedRow.info || '',
              POM: normalizedRow.POM || false,
              businessName: userBusinessName || 'N/A',
              coordinates: location || 'N/A',
              slug: userSlug || '',
          } as StockItem;
        })
        .filter(item => 
          item.itemName && 
          !item.itemName.toLowerCase().includes('src/app/')
        );

        setBulkData(parsedData);
        setShowBulkPreview(true);
    };

    const reader = new FileReader();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv' || fileExtension === 'txt') {
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (result) => processData(result.data),
                    error: (error: any) => {

                        console.error("CSV parsing error:", error);
                        alert("Failed to parse CSV file. Please check the format.");
                    }
                });
            }
        };
        reader.readAsText(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                processData(json);
              } catch (error: any) {

                console.error("Excel parsing error:", error);
                alert("Failed to parse Excel file. Please make sure it's a valid .xlsx or .xls file.");
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert(`Unsupported file type: .${fileExtension}. Please upload a CSV or Excel file.`);
    }
  };



  const handleConfirmBulkUpload = async () => {
    const targetBusiness = (isAdmin && selectedBusinessForUpload) ? selectedBusinessForUpload : userBusinessName;

    if (!bulkData.length || !targetBusiness) {
      alert('No data to upload or the target business is not specified.');
      return;
    }
    setIsSubmitting(true);
    setUploadResult(null);
    setUploadSuccessInfo(null);
    try {
      const payload = {
        products: bulkData.map(item => ({...item, businessName: targetBusiness })),
        fileName: fileInputRef.current?.files?.[0]?.name || 'bulk_upload.csv',
        businessName: targetBusiness,
      };
      const response = await fetch('/api/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resultData = await response.json();
      if (!response.ok) throw new Error(resultData.message || 'Bulk upload failed');
      const { savedProducts, warnings, errors } = resultData;
      if (savedProducts && savedProducts.length > 0) {
        setStockData(prev => [...savedProducts, ...prev]);
        setUploadSuccessInfo({ count: savedProducts.length });
      }
      setUploadResult({ message: `${savedProducts.length} out of ${bulkData.length} items were uploaded.`, warnings: warnings || [], errors: errors || [] });
      
      const status = errors.length > 0 ? (savedProducts.length > 0 ? 'PARTIAL' : 'FAILURE') : 'SUCCESS';
      const logDetails = isAdmin && selectedBusinessForUpload
        ? `Admin performed bulk upload for '${targetBusiness}'. Result: ${savedProducts.length} saved, ${warnings.length} warnings, ${errors.length} errors.`
        : `User performed bulk upload. Result: ${savedProducts.length} saved, ${warnings.length} warnings, ${errors.length} errors.`;
      logAction('BULK_UPLOAD', status, logDetails, { type: 'Business', name: targetBusiness });

      setShowBulkPreview(false);
      setBulkData([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error('Error during bulk upload:', error);
      setUploadResult({ message: "An unexpected error occurred during upload.", warnings: [], errors: [{ message: (error as Error).message, item: 'N/A'}] });
      const logDetails = isAdmin && selectedBusinessForUpload
        ? `Admin bulk upload for '${targetBusiness}' failed entirely. Error: ${(error as Error).message}`
        : `User bulk upload failed entirely. Error: ${(error as Error).message}`;
      logAction('BULK_UPLOAD', 'FAILURE', logDetails, { type: 'Business', name: targetBusiness });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handlePublish = async (id: string) => {
    try {
      const response = await fetch('/api/stock/publish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to publish item.');
      const { product: updatedProduct } = result;
      setStockData(prevData => prevData.map(item => item._id === id ? { ...item, ...updatedProduct } : item));
      alert(`Item "${result.product.itemName}" has been published successfully!`);
      logAction('PUBLISH_ITEM', 'SUCCESS', `User published item '${result.product.itemName}'.`, { type: 'Product', id, name: result.product.itemName });
    } catch (error) {
      const item = stockData.find(i => i._id === id);
      console.error('Error publishing item:', error);
      alert((error as Error).message);
      logAction('PUBLISH_ITEM', 'FAILURE', `User failed to publish item '${item?.itemName || 'Unknown'}'. Error: ${(error as Error).message}`, { type: 'Product', id, name: item?.itemName });
    }
  };

  const handleUnpublish = async (id: string) => {
    const itemToUpdate = stockData.find(item => item._id === id);
    if (!window.confirm('Are you sure you want to withdraw this item? It will be removed from the public storefront.')) {
      logAction('UNPUBLISH_ITEM', 'INFO', `User cancelled unpublishing item '${itemToUpdate?.itemName || 'Unknown'}'.`, { type: 'Product', id, name: itemToUpdate?.itemName });
      return;
    }
    try {
      const response = await fetch('/api/stock/unpublish', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unpublish item.');
      }
      setStockData(prevData => prevData.map(item => item._id === id ? { ...item, isPublished: false } : item));
      alert(`Item "${itemToUpdate?.itemName || 'Item'}" has been unpublished successfully.`);
      logAction('UNPUBLISH_ITEM', 'SUCCESS', `User unpublished item '${itemToUpdate?.itemName || 'Item'}'.`, { type: 'Product', id, name: itemToUpdate?.itemName });
    } catch (error) {
      console.error('Error unpublishing item:', error);
      alert((error as Error).message);
      logAction('UNPUBLISH_ITEM', 'FAILURE', `User failed to unpublish item '${itemToUpdate?.itemName || 'Item'}'. Error: ${(error as Error).message}`, { type: 'Product', id, name: itemToUpdate?.itemName });
    }
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

  const handleAutoFill = async (item: StockItem) => {
    if (!item._id || !item.itemName) {
      alert('Cannot fetch suggestions for an item without a name.');
      return;
    }

    setAutoFillingId(item._id); // Start loading indicator for this row
    try {
      const response = await fetch(`/api/stock/suggestions?itemName=${encodeURIComponent(item.itemName)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No suggestions found.');
      }

      const { suggestion } = await response.json();

      const itemIndex = stockData.findIndex(d => d._id === item._id);
      if (itemIndex === -1) return;

      // Prepare suggested data, only filling in fields that are missing or 'N/A'
      const suggestedData: Partial<StockItem> = {
        activeIngredient: (!item.activeIngredient || item.activeIngredient === 'N/A') ? suggestion.activeIngredient : item.activeIngredient,
        category: (!item.category || item.category === 'N/A') ? suggestion.category : item.category,
        imageUrl: !item.imageUrl ? suggestion.imageUrl : item.imageUrl,
        info: (!item.info || item.info === 'N/A') ? suggestion.info : item.info,
        POM: item.POM ? item.POM : suggestion.POM,
      };

      // Put the row into edit mode with the new data
      setEditingRowIndex(itemIndex);
      setEditingRowData({ ...item, ...suggestedData });
      
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      alert(`Could not find any suggestions for "${item.itemName}". Please fill in the details manually.`);
    } finally {
      setAutoFillingId(null); // Stop loading indicator
    }
  };


  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'processing' | 'completed' | 'cancelled' | 'failed') => {
    const confirmationMessage = `Are you sure you want to change the order status to ${newStatus}?`;
    const order = orders.find(o => o._id === orderId);
    if (!window.confirm(confirmationMessage)) {
      logAction('UPDATE_ORDER_STATUS', 'INFO', `User cancelled updating order status to '${newStatus}'.`, { type: 'Order', id: orderId, name: `Order for ${order?.customerName}` });
      return;
    }
    try {
      const res = await fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, status: newStatus }) });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to update status to ${newStatus}`);
      }
      const updatedOrder = await res.json();
      setOrders(prevOrders => prevOrders.map(o => (o._id === orderId ? { ...o, status: updatedOrder.status.toLowerCase() } : o)));
      alert(`Order status updated to ${updatedOrder.status}`);
      logAction('UPDATE_ORDER_STATUS', 'SUCCESS', `User updated order status to '${newStatus}'.`, { type: 'Order', id: orderId, name: `Order for ${order?.customerName}` });
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(`Error: ${(error as Error).message}`);
      logAction('UPDATE_ORDER_STATUS', 'FAILURE', `User failed to update order status to '${newStatus}'. Error: ${(error as Error).message}`, { type: 'Order', id: orderId, name: `Order for ${order?.customerName}` });
    }
  };


  const handleCopyUrl = () => {
    if (!userSlug) return;
    const storeUrl = `${userSlug}.psx.ng`;
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    logAction('COPY_URL', 'INFO', `User copied their store URL: ${storeUrl}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFlyer = async () => {
    const flyerElement = flyerRef.current;
    if (!flyerElement) {
      alert('Could not find the flyer component. Please try again.');
      return;
    }
    if (!qrCodeDataUrl || !userBusinessName) {
        alert('Flyer data is still loading. Please wait a moment and try again.');
        return;
    }
    logAction('DOWNLOAD_FLYER', 'INFO', 'User initiated flyer download.');
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(flyerElement, { cacheBust: true, backgroundColor: 'white', pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `${userSlug}-store-flyer.png`;
        link.href = dataUrl;
        link.click();
        logAction('DOWNLOAD_FLYER', 'SUCCESS', 'User successfully downloaded their store flyer.');
      } catch (err) {
        console.error('Failed to create flyer image:', err);
        alert('Sorry, there was an error creating your flyer.');
        logAction('DOWNLOAD_FLYER', 'FAILURE', `Flyer download failed. Error: ${(err as Error).message}`);
      }
    }, 100);
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

  const handleTileFormChange = (field: keyof StockItem, value: any) => {
    if (tileEditData) {
      setTileEditData({ ...tileEditData, [field]: value });
    }
  };

  const handleTileImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setTileImageFile(event.target.files[0]);
      // Show a preview instantly
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          handleTileFormChange('imageUrl', e.target.result as string);
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleTileSave = async () => {
    if (!tileEditData?._id) return;
    setIsUploading(true);
    
    // The 'tileEditData' object already has the new image as a Base64 URL from the preview.
    // We can save it directly without calling the broken '/api/products/upload' endpoint.
    let dataToSave = { ...tileEditData };

    try {
      // The entire 'if (tileImageFile)' block that caused the error has been removed.
      const saveResponse = await fetch(`/api/stock/${dataToSave._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });
      
      const saveResult = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(saveResult.message || 'Failed to save product.');
      }
      
      // Update the local state with the exact data we just saved
      const updatedStockData = stockData.map(item => item._id === dataToSave._id ? dataToSave : item);
      setStockData(updatedStockData);
      setSelectedProduct(dataToSave);
      
      alert('Product updated successfully!');
      logAction('UPDATE_ITEM', 'SUCCESS', `User updated item '${dataToSave.itemName}'.`, { type: 'Product', id: dataToSave._id, name: dataToSave.itemName });

    } catch (error) {
      console.error("Save error:", error);
      alert((error as Error).message);
      logAction('UPDATE_ITEM', 'FAILURE', `User failed to update item '${dataToSave.itemName}'. Error: ${(error as Error).message}`, { type: 'Product', id: dataToSave._id, name: dataToSave.itemName });
    } finally {
      setIsUploading(false);
      setIsEditingTile(false);
      setTileImageFile(null); // Clear the selected file state
    }
  };



  const handleNavigation = (direction: 'next' | 'prev') => {
    if (!selectedProduct) return;

    // Use the filteredStock array which respects the user's current search/filter
    const currentIndex = filteredStock.findIndex(item => item._id === selectedProduct._id);
    if (currentIndex === -1) return; // Exit if the item isn't found for some reason

    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    // Check if the new index is within the bounds of the array
    if (newIndex >= 0 && newIndex < filteredStock.length) {
      const newProduct = filteredStock[newIndex];
      setSelectedProduct(newProduct);
      setTileEditData(newProduct);
      setIsEditingTile(false); // Always reset to detail view when navigating
    }
  };


  const handleFetchSuggestion = async () => {
    if (!tileEditData?.itemName || !tileEditData._id) {
      console.log("Cannot fetch suggestion without an item name.");
      return;
    }

    setIsFetchingSuggestion(true);
    setSuggestionData(null); 

    try {
      const response = await fetch('/api/stock/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: tileEditData.itemName,
          currentItemId: tileEditData._id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestionData(data);
      } else {
        console.log("No close match found.");
      }
    } catch (error) {
      console.error("Failed to fetch suggestion:", error);
    } finally {
      setIsFetchingSuggestion(false);
    }
  };

  const handleToggleSuggestions = () => {
    const turningOn = !showSuggestions;
    setShowSuggestions(turningOn);

    if (turningOn && !suggestionData) {
      handleFetchSuggestion();
    } else if (!turningOn) {
      setSuggestionData(null); 
    }
  };

  const handleAcceptField = (field: keyof StockItem, value: any) => {
    if (value === undefined || value === null) return;
    setTileEditData(prev => ({ ...prev!, [field]: value }));
  };

  const handleAcceptAll = () => {
    if (!suggestionData) return;
    
    const updatedData = { ...tileEditData };
    (Object.keys(suggestionData) as (keyof StockItem)[]).forEach(key => {
        const value = suggestionData[key];
        if (value !== null && value !== undefined && key !== '_id' && key !== 'businessName' && key !== 'coordinates') {
            (updatedData as any)[key] = value;
        }
    });

    setTileEditData(updatedData as StockItem);
  };


    // --- START: WhatsApp Activation Link ---
  // Construct the one-click WhatsApp activation link
  const whatsAppNumber = "14155238886";
  const whatsAppMessage = "join adult-result";
  const whatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(whatsAppMessage)}`;
  // --- END: WhatsApp Activation Link ---

  



  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>Store Management</Typography>
      
      <Tabs value={selectedTab} onChange={handleTabChange} variant={isMobile ? 'scrollable' : 'standard'} scrollButtons="auto">
        {isStockManager ? (
          // Stock Manager can only see the Stock tab
          <Tab label="Stock" value={2} />
        ) : (
          // Other users see the normal tabs
          [
            <Tab key="storefront" label="Storefront" />,
            <Tab key="upload" label="Upload" disabled={!isLocationSet} />,
            <Tab key="stock" label="Stock" disabled={!isLocationSet} />,
            <Tab key="orders" label="Orders" disabled={!isLocationSet} />,
            isAdmin && <Tab key="logs" label="Activity Log" />
          ]
        )}
      </Tabs>




      {selectedTab === 0 && (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
           <Box sx={{ maxWidth: 350, width: '100%', background: 'linear-gradient(90deg, #004d40 0%, #800080 100%)', color: 'white', p: 3, borderRadius: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' } }} onClick={handleStoreInfoClick}>
            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }}><Storefront sx={{ color: 'white' }} /></IconButton>
            <Typography variant="h6">Store Info</Typography>
            {loadingUser ? <CircularProgress size={20} color="inherit" /> : <Typography variant="body2">{userBusinessName ? `Name: ${userBusinessName}` : 'Click to fetch info'}</Typography>}
            {userSlug && <Typography variant="caption">Slug: {userSlug}</Typography>}
          </Box>

          {!isLocationSet && (
            <Alert severity="warning" variant="filled" sx={{ width: '100%', maxWidth: 350, borderRadius: 2 }}>
              <AlertTitle sx={{ fontWeight: 'bold' }}>Action Required: Set Your Location</AlertTitle>
              Your store location is not set. Click the <strong>&quot;Click to get your location&quot;</strong> card below to make your business visible to customers and enable other management features.
            </Alert>
          )}


<Box
            sx={{
              maxWidth: 350,
              width: '100%',
              background: isLocationSet
                ? 'linear-gradient(90deg, #9e9e9e 0%, #bdbdbd 100%)' // "Dull" background when set
                : 'linear-gradient(90deg, #006400 0%, #8b008b 100%)', // Vibrant background when not set
              color: 'white',
              p: 3, // Using padding for a better fit
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              transition: '0.3s',
              // Add hover effect and cursor only when the location is NOT set
              ...(!isLocationSet && {
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                },
              }),
            }}
            // The whole box is clickable only when location is NOT set
            onClick={!isLocationSet ? handleGetLocation : undefined}
          >
            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }}>
              <LocationOn sx={{ color: 'white' }} />
            </IconButton>

            {isLocationSet ? (
              // This is the view when location IS set
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Store Location:</Typography>
                <Typography variant="body2" sx={{ mt: 0.5, mb: 2 }}>{location}</Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleGetLocation} // Re-uses the existing function with confirmation
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.2)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' }
                  }}
                >
                  Update Location
                </Button>
              </>
            ) : (
              // This is the initial view when location is NOT set
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Click to get your location</Typography>
            )}
          </Box>


                      {/* New Store URL Card */}
          {userSlug && (
            <Box sx={{ maxWidth: 350, width: '100%', background: 'linear-gradient(90deg, #4CAF50 0%, #2E7D32 100%)', color: 'white', p: 3, borderRadius: 3, textAlign: 'center' }}>
              <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }}><Link href={`https://${userSlug}.psx.ng`} target="_blank" sx={{color: 'white'}}><QrCode2 /></Link></IconButton>
              <Typography variant="h6">Your Store URL</Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', my: 1, p:1, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.1)' }}>{userSlug}.psx.ng</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                <Button variant="contained" startIcon={<ContentCopy />} onClick={handleCopyUrl} sx={{bgcolor: 'rgba(255,255,255,0.8)', color: 'black', '&:hover': {bgcolor: 'white'}}}>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button variant="contained" startIcon={<Download />} onClick={handleDownloadFlyer} sx={{bgcolor: 'rgba(255,255,255,0.8)', color: 'black', '&:hover': {bgcolor: 'white'}}}>
                  Flyer
                </Button>
              </Box>
            </Box>
          )}


        </Box>
        
      )}

      {selectedTab === 1 && (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
          
          {isAdmin && (
            <Paper sx={{ p: 2, mb: 2, width: '100%', maxWidth: 350, bgcolor: 'secondary.main', color: 'white' }}>
              <FormControl fullWidth>
                <InputLabel id="business-select-label" sx={{color: 'white'}}>Upload For Business</InputLabel>
                <Select
                  labelId="business-select-label"
                  value={selectedBusinessForUpload || ''}
                  label="Upload For Business"
                  onChange={(e) => setSelectedBusinessForUpload(e.target.value as string)}
                  sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.7)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' }, '.MuiSvgIcon-root': { color: 'white' } }}
                >
                  <MenuItem value="">
                    <em>Upload for Myself (Admin)</em>
                  </MenuItem>
                  {allBusinesses.map((biz) => (
                    <MenuItem key={biz.businessName} value={biz.businessName}>
                      {biz.businessName}
                    </MenuItem>
                  ))}


                </Select>
              </FormControl>
              <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                Select a business to perform an upload on their behalf.
              </Typography>
            </Paper>
          )}

{uploadSuccessInfo && (
    <Alert
      ref={successAlertRef} // Attach the ref here
      severity="success"
      onClose={() => setUploadSuccessInfo(null)}
      sx={{
        mb: 3,
        width: '100%',
        maxWidth: 600,
        alignItems: 'flex-start',
        boxShadow: '0 4px 12px rgba(0, 128, 0, 0.4)', // Makes it pop
        border: '1px solid #4caf50', // Adds a subtle border
      }}
    >
      <AlertTitle sx={{ fontWeight: 'bold' }}>Success!</AlertTitle>
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>{uploadSuccessInfo.count} {uploadSuccessInfo.count === 1 ? 'product has' : 'products have'} been added to your stock catalogue.</strong>
      </Typography>
      <Typography variant="body2">
        Your items are now in review. Our team normally takes 24–48 hours to verify product details, fill in missing fields, and publish them to the Find Medicines page.
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        To speed things up, you can open the{' '}
        <Link component="button" variant="body2" onClick={() => { setSelectedTab(2); setUploadSuccessInfo(null); }} sx={{ fontWeight: 'bold', textAlign: 'left' }}>
          Stock Catalogue
        </Link>
        , review each item, make corrections, and publish any product immediately.
      </Typography>
    </Alert>
  )}



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
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || loadingUser}>
                {isSubmitting || loadingUser ? <CircularProgress size={24} /> : 'Submit'}
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
              <input 
  type="file" 
  accept=".csv,.xlsx,.xls,text/csv,application/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain" 
  hidden 
  onChange={handleBulkFileUpload} 
  ref={fileInputRef} 
/>
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
              <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleConfirmBulkUpload} disabled={isSubmitting || loadingUser}>
    {isSubmitting || loadingUser ? <CircularProgress size={24} /> : 'Confirm Upload'}
</Button>

            </Paper>

            )}
          </Box>

          {uploadResult && (
    <Alert 
        severity={uploadResult.errors.length > 0 ? "error" : uploadResult.warnings.length > 0 ? "warning" : "success"} 
        sx={{ mt: 2, width: '100%', maxWidth: 600, maxHeight: 400, overflowY: 'auto' }}
        onClose={() => setUploadResult(null)}
    >
        <AlertTitle>
            {uploadResult.errors.length > 0 
                ? "Upload Finished with Errors" 
                : uploadResult.warnings.length > 0 
                    ? "Upload Successful with Warnings"
                    : "Upload Successful"}
        </AlertTitle>

        {uploadResult.message}

        {uploadResult.errors.length > 0 && (
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>The following items could not be uploaded:</Typography>
                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {uploadResult.errors.slice(0, 10).map((err, i) => (
                        <li key={i}>
                            <Typography variant="caption">
                                <strong>{err.item.itemName || `Row ${err.item.row}`}:</strong> {err.message}
                            </Typography>
                        </li>
                    ))}
                </ul>
                {uploadResult.errors.length > 10 && <Typography variant="caption">...and {uploadResult.errors.length - 10} more errors.</Typography>}
            </Box>
        )}
        
        {uploadResult.warnings.length > 0 && uploadResult.errors.length === 0 && (
             <Typography variant="body2" sx={{ mt: 1 }}>
                Some items had missing information that was auto-filled. Please go to the <strong>Stock</strong> tab to review and edit them.
             </Typography>
        )}
    </Alert>
)}

        

<Divider sx={{ my: 4, width: '80%' }} />

<Typography variant="h6" sx={{ fontWeight: 600 }}>Upload History</Typography>
<Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
    Showing your recent single and bulk uploads. Note: Single item history is cleared on page reload.
</Typography>

{loadingHistory ? <CircularProgress /> : (
  <Paper sx={{ maxWidth: isAdmin ? 800 : 600, width: '100%', overflowX: 'auto', bgcolor: 'white', color: 'black', p: 2, mt: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold' }}>Name / File</TableCell>
          {isAdmin && <TableCell sx={{ fontWeight: 'bold' }}>Business Name</TableCell>}
          <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold' }}>Items</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {uploadHistory.length > 0 ? uploadHistory.map((upload) => (
          <TableRow hover key={upload._id}>
            <TableCell>{upload.name}</TableCell>
            {isAdmin && <TableCell>{upload.businessName}</TableCell>}
            <TableCell>
                <Chip 
                    label={upload.type} 
                    size="small"
                    variant="outlined"
                    color={upload.type === 'Bulk' ? 'primary' : 'secondary'}
                />
            </TableCell>
            <TableCell align="center">{upload.itemCount}</TableCell>
            <TableCell>
                <Chip 
                    label={upload.status} 
                    size="small"
                    color={
                        upload.status === 'Successful' ? 'success' :
                        upload.status === 'Partial' ? 'warning' :
                        'error'
                    }
                />
            </TableCell>
            <TableCell>{new Date(upload.uploadedAt).toLocaleString()}</TableCell>
          </TableRow>
        )) : (
          <TableRow>
              <TableCell colSpan={isAdmin ? 6 : 5} sx={{ textAlign: 'center', p: 3 }}>No recent uploads found.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </Paper>
)}


</Box>
      )}

      {selectedTab === 2 && (
         <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
           
           {/* --- START: ADD THIS CORRECTED CODE --- */}
<Box sx={{ width: '100%', maxWidth: 900, mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', flex: 1 }}>
    <Inventory color="primary" sx={{ fontSize: 40 }} />
    <Box>
      <Typography variant="h6">{totalProducts}</Typography>
      <Typography variant="body2" color="text.secondary">Total Products</Typography>
    </Box>
  </Paper>
  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', flex: 1 }}>
    <CheckCircle color="success" sx={{ fontSize: 40 }} />
    <Box>
      <Typography variant="h6">{publishedItems}</Typography>
      <Typography variant="body2" color="text.secondary">Published</Typography>
    </Box>
  </Paper>
  <Paper 
  sx={{ 
    p: 2, 
    display: 'flex', 
    alignItems: 'center', 
    gap: 2, 
    justifyContent: 'center', 
    flex: 1, 
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'action.hover'
    }
  }}
  onClick={() => setShowIncomplete(true)}
>
    <Warning color="warning" sx={{ fontSize: 40 }} />
    <Box>
      <Typography variant="h6">{needsAttention}</Typography>
      <Typography variant="body2" color="text.secondary">Needs Attention</Typography>
    </Box>
</Paper>

</Box>
{/* --- END: ADD THIS CORRECTED CODE --- */}

           
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Current Stock Catalogue</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 900, width: '100%', textAlign: 'center', fontStyle: 'italic' }}>
            These are all medications you have uploaded. A red dot indicates an item with incomplete details that you can edit.
            Use the search bar to find items, click column headers to sort, or toggle the checkbox to only see incomplete products that need your attention.
            </Typography>

             {loadingStock ? <CircularProgress /> :
              <Paper sx={{ maxWidth: 900, width: '100%', overflowX: 'auto', bgcolor: 'white', color: 'black', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', borderRadius: 2, p: 2 }}>
              <>
  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
    <TextField label="Search items" variant="outlined" size="small" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} sx={{ width: isMobile ? '100%' : 300 }} />
    <FormControlLabel control={<Checkbox checked={showIncomplete} onChange={(e) => setShowIncomplete(e.target.checked)} name="showIncomplete" />} label="Show only incomplete items" />
    <FormControlLabel control={<Checkbox checked={showUnpublishedOnly} onChange={(e) => setShowUnpublishedOnly(e.target.checked)} name="showUnpublishedOnly" />} label="Show only unpublished" />

  </Box>

  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600 }}>S/N</TableCell>
          {(['itemName', 'activeIngredient', 'category', 'amount', 'imageUrl', 'info', 'POM', 'businessName', 'coordinates'] as (keyof StockItem)[]).map(key => (
            <TableCell key={key} onClick={() => handleSort(key)} sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
              {(key.replace(/([a-z])([A-Z])/g, '$1 $2')).charAt(0).toUpperCase() + (key.replace(/([a-z])([A-Z])/g, '$1 $2')).slice(1)}
              {sortColumn === key && <span style={{ marginLeft: 4, fontSize: 12, color: 'gray' }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
            </TableCell>
          ))}
          <TableCell>Status</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
        </TableRow>
      </TableHead>
      
      <TableBody>
        {paginatedStock.map((row, i) => {
          const globalIndex = stockData.findIndex(item => item._id === row._id);
          const serialNumber = startIndex + i + 1;
          return (
            <TableRow key={row._id} onClick={() => { setSelectedProduct(row); setTileEditData(row); }} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isItemIncomplete(row) ? <Tooltip title="This item has incomplete details."><Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'red', mr: 1, }} /></Tooltip> : null}
                  {serialNumber}
                </Box>
              </TableCell>
              <TableCell>{row.itemName}</TableCell>
              <TableCell>{row.activeIngredient}</TableCell>
              <TableCell>{row.category}</TableCell>
              <TableCell>{typeof row.amount === 'number' ? `₦${row.amount.toFixed(2)}` : row.amount}</TableCell>
              <TableCell><img src={row.imageUrl || '/placeholder.png'} alt={row.itemName || 'Product image'} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} onError={e => (e.currentTarget.src = '/placeholder.png')} /></TableCell>
              <TableCell>{row.info}</TableCell>
              <TableCell>{row.POM ? 'Yes' : 'No'}</TableCell>
              <TableCell>{row.businessName}</TableCell>
              <TableCell>{row.coordinates}</TableCell>
              <TableCell>{row.isPublished ? (<Chip label="Published" color="success" size="small" />) : (<Chip label="Draft" color="warning" size="small" />)}</TableCell>
              
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(row._id!)}>Delete</Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
  
  <Box sx={{ display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center', mt: 2, width: '100%', flexDirection: isMobile ? 'column' : 'row' }}>
    <Typography variant="body2" color="text.secondary" sx={{ mb: isMobile ? 2 : 0 }}>Page {currentPage} of {Math.ceil(filteredStock.length / itemsPerPage)}</Typography>
    <Box>
      <Button variant="outlined" size="small" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} sx={{ mr:1 }}>Prev</Button>
      <Button variant="outlined" size="small" disabled={currentPage===Math.ceil(filteredStock.length/itemsPerPage)} onClick={()=>setCurrentPage(p=>p+1)}>Next</Button>
    </Box>
  </Box>
</>

            </Paper>
            }
        </Box>
      )}

      {selectedTab === 3 && (
        <Box sx={{ mt: 3 }}>
                    {/* --- START: WhatsApp Activation Banner --- */}
                    <Alert severity="info" sx={{ mb: 3 }} action={
            <Button 
              color="inherit" 
              size="small" 
              component={Link}
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              ACTIVATE
            </Button>
          }>
            <AlertTitle>Get New Order Alerts on WhatsApp</AlertTitle>
            Click the activate button to connect your WhatsApp and receive instant notifications for new orders.
          </Alert>
          {/* --- END: WhatsApp Activation Banner --- */}

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

           {/* --- START: ADD THIS NEW CODE FOR THE LOG TAB --- */}
{selectedTab === 4 && isAdmin && (
  <Box sx={{ mt: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Admin Activity Log</Typography>


              {/* --- START: LOG INSIGHTS UI --- */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Log Insights</Typography>
              <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Button variant="contained" onClick={handleGenerateUserActivity} size="small">User Activity</Button>
                  <Button variant="contained" onClick={handleGenerateActionCounts} size="small">Action Counts</Button>
                  <Button variant="contained" onClick={handleGenerateStatusSummary} size="small">Status Summary</Button>
                  <Button variant="outlined" color="secondary" onClick={() => setLogInsights(null)} size="small">Clear Insights</Button>
              </Stack>
              <Collapse in={!!logInsights}>
                {logInsights && (
                    <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflowY: 'auto', bgcolor: '#f5f5f5' }}>
                        <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {logInsights.join('\n')}
                        </Typography>
                    </Paper>
                )}
              </Collapse>
          </Paper>
          {/* --- END: LOG INSIGHTS UI --- */}


    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
      Showing the 200 most recent actions taken across the platform.
    </Typography>
    {loadingLogs ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
    ) : logsError ? (
      <Alert severity="error">{logsError}</Alert>
    ) : (
      <Paper sx={{ width: '100%', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="activity log table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actor</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Target</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activityLogs.map((log) => (
                <TableRow hover key={log._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{log.actor?.name}</TableCell>
                  <TableCell><Chip label={log.action} size="small" variant="outlined" /></TableCell>
                  <TableCell>{log.target?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.status}
                      size="small"
                      color={
                        log.status === 'SUCCESS' ? 'success' :
                        log.status === 'FAILURE' ? 'error' :
                        log.status === 'PARTIAL' ? 'warning' :
                        'default'
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{log.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    )}
  </Box>
)}
{/* --- END: ADD THIS NEW CODE --- */}

  <WhatsAppButton />


        <WhatsAppButton />

            {/* Hidden Flyer for download */}
            <Box
        ref={flyerRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: -1,
          opacity: 0,
          pointerEvents: 'none', // Prevents it from capturing mouse clicks
          width: '400px',
          height: '600px',
          backgroundColor: 'white',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          color: 'black',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#800080' }}>
          {userBusinessName || 'Your Store'}
        </Typography>
        <Typography variant="h6">
          Shop from us online!
        </Typography>
        {qrCodeDataUrl && (
          <img src={qrCodeDataUrl} alt="QR Code for store" style={{ width: '200px', height: '200px', margin: '20px 0' }} />
        )}
        <Typography variant="h5" sx={{ fontWeight: 'bold', backgroundColor: '#004d40', color: 'white', padding: '8px 16px', borderRadius: '8px' }}>
          {userSlug}.psx.ng
        </Typography>
        <Typography variant="caption" sx={{ mt: 2, fontStyle: 'italic' }}>
          Powered by Pharmastackx
        </Typography>
      </Box>

       {/* --- EDIT TILE MODAL (with Suggestions) --- */}
<Modal
  open={!!selectedProduct}
  onClose={() => {
    setSelectedProduct(null);
    setIsEditingTile(false);
    setShowSuggestions(false); // Reset suggestion view on close
    setSuggestionData(null);
  }}
  closeAfterTransition
  slots={{ backdrop: Backdrop }}
  slotProps={{ backdrop: { timeout: 500 } }}
>
  <Fade in={!!selectedProduct}>
    <Box sx={{
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: '90%',
      // Make modal wider when suggestions are active
      maxWidth: showSuggestions ? 1200 : 900,
      bgcolor: 'background.paper', boxShadow: 24, p: { xs: 2, md: 4 }, borderRadius: 2,
      maxHeight: '90vh', overflowY: 'auto',
      transition: 'max-width 0.3s ease-in-out', // Smooth transition for width change
    }}>
      {tileEditData && (
        <>
          {/* --- Header --- */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{isEditingTile ? 'Editing Item' : 'Item Details'}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={<Switch checked={showSuggestions} onChange={handleToggleSuggestions} />}
                label="Suggest"
                disabled={!isEditingTile}
              />
              {isEditingTile ? (
                <Box>
                  <Button size="medium" onClick={() => { setIsEditingTile(false); setTileEditData(selectedProduct); }} disabled={isUploading} sx={{ mr: 1 }}>Cancel</Button>
                  <Button variant="contained" color="success" size="medium" onClick={handleTileSave} disabled={isUploading}>
                    {isUploading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                  </Button>
                </Box>
              ) : (
                <Button variant="contained" size="medium" onClick={() => setIsEditingTile(true)}>Edit</Button>
              )}
            </Box>
          </Box>

          {/* --- Body (with side-by-side suggestions) --- */}
          <Box sx={{ position: 'relative' }}>
            
            {/* --- Navigation Arrows --- */}
<IconButton onClick={() => handleNavigation('prev')} disabled={!selectedProduct || filteredStock.findIndex(p => p._id === selectedProduct._id) === 0} sx={{ position: 'absolute', left: { xs: -16, md: -50 }, top: '50%', transform: 'translateY(-50%)', zIndex: 1301, bgcolor: 'background.paper', boxShadow: 3, '&:hover': { bgcolor: '#f5f5f5' } }}>
    <ArrowBackIosNewIcon />
</IconButton>
<IconButton onClick={() => handleNavigation('next')} disabled={!selectedProduct || filteredStock.findIndex(p => p._id === selectedProduct._id) === filteredStock.length - 1} sx={{ position: 'absolute', right: { xs: -16, md: -50 }, top: '50%', transform: 'translateY(-50%)', zIndex: 1301, bgcolor: 'background.paper', boxShadow: 3, '&:hover': { bgcolor: '#f5f5f5' } }}>
    <ArrowForwardIosIcon />
</IconButton>


            {/* --- Main Content Layout --- */}
            <Box sx={{ display: 'flex', gap: 3, flexDirection: showSuggestions ? 'row' : { xs: 'column', md: 'row' } }}>

              {/* --- CURRENT ITEM COLUMN --- */}
              <Box sx={{ width: showSuggestions ? '50%' : { xs: '100%', md: '33.33%' }, transition: 'width 0.3s ease-in-out' }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Current Item</Typography>
                <Box sx={{ position: 'relative', paddingTop: '100%', backgroundColor: '#f0f0f0', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                  <img src={tileEditData.imageUrl || '/placeholder.png'} alt="Current" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.currentTarget.src = '/placeholder.png')} />
                </Box>
                <Button variant="outlined" component="label" fullWidth disabled={!isEditingTile || isUploading}>
                  Upload Image <input type="file" accept="image/*" hidden onChange={handleTileImageSelect} />
                </Button>
                
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField label="Item Name" value={tileEditData.itemName || ''} onChange={e => handleTileFormChange('itemName', e.target.value)} fullWidth disabled={!isEditingTile} />
                  <TextField label="Amount (₦)" type="number" value={tileEditData.amount || ''} onChange={e => handleTileFormChange('amount', Number(e.target.value))} fullWidth disabled={!isEditingTile} />
                  <TextField label="Info" value={tileEditData.info || ''} onChange={e => handleTileFormChange('info', e.target.value)} fullWidth multiline rows={2} disabled={!isEditingTile} />
                  <TextField label="Active Ingredient" value={tileEditData.activeIngredient || ''} onChange={e => handleTileFormChange('activeIngredient', e.target.value)} fullWidth disabled={!isEditingTile} />
                  <TextField label="Category" value={tileEditData.category || ''} onChange={e => handleTileFormChange('category', e.target.value)} fullWidth disabled={!isEditingTile} />
                  <FormControlLabel control={<Checkbox checked={tileEditData.POM || false} onChange={e => handleTileFormChange('POM', e.target.checked)} disabled={!isEditingTile} />} label="Prescription Only" />
                </Stack>
              </Box>

              {/* --- SUGGESTION COLUMN (Conditional) --- */}
              {showSuggestions && (
                <Box sx={{ width: '50%', borderLeft: '1px solid #ddd', pl: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Button 
        size="small" 
        variant="outlined" 
        startIcon={<ArrowBackIosNewIcon />} 
        onClick={() => setShowSuggestions(false)}
    >
        Back to Editor
    </Button>
    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Suggestion</Typography>
</Box>

                    <Button size="small" variant="contained" onClick={handleAcceptAll} disabled={!suggestionData || !isEditingTile}>Accept All</Button>
                  </Box>
                  
                  {isFetchingSuggestion && <Box sx={{display: 'flex', justifyContent: 'center', pt: 4}}><CircularProgress /></Box>}
                  {!isFetchingSuggestion && !suggestionData && <Typography sx={{pt: 4, textAlign: 'center'}} color="text.secondary">No close match found.</Typography>}

                  {suggestionData && (
                    <>
                      <Box sx={{ position: 'relative', paddingTop: '100%', backgroundColor: '#f0f0f0', borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                        <img src={suggestionData.imageUrl || '/placeholder.png'} alt="Suggestion" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => (e.currentTarget.src = '/placeholder.png')} />
                      </Box>
                      <Button variant="outlined" fullWidth onClick={() => handleAcceptField('imageUrl', suggestionData.imageUrl)} disabled={!isEditingTile}>Accept Image</Button>
                      
                      <Stack spacing={1.5} sx={{ mt: 2 }}>
                        {(['itemName', 'amount', 'info', 'activeIngredient', 'category'] as (keyof StockItem)[]).map(key => (
                          <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField 
                               label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                               value={suggestionData[key] || ''} 
                               fullWidth 
                               disabled 
                               InputProps={{ readOnly: true }} 
                               variant="filled" 
                               size="small"
                             />
                            <Tooltip title={`Accept ${key}`}>
                                <IconButton size="small" onClick={() => handleAcceptField(key, suggestionData[key])} disabled={!isEditingTile}>
                                    <ArrowBackIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                          </Box>
                        ))}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FormControlLabel control={<Checkbox checked={suggestionData.POM || false} disabled />} label="Prescription Only" sx={{flexGrow: 1}}/>
                            <Tooltip title="Accept Prescription status">
                                <IconButton size="small" onClick={() => handleAcceptField('POM', suggestionData.POM)} disabled={!isEditingTile}>
                                    <ArrowBackIcon fontSize="inherit" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                      </Stack>
                    </>
                  )}
                </Box>
              )}
            </Box>

            {/* --- ACTION BUTTONS (for non-edit mode) --- */}
            {!isEditingTile && (
              <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5, borderTop: '1px solid #eee', pt: 3 }}>
                <Button variant="outlined" color="error" size="medium" onClick={() => { if(tileEditData?._id) handleDelete(tileEditData._id)}}>Delete Item</Button>
                {!tileEditData.isPublished ? (
                  (() => {
                    if (!tileEditData?._id) return null;
                    const isItemIncomplete = getIncompleteFieldsList(tileEditData).length > 0;
                    const publishButton = (<Button variant="contained" color="primary" size="medium" onClick={() => handlePublish(tileEditData._id!)} disabled={isItemIncomplete}>Publish</Button>);
                    return isItemIncomplete ? <Tooltip title={getIncompleteFieldsList(tileEditData).join(', ')}><span>{publishButton}</span></Tooltip> : publishButton;
                  })()
                ) : null}
                {tileEditData.isPublished ? (<Button variant="contained" color="warning" size="medium" onClick={() => {if(tileEditData?._id) handleUnpublish(tileEditData._id)}}>Withdraw</Button>) : null}
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  </Fade>
</Modal>







    </Box>
  );
}
