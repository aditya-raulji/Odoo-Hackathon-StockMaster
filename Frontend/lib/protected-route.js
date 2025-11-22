import { useRouter } from 'next/router';
import { useAuth } from './auth-context';

export const withAuth = (Component, requiredRole = null) => {
  return function ProtectedComponent(props) {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();

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

    if (!isAuthenticated) {
      router.push('/auth/login');
      return null;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push('/dashboard');
      return null;
    }

    return <Component {...props} />;
  };
};

export const withoutAuth = (Component) => {
  return function PublicComponent(props) {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();

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

    if (isAuthenticated) {
      router.push('/dashboard');
      return null;
    }

    return <Component {...props} />;
  };
};
