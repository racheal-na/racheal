import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(credentials.email, credentials.password);

      if (result.success) {
        if (result.user.role === 'lawyer') {
          navigate('/lawyer/dashboard');
        } else if (result.user.role === 'client') {
          navigate('/client');
        } else if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/login');
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Background Image Section */}
      <div className="login-background">
        <div className="background-overlay"></div>
        <div className="welcome-content">
          <h1>Legal Ease Lite</h1>
          <p>Streamlining legal practice management for modern law firms</p>
          <div className="features">
            <div className="feature">
              <span className="feature-icon">📁</span>
              <span>Case Management</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📅</span>
              <span>Appointment Scheduling</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📂</span>
              <span>Document Storage</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⚖️</span>
              <span>Legal Constitution Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="login-form-section">
        <div className="login-card">
          <div className="logo">
            <span className="logo-icon">⚖️</span>
            <h2>Legal Ease Lite</h2>
          </div>
          <h3>Welcome Back</h3>
          <p>Please sign in to access your account</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" disabled={loading} className="login-button">
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
            <div className="demo-notes">
              <p>Use your registered email and password to login.</p>
            </div>
          </form>
          
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
        
        <div className="footer">
          <p>© 2025 Legal Ease Lite. All rights reserved.</p>
          <p>Addis Ababa, Ethiopia</p>
        </div>
      </div>
    </div>
  );
};

export default Login;