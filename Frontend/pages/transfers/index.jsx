import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import DataTable from '@components/DataTable';
import { Plus, Filter } from 'lucide-react';

const Transfers = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [transfers, setTransfers] = useState([
    {
      id: 1,
      refNo: 'TRF-001',
      from: 'Warehouse A',
      to: 'Warehouse B',
      date: '2024-01-15',
      items: 12,
      status: 'done',
    },
    {
      id: 2,
      refNo: 'TRF-002',
      from: 'Warehouse B',
      to: 'Warehouse C',
      date: '2024-01-14',
      items: 7,
      status: 'ready',
    },
  ]);

  const columns = [
    { key: 'refNo', label: 'Reference', sortable: true },
    { key: 'from', label: 'From', sortable: true },
    { key: 'to', label: 'To', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'items', label: 'Items' },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Internal Transfers</h1>
          <p className="text-neutral-600 mt-1">Manage stock movements between locations</p>
        </div>
        <Link href="/transfers/new" className="btn btn-primary">
          <Plus size={20} />
          New Transfer
        </Link>
      </div>

      <div className="card p-4 flex gap-4 items-center">
        <Filter size={20} className="text-neutral-400" />
        <input type="text" placeholder="Search by reference..." className="input flex-1" />
        <select className="input w-40">
          <option>All Status</option>
          <option>Draft</option>
          <option>Ready</option>
          <option>Done</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={transfers}
        onRowClick={(row) => router.push(`/transfers/${row.id}`)}
        selectable
      />
    </div>
  );
};

export default Transfers;
