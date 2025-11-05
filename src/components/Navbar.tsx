"use client";

// ...existing code...

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
  Divider,
} from '@mui/material';
import { LocalPharmacy, Person, BusinessCenter, Search, Security, Menu, ShoppingCart, LocalOffer, ShoppingBag, Chat, DeliveryDining } from '@mui/icons-material';
import { Badge } from '@mui/material';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Avatar } from '@mui/material';
import { usePathname } from 'next/navigation';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const [userInitial, setUserInitial] = useState<string | null>(null);
  useEffect(() => {
    // Try to get user info from localStorage token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      try {
        // Decode JWT to get username (assume payload has 'name' or 'username')
        const payload = JSON.parse(atob(token.split('.')[1]));
        const name = payload.name || payload.username || payload.email || '';
        setUserInitial(name.charAt(0).toUpperCase());
      } catch {
        setUserInitial(null);
      }
    } else {
      setUserInitial(null);
    }
  }, []);
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

  const drawer = (
    <Box sx={{ 
      height: '100%', 
      background: 'linear-gradient(180deg, #006D5B 0%, #004D40 50%, #00332B 100%)',
      color: 'white'
    }}>
      {/* Header Section */}
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

      {/* Menu Items */}
      <List sx={{ px: 0.5, py: 1 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link} 
            href="/"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              bgcolor: isActive('/') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <LocalPharmacy fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Home" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link} 
            href="/find-medicines"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              bgcolor: isActive('/find-medicines') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <Search fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Find Medicines" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link} 
            href="/business/dashboard"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              bgcolor: isActive('/business') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <BusinessCenter fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Business" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link} 
            href="/delivery-agents/dashboard"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              bgcolor: isActive('/delivery-agents') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <DeliveryDining fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Delivery Agents" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link} 
            href="/about"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <LocalPharmacy fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="About" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link} 
            href="/promos"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <LocalOffer fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Promos" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link} 
            href="/orders"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <ShoppingBag fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Orders" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link} 
            href="/carechat"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              bgcolor: isActive('/carechat') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <Chat fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="CareChat" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link} 
            href="/edit-medics"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              bgcolor: isActive('/edit-medics') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Edit Medics" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link}
            href="/admin/delivery-agents"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              bgcolor: isActive('/admin/delivery-agents') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <Security fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Agent Management" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link}
            href="/admin/business-management"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              bgcolor: isActive('/admin/business-management') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <BusinessCenter fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Business Management" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            component={Link}
            href="/admin/order-management"
            onClick={handleDrawerToggle}
            sx={{ 
              borderRadius: '8px',
              mx: 0.5,
              py: 1,
              bgcolor: isActive('/admin/order-management') ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                transition: 'all 0.2s ease'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '32px' }}>
              <ShoppingCart fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Order Management" 
              primaryTypographyProps={{ 
                fontWeight: 500, 
                fontSize: '0.8rem',
                color: 'white'
              }} 
            />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Footer Section */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        p: 2, 
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <Typography variant="caption" sx={{ 
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.7rem'
        }}>
          © 2025 PharmaStackX
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Header */}
      <AppBar position="sticky" elevation={2} sx={{ bgcolor: '#e0e0e0', color: 'black' }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <Menu />
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
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            
          </Typography>
          
          {/* Desktop Menu */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button 
              color="inherit" 
              startIcon={<LocalPharmacy />} 
              component={Link} 
              href="/"
              sx={{
                bgcolor: isActive('/') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: '20px',
                mx: 0.5
              }}
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              startIcon={<Search />} 
              component={Link} 
              href="/find-medicines"
              sx={{
                bgcolor: isActive('/find-medicines') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: '20px',
                mx: 0.5
              }}
            >
              Find Meds
            </Button>
            <Button 
              color="inherit" 
              startIcon={<Chat />} 
              component={Link} 
              href="/carechat"
              sx={{
                bgcolor: isActive('/carechat') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: '20px',
                mx: 0.5
              }}
            >
              CareChat
            </Button>
            <IconButton 
              color="inherit" 
              component={Link} 
              href="/cart"
              sx={{ 
                mx: 1,
                bgcolor: isActive('/cart') ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                borderRadius: '50%'
              }}
            >
              <Badge badgeContent={getTotalItems()} color="error" max={99}>
                <ShoppingCart />
              </Badge>
            </IconButton>
            {userInitial ? (
              <IconButton component={Link} href="/auth" sx={{ p: 0, ml: 1 }}>
                <Avatar sx={{ bgcolor: '#E91E63', color: 'white', width: 32, height: 32, fontWeight: 700 }}>
                  {userInitial}
                </Avatar>
              </IconButton>
            ) : (
              <Button color="inherit" startIcon={<Person />} component={Link} href="/auth">
                Login
              </Button>
            )}
            <Button color="inherit" startIcon={<BusinessCenter />} component={Link} href="/business/dashboard">
              Business Portal
            </Button>
            <Button color="inherit" startIcon={<DeliveryDining />} component={Link} href="/delivery-agents/dashboard">
              Delivery Agents
            </Button>
            <Button color="inherit" startIcon={<Security />} component={Link} href="/admin/delivery-agents">
              Agent Management
            </Button>
            <Button color="inherit" startIcon={<BusinessCenter />} component={Link} href="/admin/business-management">
              Business Management
            </Button>
            <Button color="inherit" startIcon={<ShoppingCart />} component={Link} href="/admin/order-management"
              sx={{ bgcolor: isActive('/admin/order-management') ? 'rgba(255, 255, 255, 0.15)' : 'transparent', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }, borderRadius: '20px', mx: 0.5 }}>
              Order Management
            </Button>
            <Button color="inherit" startIcon={<LocalPharmacy />} component={Link} href="/about">
              About
            </Button>
          </Box>

          {/* Mobile Essential Icons (Always Visible) */}
          <Box sx={{ 
            display: { xs: 'flex', sm: 'none' }, 
            alignItems: 'center',
            gap: 2,
            mr: 2
          }}>
            <IconButton 
              color="inherit" 
              size="small"
              component={Link}
              href="/find-medicines"
              sx={{ 
                flexDirection: 'column', 
                fontSize: '0.7rem',
                minWidth: 'auto',
                px: 1
              }}
            >
              <Search sx={{ fontSize: 20 }} />
              <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>
                Find
              </Typography>
            </IconButton>
            <IconButton 
              color="inherit" 
              size="small"
              component={Link}
              href="/cart"
              sx={{ 
                flexDirection: 'column',
                fontSize: '0.7rem',
                minWidth: 'auto',
                px: 1
              }}
            >
              <Badge badgeContent={getTotalItems()} color="error" max={99} sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: '16px', height: '16px' } }}>
                <ShoppingCart sx={{ fontSize: 20 }} />
              </Badge>
              <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>
                Cart
              </Typography>
            </IconButton>
            {userInitial ? (
              <IconButton component={Link} href="/auth" sx={{ p: 0, m: '0 auto' }}>
                <Avatar sx={{ bgcolor: '#E91E63', color: 'white', width: 32, height: 32, fontWeight: 700 }}>
                  {userInitial}
                </Avatar>
              </IconButton>
            ) : (
              <IconButton 
                color="inherit" 
                size="small"
                component={Link}
                href="/auth"
                sx={{ 
                  flexDirection: 'column',
                  fontSize: '0.7rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                <Person sx={{ fontSize: 20 }} />
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1 }}>
                  Login
                </Typography>
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: '20vw',
            minWidth: '160px',
            maxWidth: '200px',
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