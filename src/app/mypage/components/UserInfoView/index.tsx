import LoadingSpinner from '@/components/common/LoadingSpinner';
import { User } from '@/types/post';
import { Suspense } from 'react';
import UserInfoClient from './UserInfoClient';

interface UserInfoViewProps {
  initialUserData: User;
}

const UserInfoView = ({ initialUserData }: UserInfoViewProps) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UserInfoClient initialUserData={initialUserData} />
    </Suspense>
  );
};

export default UserInfoView;
