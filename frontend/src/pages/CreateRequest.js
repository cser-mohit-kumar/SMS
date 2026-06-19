import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Send, ClipboardList } from 'lucide-react';
import api from '../api/axiosConfig';
import './FormPage.css';

const CreateRequest = () => {
  const [items, setItems] = useState([]);
  const [requestItems, setRequestItems] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await api.get('/api/inventory', { params: { page: 0, size: 100, sortBy: 'name' } });
        setItems(response.data.content || []);
      } catch (err) {
        setError('Failed to load inventory items.');
      }
    };

    loadItems();
  }, []);

  const findItem = (itemId) => items.find((item) => String(item.id) === String(itemId));

  const addItem = () => {
    setRequestItems((prev) => [...prev, { itemId: '', itemName: '', quantity: 1 }]);
  };

  const handleItemChange = (index, field, value) => {
    setRequestItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'itemId') {
        const selected = findItem(value);
        next[index].itemName = selected?.name || '';
      }
      return next;
    });
  };

  const removeItem = (index) => {
    setRequestItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const exceedsStock = (row) => {
    const item = findItem(row.itemId);
    return !!item && Number(row.quantity || 0) > item.availableQuantity;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!requestItems.length) {
      setError('Add at least one item to create a request.');
      return;
    }

    const payload = requestItems.map((row) => ({
      itemId: Number(row.itemId),
      itemName: row.itemName,
      quantity: Number(row.quantity),
    }));

    if (payload.some((row) => !row.itemId || row.quantity < 1)) {
      setError('Select valid items and quantities.');
      return;
    }

    if (requestItems.some(exceedsStock)) {
      setError('One or more items exceed the currently available stock. Adjust quantities to continue.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/api/requests', { items: payload });
      setSuccess('Request created successfully.');
      setTimeout(() => navigate('/requests/my'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card form-card">
      <div className="page-header">
        <div>
          <h1>Create Request</h1>
          <p className="page-subtitle">Submit a new stationery request from available inventory.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="request-toolbar">
        <button type="button" className="btn btn-secondary" onClick={addItem}>
          <Plus /> Add Item
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {requestItems.length ? (
          <div className="request-rows">
            {requestItems.map((row, index) => {
              const selected = findItem(row.itemId);
              const warning = exceedsStock(row);
              return (
                <div className="request-row" key={index}>
                  <div>
                    <select
                      className="form-select"
                      value={row.itemId}
                      onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                      disabled={loading}
                    >
                      <option value="">Select item</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.availableQuantity} {item.unit} available)
                        </option>
                      ))}
                    </select>
                    {selected && (
                      <div className={`request-stock-note ${warning ? 'is-warning' : ''}`}>
                        {warning
                          ? `Only ${selected.availableQuantity} ${selected.unit} available`
                          : `${selected.availableQuantity} ${selected.unit} in stock`}
                      </div>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={row.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    disabled={loading}
                    placeholder="Qty"
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-icon"
                    disabled={loading}
                    onClick={() => removeItem(index)}
                    aria-label="Remove item"
                  >
                    <Trash2 />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="request-empty">
            <ClipboardList style={{ width: 28, height: 28, color: 'var(--sage-400)', marginBottom: '0.5rem' }} />
            <strong>No items added yet</strong>
            Click "Add Item" above to start building your request.
          </div>
        )}

        <div className="form-actions" style={{ marginTop: '1.25rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading || !requestItems.length}>
            <Send /> {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          <Link to="/requests/my" className="btn btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  );
};

export default CreateRequest;
