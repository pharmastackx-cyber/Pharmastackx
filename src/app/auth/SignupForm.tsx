"use client";
import React, { useState } from "react";
import { TextField, Button, MenuItem, Box, Typography } from "@mui/material";
import axios from "axios";

export default function SignupForm({ setError, setSuccess }: { setError: (msg: string) => void, setSuccess: (msg: string) => void }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    businessName: "",
    state: "",
    city: "",
    businessAddress: "",
    phoneNumber: "",
    license: ""
  });
  const [loading, setLoading] = useState(false);
  const [showProviderStep, setShowProviderStep] = useState(false);
  const [providerType, setProviderType] = useState("");
  const [providerLoading, setProviderLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post("/api/auth/signup", { ...form, role: "customer" });
      setSuccess("Signup successful! You can now log in.");
      setForm({
        username: "",
        email: "",
        password: "",
        businessName: "",
        state: "",
        city: "",
        businessAddress: "",
        phoneNumber: "",
        license: ""
      });
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };


  const providerTypes = [
    { label: "Pharmacy", value: "pharmacy" },
    { label: "Clinic", value: "clinic" },
    { label: "Vendor", value: "vendor" },
    { label: "Delivery Agent", value: "agent" },
  ];

  const handleProviderSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setProviderLoading(true);
    try {
      await axios.post("/api/auth/signup", { ...form, role: providerType });
      setSuccess("Service provider signup successful! You can now log in.");
      setForm({
        username: "",
        email: "",
        password: "",
        businessName: "",
        state: "",
        city: "",
        businessAddress: "",
        phoneNumber: "",
        license: ""
      });
      setProviderType("");
      setShowProviderStep(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setProviderLoading(false);
    }
  };

  return (
    <>
      {!showProviderStep ? (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            fullWidth
            disabled={loading || !form.username || !form.email || !form.password}
            sx={{ mt: 2 }}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading || !form.username || !form.email || !form.password}
            sx={{ mt: 1, bgcolor: '#222', '&:hover': { bgcolor: '#111' } }}
            onClick={() => setShowProviderStep(true)}
          >
            Service Providers
          </Button>
        </form>
      ) : (
        <Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Service Provider Registration
          </Typography>
          <form onSubmit={handleProviderSignup} style={{ maxWidth: 320, margin: '0 auto' }}>
            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              fullWidth
              margin="none"
              size="small"
              required
              disabled
              sx={{ mb: 0.5, fontSize: '0.92rem' }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="none"
              size="small"
              required
              disabled
              sx={{ mb: 0.5, fontSize: '0.92rem' }}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="none"
              size="small"
              required
              disabled
              sx={{ mb: 0.5, fontSize: '0.92rem' }}
            />
            <TextField
              select
              label="Provider Type"
              name="providerType"
              value={providerType}
              onChange={e => setProviderType(e.target.value)}
              fullWidth
              margin="none"
              required
              size="small"
              sx={{ mb: 0.5, fontSize: '0.92rem' }}
            >
              {providerTypes.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Business Name"
              name="businessName"
              value={form.businessName || ''}
              onChange={handleChange}
              fullWidth
              margin="none"
              size="small"
              required
              sx={{ mb: 0.5, fontSize: '0.92rem' }}
            />
            <TextField
              label="State"
              name="state"
              value={form.state || ''}
              onChange={handleChange}
              fullWidth
              margin="none"
              size="small"
              required
              sx={{ mb: 0.5, fontSize: '0.92rem' }}
            />
            <TextField
              label="City"
              name="city"
              value={form.city || ''}
              onChange={handleChange}
              fullWidth
              margin="none"
              size="small"
              required
              sx={{ mb: 0.5, fontSize: '0.92rem' }}
            />
            <TextField
              label="Business Address"
              name="businessAddress"
              value={form.businessAddress || ''}
              onChange={handleChange}
              fullWidth
              margin="none"
              size="small"
              required
              sx={{ mb: 0.5, fontSize: '0.92rem' }}
            />
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber || ''}
              onChange={handleChange}
              fullWidth
              margin="none"
              size="small"
              required
              sx={{ mb: 0.5, fontSize: '0.92rem' }}
            />
            <TextField
              label="License (optional)"
              name="license"
              value={form.license || ''}
              onChange={handleChange}
              fullWidth
              margin="none"
              size="small"
              sx={{ mb: 0.5, fontSize: '0.92rem' }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={providerLoading || !providerType}
              sx={{ mt: 2, bgcolor: '#222', '&:hover': { bgcolor: '#111' } }}
            >
              {providerLoading ? `Signing up...` : `Sign Up as Service Provider`}
            </Button>
            <Button
              variant="text"
              color="secondary"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => setShowProviderStep(false)}
            >
              Back
            </Button>
          </form>
        </Box>
      )}
    </>
  );
}
