"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  LocalPharmacy,
  Person,
  BusinessCenter,
  Search,
  Security,
  Menu as MenuIcon,
  ShoppingCart,
  LocalOffer,
  ShoppingBag,
  Chat,
  DeliveryDining
} from '@mui/icons-material';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { useSession } from '../context/SessionProvider';
import axios from 'axios';

export default function Navbar() {
  const { user, isLoading } = useSession();
  const isAdmin = user?.role === 'admin';
  const isBusinessUser = user?.role && ['admin', 'pharmacy', 'vendor'].includes(user.role);
  const isAgentOrAdmin = user?.role && ['admin', 'agent'].includes(user.role);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      handleMenuClose();
      window.location.href = '/auth';
    }
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const { getTotalItems } = useCart();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const drawerAdminLinks = isAdmin ? (
    <>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton component={Link} href="/admin/delivery-agents" onClick={handleDrawerToggle} sx={{ borderRadius: '8px', mx: 0.5, py: 1, bgcolor: isActive('/admin/delivery-agents') ? 'rgba(255, 255, 255, 0.2)' : 'transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}><Security fontSize="small" /></ListItemIcon>
            <ListItemText primary="Agent Management" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.8rem', color: 'white' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton component={Link} href="/admin/business-management" onClick={handleDrawerToggle} sx={{ borderRadius: '8px', mx: 0.5, py: 1, bgcolor: isActive('/admin/business-management') ? 'rgba(255, 255, 255, 0.2)' : 'transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}><BusinessCenter fontSize="small" /></ListItemIcon>
            <ListItemText primary="Business Management" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.8rem', color: 'white' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton component={Link} href="/admin/order-management" onClick={handleDrawerToggle} sx={{ borderRadius: '8px', mx: 0.5, py: 1, bgcolor: isActive('/admin/order-management') ? 'rgba(255, 255, 255, 0.2)' : 'transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}><ShoppingCart fontSize="small" /></ListItemIcon>
            <ListItemText primary="Order Management" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.8rem', color: 'white' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton component={Link} href="/admin/user-management" onClick={handleDrawerToggle} sx={{ borderRadius: '8px', mx: 0.5, py: 1, bgcolor: isActive('/admin/user-management') ? 'rgba(255, 255, 255, 0.2)' : 'transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
              <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}><Security fontSize="small" /></ListItemIcon>
              <ListItemText primary="User Management" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.8rem', color: 'white' }} />
            </ListItemButton>
        </ListItem>
    </>
  ): null

  const drawer = (
    <Box sx={{
      height: '100%',
      background: 'linear-gradient(180deg, #006D5B 0%, #004D40 50%, #00332B 100%)',
      color: 'white'
    }}>
      <Box sx={{
        p: 2,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <img
          src="https://i.ibb.co/bM86kxhT/psx-logo-removebg-preview.png"
          alt="Pharmastackx Logo"
          style={{
            height: '25px',
            width: 'auto',
            filter: 'brightness(0) invert(1)'
          }}
        />
      </Box>

      <List sx={{ px: 0.5, py: 1 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton component={Link} href="/find-medicines" onClick={handleDrawerToggle} sx={{ borderRadius: '8px', mx: 0.5, py: 1, bgcolor: isActive('/find-medicines') ? 'rgba(255, 255, 255, 0.2)' : 'transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}><Search fontSize="small" /></ListItemIcon>
            <ListItemText primary="Find Medicines" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.8rem', color: 'white' }} />
          </ListItemButton>
        </ListItem>
        {isBusinessUser && <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton component={Link} href="/business/dashboard" onClick={handleDrawerToggle} sx={{ borderRadius: '8px', mx: 0.5, py: 1, bgcolor: isActive('/business') ? 'rgba(255, 255, 255, 0.2)' : 'transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}><BusinessCenter fontSize="small" /></ListItemIcon>
            <ListItemText primary="Business" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.8rem', color: 'white' }} />
          </ListItemButton>
        </ListItem>}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton component={Link} href="/store-management" onClick={handleDrawerToggle} sx={{  borderRadius: '8px',
      mx: 0.5,
      py: 1,
      bgcolor: isActive('/store-management') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
        <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}><BusinessCenter fontSize="small" /></ListItemIcon>
        <ListItemText primary="Store Management" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.8rem', color: 'white' }} />
      </ListItemButton>
    </ListItem>
        {isAgentOrAdmin && <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton component={Link} href="/delivery-agents/dashboard" onClick={handleDrawerToggle} sx={{ borderRadius: '8px', mx: 0.5, py: 1, bgcolor: isActive('/delivery-agents') ? 'rgba(255, 255, 255, 0.2)' : 'transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}><DeliveryDining fontSize="small" /></ListItemIcon>
            <ListItemText primary="Delivery Agents" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.8rem', color: 'white' }} />
          </ListItemButton>
        </ListItem>}
        {isAdmin && <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton component={Link} href="/promos" onClick={handleDrawerToggle} sx={{ borderRadius: '8px', mx: 0.5, py: 1, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}><LocalOffer fontSize="small" /></ListItemIcon>
            <ListItemText primary="Promos" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.8rem', color: 'white' }} />
          </ListItemButton>
        </ListItem>}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton component={Link} href="/orders" onClick={handleDrawerToggle} sx={{ borderRadius: '8px', mx: 0.5, py: 1, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}><ShoppingBag fontSize="small" /></ListItemIcon>
            <ListItemText primary="Orders" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.8rem', color: 'white' }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton component={Link} href="/carechat" onClick={handleDrawerToggle} sx={{ borderRadius: '8px', mx: 0.5, py: 1, bgcolor: isActive('/carechat') ? 'rgba(255, 255, 255, 0.2)' : 'transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}><Chat fontSize="small" /></ListItemIcon>
            <ListItemText primary="CareChat" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.8rem', color: 'white' }} />
          </ListItemButton>
        </ListItem>
       {drawerAdminLinks}
      </List>

      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
          © 2025 PharmaStackX
        </Typography>
      </Box>
    </Box>
  );

  const desktopAdminLinks = isAdmin ? (
    <>
      <Button color="inherit" startIcon={<Security />} component={Link} href="/admin/delivery-agents">
        Agent Management
      </Button>
      <Button color="inherit" startIcon={<BusinessCenter />} component={Link} href="/admin/business-management">
        Business Management
      </Button>
      <Button color="inherit" startIcon={<ShoppingCart />} component={Link} href="/admin/order-management" sx={{ bgcolor: isActive('/admin/order-management') ? 'rgba(0, 0, 0, 0.08)' : 'transparent', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }, borderRadius: '20px', mx: 0.5 }}>
        Order Management
      </Button>
      <Button color="inherit" startIcon={<Security />} component={Link} href="/admin/user-management" sx={{ bgcolor: isActive('/admin/user-management') ? 'rgba(0, 0, 0, 0.08)' : 'transparent', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }, borderRadius: '20px', mx: 0.5 }}>
          User Management
      </Button>
    </>
  ) : null;

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase();

  return (
    <>
      <AppBar position="sticky" elevation={2} sx={{ bgcolor: '#e0e0e0', color: 'black' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <img
                src="https://i.ibb.co/bM86kxhT/psx-logo-removebg-preview.png"
                alt="Pharmastackx Logo"
                style={{
                  height: '40px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            </Link>
          </Box>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }} />
          
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button color="inherit" startIcon={<Search />} component={Link} href="/find-medicines" sx={{ bgcolor: isActive('/find-medicines') ? 'rgba(0, 0, 0, 0.08)' : 'transparent', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }, borderRadius: '20px', mx: 0.5 }}>
              Find Meds
            </Button>
            <Button color="inherit" startIcon={<Chat />} component={Link} href="/carechat" sx={{ bgcolor: isActive('/carechat') ? 'rgba(0, 0, 0, 0.08)' : 'transparent', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }, borderRadius: '20px', mx: 0.5 }}>
              CareChat
            </Button>
            <IconButton color="inherit" component={Link} href="/cart" sx={{ mx: 1, bgcolor: isActive('/cart') ? 'rgba(0, 0, 0, 0.08)' : 'transparent', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
              <Badge badgeContent={getTotalItems()} color="error" max={99}>
                <ShoppingCart />
              </Badge>
            </IconButton>
            
            {isBusinessUser && <Button color="inherit" startIcon={<BusinessCenter />} component={Link} href="/business/dashboard">
              Business Portal
            </Button>}
            <Button color="inherit" startIcon={<BusinessCenter />} component={Link} href="/store-management"> Store Management </Button>
            
            {isAgentOrAdmin && <Button color="inherit" startIcon={<DeliveryDining />} component={Link} href="/delivery-agents/dashboard">
              Delivery Agents
            </Button>}

            {desktopAdminLinks}

            {isLoading ? (
              <CircularProgress size={24} color="inherit" sx={{ ml: 2 }} />
            ) : user ? (
              <>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 1 }}>
                  <Avatar sx={{ bgcolor: '#E91E63', color: 'white', width: 32, height: 32, fontWeight: 700 }}>
                    {userInitial}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>{user.email}</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" startIcon={<Person />} component={Link} href="/auth">
                Login
              </Button>
            )}
          </Box>

          <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center', gap: 1, ml: 'auto' }}>
            <IconButton color="inherit" component={Link} href="/find-medicines">
                <Search />
            </IconButton>
            <IconButton color="inherit" component={Link} href="/cart">
              <Badge badgeContent={getTotalItems()} color="error" max={99}>
                <ShoppingCart />
              </Badge>
            </IconButton>
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : user ? (
               <>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: '#E91E63', color: 'white', width: 32, height: 32 }}>
                    {userInitial}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>{user.email}</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton color="inherit" component={Link} href="/auth">
                <Person />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: '130px',
            borderRadius: '0 16px 16px 0',
            border: 'none',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)'
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)'
          }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
