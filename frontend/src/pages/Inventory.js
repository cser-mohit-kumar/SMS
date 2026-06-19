import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Plus, Pencil, Trash2, AlertTriangle, PackageSearch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import './Inventory.css';

const CATEGORIES = ['PAPER', 'PEN', 'PENCIL', 'NOTEBOOK', 'ERASER', 'MARKER', 'FOLDER', 'STAPLER', 'OTHER'];

const formatCategory = (value) =>
  value ? value.charAt(0) + value.slice(1).toLowerCase() : value;

const Inventory = () => {
  const { isAdmin } = useAuth();
  const admin = isAdmin();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const loadItems = async () => {
    setLoading(true);
    setError('');

    try {
      if (appliedSearch) {
        const response = await api.get('/api/inventory/search', { params: { keyword: appliedSearch } });
        setItems(response.data || []);
        setTotal(response.data?.length ?? 0);
      } else if (category) {
        const response = await api.get(`/api/inventory/category/${category}`, { params: { page, size } });
        setItems(response.data?.content || []);
        setTotal(response.data?.totalElements ?? 0);
      } else {
        const response = await api.get('/api/inventory', { params: { page, size, sortBy } });
        setItems(response.data?.content || []);
        setTotal(response.data?.totalElements ?? 0);
      }
    } catch (err) {
      setError('Failed to load inventory.');
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [page, size, category, sortBy, appliedSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setCategory('');
    setPage(0);
    setAppliedSearch(search.trim());
  };

  const clearSearch = () => {
    setSearch('');
    setAppliedSearch('');
    setPage(0);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setSearch('');
    setAppliedSearch('');
    setPage(0);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This action cannot be undone.`)) return;
    setActionError('');
    setActionSuccess('');
    try {
      await api.delete(`/api/inventory/${item.id}`);
      setActionSuccess(`"${item.name}" was deleted.`);
      loadItems();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  const isLow = (item) => item.availableQuantity <= item.minimumQuantity;
  const columnCount = admin ? 6 : 4;

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p className="page-subtitle">
            {admin
              ? 'Browse, filter, and manage the stationery catalog.'
              : 'Browse available stationery items in the catalog.'}
          </p>
        </div>
        {admin && (
          <div className="page-actions">
            <Link to="/inventory/add" className="btn btn-primary">
              <Plus /> Add New Item
            </Link>
          </div>
        )}
      </div>

      <form className="toolbar" onSubmit={handleSearch}>
        <div className="input-search-wrap">
          <Search />
          <input
            type="text"
            placeholder="Search items by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-search"
          />
        </div>
        <button type="submit" className="btn btn-secondary">Search</button>
        {appliedSearch && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={clearSearch}>
            <X /> Clear
          </button>
        )}

        <div className="field-control">
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            className="select-control"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{formatCategory(c)}</option>
            ))}
          </select>
        </div>

        <div className="field-control">
          <label htmlFor="sort-by">Sort By</label>
          <select
            id="sort-by"
            className="select-control"
            value={sortBy}
            onChange={handleSortChange}
            disabled={!!category || !!appliedSearch}
            title={category || appliedSearch ? 'Clear filters to change sort order' : undefined}
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="availableQuantity">Availability</option>
          </select>
        </div>
      </form>

      {error && <div className="alert alert-error">{error}</div>}
      {actionError && <div className="alert alert-error">{actionError}</div>}
      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Available</th>
              {admin && <th>Min Qty</th>}
              <th>Description</th>
              {admin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="cell-strong">{item.name}</td>
                  <td><span className="chip chip-muted">{formatCategory(item.category)}</span></td>
                  <td>
                    {item.availableQuantity} {item.unit}
                    {admin && isLow(item) && (
                      <span className="low-stock-flag"><AlertTriangle /> Low</span>
                    )}
                  </td>
                  {admin && <td>{item.minimumQuantity}</td>}
                  <td>{item.description || '—'}</td>
                  {admin && (
                    <td className="action-cell">
                      <Link to={`/inventory/edit/${item.id}`} className="action-link">
                        <Pencil style={{ width: 14, height: 14 }} /> Edit
                      </Link>
                      <button
                        type="button"
                        className="action-link"
                        style={{ color: 'var(--clay-600)' }}
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 style={{ width: 14, height: 14 }} /> Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnCount} className="empty-row">
                  {loading ? (
                    'Loading items...'
                  ) : (
                    <>
                      <PackageSearch style={{ width: 26, height: 26, color: 'var(--text-muted)', marginBottom: '0.4rem' }} />
                      <strong>No items found</strong>
                      Try a different search term or category.
                    </>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!appliedSearch && (
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            Previous
          </button>
          <span>Page {page + 1} • {total} items</span>
          <button
            className="pagination-btn"
            disabled={(page + 1) * size >= total}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Inventory;
