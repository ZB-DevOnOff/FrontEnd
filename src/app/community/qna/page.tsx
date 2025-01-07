import { Suspense } from 'react';
import QnAList from '@/app/community/components/QnAList';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function QnAListPage() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<LoadingSpinner />}>
        <QnAList />
      </Suspense>
    </div>
  );
}
