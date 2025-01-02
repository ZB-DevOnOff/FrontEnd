import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { deleteCookie } from '@/utils/cookies';
import { cookies } from 'next/headers';

export const POST = async (req: NextRequest) => {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('accessToken')?.value;

  const { password } = await req.json();

  if (!accessToken) {
    const refreshToken = cookieStore.get('refreshToken')?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { message: '다시 로그인 해주세요.' },
        { status: 403 },
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
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const payload = password ? { password } : undefined;

    await axios.post(`${process.env.API_URL}/auth/withdrawal`, payload, config);

    const res = NextResponse.json({ message: '회원 탈퇴 성공' });

    deleteCookie(res, 'accessToken');
    deleteCookie(res, 'refreshToken');

    return res;
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      return NextResponse.json(data, { status });
    }

    return NextResponse.json(
      { message: '네트워크 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
};
