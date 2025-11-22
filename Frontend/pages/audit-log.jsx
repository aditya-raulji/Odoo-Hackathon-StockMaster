import React, { useState } from 'react';
import { useAuth } from '@lib/auth-context';
import DataTable from '@components/DataTable';
import { Filter } from 'lucide-react';

const AuditLog = () => {
  const { isAuthenticated } = useAuth();
  const [logs, setLogs] = useState([
    {
      id: 1,
      timestamp: '2024-01-15 14:30',
      user: 'John Doe',
      action: 'Created Receipt',
      entity: 'REC-001',
      details: 'Added 5 items',
    },
    {
      id: 2,
      timestamp: '2024-01-15 13:15',
      user: 'Jane Smith',
      action: 'Updated Product',
      entity: 'SKU-001',
      details: 'Changed reorder level',
    },
  ]);

  const columns = [
    { key: 'timestamp', label: 'Timestamp', sortable: true },
    { key: 'user', label: 'User', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'entity', label: 'Entity', sortable: true },
    { key: 'details', label: 'Details' },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Audit Log</h1>
        <p className="text-neutral-600 mt-1">System activity and changes</p>
      </div>

      <div className="card p-4 flex gap-4 items-center">
        <Filter size={20} className="text-neutral-400" />
        <input type="text" placeholder="Search by user, action, or entity..." className="input flex-1" />
        <input type="date" className="input w-40" />
      </div>

      <DataTable columns={columns} data={logs} />
    </div>
  );
};

export default AuditLog;
