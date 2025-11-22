import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { api } from '@lib/api';
import KPICard from '@components/KPICard';
import DataTable from '@components/DataTable';
import { Package, AlertCircle, Truck, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [recentMovements, setRecentMovements] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [pendingOperations, setPendingOperations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch KPIs
        const kpisResponse = await api.get('/dashboard/kpis');
        if (kpisResponse.data) {
          setKpis(kpisResponse.data);
        }

        // Fetch recent movements
        const movementsResponse = await api.get('/dashboard/recent-movements?limit=10');
        if (movementsResponse.data) {
          setRecentMovements(movementsResponse.data);
        }

        // Fetch low stock alerts
        const alertsResponse = await api.get('/dashboard/low-stock-alerts');
        if (alertsResponse.data) {
          setLowStockAlerts(alertsResponse.data.slice(0, 5));
        }

        // Fetch pending operations
        const operationsResponse = await api.get('/dashboard/pending-operations');
        if (operationsResponse.data) {
          setPendingOperations(operationsResponse.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardData();
      // Refresh data every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const movementColumns = [
    { key: 'refNo', label: 'Reference', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'items', label: 'Items' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Welcome back! Here's your inventory overview.</p>
        </div>
        <Link href="/products/new" className="btn btn-primary">
          + New Product
        </Link>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <KPICard
            title="Total Products in Stock"
            value={kpis.totalProducts.toLocaleString()}
            icon={Package}
            color="primary"
            trend={5}
            trendLabel="vs last month"
          />
          <KPICard
            title="Low / Out of Stock"
            value={kpis.lowStockItems + kpis.outOfStock}
            icon={AlertCircle}
            color="danger"
            trend={-2}
            trendLabel="vs last month"
          />
          <KPICard
            title="Pending Operations"
            value={kpis.pendingReceipts + kpis.pendingDeliveries}
            icon={Truck}
            color="warning"
            trend={12}
            trendLabel="vs last month"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Movements */}
        <div className="lg:col-span-2">
          <div className="card-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Recent Movements</h2>
              <Link href="/movements" className="text-sm text-primary hover:text-primary-dark">
                View All →
              </Link>
            </div>
            <DataTable
              columns={movementColumns}
              data={recentMovements}
              loading={loading}
              onRowClick={(row) => console.log('Row clicked:', row)}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="card-lg p-6">
            <h3 className="font-bold text-neutral-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/receipts/new"
                className="block p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-colors"
              >
                <p className="font-medium text-neutral-900">New Receipt</p>
                <p className="text-sm text-neutral-600">Add incoming stock</p>
              </Link>
              <Link
                href="/deliveries/new"
                className="block p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 hover:from-secondary/20 hover:to-secondary/10 transition-colors"
              >
                <p className="font-medium text-neutral-900">New Delivery</p>
                <p className="text-sm text-neutral-600">Create outgoing order</p>
              </Link>
              <Link
                href="/transfers/new"
                className="block p-4 rounded-lg bg-gradient-to-br from-warning/10 to-warning/5 hover:from-warning/20 hover:to-warning/10 transition-colors"
              >
                <p className="font-medium text-neutral-900">New Transfer</p>
                <p className="text-sm text-neutral-600">Move between locations</p>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="card-lg p-6">
            <h3 className="font-bold text-neutral-900 mb-4">Inventory Health</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Stock Accuracy</span>
                  <span className="font-medium text-neutral-900">98%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Fulfillment Rate</span>
                  <span className="font-medium text-neutral-900">95%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
