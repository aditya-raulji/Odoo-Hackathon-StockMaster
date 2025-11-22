import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { api } from '@lib/api';
import { Plus, Eye, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

const TransfersManagement = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchTransfers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/movements?type=TRANSFER');
        if (response.data) {
          setTransfers(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch transfers:', error);
        setError('Failed to load transfers');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchTransfers();
    }
  }, [isAuthenticated]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle size={16} className="text-success" />;
      case 'WAITING':
        return <Clock size={16} className="text-warning" />;
      case 'DRAFT':
        return <AlertCircle size={16} className="text-neutral-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: 'bg-neutral-100 text-neutral-700',
      WAITING: 'bg-warning/10 text-warning',
      DONE: 'bg-success/10 text-success',
    };
    return statusMap[status] || 'bg-neutral-100 text-neutral-700';
  };

  const filteredTransfers = filterStatus === 'all' 
    ? transfers 
    : transfers.filter(t => t.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Internal Transfers</h1>
          <p className="text-neutral-600 mt-1">Move stock between warehouse locations</p>
        </div>
        <Link href="/transfers/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> New Transfer
        </Link>
      </div>

      {/* Status Filter */}
      <div className="card-lg p-6">
        <div className="flex gap-2">
          {['all', 'DRAFT', 'WAITING', 'DONE'].map((status) => (
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

      {/* Transfers Grid */}
      <div className="grid grid-cols-1 gap-4">
        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-neutral-600">Loading transfers...</div>
        ) : filteredTransfers.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">No transfers found</div>
        ) : (
          filteredTransfers.map((transfer) => (
            <div key={transfer.id} className="card-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-neutral-900">{transfer.referenceNo}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(transfer.status)}`}>
                      {getStatusIcon(transfer.status)}
                      {transfer.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
                    <span className="font-medium">{transfer.fromLocation?.name || 'Unknown'}</span>
                    <ArrowRight size={16} />
                    <span className="font-medium">{transfer.toLocation?.name || 'Unknown'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-600">Items</p>
                      <p className="font-medium text-neutral-900">{transfer.lines?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Total Qty</p>
                      <p className="font-medium text-neutral-900">
                        {transfer.lines?.reduce((sum, line) => sum + line.quantity, 0) || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Created</p>
                      <p className="font-medium text-neutral-900">
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/transfers/${transfer.id}`}
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

export default TransfersManagement;
