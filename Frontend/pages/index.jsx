import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { Package, Truck, BarChart3, Users, Lock } from 'lucide-react';

const Home = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-lg text-neutral-900">Comet IMS</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login" className="btn btn-outline">
              Login
            </Link>
            <Link href="/auth/signup" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-neutral-900 mb-6 leading-tight">
              Modern Inventory Management, Simplified
            </h1>
            <p className="text-xl text-neutral-600 mb-8">
              Comet IMS is a powerful, intuitive inventory management system designed for modern warehouses. Track stock, manage receipts & deliveries, and optimize your supply chain in real-time.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/signup" className="btn btn-primary btn-lg">
                Start Free Trial
              </Link>
              <Link href="/help" className="btn btn-outline btn-lg">
                Learn More
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="card-lg p-6 bg-gradient-to-br from-primary/10 to-primary/5">
              <Package size={32} className="text-primary mb-4" />
              <h3 className="font-bold text-neutral-900 mb-2">Product Management</h3>
              <p className="text-sm text-neutral-600">Track SKUs, categories, and stock levels across locations</p>
            </div>
            <div className="card-lg p-6 bg-gradient-to-br from-secondary/10 to-secondary/5">
              <Truck size={32} className="text-secondary mb-4" />
              <h3 className="font-bold text-neutral-900 mb-2">Logistics</h3>
              <p className="text-sm text-neutral-600">Manage receipts, deliveries, and transfers seamlessly</p>
            </div>
            <div className="card-lg p-6 bg-gradient-to-br from-warning/10 to-warning/5">
              <BarChart3 size={32} className="text-warning mb-4" />
              <h3 className="font-bold text-neutral-900 mb-2">Analytics</h3>
              <p className="text-sm text-neutral-600">Get insights with ABC analysis and valuation reports</p>
            </div>
            <div className="card-lg p-6 bg-gradient-to-br from-danger/10 to-danger/5">
              <Users size={32} className="text-danger mb-4" />
              <h3 className="font-bold text-neutral-900 mb-2">Team Collaboration</h3>
              <p className="text-sm text-neutral-600">Assign tasks and track team performance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-neutral-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: 'Role-Based Access',
                description: 'Inventory Managers, Warehouse Staff, and StockMaster roles with granular permissions',
              },
              {
                icon: Package,
                title: 'Real-Time Tracking',
                description: 'Live inventory updates across multiple warehouse locations',
              },
              {
                icon: BarChart3,
                title: 'Advanced Reports',
                description: 'Stock valuation, movement analysis, and ABC classification',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="card p-8">
                  <Icon size={32} className="text-primary mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{feature.title}</h3>
                  <p className="text-neutral-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-neutral-900 mb-6">Ready to streamline your inventory?</h2>
        <p className="text-lg text-neutral-600 mb-8">Join hundreds of warehouses using Comet IMS</p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signup" className="btn btn-primary btn-lg">
            Get Started Now
          </Link>
          <Link href="/auth/login" className="btn btn-outline btn-lg">
            Try Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-300 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; 2024 Comet IMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

Home.isAuthPage = true;

export default Home;
