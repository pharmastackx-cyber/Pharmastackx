"use client";
import React, { useState } from "react";
import { TextField, Button, Typography, Box, MenuItem, Alert } from "@mui/material";
import axios from "axios";
import { event } from '../../lib/gtag';


const userTypes = [
  { value: "admin", label: "Admin" },
  { value: "customer", label: "Customer" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "clinic", label: "Clinic" },
  { value: "vendor", label: "Vendor" },
  { value: "agent", label: "Delivery Agent" },
];

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "customer" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post("/api/auth/signup", form);
      event({
        action: 'sign_up',
        category: 'engagement',
        label: 'Standard Signup' // Identifies the signup method
      });
      setSuccess("Signup successful! You can now log in.");
      setForm({ username: "", email: "", password: "", role: "customer" });
    } catch (err: any) {

      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8} p={3} bgcolor="#1B5E20" borderRadius={2} boxShadow={3}>
      <Typography variant="h5" color="white" mb={2}>Sign Up</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
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
        <TextField
          select
          label="User Type"
          name="role"
          value={form.role}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          {userTypes.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          fullWidth
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
      </form>
    </Box>
  );
}
