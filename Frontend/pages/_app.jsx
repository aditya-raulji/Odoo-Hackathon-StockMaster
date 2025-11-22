import React from 'react';
import { AuthProvider } from '@lib/auth-context';
import Layout from '@components/Layout';
import '@styles/globals.css';

function MyApp({ Component, pageProps }) {
  const isAuthPage = Component.isAuthPage;

  return (
    <AuthProvider>
      {isAuthPage ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </AuthProvider>
  );
}

export default MyApp;
