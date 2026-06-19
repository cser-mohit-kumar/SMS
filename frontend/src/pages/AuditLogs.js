import React, { useEffect, useState } from 'react';
import { Search, RefreshCw, FileText } from 'lucide-react';
import api from '../api/axiosConfig';
import './Requests.css'; // Leverage existing Request styling for tables and layout

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Client-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 12;

  const loadAuditLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/auth/audit');
      setLogs(response.data || []);
      setCurrentPage(1); // Reset to first page on load
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load audit logs.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const getActionBadgeClass = (action) => {
    if (action.includes('CREATED') || action.includes('APPROVED')) {
      return 'chip-role-student'; // Green-ish badge
    }
    if (action.includes('UPDATED') || action.includes('FULFILLED')) {
      return 'chip-muted'; // Neutral gray badge
    }
    if (action.includes('DELETED') || action.includes('REJECTED')) {
      return 'chip-role-admin'; // Red/gradient badge
    }
    return 'chip-muted';
  };

  const formatActionName = (action) => {
    return action.replace('_', ' ');
  };

  // Filter logs based on search and action type
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.username?.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter ? log.action === actionFilter : true;
    return matchesSearch && matchesAction;
  });

  // Get current logs for pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h1>System Audit Logs</h1>
          <p className="page-subtitle">Track all critical updates, inventory changes, and request actions (Admin only).</p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={loadAuditLogs}
          disabled={loading}
          title="Refresh Logs"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          Refresh
        </button>
      </div>

      <div className="toolbar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="field-control" style={{ flex: '1', minWidth: '250px' }}>
          <label htmlFor="search-input">Search logs</label>
          <div style={{ position: 'relative' }}>
            <input
              id="search-input"
              type="text"
              placeholder="Search by user or details..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              style={{ paddingLeft: '2.5rem', width: '100%', boxSizing: 'border-box' }}
            />
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '0.8rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </div>
        </div>

        <div className="field-control" style={{ minWidth: '200px' }}>
          <label htmlFor="action-filter">Filter by action</label>
          <select
            id="action-filter"
            className="select-control"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Actions</option>
            <option value="ITEM_CREATED">Item Created</option>
            <option value="ITEM_UPDATED">Item Updated</option>
            <option value="ITEM_DELETED">Item Deleted</option>
            <option value="REQUEST_CREATED">Request Created</option>
            <option value="REQUEST_APPROVED">Request Approved</option>
            <option value="REQUEST_REJECTED">Request Rejected</option>
            <option value="REQUEST_FULFILLED">Request Fulfilled</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '180px' }}>Timestamp</th>
              <th style={{ width: '180px' }}>User</th>
              <th style={{ width: '180px' }}>Action</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 1rem' }} />
                  Loading audit trail...
                </td>
              </tr>
            ) : currentLogs.length ? (
              currentLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span className="cell-strong">{log.username}</span>
                      <span
                        className={`chip chip-role-${log.userRole?.toLowerCase()}`}
                        style={{ fontSize: '0.7rem', width: 'fit-content', padding: '0.1rem 0.4rem' }}
                      >
                        {log.userRole || 'UNKNOWN'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`chip ${getActionBadgeClass(log.action)}`}>
                      {formatActionName(log.action)}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <FileText size={16} style={{ marginTop: '0.1rem', flexShrink: 0, color: 'var(--text-muted)' }} />
                      <span>{log.details}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No audit log entries match your search or filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              className={`btn btn-sm ${currentPage === number ? 'btn-accent' : 'btn-ghost'}`}
              onClick={() => paginate(number)}
            >
              {number}
            </button>
          ))}
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
