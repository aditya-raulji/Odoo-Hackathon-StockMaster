import { useEffect } from 'react';
import { useRouter } from 'next/router';

const AuditLog = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/audit-log/index');
  }, [router]);

  return null;
};

export default AuditLog;
