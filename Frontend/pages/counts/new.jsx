import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { api } from '@lib/api';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const NewCount = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    referenceNo: `CNT-${Date.now()}`,
    locationId: '',
    notes: '',
    lines: [{ productId: '', physicalCount: 0 }],
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locRes, prodRes] = await Promise.all([
          api.get('/locations'),
          api.get('/products'),
        ]);
        setLocations(locRes.data || []);
        setProducts(prodRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load form data');
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index] = {
      ...newLines[index],
      [field]: field === 'physicalCount' ? parseInt(value) || 0 : value,
    };
    setFormData(prev => ({
      ...prev,
      lines: newLines,
    }));
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { productId: '', physicalCount: 0 }],
    }));
  };

  const removeLine = (index) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await api.post('/counts', formData);
      router.push('/counts');
    } catch (error) {
      console.error('Failed to create count:', error);
      setError(error.response?.data?.error?.message || 'Failed to create count');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/counts"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-neutral-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Create Inventory Count</h1>
          <p className="text-neutral-600 mt-1">Record physical inventory count</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="card-lg p-6 space-y-4">
          <h2 className="text-lg font-bold text-neutral-900">Count Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Reference No
              </label>
              <input
                type="text"
                name="referenceNo"
                value={formData.referenceNo}
                readOnly
                className="input bg-neutral-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Location *
              </label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleInputChange}
                required
                className="input"
              >
                <option value="">Select location</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="input"
                placeholder="Add any notes..."
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Items</h2>
            <button
              type="button"
              onClick={addLine}
              className="btn btn-outline flex items-center gap-2"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          <div className="space-y-3">
            {formData.lines.map((line, index) => (
              <div key={index} className="flex gap-3 items-end p-4 bg-neutral-50 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Product
                  </label>
                  <select
                    value={line.productId}
                    onChange={(e) => handleLineChange(index, 'productId', e.target.value)}
                    required
                    className="input"
                  >
                    <option value="">Select product</option>
                    {products.map(prod => (
                      <option key={prod.id} value={prod.id}>
                        {prod.name} ({prod.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Physical Count
                  </label>
                  <input
                    type="number"
                    value={line.physicalCount}
                    onChange={(e) => handleLineChange(index, 'physicalCount', e.target.value)}
                    min="0"
                    required
                    className="input"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="p-2 hover:bg-danger/10 rounded-lg text-danger"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/counts"
            className="flex-1 btn btn-outline"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Count'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCount;
