import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import DataTable from '@components/DataTable';
import { Plus, Filter } from 'lucide-react';

const Products = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([
    {
      id: 1,
      sku: 'SKU-001',
      name: 'Laptop Stand',
      category: 'Office Equipment',
      quantity: 45,
      reorderLevel: 10,
      status: 'in_stock',
    },
    {
      id: 2,
      sku: 'SKU-002',
      name: 'Wireless Mouse',
      category: 'Accessories',
      quantity: 8,
      reorderLevel: 20,
      status: 'low_stock',
    },
  ]);

  const columns = [
    { key: 'sku', label: 'SKU', sortable: true },
    { key: 'name', label: 'Product Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'quantity', label: 'Quantity', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span
          className={`badge ${
            status === 'in_stock'
              ? 'badge-secondary'
              : status === 'low_stock'
              ? 'badge-warning'
              : 'badge-danger'
          }`}
        >
          {status === 'in_stock' ? 'In Stock' : status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
        </span>
      ),
    },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
          <p className="text-neutral-600 mt-1">Manage your product catalog</p>
        </div>
        <Link href="/products/new" className="btn btn-primary">
          <Plus size={20} />
          New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-4 items-center">
        <Filter size={20} className="text-neutral-400" />
        <input
          type="text"
          placeholder="Search by SKU, name, or category..."
          className="input flex-1"
        />
        <select className="input w-48">
          <option>All Categories</option>
          <option>Office Equipment</option>
          <option>Accessories</option>
        </select>
        <select className="input w-40">
          <option>All Status</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        onRowClick={(row) => router.push(`/products/${row.id}`)}
        selectable
      />
    </div>
  );
};

export default Products;
