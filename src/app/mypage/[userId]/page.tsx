import MyStudyView from '../components/MyStudyView';
import UserInfoView from '../components/UserInfoView';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

type PageParams = {
  params: Promise<{
    userId: string;
  }>;
};

export const metadata: Metadata = {
  title: '마이페이지 - 온오프라인 개발 스터디 플랫폼 DevOnOff',
  description: 'DevOnOff 마이페이지입니다.',
};

const fetchInitialUserData = async (userId: string) => {
  try {
    const [userDataRes, studiesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`, {
        next: { revalidate: 60 },
      }),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/study/author/${userId}?page=0`,
        { next: { revalidate: 60 } },
      ),
    ]);

    if (userDataRes.status === 404) return notFound();
    if (!userDataRes.ok || !studiesRes.ok) {
      throw new Error('UserData를 가져오는 데 실패했습니다.');
    }

    const [userData, studiesData] = await Promise.all([
      userDataRes.json(),
      studiesRes.json(),
    ]);

    return {
      userData,
      initialStudies: studiesData,
    };
  } catch (error) {
    console.error('UserData를 가져오는 데 실패했습니다.', error);
    throw error;
  }
};

const MyPage = async ({ params }: PageParams) => {
  const { userId } = await params;

  try {
    const { userData, initialStudies } = await fetchInitialUserData(userId);

    if (!userData) {
      redirect('/');
    }

    return (
      <div>
        <UserInfoView initialUserData={userData} />
        <MyStudyView userId={userData.id} initialStudies={initialStudies} />
      </div>
    );
  } catch {
    redirect('/');
  }
};

export default MyPage;
