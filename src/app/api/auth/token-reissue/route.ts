import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { setCookie } from '@/utils/cookies';

export const POST = async (req: NextRequest) => {
  // const cookiesList = await cookies();
  // const refreshToken = cookiesList.get('refreshToken')?.value;
  const { refreshToken } = await req.json();

  if (!refreshToken) {
    return NextResponse.json(
      { errorMessage: '리프레시 토큰이 없습니다.' },
      { status: 401 },
    );
  }

  try {
    const response = await axios.post(
      `${process.env.API_URL}/auth/token-reissue`, // 백엔드 API 실제 경로
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (response.status === 200) {
      const { accessToken } = response.data;

      const decodedAccessToken = jwt.decode(accessToken) as { exp: number };
      if (!decodedAccessToken || !decodedAccessToken.exp) {
        throw new Error('액세스토큰 exp 클레임이 없습니다.');
      }

      const currentTime = Math.trunc(Date.now() / 1000);
      const bufferTime = 10;
      const accessTokenMaxAge = Math.max(
        decodedAccessToken.exp - currentTime - bufferTime,
        0,
      );

      const res = NextResponse.json({ message: 'route.ts 토큰 갱신 성공' });

      setCookie(res, 'accessToken', accessToken, accessTokenMaxAge);
      res.headers.set('Authorization', `Bearer ${accessToken}`);
      return res;
    }
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }
    return NextResponse.json(
      { errorMessage: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 500 },
    );
  }
};
