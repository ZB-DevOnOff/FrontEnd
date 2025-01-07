import { Suspense } from 'react';
import VideoRoomComponent from '@/app/studyroom/components/VideoRoomComponents';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function StudyRoomPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VideoRoomComponent />
    </Suspense>
  );
}
