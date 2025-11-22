import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { api } from '@lib/api';
import DataTable from '@components/DataTable';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

const ProductsManagement = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
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
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/products');
        console.log('Products response:', response);
        
        // Backend returns { ok: true, data: [...], meta: {...} }
        let productsList = [];
        if (response.data?.ok && Array.isArray(response.data?.data)) {
          productsList = response.data.data;
        } else if (Array.isArray(response.data)) {
          productsList = response.data;
        }
        
        console.log('Parsed products:', productsList);
        setProducts(productsList);
        setFilteredProducts(productsList);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  // Handle search
  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleDelete = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError('Failed to delete product');
    }
  };

  const columns = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'minStockLevel', label: 'Min Stock', sortable: true },
    { key: 'reorderPoint', label: 'Reorder Point', sortable: true },
    { key: 'unitPrice', label: 'Unit Price', sortable: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
          <p className="text-neutral-600 mt-1">Manage your inventory products</p>
        </div>
        <Link href="/products/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> New Product
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="card-lg p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <button className="btn btn-outline flex items-center gap-2">
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="card-lg p-6">
        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg mb-4 text-danger text-sm">
            {error}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">SKU</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Product Name</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Min Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Reorder Point</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Unit Price</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-neutral-600">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-neutral-600">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4 text-neutral-900 font-medium">{product.sku}</td>
                    <td className="py-3 px-4 text-neutral-900">{product.name}</td>
                    <td className="py-3 px-4 text-neutral-600">{product.category || '-'}</td>
                    <td className="py-3 px-4 text-neutral-600">{product.minStockLevel}</td>
                    <td className="py-3 px-4 text-neutral-600">{product.reorderPoint}</td>
                    <td className="py-3 px-4 text-neutral-900 font-medium">${product.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link href={`/products/${product.id}`} className="p-2 hover:bg-primary/10 rounded-lg text-primary">
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(product.id)}
                          className="p-2 hover:bg-danger/10 rounded-lg text-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Delete Product?</h3>
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

export default ProductsManagement;
