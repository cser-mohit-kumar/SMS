import React, { useEffect, useState } from 'react';
import { Check, X, PackageCheck, ClipboardCheck } from 'lucide-react';
import api from '../api/axiosConfig';
import StatusStamp from '../components/StatusStamp';
import './Requests.css';

const ManageRequests = () => {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [busyId, setBusyId] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/requests', {
        params: status ? { status } : {},
      });
      setRequests(response.data || []);
    } catch (err) {
      setError('Failed to load requests.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [status]);

  const updateRequest = async (id, action, body = {}) => {
    setMessage('');
    setError('');
    setBusyId(id);
    try {
      await api.put(`/api/requests/${id}/${action}`, body);
      setMessage(`Request ${action}ed successfully.`);
      setRejectingId(null);
      setRejectionReason('');
      loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} request.`);
    } finally {
      setBusyId(null);
    }
  };

  const startReject = (id) => {
    setRejectingId(id);
    setRejectionReason('');
    setMessage('');
    setError('');
  };

  const confirmReject = (id) => {
    updateRequest(id, 'reject', { rejectionReason: rejectionReason.trim() || 'Rejected by admin' });
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h1>Manage Requests</h1>
          <p className="page-subtitle">Approve, reject, or fulfill student stationery requests.</p>
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

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Student</th>
              <th>Status</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length ? (
              requests.map((request) => (
                <tr key={request.id}>
                  <td className="cell-id">{request.requestId}</td>
                  <td className="cell-strong">{request.studentUsername}</td>
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
                  <td className="action-cell">
                    {rejectingId === request.id ? (
                      <div className="reject-form">
                        <input
                          type="text"
                          placeholder="Reason for rejection"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          autoFocus
                        />
                        <button className="btn btn-sm btn-danger" disabled={busyId === request.id} onClick={() => confirmReject(request.id)}>
                          Confirm
                        </button>
                        <button className="btn btn-sm btn-ghost" disabled={busyId === request.id} onClick={() => setRejectingId(null)}>
                          Cancel
                        </button>
                      </div>
                    ) : request.status === 'PENDING' ? (
                      <>
                        <button className="btn btn-sm btn-accent" disabled={busyId === request.id} onClick={() => updateRequest(request.id, 'approve')}>
                          <Check /> Approve
                        </button>
                        <button className="btn btn-sm btn-danger" disabled={busyId === request.id} onClick={() => startReject(request.id)}>
                          <X /> Reject
                        </button>
                      </>
                    ) : request.status === 'APPROVED' ? (
                      <button className="btn btn-sm btn-accent" disabled={busyId === request.id} onClick={() => updateRequest(request.id, 'fulfill')}>
                        <PackageCheck /> Fulfill
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-row">
                  {loading ? (
                    'Loading requests...'
                  ) : (
                    <>
                      <ClipboardCheck style={{ width: 26, height: 26, color: 'var(--text-muted)', marginBottom: '0.4rem' }} />
                      <strong>No requests found</strong>
                      Requests submitted by students will appear here.
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

export default ManageRequests;
