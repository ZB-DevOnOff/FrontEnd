import { Suspense } from 'react';
import MyStudyClient from './MyStudyClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { MyStudyCardData } from '../MyStudyCard';

interface MyStudyViewProps {
  userId: number;
  initialStudies: MyStudyCardData[];
}

const MyStudyView = ({ userId, initialStudies }: MyStudyViewProps) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MyStudyClient userId={userId} initialStudies={initialStudies} />
    </Suspense>
  );
};

export default MyStudyView;
