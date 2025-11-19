import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        contactNumber: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'contactNumber') {
            const onlyNumbers = value.replace(/\D/g, '');
            if (onlyNumbers.length > 10) return;
            setForm((prev) => ({ ...prev, [name]: onlyNumbers }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const validateForm = () => {
        const { username, email, contactNumber, password } = form;
        if (!username.trim()) return 'Username is required.';
        if (username.length < 3) return 'Username must be at least 3 characters long.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) return 'Email is required.';
        if (!emailRegex.test(email)) return 'Please enter a valid email address.';
        if (contactNumber.trim() && !/^[0-9]{10}$/.test(contactNumber)) {
            return 'Contact number must be exactly 10 digits.';
        }
        if (!password.trim()) return 'Password is required.';
        if (password.length < 6) return 'Password must be at least 6 characters long.';
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        try {
            const resp = await axios.post('http://localhost:5000/api/auth/register', form);
            if (resp.status === 201) {
                setSuccess('Registration successful! Redirecting to login...');
                setForm({ username: '', email: '', contactNumber: '', password: '' });
                setTimeout(() => navigate('/login'), 1500);
            } else {
                setError('Unexpected server response.');
            }
        } catch (err) {
            setError('Registration failed: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}
        >
            <div
                className="card p-4 shadow"
                style={{ width: '100%', maxWidth: '400px', borderRadius: '10px' }}
            >
                <h2 className="text-center mb-4">Register</h2>

                {error && (
                    <div className="alert alert-danger text-center" role="alert">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success text-center" role="alert">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            name="username"
                            type="text"
                            className="form-control"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            name="email"
                            type="email"
                            className="form-control"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Contact Number</label>
                        <input
                            name="contactNumber"
                            type="text"
                            className="form-control"
                            value={form.contactNumber}
                            onChange={handleChange}
                            placeholder="10-digit number"
                            maxLength="10"
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
                        Register
                    </button>
                </form>

                <p className="text-center">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
