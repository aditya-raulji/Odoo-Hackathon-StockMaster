import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@lib/auth-context';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const { requestOTP, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    try {
      await requestOTP(email);
      setSubmitted(true);
    } catch (err) {
      setFormError(error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-secondary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Check Your Email</h1>
            <p className="text-neutral-600 mb-6">
              We've sent an OTP to <strong>{email}</strong>. Enter it on the next page to reset your password.
            </p>
            <Link href="/auth/verify-otp" className="btn btn-primary w-full">
              Enter OTP
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-neutral-900">Reset Password</h1>
          <p className="text-neutral-600 mt-2">Enter your email to receive an OTP</p>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input pl-10"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3">
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-neutral-600 mt-6">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-primary font-medium hover:text-primary-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

ForgotPassword.isAuthPage = true;

export default ForgotPassword;
