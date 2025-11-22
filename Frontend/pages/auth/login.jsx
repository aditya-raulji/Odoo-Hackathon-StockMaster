import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const router = useRouter();
  const { login, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push('/dashboard');
    } catch (err) {
      setFormError(error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome Back</h1>
          <p className="text-neutral-600 mt-2">Sign in to your Comet IMS account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-lg p-8 space-y-6">
          {formError && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{formError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input pl-10"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-neutral-700">Password</label>
              <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input pl-10"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs font-semibold text-primary mb-3">DEMO CREDENTIALS</p>
          <div className="space-y-2 text-xs">
            <div>
              <p className="text-neutral-600">Warehouse Staff:</p>
              <p className="font-mono text-neutral-700">guest@example.com / guest123</p>
            </div>
            <div>
              <p className="text-neutral-600">Inventory Manager:</p>
              <p className="font-mono text-neutral-700">manager@example.com / manager123</p>
            </div>
            <div>
              <p className="text-neutral-600">Admin (StockMaster):</p>
              <p className="font-mono text-neutral-700">admin@example.com / admin123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-neutral-600 mt-6">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-primary font-medium hover:text-primary-dark">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

Login.isAuthPage = true;

export default Login;
