'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, IconButton, TextField, Button,
  Table, TableHead, TableBody, TableRow, TableCell, Paper
} from '@mui/material';
import { Storefront, LocationOn, UploadFile } from '@mui/icons-material';
import Papa from 'papaparse';

interface StockItem {
  itemName: string;
  activeIngredient: string;
  category: string;
  amount: number | string;
  imageUrl: string;
  businessName: string;
  coordinates: string;
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
  const [stockData, setStockData] = useState<StockItem[]>([
    { itemName: 'Paracetamol 500mg', activeIngredient: 'Paracetamol', category: 'Analgesic', amount: 500, imageUrl: 'https://via.placeholder.com/50', businessName: 'PharmaStackx Store', coordinates: 'Lat: 6.5244, Lon: 3.3792' },
    { itemName: 'Amoxicillin 250mg', activeIngredient: 'Amoxicillin', category: 'Antibiotic', amount: 1200, imageUrl: 'https://via.placeholder.com/50', businessName: 'PharmaStackx Store', coordinates: 'Lat: 6.5244, Lon: 3.3792' },
    { itemName: 'Cough Syrup', activeIngredient: 'Dextromethorphan', category: 'Cough & Cold', amount: 850, imageUrl: 'https://d3ckuu7lxvlwp2.cloudfront.net/products/01JM2PEQQND2VAQ2PAA3VTQZGN.jpg', businessName: 'PharmaStackx Store', coordinates: 'Lat: 6.5244, Lon: 3.3792' },
  ]);

  // STOCK Table helpers
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof StockItem | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editingRowData, setEditingRowData] = useState<StockItem | {}>({});

  const formRef = useRef<HTMLDivElement>(null);

  interface FormValues {
    itemName: string;
    activeIngredient: string;
    category: string;
    amount: string | number;
    imageUrl: string;
    businessName: string;
    coordinates: string;
  }

  const [formValues, setFormValues] = useState<FormValues>({
    itemName: '',
    activeIngredient: '',
    category: '',
    amount: '',
    imageUrl: '',
    businessName: '',
    coordinates: '',
  });

  // --- Filtering, Sorting, Pagination ---
  const filteredStock = stockData.filter(item =>
    Object.values(item).join(' ').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedStock = [...filteredStock].sort((a, b) => {
    if (!sortColumn) return 0;
    const valA = String(a[sortColumn] ?? '');
    const valB = String(b[sortColumn] ?? '');
    return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStock = sortedStock.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (column: keyof StockItem) => {
    if (sortColumn === column) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(column); setSortDirection('asc'); }
    setCurrentPage(1);
  };

  // ✅ Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/me');
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();

        if (data.user?.businessName) setUserBusinessName(data.user.businessName);
        if (data.user?.slug) setUserSlug(data.user.slug);

        if (data.user?.businessCoordinates) {
          setBusinessCoordinates(data.user.businessCoordinates);
          const { latitude, longitude } = data.user.businessCoordinates;
          const coordsString = `Lat: ${latitude?.toFixed(4)}, Lon: ${longitude?.toFixed(4)}`;
          setLocation(coordsString);
          setFormValues(prev => ({ ...prev, coordinates: coordsString }));
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formValues);
    alert('Form submitted! Check console.');
  };

  // CSV helpers
  const normalizeCSVHeaders = (headers: string[]) => {
    const headerMap: Record<string, string[]> = {
      itemName: ['item name', 'item', 'product', 'drug', 'medicine name', 'name'],
      activeIngredient: ['active ingredient', 'ingredient', 'compound', 'api', 'substance'],
      category: ['category', 'class', 'type', 'drug class'],
      amount: ['amount', 'price', 'cost', 'value', '₦', 'naira'],
      imageUrl: ['image', 'photo', 'picture', 'img', 'image url'],
    };
    const normalized: Record<string, string> = {};
    headers.forEach(header => {
      const lower = header.trim().toLowerCase();
      for (const [key, aliases] of Object.entries(headerMap)) {
        if (aliases.includes(lower)) { normalized[key] = header; return; }
      }
    });
    return normalized;
  };

  const normalizeValue = (key: string, rawValue: any) => {
    if (!rawValue) return 'N/A';
    const value = rawValue.toString().trim();
    if (key === 'amount') {
      const numeric = value.replace(/[₦$,]/g, '').replace(/k/i, '000').match(/\d+(\.\d+)?/);
      return numeric ? parseFloat(numeric[0]) : 'N/A';
    }
    if (['itemName', 'activeIngredient', 'category'].includes(key)) return value.replace(/\s+/g, ' ').trim();
    return value;
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
          const normalizedRow: StockItem = {
            itemName: normalizeValue('itemName', row[headerMapping.itemName]),
            activeIngredient: normalizeValue('activeIngredient', row[headerMapping.activeIngredient]),
            category: normalizeValue('category', row[headerMapping.category]),
            amount: normalizeValue('amount', row[headerMapping.amount]),
            imageUrl: normalizeValue('imageUrl', row[headerMapping.imageUrl]),
            businessName: userBusinessName || 'N/A',
            coordinates: businessCoordinates?.latitude && businessCoordinates?.longitude
              ? `Lat: ${businessCoordinates.latitude.toFixed(4)}, Lon: ${businessCoordinates.longitude.toFixed(4)}`
              : 'N/A',
          };
          return normalizedRow;
        });

        setBulkData(parsedData);
        setShowBulkPreview(true);
      },
    });
  };

  const handleConfirmBulkUpload = () => {
    console.log('✅ Final bulk upload data:', bulkData);
    alert('Bulk upload data logged to console!');
  };

  // --- RENDER ---
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Store Management</Typography>
      <Tabs value={selectedTab} onChange={handleTabChange}>
        <Tab label="Storefront" />
        <Tab label="Upload" />
        <Tab label="Stock" />
      </Tabs>

      {/* STORE FRONT */}
      {selectedTab === 0 && (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
          <Box sx={{ width: 350, background: 'linear-gradient(90deg, #004d40 0%, #800080 100%)', color: 'white', p: 3, borderRadius: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' } }} onClick={handleStoreInfoClick}>
            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }}><Storefront sx={{ color: 'white' }} /></IconButton>
            <Typography variant="h6">Store Info</Typography>
            <Typography variant="body2">{loadingUser ? 'Loading...' : userSlug ? `Slug: ${userSlug}` : 'Click to fetch store info.'}</Typography>
          </Box>

          <Box
  sx={{
    width: 350,
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
    '&:hover': !businessCoordinates
      ? { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' }
      : undefined,
    transition: '0.3s',
  }}
  onClick={!businessCoordinates ? handleGetLocation : undefined}
>

            <IconButton sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 1 }}><LocationOn sx={{ color: 'white' }} /></IconButton>
            {businessCoordinates ? (
              <>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Store Location:</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>Lat: {businessCoordinates.latitude?.toFixed(4)}, Lon: {businessCoordinates.longitude?.toFixed(4)}</Typography>
              </>
            ) : <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Click to get your location</Typography>}
          </Box>
        </Box>
      )}

      {/* UPLOAD */}
      {selectedTab === 1 && (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
          {!showUploadForm ? (
            <Box sx={{ width: 350, height: 150, bgcolor: '#1976d2', color: 'white', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 20px rgba(0,0,0,0.4)' } }} onClick={handleUploadClick}>
              <IconButton sx={{ color: 'white', mb: 1 }}><UploadFile /></IconButton>
              <Typography variant="h6">Upload</Typography>
              <Typography variant="body2">Click to add new items.</Typography>
            </Box>
          ) : (
            <Box ref={formRef} component="form" onSubmit={handleFormSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 350, p: 3, bgcolor: '#e0f7fa', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <TextField label="Item Name" name="itemName" value={formValues.itemName} onChange={handleFormChange} fullWidth />
              <TextField label="Active Ingredient" name="activeIngredient" value={formValues.activeIngredient} onChange={handleFormChange} fullWidth />
              <TextField label="Category" name="category" value={formValues.category} onChange={handleFormChange} fullWidth />
              <TextField label="Amount" name="amount" value={formValues.amount} onChange={handleFormChange} fullWidth />
              <TextField label="Image URL" name="imageUrl" value={formValues.imageUrl} onChange={handleFormChange} fullWidth />
              <TextField label="Business Name" value={userBusinessName || ''} InputProps={{ readOnly: true }} fullWidth />
              <TextField label="Coordinates" value={location || ''} InputProps={{ readOnly: true }} fullWidth />
              <Button type="submit" variant="contained" color="primary">Submit</Button>
            </Box>
          )}

          <Box sx={{ width: 350, height: 'auto', background: 'linear-gradient(90deg, #004d40 0%, #800080 100%)', color: 'white', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', p: 3 }}>
            <IconButton sx={{ color: 'white', mb: 1 }}><UploadFile /></IconButton>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Bulk Upload</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>Upload multiple items using a CSV file</Typography>
            <Button variant="contained" component="label" color="secondary">
              Choose CSV
              <input type="file" accept=".csv" hidden onChange={handleBulkFileUpload} />
            </Button>

            {showBulkPreview && (
              <Paper sx={{ mt: 3, width: '100%', overflowX: 'auto', bgcolor: 'white', color: 'black' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Item Name', 'Active Ingredient', 'Category', 'Amount', 'Image', 'Business Name', 'Coordinates'].map(h => <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>)}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkData.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.itemName}</TableCell>
                        <TableCell>{row.activeIngredient}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.amount}</TableCell>
                        <TableCell>{row.imageUrl}</TableCell>
                        <TableCell>{row.businessName}</TableCell>
                        <TableCell>{row.coordinates}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button fullWidth variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleConfirmBulkUpload}>Confirm Upload</Button>
              </Paper>
            )}
          </Box>
        </Box>
      )}

      {/* STOCK */}
      {selectedTab === 2 && (
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <Box sx={{ width: 700, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, boxShadow: '0 2px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Bulk Files</Typography>
            <Typography variant="body2" color="text.secondary">Upload CSV files here for batch stock updates</Typography>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Current Stock Catalogue</Typography>

          <Paper sx={{ width: 700, overflowX: 'auto', bgcolor: 'white', color: 'black', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', borderRadius: 2, p: 2 }}>
            <TextField label="Search items" variant="outlined" size="small" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} sx={{ mb: 2, width: '50%' }} />

            <Table size="small">
              <TableHead>
                <TableRow>
                  {(['itemName', 'activeIngredient', 'category', 'amount', 'imageUrl', 'businessName', 'coordinates'] as (keyof StockItem)[]).map(key => (
                    <TableCell key={key} onClick={() => handleSort(key)} sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                      {sortColumn === key && <span style={{ marginLeft: 4, fontSize: 12, color: 'gray' }}>{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStock.map((row, i) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + i;
                  return (
                    <TableRow key={globalIndex}>
                      {editingRowIndex === globalIndex ? (
                        <>
                          {(['itemName','activeIngredient','category','amount','imageUrl'] as (keyof StockItem)[]).map(field => (
                            <TableCell key={field}>
                              <TextField
                                type={field==='amount' ? 'number' : 'text'}
                                value={(editingRowData as any)[field]}
                                onChange={e => setEditingRowData({ ...(editingRowData as any), [field]: field==='amount' ? Number(e.target.value) : e.target.value })}
                              />
                            </TableCell>
                          ))}
                          <TableCell>{row.businessName}</TableCell>
                          <TableCell>{row.coordinates}</TableCell>
                          <TableCell>
                            <Button variant="contained" size="small" color="success" sx={{ mr: 1 }} onClick={() => { const updated = [...stockData]; updated[globalIndex] = editingRowData as StockItem; setStockData(updated); setEditingRowIndex(null); }}>Save</Button>
                            <Button size="small" onClick={() => setEditingRowIndex(null)}>Cancel</Button>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{row.itemName}</TableCell>
                          <TableCell>{row.activeIngredient}</TableCell>
                          <TableCell>{row.category}</TableCell>
                          <TableCell>{row.amount}</TableCell>
                          <TableCell>{row.imageUrl ? <img src={row.imageUrl} alt={row.itemName} width={50} height={50} style={{ borderRadius: 6 }} /> : 'N/A'}</TableCell>
                          <TableCell>{row.businessName}</TableCell>
                          <TableCell>{row.coordinates}</TableCell>
                          <TableCell>
                            <Button variant="contained" size="small" sx={{ mr: 1 }} onClick={() => { setEditingRowIndex(globalIndex); setEditingRowData(row); }}>Edit</Button>
                            <Button variant="outlined" color="error" size="small" onClick={() => { if(window.confirm('Are you sure you want to delete this item?')) setStockData(stockData.filter((_, idx) => idx !== globalIndex)); }}>Delete</Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, width: '100%' }}>
              <Typography variant="body2" color="text.secondary">Page {currentPage} of {Math.ceil(filteredStock.length / itemsPerPage)}</Typography>
              <Box>
                <Button variant="outlined" size="small" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} sx={{ mr:1 }}>Prev</Button>
                <Button variant="outlined" size="small" disabled={currentPage===Math.ceil(filteredStock.length/itemsPerPage)} onClick={()=>setCurrentPage(p=>p+1)}>Next</Button>
              </Box>
            </Box>

          </Paper>
        </Box>
      )}
    </Box>
  );
}
