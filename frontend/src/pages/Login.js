import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Container, TextField, Link } from '@mui/material';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/login', { userId, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      console.log("Success!");
      navigate('/chat');
    } catch (error) {
      setError('Invalid user ID or password');
      console.error('Login failed:', error.response.data);
    }
  };


  return (
    <Box className="login-container">
      <Container maxWidth="sm" className="login-box">
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Login
        </Typography>
        {error && <Typography color="error" align="center">{error}</Typography>}
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
            Login
          </Button>
        </form>
        <Typography variant="body2" align="center">
          Don't have an account? <Link component={RouterLink} to="/signup">Sign up</Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Login;