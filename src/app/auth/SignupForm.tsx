'use client';
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import { TextField, Button, MenuItem, Box, Typography, InputAdornment, IconButton, ListSubheader } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from "axios";
import Cookies from "js-cookie";
import CreatePharmacyModal from "../components/CreatePharmacyModal";

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara"
];

interface Pharmacy {
  _id: string;
  businessName: string;
}

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
    pharmacy: "",
    mobile: "",
    licenseNumber: "",
    stateOfPractice: "",
  });
  const [loading, setLoading] = useState(false);
  const [showProviderStep, setShowProviderStep] = useState(false);
  const [providerType, setProviderType] = useState("");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [isCreatePharmacyModalOpen, setCreatePharmacyModalOpen] = useState(false);

  const [providerLoading, setProviderLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const fetchPharmacies = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/pharmacies');
      setPharmacies(data);
    } catch (error) {
      console.error("Failed to fetch pharmacies", error);
      setError("Failed to load pharmacies list.");
    }
  }, [setError]);

  useEffect(() => {
    if (providerType === 'pharmacist') {
      fetchPharmacies();
    }
  }, [providerType, fetchPharmacies]);

  const handlePharmacySearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPharmacySearch(event.target.value);
  };

  const filteredPharmacies = pharmacies.filter(
    (p) => p && p.businessName && p.businessName.toLowerCase().includes(pharmacySearch.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name === 'pharmacy' && value === 'create-new') {
      setCreatePharmacyModalOpen(true);
      return;
    }
    setForm((prevForm) => ({ ...prevForm, [name as string]: value }));
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
      const res = await axios.post("/api/auth/login", { email: form.email, password: form.password });
      Cookies.set("session_token", res.data.token, { expires: 7 });
      setSuccess("Signup successful!");
      window.location.href = redirectUrl || '/';
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const providerTypes = [
    { label: "Pharmacy", value: "pharmacy" },
    { label: "Pharmacist", value: "pharmacist" },
    { label: "Clinic", value: "clinic" },
    { label: "Vendor", value: "vendor" },
    { label: "Delivery Agent", value: "agent" },
    
  ];

  const handlePharmacyCreated = (newPharmacy: Pharmacy) => {
    fetchPharmacies().then(() => {
        setForm((prevForm) => ({ ...prevForm, pharmacy: newPharmacy._id }));
        setCreatePharmacyModalOpen(false);
    });
  };

  const handleProviderSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setProviderLoading(true);

    const { username, email, password, mobile, licenseNumber, stateOfPractice, pharmacy, businessName, state, city, businessAddress, phoneNumber, license } = form;

    let payload: any = { username, email, password, role: providerType };

    if (providerType === 'pharmacist') {
      payload = { ...payload, mobile, licenseNumber, stateOfPractice, pharmacy };
    } else {
      payload = { ...payload, businessName, state, city, businessAddress, phoneNumber, license };
    }

    try {
      await axios.post("/api/auth/signup", payload);
      const res = await axios.post("/api/auth/login", { email: form.email, password: form.password });
      Cookies.set("session_token", res.data.token, { expires: 7 });
      setSuccess("Signup successful!");
      
      if(redirectUrl) {
          window.location.href = redirectUrl;
          return;
      }

      const userRole = res.data.user?.role;
      if (userRole === 'pharmacy' || userRole === 'vendor') {
        window.location.href = '/store-management';
      } else {
        window.location.href = '/';
      }

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
            
            {providerType === 'pharmacist' && (
              <>
                <TextField
                  label="Mobile"
                  name="mobile"
                  value={form.mobile || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                />
                <TextField
                  label="License Number (optional)"
                  name="licenseNumber"
                  value={form.licenseNumber || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  select
                  label="State of Practice"
                  name="stateOfPractice"
                  value={form.stateOfPractice || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                >
                  {nigerianStates.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Pharmacy"
                  name="pharmacy"
                  value={form.pharmacy}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                >
                  <ListSubheader>
                    <TextField
                      size="small"
                      autoFocus
                      placeholder="Type to search..."
                      fullWidth
                      value={pharmacySearch}
                      onChange={handlePharmacySearchChange}
                      onKeyDown={(e) => e.stopPropagation()} // Prevent dropdown from closing on keydown
                    />
                  </ListSubheader>
                  <MenuItem value="create-new">+ Create New Pharmacy</MenuItem>
                  {filteredPharmacies.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.businessName}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            {providerType && providerType !== 'pharmacist' && (
              <>
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
                  select
                  label="State"
                  name="state"
                  value={form.state || ""}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  required
                >
                  {nigerianStates.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </TextField>
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
              </>
            )}

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
          <CreatePharmacyModal
            open={isCreatePharmacyModalOpen}
            onClose={() => setCreatePharmacyModalOpen(false)}
            onPharmacyCreated={handlePharmacyCreated}
            setError={setError}
          />
        </Box>
      )}
    </>
  );
}
