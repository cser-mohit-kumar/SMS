import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  PackagePlus,
  ClipboardCheck,
  FilePlus2,
  FileStack,
  History,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const BrandMark = () => (
  <svg viewBox="0 0 40 40" className="brand-mark" aria-hidden="true">
    <rect width="40" height="40" rx="10" fill="#6B8F71" />
    <path d="M11 10h17v20H11z" fill="#F2F8F3" />
    <path d="M28 10v6.2L21.8 10z" fill="#C8DCC9" />
    <rect x="14.5" y="19" width="11" height="2.3" rx="1.1" fill="#6B8F71" />
    <rect x="14.5" y="23.6" width="11" height="2.3" rx="1.1" fill="#6B8F71" />
    <circle cx="28.5" cy="28.5" r="6" fill="#C4887A" />
    <path d="M25.7 28.6l1.9 1.9 3.8-3.8" stroke="#FDF6F5" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ADMIN_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/inventory/add', label: 'Add Item', icon: PackagePlus },
  { path: '/requests/manage', label: 'Manage Requests', icon: ClipboardCheck },
  { path: '/audit', label: 'Audit Logs', icon: History },
];

const STUDENT_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/requests/new', label: 'New Request', icon: FilePlus2 },
  { path: '/requests/my', label: 'My Requests', icon: FileStack },
];

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const links = isAdmin() ? ADMIN_LINKS : STUDENT_LINKS;
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-main">
        {/* Logo and Brand */}
        <Link to="/dashboard" className="navbar-brand">
          <BrandMark />
          <div className="brand-text">
            <span className="brand-name">Stationery</span>
            <span className="brand-subtitle">Campus Supply Hub</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-nav-desktop">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${active ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{link.label}</span>
                {active && <span className="navbar-link-indicator" />}
              </Link>
            );
          })}
        </div>

        {/* Desktop User Info & Logout */}
        <div className="navbar-user-desktop">
          <div className="navbar-user-card">
            <span className="user-avatar-small">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
            <div className="user-info-text">
              <span className="user-username">{user?.username}</span>
              <span className={`chip chip-role-${user?.role?.toLowerCase()}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button className="navbar-logout-btn" onClick={handleLogout} title="Log out">
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="navbar-menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      <div className={`navbar-menu-mobile ${isOpen ? 'open' : ''}`}>
        <div className="mobile-nav-links">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-link ${active ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="mobile-user-section">
          <div className="mobile-user-info">
            <span className="user-avatar-small">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
            <div className="user-info-text">
              <span className="user-username">{user?.username}</span>
              <span className={`chip chip-role-${user?.role?.toLowerCase()}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            className="navbar-logout-btn mobile-logout"
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
