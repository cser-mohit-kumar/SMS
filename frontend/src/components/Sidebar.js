import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  PackagePlus,
  ClipboardCheck,
  FilePlus2,
  FileStack,
  LogOut,
  X,
  History,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

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

const Sidebar = ({ open, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = isAdmin() ? ADMIN_LINKS : STUDENT_LINKS;
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <Link to="/dashboard" className="sidebar-brand" onClick={onClose}>
            <BrandMark />
            <div className="brand-text">
              <span className="brand-name">Stationery</span>
              <span className="brand-subtitle">Campus Supply Hub</span>
            </div>
          </Link>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`sidebar-link ${active ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="sidebar-link-bar" />
                <Icon size={18} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
            <div className="user-details">
              <span className="user-name">{user?.username}</span>
              <span className={`chip chip-role-${user?.role?.toLowerCase()}`}>
                {user?.role}
              </span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Log out">
            <LogOut size={17} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {open && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
};

export default Sidebar;
