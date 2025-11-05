"use client";
import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, Alert } from "@mui/material";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import Navbar from "@/components/Navbar";

export default function AuthPage() {
  const [tab, setTab] = useState(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  return (
    <>
      <Navbar />
      <Box
      sx={{
        width: '100%',
        maxWidth: 340,
        mx: 'auto',
  mt: { xs: '50vh', sm: 8, md: 10 },
  transform: { xs: 'translateY(-50%)', sm: 'none', md: 'none' },
        p: { xs: 2, sm: 3, md: 4 },
        background: '#f5f6fa', // darker off-white
        borderRadius: { xs: 4, sm: 5, md: 6 },
        boxShadow: '0 8px 32px 4px rgba(30, 41, 59, 0.25), 0 1.5px 8px 0 rgba(233,30,99,0.10)',
        border: '2.5px solid #e0e0e0',
        color: '#222',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        centered
        textColor="secondary"
        indicatorColor="secondary"
        sx={{
          mb: 2,
          p: 0.5,
          border: '1.5px solid #e0e0e0',
          borderRadius: 2,
          background: '#f9f9fb',
          minHeight: 48,
          position: 'relative',
          '& .MuiTab-root': {
            color: '#222',
            fontWeight: 700,
            letterSpacing: 1,
            fontSize: '1.08rem',
            opacity: 0.95,
            minWidth: 100,
            borderRadius: 2,
            zIndex: 1,
            transition: 'background 0.2s',
            background: 'transparent',
            '&.Mui-selected': {
              background: '#fff',
              boxShadow: '0 2px 8px 0 rgba(233,30,99,0.07)',
              color: '#E91E63',
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#E91E63',
            height: 3,
            borderRadius: 2,
          },
        }}
        TabIndicatorProps={{ style: { zIndex: 2 } }}
      >
        <Tab label="LOGIN" sx={{ mr: 1, position: 'relative' }} />
        <Tab label="SIGN UP" sx={{ ml: 1, position: 'relative' }} />
      </Tabs>
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Box mt={3}>
        {tab === 0 ? (
          <LoginForm setError={setError} setSuccess={setSuccess} />
        ) : (
          <SignupForm setError={setError} setSuccess={setSuccess} />
        )}
      </Box>
    </Box>
    </>
  );
}
