import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const loginUser = async (data) => {
    const response = await axios.post('http://localhost:5000/api/auth/login', data);
    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { token } = await loginUser(form);
      localStorage.setItem('token', token);
      // Dispatch event to notify Navbar of login
      window.dispatchEvent(new Event("tokenChanged"));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) return setError('Google login failed');

    try {
      // const decoded = jwtDecode(credentialResponse.credential);

      const res = await axios.post('http://localhost:5000/api/auth/google', {
        token: credentialResponse.credential,
      });

      localStorage.setItem('token', res.data.token);
      // Dispatch event to notify Navbar of login
      window.dispatchEvent(new Event("tokenChanged"));
      navigate('/');
    } catch (err) {
      setError('Google login failed');
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}
      >
        <div
          className="card p-4 shadow"
          style={{ width: '100%', maxWidth: '400px', borderRadius: '10px' }}
        >
          <h2 className="text-center mb-4">Login</h2>

          {error && (
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email or User Name</label>
              <input
                name="email"
                type="text"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="showPassword"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label className="form-check-label" htmlFor="showPassword">
                Show Password
              </label>
            </div>

            <button type="submit" className="btn btn-primary w-100 mb-3">
              Login
            </button>
          </form>

          <div className="text-center mb-3">or</div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
            />
          </div>

          <p className="text-center">
            Create a new account <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
