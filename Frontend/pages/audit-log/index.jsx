import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { api } from '@lib/api';
import { Search, Filter, Calendar } from 'lucide-react';

const AuditLog = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/audit-log');
        if (response.data) {
          setLogs(response.data);
          setFilteredLogs(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, filterAction, logs]);

  const getActionBadge = (action) => {
    const actionMap = {
      CREATE: 'bg-success/10 text-success',
      UPDATE: 'bg-primary/10 text-primary',
      DELETE: 'bg-danger/10 text-danger',
      APPROVE: 'bg-secondary/10 text-secondary',
    };
    return actionMap[action] || 'bg-neutral-100 text-neutral-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Audit Log</h1>
        <p className="text-neutral-600 mt-1">Track all system operations and changes</p>
      </div>

      {/* Filters */}
      <div className="card-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by user or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="input"
          >
            <option value="all">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="APPROVE">Approve</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card-lg p-6">
        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg mb-4 text-danger text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">User</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Action</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Entity</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Details</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-neutral-600">
                    Loading audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-neutral-600">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-neutral-900">{log.user}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{log.entity}</td>
                    <td className="py-3 px-4 text-neutral-600 text-sm">{log.details || '-'}</td>
                    <td className="py-3 px-4 text-neutral-600 text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLog;
