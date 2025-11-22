import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import DataTable from '@components/DataTable';
import { Plus, Filter } from 'lucide-react';

const Deliveries = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [deliveries, setDeliveries] = useState([
    {
      id: 1,
      refNo: 'DEL-001',
      customer: 'Customer A',
      date: '2024-01-15',
      items: 8,
      status: 'done',
    },
    {
      id: 2,
      refNo: 'DEL-002',
      customer: 'Customer B',
      date: '2024-01-14',
      items: 5,
      status: 'ready',
    },
  ]);

  const columns = [
    { key: 'refNo', label: 'Reference', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
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
          <h1 className="text-3xl font-bold text-neutral-900">Deliveries</h1>
          <p className="text-neutral-600 mt-1">Manage outgoing orders</p>
        </div>
        <Link href="/deliveries/new" className="btn btn-primary">
          <Plus size={20} />
          New Delivery
        </Link>
      </div>

      <div className="card p-4 flex gap-4 items-center">
        <Filter size={20} className="text-neutral-400" />
        <input type="text" placeholder="Search by reference or customer..." className="input flex-1" />
        <select className="input w-40">
          <option>All Status</option>
          <option>Draft</option>
          <option>Ready</option>
          <option>Done</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={deliveries}
        onRowClick={(row) => router.push(`/deliveries/${row.id}`)}
        selectable
      />
    </div>
  );
};

export default Deliveries;
