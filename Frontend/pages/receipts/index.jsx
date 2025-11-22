import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { movementService } from '@lib/services';
import DataTable from '@components/DataTable';
import { Plus, Filter } from 'lucide-react';

const Receipts = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReceipts();
    }
  }, [isAuthenticated, page]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await movementService.getAll(page, 20, { type: 'receipt' });
      setReceipts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'refNo', label: 'Reference', sortable: true },
    { key: 'supplier', label: 'Supplier', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'items', label: 'Items' },
    { key: 'total', label: 'Total', render: (val) => `$${val}` },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <span className={`badge badge-${status === 'done' ? 'secondary' : 'warning'}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
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
          <h1 className="text-3xl font-bold text-neutral-900">Receipts</h1>
          <p className="text-neutral-600 mt-1">Manage incoming stock</p>
        </div>
        <Link href="/receipts/new" className="btn btn-primary">
          <Plus size={20} />
          New Receipt
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex gap-4 items-center">
        <Filter size={20} className="text-neutral-400" />
        <input type="text" placeholder="Search by reference or supplier..." className="input flex-1" />
        <select className="input w-40">
          <option>All Status</option>
          <option>Draft</option>
          <option>Ready</option>
          <option>Done</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={receipts}
        onRowClick={(row) => router.push(`/receipts/${row.id}`)}
        selectable
      />
    </div>
  );
};

export default Receipts;
