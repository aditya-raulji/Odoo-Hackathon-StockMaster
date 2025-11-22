import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Suppliers = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/suppliers/manage');
  }, [router]);

  return null;
};

export default Suppliers;
