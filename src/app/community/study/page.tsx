import { Suspense } from 'react';
import StudyList from '@/app/community/study/components/StudyList';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function StudyListPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StudyList />
    </Suspense>
  );
}
