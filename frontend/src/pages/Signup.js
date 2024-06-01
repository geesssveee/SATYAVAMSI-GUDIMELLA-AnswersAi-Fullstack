import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Container, TextField, Link, Alert } from '@mui/material';
import './Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let errorTimeout;
    if (error) {
      errorTimeout = setTimeout(() => {
        setError('');
      }, 3000); // Clear error message after 5 seconds
    }

    return () => {
      clearTimeout(errorTimeout);
    };
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/signup', {
        userId,
        firstName,
        lastName,
        email,
        password,
      });
      console.log('Signup successful:', response.data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000); 
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Error during signup. Please try again.');
      }
      console.error('Signup failed:', error.response ? error.response.data : error);
    }
  };

  return (
    <Box className="signup-container">
      <Container maxWidth="sm" className="signup-box">
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Sign Up
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">Registration successful! Redirecting to login...</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="User ID"
            variant="outlined"
            fullWidth
            margin="normal"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
          <TextField
            label="First Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <TextField
            label="Last Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, mb: 2 }}>
            Sign Up
          </Button>
        </form>
        <Typography variant="body2" align="center">
          Already have an account? <Link component={RouterLink} to="/login">Login</Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Signup;