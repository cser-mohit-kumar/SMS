import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  ClipboardList,
  Clock,
  PackageCheck,
  PackagePlus,
  ClipboardCheck,
  FilePlus2,
  FileStack,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStock: 0,
    totalRequests: 0,
    pendingRequests: 0,
    myRequests: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');

      try {
        const inventoryResponse = await api.get('/api/inventory', {
          params: { page: 0, size: 1, sortBy: 'name' },
        });

        const totalItems = inventoryResponse.data?.totalElements ?? 0;
        let lowStock = 0;
        let lowItems = [];
        let totalRequests = 0;
        let pendingRequests = 0;
        let myRequests = 0;

        if (user?.role === 'ADMIN') {
          const lowResponse = await api.get('/api/inventory/low-stock');
          lowItems = lowResponse.data || [];
          lowStock = lowItems.length;

          const allRequests = await api.get('/api/requests');
          totalRequests = Number(allRequests.data?.length ?? 0);
          pendingRequests = Number(
            allRequests.data?.filter((request) => request.status === 'PENDING')?.length ?? 0
          );
        } else {
          const myResponse = await api.get('/api/requests/my');
          myRequests = Number(myResponse.data?.length ?? 0);
          pendingRequests = Number(
            myResponse.data?.filter((request) => request.status === 'PENDING')?.length ?? 0
          );
        }

        setStats({ totalItems, lowStock, totalRequests, pendingRequests, myRequests });
        setLowStockItems(lowItems);
      } catch (err) {
        setError('Unable to load dashboard stats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.role]);

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h1>Welcome back{user?.username ? `, ${user.username}` : ''}</h1>
          <p className="page-subtitle">
            {isAdmin()
              ? 'Here is the current state of inventory and request activity.'
              : 'Here is a quick look at inventory and your requests.'}
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon--lav">
            <Package />
          </div>
          <div className="stat-label">Inventory Items</div>
          <div className="stat-value">{stats.totalItems}</div>
        </div>

        {isAdmin() ? (
          <>
            <div className="stat-card">
              <div className="stat-icon stat-icon--amb">
                <AlertTriangle />
              </div>
              <div className="stat-label">Low Stock Items</div>
              <div className="stat-value">{stats.lowStock}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon--grn">
                <ClipboardList />
              </div>
              <div className="stat-label">Total Requests</div>
              <div className="stat-value">{stats.totalRequests}</div>
            </div>
          </>
        ) : (
          <div className="stat-card">
            <div className="stat-icon stat-icon--grn">
              <ClipboardList />
            </div>
            <div className="stat-label">My Requests</div>
            <div className="stat-value">{stats.myRequests}</div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-icon stat-icon--lav">
            <Clock />
          </div>
          <div className="stat-label">Pending Requests</div>
          <div className="stat-value">{stats.pendingRequests}</div>
        </div>
      </div>

      {loading && <div className="page-loading"><span className="spin-dot" /> Loading dashboard...</div>}

      {!loading && isAdmin() && (
        <>
          <div className="section-label">Needs Restocking</div>
          {lowStockItems.length ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Available</th>
                    <th>Minimum</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td className="cell-strong">{item.name}</td>
                      <td><span className="chip chip-muted">{item.category}</span></td>
                      <td>{item.availableQuantity} {item.unit}</td>
                      <td>
                        {item.minimumQuantity}
                        <span className="low-stock-flag">
                          <AlertTriangle /> Low
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-row">
              <PackageCheck style={{ width: 28, height: 28, color: 'var(--grn-500)', marginBottom: '0.5rem' }} />
              <strong>All stocked up</strong>
              Every item is currently above its minimum quantity.
            </div>
          )}
        </>
      )}

      <div className="section-label">Quick Actions</div>
      <div className="page-actions">
        {isAdmin() ? (
          <>
            <Link to="/inventory/add" className="btn btn-primary">
              <PackagePlus /> Add Item
            </Link>
            <Link to="/requests/manage" className="btn btn-secondary">
              <ClipboardCheck /> Manage Requests
            </Link>
            <Link to="/inventory" className="btn btn-ghost">
              <Package /> View Inventory <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </>
        ) : (
          <>
            <Link to="/requests/new" className="btn btn-primary">
              <FilePlus2 /> New Request
            </Link>
            <Link to="/requests/my" className="btn btn-secondary">
              <FileStack /> My Requests
            </Link>
            <Link to="/inventory" className="btn btn-ghost">
              <Package /> Browse Inventory <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
