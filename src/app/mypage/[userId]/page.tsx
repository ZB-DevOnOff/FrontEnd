import MyStudyView from '../components/MyStudyView';
import UserInfoView from '../components/UserInfoView';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
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
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  // 두 토큰이 모두 없는 경우 로그인 페이지로 리다이렉트
  if (!accessToken && !refreshToken) {
    redirect('/signin');
  }

  if (!accessToken && refreshToken) {
    // 엑세스토큰 재발급
    try {
      const reissueResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/token-reissue`, // 백엔드로 바로 요청
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }), // 리프레시 토큰을 body로 전달
        },
      );

      if (!reissueResponse.ok) {
        throw new Error('액세스 토큰 재발급 실패');
      }

      const reissueData = await reissueResponse.json();
      accessToken = reissueData.accessToken;
    } catch (error) {
      console.error('액세스 토큰 재발급 실패:', error);
      redirect('/signin');
    }
  }

  if (!accessToken) {
    redirect('/signin');
  }

  try {
    const [userDataRes, studiesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`, {
        next: { revalidate: 60 },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/study/author/${userId}?page=0`,
        {
          next: { revalidate: 60 },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    ]);

    if (userDataRes.status === 404) return notFound();
    if (!userDataRes.ok || !studiesRes.ok) {
      const userErrorText = await userDataRes.text();
      const studiesErrorText = await studiesRes.text();
      console.error('userDataRes error:', userErrorText);
      console.error('studiesRes error:', studiesErrorText);

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
