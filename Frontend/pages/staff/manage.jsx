import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { api } from '@lib/api';
import { Plus, Edit2, Trash2, Users, Shield, AlertCircle } from 'lucide-react';

const StaffManagement = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    // Check if user is admin (STOCKMASTER role)
    if (!authLoading && user && user.role !== 'STOCKMASTER') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/staff');
        if (response.data) {
          setStaff(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch staff:', error);
        setError('Failed to load staff members');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'STOCKMASTER') {
      fetchStaff();
    }
  }, [isAuthenticated, user]);

  const handleDelete = async (staffId) => {
    try {
      await api.delete(`/staff/${staffId}`);
      setStaff(staff.filter(s => s.id !== staffId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete staff:', error);
      setError('Failed to delete staff member');
    }
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      STOCKMASTER: 'bg-danger/10 text-danger',
      INVENTORY_MANAGER: 'bg-secondary/10 text-secondary',
      WAREHOUSE_STAFF: 'bg-primary/10 text-primary',
      VIEWER: 'bg-neutral-100 text-neutral-700',
    };
    return roleMap[role] || 'bg-neutral-100 text-neutral-700';
  };

  const getRoleLabel = (role) => {
    const roleMap = {
      STOCKMASTER: 'Admin',
      INVENTORY_MANAGER: 'Inventory Manager',
      WAREHOUSE_STAFF: 'Warehouse Staff',
      VIEWER: 'Viewer',
    };
    return roleMap[role] || role;
  };

  const filteredStaff = filterRole === 'all' 
    ? staff 
    : staff.filter(s => s.role === filterRole);

  if (!isAuthenticated || user?.role !== 'STOCKMASTER') {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Staff Management</h1>
          <p className="text-neutral-600 mt-1">Manage team members and their roles</p>
        </div>
        <Link href="/staff/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Staff Member
        </Link>
      </div>

      {/* Role Filter */}
      <div className="card-lg p-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'STOCKMASTER', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF', 'VIEWER'].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterRole === role
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {role === 'all' ? 'All Roles' : getRoleLabel(role)}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Table */}
      <div className="card-lg p-6">
        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg mb-4 text-danger text-sm flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Last Login</th>
                <th className="text-left py-3 px-4 font-semibold text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-600">
                    Loading staff members...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-neutral-600">
                    No staff members found
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {member.firstName} {member.lastName}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">{member.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                        {getRoleLabel(member.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.isActive 
                          ? 'bg-success/10 text-success' 
                          : 'bg-neutral-100 text-neutral-700'
                      }`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-neutral-600 text-sm">
                      {member.lastLogin 
                        ? new Date(member.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link href={`/staff/${member.id}`} className="p-2 hover:bg-primary/10 rounded-lg text-primary">
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(member.id)}
                          className="p-2 hover:bg-danger/10 rounded-lg text-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Remove Staff Member?</h3>
            <p className="text-neutral-600 mb-6">This action cannot be undone. The user will lose access to the system.</p>
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
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
