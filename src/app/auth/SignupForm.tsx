'use client';
import React, { useState, useCallback, useEffect } from "react";
import { TextField, Button, MenuItem, Box, Typography, InputAdornment, IconButton, ListSubheader, Alert, CircularProgress } from "@mui/material";
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

export default function SignupForm({ redirectUrl }: { redirectUrl: string | null; }) {
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
  const [providerLoading, setProviderLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showProviderStep, setShowProviderStep] = useState(false);
  const [providerType, setProviderType] = useState("");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [isCreatePharmacyModalOpen, setCreatePharmacyModalOpen] = useState(false);
  const [newlyCreatedPharmacy, setNewlyCreatedPharmacy] = useState<Pharmacy | null>(null);

  const fetchPharmacies = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/pharmacies?all=true');
      if (data && Array.isArray(data.pharmacies)) {
        setPharmacies(data.pharmacies);
      } else {
        setError("Failed to load pharmacies list.");
      }
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

  useEffect(() => {
    if (newlyCreatedPharmacy && pharmacies.some(p => p._id === newlyCreatedPharmacy._id)) {
      setPharmacies(prevPharmacies => {
        const otherPharmacies = prevPharmacies.filter(p => p._id !== newlyCreatedPharmacy._id);
        const newPharmacyFromList = prevPharmacies.find(p => p._id === newlyCreatedPharmacy._id);
        if (newPharmacyFromList) {
          const reorderedList = [newPharmacyFromList, ...otherPharmacies];
          // Only reset if the operation was successful
          setNewlyCreatedPharmacy(null);
          return reorderedList;
        }
        return prevPharmacies;
      });
    }
  }, [pharmacies, newlyCreatedPharmacy]);


  useEffect(() => {
    if (newlyCreatedPharmacy && pharmacies.some(p => p._id === newlyCreatedPharmacy._id)) {
      const reorderedList = [
        newlyCreatedPharmacy,
        ...pharmacies.filter(p => p._id !== newlyCreatedPharmacy._id),
      ];
      setPharmacies(reorderedList);
      setNewlyCreatedPharmacy(null);
    }
  }, [pharmacies, newlyCreatedPharmacy]);

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

  const redirectToApp = (role: string) => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
    if (role === 'pharmacy' || role === 'vendor' || role === 'admin') {
      window.location.href = '/store-management';
    } else {
      window.location.href = '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await axios.post("/api/auth/signup", { ...form, role: "customer" });
      const loginResponse = await axios.post("/api/auth/login", { email: form.email, password: form.password });
      Cookies.set("session_token", loginResponse.data.token, { expires: 7 });
      setSuccess("Signup successful! Redirecting...");
      setTimeout(() => redirectToApp(loginResponse.data.user?.role), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
      setLoading(false);
    }
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
      setSuccess("Provider signup successful! Redirecting...");
      setTimeout(() => redirectToApp(res.data.user?.role), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Provider signup failed. Please check your information.");
      setProviderLoading(false);
    }
  };

  const handlePharmacyCreated = async (newPharmacy: Pharmacy) => {
    setCreatePharmacyModalOpen(false);
    setForm((prevForm) => ({ ...prevForm, pharmacy: newPharmacy._id }));
    setPharmacySearch("");
    setNewlyCreatedPharmacy(newPharmacy);
    await fetchPharmacies();
  };

  
  const providerTypes = [
    { label: "Pharmacy", value: "pharmacy" },
    { label: "Pharmacist", value: "pharmacist" },
    { label: "Clinic", value: "clinic" },
    { label: "Vendor", value: "vendor" },
    { label: "Delivery Agent", value: "agent" },
  ];

  return (
    <>
     {(error || success) && (
        <Alert severity={error ? "error" : "success"} sx={{ mb: 2, mt: 1 }}>
          {error || success}
        </Alert>
      )}
      {!showProviderStep ? (
        <form onSubmit={handleSubmit}>
          <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" required disabled={loading} />
          <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required disabled={loading} />
          <TextField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !form.username || !form.email || !form.password}
            sx={{
                mt: 2,
                py: 1.5,
                fontWeight: 'bold',
                bgcolor: 'teal',
                color: 'white',
                '&:hover': { bgcolor: 'darkcyan' }
            }}
            >
            {loading ? <CircularProgress size={24} sx={{ color: 'white' }}/> : "Sign Up as a Customer"}
            </Button>
            <Typography variant="body2" sx={{ textAlign: 'center', my: 2, color: 'text.secondary' }}>
                Are you a pharmacy, clinic, or other service provider?
            </Typography>
            <Button 
                variant="outlined" 
                color="secondary"
                fullWidth sx={{ mt: 1, py: 1.5 }} 
                onClick={() => setShowProviderStep(true)}
            >
                Join as a Service Provider
            </Button>
        </form>
      ) : (
        <Box sx={{ px: { xs: 0, sm: 1 } }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
            Service Provider Registration
          </Typography>
          <form onSubmit={handleProviderSignup}>
            <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth margin="normal" required disabled={providerLoading} />
            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth margin="normal" required disabled={providerLoading} />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              disabled={providerLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField select label="Provider Type" name="providerType" value={providerType} onChange={(e) => setProviderType(e.target.value)} fullWidth margin="normal" required disabled={providerLoading} >
              {providerTypes.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            
            {providerType === 'pharmacist' && (
              <>
                <TextField label="Mobile" name="mobile" value={form.mobile || ""} onChange={handleChange} fullWidth margin="normal" required />
                <TextField label="License Number (optional)" name="licenseNumber" value={form.licenseNumber || ""} onChange={handleChange} fullWidth margin="normal" />
                <TextField select label="State of Practice" name="stateOfPractice" value={form.stateOfPractice || ""} onChange={handleChange} fullWidth margin="normal" required >
                  {nigerianStates.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                </TextField>
                <TextField select label="Pharmacy" name="pharmacy" value={form.pharmacy} onChange={handleChange} fullWidth margin="normal" required >
                  <ListSubheader>
                    <TextField size="small" autoFocus placeholder="Type to search..." fullWidth value={pharmacySearch} onChange={handlePharmacySearchChange} onKeyDown={(e) => e.stopPropagation()} variant="standard" />
                  </ListSubheader>
                  <MenuItem value="create-new">+ Create New Pharmacy</MenuItem>
                  {filteredPharmacies.map((p) => <MenuItem key={p._id} value={p._id}>{p.businessName}</MenuItem>)}
                </TextField>
              </>
            )}

            {providerType && providerType !== 'pharmacist' && (
              <>
                <TextField label="Business Name" name="businessName" value={form.businessName || ""} onChange={handleChange} fullWidth margin="normal" required />
                <TextField select label="State" name="state" value={form.state || ""} onChange={handleChange} fullWidth margin="normal" required >
                  {nigerianStates.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}
                </TextField>
                <TextField label="City" name="city" value={form.city || ""} onChange={handleChange} fullWidth margin="normal" required />
                <TextField label="Business Address" name="businessAddress" value={form.businessAddress || ""} onChange={handleChange} fullWidth margin="normal" required />
                <TextField label="Phone Number" name="phoneNumber" value={form.phoneNumber || ""} onChange={handleChange} fullWidth margin="normal" required />
                <TextField label="License (optional)" name="license" value={form.license || ""} onChange={handleChange} fullWidth margin="normal" />
              </>
            )}

            <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                disabled={providerLoading || !providerType} 
                sx={{
                    mt: 2,
                    py: 1.5,
                    fontWeight: 'bold',
                    bgcolor: 'teal',
                    color: 'white',
                    '&:hover': { bgcolor: 'darkcyan' }
                }}
            >
              {providerLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : `Sign Up as ${providerType.charAt(0).toUpperCase() + providerType.slice(1)}`}
            </Button>
            <Button variant="text" sx={{ mt: 1 }} fullWidth onClick={() => setShowProviderStep(false)}>
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
