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

      <div className="toolbar">
        <div className="field-control">
          <label htmlFor="status-filter">Filter by status</label>
          <select id="status-filter" className="select-control" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="FULFILLED">Fulfilled</option>
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
            {requests.length ? (
              requests.map((request) => (
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
