import { Suspense } from 'react';
import KakaoCallbackClient from '../components/KakaoCallbackClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const KakaoCallbackPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <KakaoCallbackClient />
    </Suspense>
  );
};

export default KakaoCallbackPage;
