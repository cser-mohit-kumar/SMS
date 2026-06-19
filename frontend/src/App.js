import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import CreateRequest from './pages/CreateRequest';
import MyRequests from './pages/MyRequests';
import ManageRequests from './pages/ManageRequests';
import AuditLogs from './pages/AuditLogs';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout title="Dashboard">
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <Layout title="Inventory">
                    <Inventory />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/add"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Layout title="Add Inventory Item">
                    <AddItem />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory/edit/:id"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Layout title="Edit Inventory Item">
                    <EditItem />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/new"
              element={
                <ProtectedRoute requiredRole="STUDENT">
                  <Layout title="New Request">
                    <CreateRequest />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/my"
              element={
                <ProtectedRoute requiredRole="STUDENT">
                  <Layout title="My Requests">
                    <MyRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests/manage"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Layout title="Manage Requests">
                    <ManageRequests />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Layout title="Audit Logs">
                    <AuditLogs />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
