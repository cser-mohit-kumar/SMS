import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PackagePlus } from 'lucide-react';
import api from '../api/axiosConfig';
import './FormPage.css';

const CATEGORIES = ['PAPER', 'PEN', 'PENCIL', 'NOTEBOOK', 'ERASER', 'MARKER', 'FOLDER', 'STAPLER', 'OTHER'];

const formatCategory = (value) =>
  value ? value.charAt(0) + value.slice(1).toLowerCase() : value;

const AddItem = () => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    unit: '',
    availableQuantity: '',
    minimumQuantity: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.category || !form.unit || !form.availableQuantity || !form.minimumQuantity) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/inventory', {
        name: form.name,
        category: form.category,
        unit: form.unit,
        availableQuantity: Number(form.availableQuantity),
        minimumQuantity: Number(form.minimumQuantity),
        description: form.description,
      });
      setSuccess('Item created successfully.');
      setTimeout(() => navigate('/inventory'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card form-card">
      <div className="page-header">
        <div>
          <Link to="/inventory" className="action-link" style={{ marginBottom: '0.6rem' }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to inventory
          </Link>
          <h1>Add Inventory Item</h1>
          <p className="page-subtitle">Create a new stationery item for the catalog.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="name">Name <span className="required">*</span></label>
          <input id="name" className="form-input" name="name" value={form.name} onChange={handleChange} disabled={loading} placeholder="e.g. A4 Ruled Notebook" />
        </div>

        <div className="form-field">
          <label htmlFor="category">Category <span className="required">*</span></label>
          <select id="category" className="form-select" name="category" value={form.category} onChange={handleChange} disabled={loading}>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{formatCategory(c)}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="unit">Unit <span className="required">*</span></label>
          <input id="unit" className="form-input" name="unit" value={form.unit} onChange={handleChange} disabled={loading} placeholder="e.g. piece, box, ream" />
        </div>

        <div className="form-field" />

        <div className="form-field">
          <label htmlFor="availableQuantity">Available Quantity <span className="required">*</span></label>
          <input id="availableQuantity" className="form-input" name="availableQuantity" type="number" min="0" value={form.availableQuantity} onChange={handleChange} disabled={loading} />
        </div>

        <div className="form-field">
          <label htmlFor="minimumQuantity">Minimum Quantity <span className="required">*</span></label>
          <input id="minimumQuantity" className="form-input" name="minimumQuantity" type="number" min="0" value={form.minimumQuantity} onChange={handleChange} disabled={loading} />
          <span className="form-hint">Items at or below this level will show a low-stock flag.</span>
        </div>

        <div className="form-field full-width">
          <label htmlFor="description">Description</label>
          <textarea id="description" className="form-textarea" name="description" value={form.description} onChange={handleChange} disabled={loading} placeholder="Optional notes about this item" />
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <PackagePlus /> {loading ? 'Creating...' : 'Create Item'}
          </button>
          <Link to="/inventory" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default AddItem;
