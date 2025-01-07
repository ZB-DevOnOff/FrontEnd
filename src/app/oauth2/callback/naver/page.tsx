import { Suspense } from 'react';
import NaverCallbackClient from '../components/NaverCallbackClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const NaverCallbackPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NaverCallbackClient />
    </Suspense>
  );
};

export default NaverCallbackPage;
