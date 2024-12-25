import { NextResponse } from 'next/server';
import axios from 'axios';
import { deleteCookie } from '@/utils/cookies';
import { cookies } from 'next/headers';

export const POST = async () => {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;
  if (!accessToken) {
    const refreshToken = cookieStore.get('refreshToken')?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { message: '로그아웃이 완료되었습니다.' },
        { status: 200 },
      );
    }
    // 액세스 토큰 재발급
    try {
      const reissueResponse = await axios.post(
        `${process.env.API_URL}/auth/token-reissue`, // 백엔드로 바로 요청
        {
          refreshToken,
        },
      );

      if (reissueResponse.status === 200) {
        accessToken = reissueResponse.data.accessToken;
        console.log('Reissue Response:', reissueResponse);
      } else {
        return NextResponse.json(
          { errorMessage: '액세스 토큰 재발급 실패' },
          { status: 403 },
        );
      }
    } catch (error) {
      return NextResponse.json(
        { errorMessage: '액세스 토큰 재발급 실패', error },
        { status: 403 },
      );
    }
  }

  try {
    await axios.post(
      `${process.env.API_URL}/auth/sign-out`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const res = NextResponse.json({ message: '로그아웃이 완료되었습니다.' });

    deleteCookie(res, 'accessToken');
    deleteCookie(res, 'refreshToken');

    return res;
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      return NextResponse.json(data, { status });
    }

    return NextResponse.json(
      { errorMessage: '네트워크 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
};
