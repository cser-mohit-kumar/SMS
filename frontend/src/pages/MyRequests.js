import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileStack, Plus } from 'lucide-react';
import api from '../api/axiosConfig';
import StatusStamp from '../components/StatusStamp';
import './Requests.css';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/requests/my', {
        params: status ? { status } : {},
      });
      setRequests(response.data || []);
    } catch (err) {
      setError('Failed to load your requests.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [status]);

  // Client-side sorting
  const sortedRequests = React.useMemo(() => {
    const list = [...requests];
    list.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'date') {
        valA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        valB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      } else if (sortBy === 'status') {
        valA = a.status || '';
        valB = b.status || '';
      } else if (sortBy === 'itemName') {
        valA = a.items?.[0]?.itemName || '';
        valB = b.items?.[0]?.itemName || '';
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [requests, sortBy, sortOrder]);

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h1>My Requests</h1>
          <p className="page-subtitle">Track requests you have submitted and their current status.</p>
        </div>
        <div className="page-actions">
          <Link to="/requests/new" className="btn btn-primary">
            <Plus /> New Request
          </Link>
        </div>
      </div>

      <div className="toolbar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="field-control" style={{ minWidth: '150px' }}>
          <label htmlFor="status-filter">Filter by status</label>
          <select id="status-filter" className="select-control" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="FULFILLED">Fulfilled</option>
          </select>
        </div>

        <div className="field-control" style={{ minWidth: '150px' }}>
          <label htmlFor="sort-by">Sort by</label>
          <select id="sort-by" className="select-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date</option>
            <option value="status">Status</option>
            <option value="itemName">Item Name</option>
          </select>
        </div>

        <div className="field-control" style={{ minWidth: '150px' }}>
          <label htmlFor="sort-order">Order</label>
          <select id="sort-order" className="select-control" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Status</th>
              <th>Items</th>
              <th>Reviewed By</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.length ? (
              sortedRequests.map((request) => (
                <tr key={request.id}>
                  <td className="cell-id">{request.requestId}</td>
                  <td>
                    <StatusStamp status={request.status} />
                    {request.status === 'REJECTED' && request.rejectionReason && (
                      <span className="request-meta">"{request.rejectionReason}"</span>
                    )}
                  </td>
                  <td>
                    <div className="chip-list">
                      {request.items?.map((item, idx) => (
                        <span className="chip chip-muted" key={idx}>{item.itemName} × {item.quantity}</span>
                      ))}
                    </div>
                  </td>
                  <td>{request.adminUsername || '—'}</td>
                  <td>{request.updatedAt ? new Date(request.updatedAt).toLocaleString() : '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-row">
                  {loading ? (
                    'Loading requests...'
                  ) : (
                    <>
                      <FileStack style={{ width: 26, height: 26, color: 'var(--text-muted)', marginBottom: '0.4rem' }} />
                      <strong>No requests found</strong>
                      Submit a new request to see it tracked here.
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyRequests;
