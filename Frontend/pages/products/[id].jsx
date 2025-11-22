import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';

const ProductDetail = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState('overview');

  if (!isAuthenticated) return null;

  const product = {
    id,
    sku: 'SKU-001',
    name: 'Laptop Stand',
    description: 'Ergonomic aluminum laptop stand',
    category: 'Office Equipment',
    unit: 'pcs',
    reorderLevel: 10,
    locations: [
      { name: 'Warehouse A', quantity: 25 },
      { name: 'Warehouse B', quantity: 20 },
    ],
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'movements', label: 'Stock Movements' },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'audit', label: 'Audit Log' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary hover:text-primary-dark"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        <div className="flex gap-3">
          <button className="btn btn-outline btn-sm">
            <Edit size={16} />
            Edit
          </button>
          <button className="btn btn-danger btn-sm">
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="card-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{product.name}</h1>
            <p className="text-neutral-600 mb-4">{product.description}</p>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-neutral-600">SKU:</span>{' '}
                <span className="font-medium">{product.sku}</span>
              </p>
              <p>
                <span className="text-neutral-600">Category:</span>{' '}
                <span className="font-medium">{product.category}</span>
              </p>
              <p>
                <span className="text-neutral-600">Unit:</span>{' '}
                <span className="font-medium">{product.unit}</span>
              </p>
              <p>
                <span className="text-neutral-600">Reorder Level:</span>{' '}
                <span className="font-medium">{product.reorderLevel}</span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-neutral-900 mb-4">Stock by Location</h3>
            <div className="space-y-3">
              {product.locations.map((loc, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-neutral-700">{loc.name}</span>
                  <span className="font-bold text-primary">{loc.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-lg overflow-hidden">
        <div className="flex border-b border-neutral-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="text-neutral-600">
              <p>Product overview content goes here</p>
            </div>
          )}
          {activeTab === 'movements' && (
            <div className="text-neutral-600">
              <p>Stock movements history goes here</p>
            </div>
          )}
          {activeTab === 'suppliers' && (
            <div className="text-neutral-600">
              <p>Supplier information goes here</p>
            </div>
          )}
          {activeTab === 'audit' && (
            <div className="text-neutral-600">
              <p>Audit log goes here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
