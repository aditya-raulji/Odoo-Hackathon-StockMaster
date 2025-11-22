import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { api } from '@lib/api';
import { BarChart3, TrendingUp, Package, AlertCircle, Download, Filter } from 'lucide-react';

const Reports = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/reports?range=${dateRange}`);
        if (response.data) {
          setReportData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        setError('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchReports();
    }
  }, [isAuthenticated, dateRange]);

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/reports/export?format=${format}&range=${dateRange}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `stockmaster-report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
    } catch (error) {
      console.error('Failed to export report:', error);
      setError('Failed to export report');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Reports & Analytics</h1>
          <p className="text-neutral-600 mt-1">Inventory insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="btn btn-outline flex items-center gap-2"
          >
            <Download size={18} /> PDF
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="btn btn-outline flex items-center gap-2"
          >
            <Download size={18} /> CSV
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card-lg p-6">
        <div className="flex items-center gap-4">
          <Filter size={18} className="text-neutral-600" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-neutral-600">Loading reports...</div>
      ) : reportData ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Total Stock Value</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    ${reportData.totalStockValue?.toLocaleString() || '0'}
                  </p>
                </div>
                <Package size={24} className="text-primary" />
              </div>
              <p className="text-xs text-neutral-600">
                {reportData.totalItems || 0} items in inventory
              </p>
            </div>

            <div className="card-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Stock Movements</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {reportData.totalMovements || 0}
                  </p>
                </div>
                <TrendingUp size={24} className="text-secondary" />
              </div>
              <p className="text-xs text-neutral-600">
                {reportData.inboundMovements || 0} in, {reportData.outboundMovements || 0} out
              </p>
            </div>

            <div className="card-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Inventory Accuracy</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {reportData.inventoryAccuracy || '0'}%
                  </p>
                </div>
                <BarChart3 size={24} className="text-success" />
              </div>
              <p className="text-xs text-neutral-600">
                Based on physical counts
              </p>
            </div>

            <div className="card-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Low Stock Items</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {reportData.lowStockItems || 0}
                  </p>
                </div>
                <AlertCircle size={24} className="text-warning" />
              </div>
              <p className="text-xs text-neutral-600">
                Require reordering
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Movement Trend */}
            <div className="card-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">Stock Movement Trend</h3>
              <div className="space-y-4">
                {reportData.movementTrend?.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-600">{item.date}</span>
                      <span className="font-medium text-neutral-900">{item.count}</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(item.count / (reportData.movementTrend?.reduce((max, m) => Math.max(max, m.count), 0) || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="card-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">Top Products by Movement</h3>
              <div className="space-y-4">
                {reportData.topProducts?.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-900">{product.name}</p>
                      <p className="text-xs text-neutral-600">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900">{product.movements}</p>
                      <p className="text-xs text-neutral-600">movements</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Receipt Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Receipts</span>
                  <span className="font-medium text-neutral-900">{reportData.totalReceipts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Completed</span>
                  <span className="font-medium text-success">{reportData.completedReceipts || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Pending</span>
                  <span className="font-medium text-warning">{reportData.pendingReceipts || 0}</span>
                </div>
              </div>
            </div>

            <div className="card-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Delivery Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Deliveries</span>
                  <span className="font-medium text-neutral-900">{reportData.totalDeliveries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Completed</span>
                  <span className="font-medium text-success">{reportData.completedDeliveries || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Pending</span>
                  <span className="font-medium text-warning">{reportData.pendingDeliveries || 0}</span>
                </div>
              </div>
            </div>

            <div className="card-lg p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Transfer Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Total Transfers</span>
                  <span className="font-medium text-neutral-900">{reportData.totalTransfers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Completed</span>
                  <span className="font-medium text-success">{reportData.completedTransfers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Pending</span>
                  <span className="font-medium text-warning">{reportData.pendingTransfers || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Reports;
