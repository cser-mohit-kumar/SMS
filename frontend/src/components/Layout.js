import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <Navbar />

      <div className="app-main">
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
