import { Suspense } from 'react';
import StudyWriteForm from '@/app/community/study/write/components/StudyWriteForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function StudyWritePage() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">스터디 모집 글 작성</h1>
      <Suspense fallback={<LoadingSpinner />}>
        <StudyWriteForm />
      </Suspense>
    </div>
  );
}
