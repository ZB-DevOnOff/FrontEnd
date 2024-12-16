import MyStudyView from '../components/MyStudyView';
import UserInfoView from '../components/UserInfoView';

const MyPage = async () => {
  try {
    return (
      <>
        <UserInfoView />
        <MyStudyView />
      </>
    );
  } catch (error) {
    console.error('내가 속한 스터디 목록 가져오기 실패');
    return (
      <>
        <h1>데이터 로딩 실패</h1>
        <p>잠시 후 다시 시도해주세요.</p>
      </>
    );
  }
};

export default MyPage;
