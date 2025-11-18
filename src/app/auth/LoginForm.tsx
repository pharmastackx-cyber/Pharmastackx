"use client";
import React, { useState, useEffect } from "react";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material'; // Add this import

import axios from "axios";
import Cookies from "js-cookie"; 

export default function LoginForm({
  setError,
  setSuccess,
  prefilledCredentials,
}: {
  setError: (msg: string) => void;
  setSuccess: (msg: string) => void;
  prefilledCredentials?: { email: string; password: string };
}) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 


  useEffect(() => {
    if (prefilledCredentials?.email) {
      setEmail(prefilledCredentials.email);
    }
    if (prefilledCredentials?.password) {
      setPassword(prefilledCredentials.password);
    }
  }, [prefilledCredentials]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      Cookies.set("session_token", res.data.token, { expires: 7 });
      setSuccess("Login successful!");
      window.location.href = "/";
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
            <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'} // Use showPassword state here
        value={password}
        onChange={e => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        required
        InputProps={{ // Add InputProps for the adornment
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
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}
