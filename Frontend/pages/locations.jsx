import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@lib/auth-context';
import DataTable from '@components/DataTable';
import { Plus } from 'lucide-react';

const Locations = () => {
  const { isAuthenticated } = useAuth();
  const [locations, setLocations] = useState([
    { id: 1, name: 'Warehouse A', address: '123 Main St', capacity: 5000, used: 3200 },
    { id: 2, name: 'Warehouse B', address: '456 Oak Ave', capacity: 3000, used: 2100 },
  ]);

  const columns = [
    { key: 'name', label: 'Location Name', sortable: true },
    { key: 'address', label: 'Address', sortable: true },
    {
      key: 'used',
      label: 'Capacity',
      render: (_, row) => `${row.used}/${row.capacity}`,
    },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Locations</h1>
          <p className="text-neutral-600 mt-1">Manage warehouse locations</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} />
          New Location
        </button>
      </div>

      <DataTable columns={columns} data={locations} />
    </div>
  );
};

export default Locations;
