import { Suspense } from 'react';
import InfoList from '@/app/community/components/InfoList';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function InfoListPage() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<LoadingSpinner />}>
        <InfoList />
      </Suspense>
    </div>
  );
}
