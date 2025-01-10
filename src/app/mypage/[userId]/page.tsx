import { Suspense } from 'react';
import MyStudyView from '../components/MyStudyView';
import UserInfoView from '../components/UserInfoView';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const MyPage = async () => {
  try {
    return (
      <>
        <Suspense fallback={<LoadingSpinner />}>
          <UserInfoView />
          <MyStudyView />
        </Suspense>
      </>
    );
  } catch (error) {
    console.error('내가 속한 스터디 목록 가져오기 실패', error);
    return (
      <>
        <h1>데이터 로딩 실패</h1>
        <p>잠시 후 다시 시도해 주세요.</p>
      </>
    );
  }
};

export default MyPage;
