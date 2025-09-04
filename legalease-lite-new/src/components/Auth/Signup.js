import React, { useState } from 'react';
import { authAPI } from '../../services/api'; // still available for admin or direct API calls
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './signup.css';
import legalImeg from './lww.jpg';

const Signup = ({ isAdminCreating = false }) => {
  const [userType, setUserType] = useState('client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    barNumber: '' // only for lawyers
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup } = useAuth(); // context signup
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (userType === 'lawyer' && !formData.barNumber) newErrors.barNumber = 'Bar Number is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length === 0) {
      setIsSubmitting(true);
      setErrors({});

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType,
        phone: formData.phone,
        ...(userType === 'lawyer' && { barNumber: formData.barNumber })
      };

      try {
        let result;

        if (isAdminCreating) {
          // Direct API call for admin-created users
          const response = await authAPI.signup(userData);
          result = { success: true, user: response.data.user };
          alert(`User ${response.data.user.name} created successfully!`);
        } else {
          // Normal signup using context
          result = await signup(userData);

          if (result.success) {
            alert('Account created successfully!');
            navigate(userType === 'lawyer' ? '/lawyer' : '/client');
          }
        }

        if (!result.success) {
          setErrors({ submit: result.message });
        }
      } catch (err) {
        setErrors({
          submit: err.response?.data?.message || 'Registration failed. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(formErrors);
    }
  };
  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-left-panel">
          <div className="signup-image">
            <img 
              src={legalImeg} 
              alt="Legal professionals working together" 
            />
          </div>
          <div className="signup-left-content">
            <h2>Legal Ease Lite</h2>
            <p>Streamlining legal practice management for modern law firms</p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">📁</span>
                <span>Case Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📅</span>
                <span>Appointment Scheduling</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📂</span>
                <span>Document Storage</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚖️</span>
                <span>Legal Constitution Access</span>
              </div>
            </div>
          </div>
        </div>
      <div className="signup-right-panel">
          <div className="signup-card">
            <div className="signup-header">
              <h1>Create your Account</h1>
              <p>Join our legal management platform</p>
            </div>

            <div className="social-signup">
              <button className="social-btn google-btn">
                <span className="social-icon">🔍</span>
                Sign up with Google
              </button>
              <button className="social-btn twitter-btn">
                <span className="social-icon">🐦</span>
                Sign up with X
              </button>
            </div>
<div className="divider">
              <span>Or continue with email</span>
            </div>

            <div className="user-type-selector">
              <button 
                className={userType === 'client' ? 'active' : ''}
                onClick={() => setUserType('client')}
              >
                I'm a Client
              </button>
              <button 
                className={userType === 'lawyer' ? 'active' : ''}
                onClick={() => setUserType('lawyer')}
              >
                I'm a Lawyer
              </button>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>

              {userType === 'lawyer' && (
                <div className="form-group">
                  <label htmlFor="barNumber">Bar Number *</label>
                  <input
                    type="text"
                    id="barNumber"
                    name="barNumber"
                    value={formData.barNumber}
                    onChange={handleChange}
                    placeholder="Enter your bar number"
                    className={errors.barNumber ? 'error' : ''}
                  />
                  {errors.barNumber && <span className="error-text">{errors.barNumber}</span>}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min. 8 characters)"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
          <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <div className="terms-container">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                  I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                </label>
              </div>

              {errors.submit && <div className="error-text submit-error">{errors.submit}</div>}

              <button 
                type="submit" 
                className="signup-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Account...' : 'Sign up'}
              </button>
            </form>
     <div className="login-redirect">
       Already have an account? <Link to="/login">Sign in</Link>
         </div>

            
          </div>
          
          <div className="footer-note">
            <p>© 2025 Legal Ease Lite. All rights reserved.</p>
            <p>Addis Ababa,Ethiopia</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;