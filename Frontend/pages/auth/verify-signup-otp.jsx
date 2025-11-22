import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@lib/auth-context';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';

const VerifySignupOTP = () => {
  const router = useRouter();
  const { verifyOTP, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // Get email from session storage
    const signupEmail = sessionStorage.getItem('signupEmail');
    if (signupEmail) {
      setEmail(signupEmail);
    } else {
      router.push('/auth/signup');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (otp.length !== 6) {
      setFormError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      console.log('Verifying OTP:', otp, 'for email:', email);
      const response = await verifyOTP(otp, email);
      console.log('OTP verification successful:', response);
      setSuccess(true);
      // Clear session storage
      sessionStorage.removeItem('signupEmail');
      // Redirect to dashboard after 2 seconds (user is now logged in)
      setTimeout(() => {
        router.replace('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('OTP verification error:', err);
      const errorMsg = err.payload?.error?.message || error || 'OTP verification failed. Please check the OTP and try again.';
      setFormError(errorMsg);
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
          <h1 className="text-2xl font-bold text-neutral-900">Verify Email</h1>
          <p className="text-neutral-600 mt-2">Enter the OTP sent to your email</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card-lg p-8 space-y-6">
          {success && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg flex gap-3">
              <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
              <p className="text-sm text-success">Email verified! Redirecting to login...</p>
            </div>
          )}

          {formError && (
            <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{formError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="input bg-neutral-50 text-neutral-600"
            />
            <p className="text-xs text-neutral-500 mt-2">Check your email for the OTP</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">OTP (6 digits)</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                className="input pl-10 text-center text-2xl tracking-widest"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || success} 
            className="btn btn-primary w-full py-3"
          >
            {loading ? 'Verifying...' : success ? 'Verified!' : 'Verify OTP'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 space-y-3">
          <p className="text-center text-sm text-neutral-600">
            Didn't receive OTP?{' '}
            <button 
              onClick={() => router.push('/auth/signup')}
              className="text-primary font-medium hover:text-primary-dark"
            >
              Go back
            </button>
          </p>
          <p className="text-center text-xs text-neutral-500">
            OTP expires in 10 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

VerifySignupOTP.isAuthPage = true;

export default VerifySignupOTP;
