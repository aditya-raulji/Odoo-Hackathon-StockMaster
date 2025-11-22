import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { api } from '@lib/api';
import { Plus, Edit2, Trash2, Search, Building2 } from 'lucide-react';

const SuppliersManagement = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/suppliers');
        if (response.data) {
          setSuppliers(response.data);
          setFilteredSuppliers(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
        setError('Failed to load suppliers');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSuppliers();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers]);

  const handleDelete = async (supplierId) => {
    try {
      await api.delete(`/suppliers/${supplierId}`);
      setSuppliers(suppliers.filter(s => s.id !== supplierId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      setError('Failed to delete supplier');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Suppliers</h1>
          <p className="text-neutral-600 mt-1">Manage your supplier contacts</p>
        </div>
        <Link href="/suppliers/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> New Supplier
        </Link>
      </div>

      {/* Search */}
      <div className="card-lg p-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {error && (
          <div className="col-span-full p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="col-span-full text-center py-8 text-neutral-600">Loading suppliers...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-neutral-600">No suppliers found</div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="card-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">{supplier.name}</h3>
                    <p className="text-sm text-neutral-600">{supplier.city}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/suppliers/${supplier.id}`}
                    className="p-2 hover:bg-primary/10 rounded-lg text-primary"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(supplier.id)}
                    className="p-2 hover:bg-danger/10 rounded-lg text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-neutral-600">Email</p>
                  <p className="font-medium text-neutral-900">{supplier.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Phone</p>
                  <p className="font-medium text-neutral-900">{supplier.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Address</p>
                  <p className="font-medium text-neutral-900">{supplier.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Delete Supplier?</h3>
            <p className="text-neutral-600 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 btn btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersManagement;
