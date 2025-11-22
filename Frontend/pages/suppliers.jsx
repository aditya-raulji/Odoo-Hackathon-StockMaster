import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@lib/auth-context';
import DataTable from '@components/DataTable';
import { Plus } from 'lucide-react';

const Suppliers = () => {
  const { isAuthenticated } = useAuth();
  const [suppliers, setSuppliers] = useState([
    { id: 1, name: 'ABC Supplies', email: 'contact@abc.com', phone: '+1-555-0001', status: 'active' },
    { id: 2, name: 'XYZ Corp', email: 'info@xyz.com', phone: '+1-555-0002', status: 'active' },
  ]);

  const columns = [
    { key: 'name', label: 'Supplier Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone' },
    {
      key: 'status',
      label: 'Status',
      render: (status) => <span className="badge badge-secondary">{status}</span>,
    },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Suppliers</h1>
          <p className="text-neutral-600 mt-1">Manage supplier information</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} />
          New Supplier
        </button>
      </div>

      <DataTable columns={columns} data={suppliers} />
    </div>
  );
};

export default Suppliers;
