import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { api } from '@lib/api';
import { Plus, Eye, CheckCircle, Clock, AlertCircle, Truck } from 'lucide-react';

const DeliveriesManagement = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/movements?type=DELIVERY');
        if (response.data) {
          setDeliveries(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch deliveries:', error);
        setError('Failed to load deliveries');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDeliveries();
    }
  }, [isAuthenticated]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle size={16} className="text-success" />;
      case 'READY':
        return <Truck size={16} className="text-secondary" />;
      case 'DRAFT':
        return <AlertCircle size={16} className="text-neutral-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: 'bg-neutral-100 text-neutral-700',
      READY: 'bg-secondary/10 text-secondary',
      DONE: 'bg-success/10 text-success',
    };
    return statusMap[status] || 'bg-neutral-100 text-neutral-700';
  };

  const filteredDeliveries = filterStatus === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Delivery Orders</h1>
          <p className="text-neutral-600 mt-1">Manage outgoing stock to customers</p>
        </div>
        <Link href="/deliveries/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> New Delivery
        </Link>
      </div>

      {/* Status Filter */}
      <div className="card-lg p-6">
        <div className="flex gap-2">
          {['all', 'DRAFT', 'READY', 'DONE'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries Grid */}
      <div className="grid grid-cols-1 gap-4">
        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-neutral-600">Loading deliveries...</div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">No deliveries found</div>
        ) : (
          filteredDeliveries.map((delivery) => (
            <div key={delivery.id} className="card-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-neutral-900">{delivery.referenceNo}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(delivery.status)}`}>
                      {getStatusIcon(delivery.status)}
                      {delivery.status}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-3">
                    From: {delivery.fromLocation?.name || 'Unknown Location'}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-600">Items</p>
                      <p className="font-medium text-neutral-900">{delivery.lines?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Total Qty</p>
                      <p className="font-medium text-neutral-900">
                        {delivery.lines?.reduce((sum, line) => sum + line.quantity, 0) || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Created</p>
                      <p className="font-medium text-neutral-900">
                        {new Date(delivery.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/deliveries/${delivery.id}`}
                  className="btn btn-outline flex items-center gap-2"
                >
                  <Eye size={16} /> View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveriesManagement;
