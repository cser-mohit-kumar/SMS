import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ title, children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="topbar-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="topbar-title">{title}</h1>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
