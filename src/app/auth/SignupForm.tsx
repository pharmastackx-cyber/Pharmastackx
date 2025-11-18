'use client';
import React, { useState } from "react";
import { TextField, Button, MenuItem, Box, Typography, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from "axios";

export default function SignupForm({
  setError,
  setSuccess,
  onSignupSuccess,
}: {
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
  onSignupSuccess: (email: string, pass: string) => void;
}) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    businessName: "",
    state: "",
    city: "",
    businessAddress: "",
    phoneNumber: "",
    license: "",
  });
  const [loading, setLoading] = useState(false);
  const [showProviderStep, setShowProviderStep] = useState(false);
  const [providerType, setProviderType] = useState("");
  
  const [providerLoading, setProviderLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post("/api/auth/signup", { ...form, role: "customer" });
      onSignupSuccess(form.email, form.password);
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
      await axios.post("/api/auth/signup", {
        ...form,
        role: providerType,
      });
      onSignupSuccess(form.email, form.password);
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
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
            sx={{ mt: 1, bgcolor: "#222", "&:hover": { bgcolor: "#111" } }}
            onClick={() => setShowProviderStep(true)}
          >
            Service Providers
          </Button>
        </form>
      ) : (
        <Box sx={{ px: { xs: 1, sm: 2 } }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
            Service Provider Registration
          </Typography>
          <form onSubmit={handleProviderSignup}>
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
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Provider Type"
              name="providerType"
              value={providerType}
              onChange={(e) => setProviderType(e.target.value)}
              fullWidth
              margin="normal"
              required
            >
              {providerTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Business Name"
              name="businessName"
              value={form.businessName || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="State"
              name="state"
              value={form.state || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="City"
              name="city"
              value={form.city || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Business Address"
              name="businessAddress"
              value={form.businessAddress || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="License (optional)"
              name="license"
              value={form.license || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={providerLoading || !providerType}
              sx={{ mt: 2, bgcolor: "#222", "&:hover": { bgcolor: "#111" } }}
            >
              {providerLoading
                ? `Signing up...`
                : `Sign Up as Service Provider`}
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