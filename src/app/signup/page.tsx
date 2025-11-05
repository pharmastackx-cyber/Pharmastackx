"use client";
import React, { useState } from "react";
import { TextField, Button, Typography, Box, MenuItem, Alert } from "@mui/material";
import axios from "axios";

const userTypes = [
  { value: "admin", label: "Admin" },
  { value: "business", label: "Business (Medicine Provider)" },
  { value: "customer", label: "Customer" },
  { value: "health_provider", label: "Health Provider" },
  { value: "delivery_agent", label: "Delivery Agent" },
];

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", userType: "customer" });
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
      setSuccess("Signup successful! You can now log in.");
      setForm({ name: "", email: "", password: "", userType: "customer" });
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
          label="Name"
          name="name"
          value={form.name}
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
          name="userType"
          value={form.userType}
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
