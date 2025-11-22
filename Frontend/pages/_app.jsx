import React from 'react';
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '@lib/auth-context';
import Layout from '@components/Layout';
import '@styles/globals.css';

// Protected route wrapper
function ProtectedApp({ Component, pageProps }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const isAuthPage = Component.isAuthPage;

  // Auth pages that should NOT be accessible when logged in
  const publicAuthPages = ['/auth/login', '/auth/signup', '/auth/manager-signup', '/auth/forgot-password', '/'];
  
  // Protected pages that require authentication
  const protectedPages = [
    '/dashboard',
    '/products',
    '/receipts',
    '/deliveries',
    '/transfers',
    '/adjustments',
    '/counts',
    '/locations',
    '/staff',
    '/suppliers',
    '/reports',
    '/audit-log',
    '/notifications',
    '/settings',
  ];

  React.useEffect(() => {
    // If user is authenticated and tries to access public auth pages, redirect to dashboard
    if (!loading && isAuthenticated && publicAuthPages.includes(router.pathname)) {
      console.log('User authenticated, redirecting from', router.pathname, 'to dashboard');
      router.replace('/dashboard');
    }
    
    // If user is NOT authenticated and tries to access protected pages, redirect to login
    if (!loading && !isAuthenticated && protectedPages.some(page => router.pathname.startsWith(page))) {
      console.log('User not authenticated, redirecting from', router.pathname, 'to login');
      router.replace('/auth/login');
    }
  }, [isAuthenticated, loading, router.pathname, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and on public auth page, don't render
  if (isAuthenticated && publicAuthPages.includes(router.pathname)) {
    return null;
  }
  
  // If user is NOT authenticated and on protected page, don't render
  if (!isAuthenticated && protectedPages.some(page => router.pathname.startsWith(page))) {
    return null;
  }

  return isAuthPage ? (
    <Component {...pageProps} />
  ) : (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ProtectedApp Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
