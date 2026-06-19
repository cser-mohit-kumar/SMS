import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, GraduationCap, ShieldCheck, BookOpen } from 'lucide-react';
import api from '../api/axiosConfig';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const selectRole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || err.response.data?.error;
        setServerError(msg || `Registration failed (${err.response.status})`);
      } else if (err.request) {
        setServerError('Unable to reach server. Please check your connection.');
      } else {
        setServerError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-form-panel">
          <div className="auth-card auth-success">
            <div className="auth-success-icon">
              <CheckCircle2 size={28} />
            </div>
            <h2>Account created!</h2>
            <p>Redirecting you to the sign-in page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-form-panel">
        <div className="auth-card">

          {/* Logo inside the card */}
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <BookOpen size={22} />
            </div>
            <div className="auth-logo-text">
              <span className="auth-logo-name">StationaryMS</span>
              <span className="auth-logo-sub">Management System</span>
            </div>
          </div>

          <div className="auth-header">
            <h1>Create your account</h1>
            <p>Join the Stationery Management System.</p>
          </div>

          {serverError && (
            <div className="auth-error">
              <AlertCircle size={17} />
              <span>{serverError}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">Username</label>
              <div className="input-icon-wrap">
                <User size={17} />
                <input
                  id="reg-username"
                  type="text"
                  name="username"
                  className={`form-input ${errors.username ? 'input-error' : ''}`}
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  autoFocus
                />
              </div>
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <div className="input-icon-wrap">
                <Mail size={17} />
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="input-icon-wrap">
                  <Lock size={17} />
                  <input
                    id="reg-password"
                    type="password"
                    name="password"
                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm password</label>
                <div className="input-icon-wrap">
                  <Lock size={17} />
                  <input
                    id="reg-confirm"
                    type="password"
                    name="confirmPassword"
                    className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">I am registering as</label>
              <div className="role-select-group">
                <div
                  className={`role-option ${formData.role === 'STUDENT' ? 'selected' : ''}`}
                  onClick={() => !loading && selectRole('STUDENT')}
                >
                  <GraduationCap size={18} />
                  <span>Student</span>
                </div>
                <div
                  className={`role-option ${formData.role === 'ADMIN' ? 'selected' : ''}`}
                  onClick={() => !loading && selectRole('ADMIN')}
                >
                  <ShieldCheck size={18} />
                  <span>Admin</span>
                </div>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <span className="btn-spinner" />
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
