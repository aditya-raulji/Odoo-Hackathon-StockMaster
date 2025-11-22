import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { api } from '@lib/api';
import { Plus, Edit2, Trash2, MapPin, Package } from 'lucide-react';

const LocationsManagement = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/locations');
        if (response.data) {
          setLocations(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch locations:', error);
        setError('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLocations();
    }
  }, [isAuthenticated]);

  const handleDelete = async (locationId) => {
    try {
      await api.delete(`/locations/${locationId}`);
      setLocations(locations.filter(l => l.id !== locationId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete location:', error);
      setError('Failed to delete location');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Warehouse Locations</h1>
          <p className="text-neutral-600 mt-1">Manage your storage locations and warehouses</p>
        </div>
        <Link href="/locations/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> New Location
        </Link>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {error && (
          <div className="col-span-full p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="col-span-full text-center py-8 text-neutral-600">Loading locations...</div>
        ) : locations.length === 0 ? (
          <div className="col-span-full text-center py-8 text-neutral-600">No locations found</div>
        ) : (
          locations.map((location) => (
            <div key={location.id} className="card-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">{location.name}</h3>
                    <p className="text-sm text-neutral-600">{location.code}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/locations/${location.id}`}
                    className="p-2 hover:bg-primary/10 rounded-lg text-primary"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <button
                    onClick={() => setDeleteConfirm(location.id)}
                    className="p-2 hover:bg-danger/10 rounded-lg text-danger"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Type</p>
                  <p className="font-medium text-neutral-900">{location.type}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Address</p>
                  <p className="font-medium text-neutral-900">{location.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600 mb-1">Capacity</p>
                  <p className="font-medium text-neutral-900">{location.capacity || 'Unlimited'}</p>
                </div>
                <div className="pt-3 border-t border-neutral-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Package size={16} className="text-neutral-600" />
                    <span className="text-neutral-600">
                      {location.products?.length || 0} products in stock
                    </span>
                  </div>
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
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Delete Location?</h3>
            <p className="text-neutral-600 mb-6">This action cannot be undone. Make sure no stock is stored here.</p>
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

export default LocationsManagement;
