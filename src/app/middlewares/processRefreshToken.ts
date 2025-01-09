import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { setCookie } from '@/utils/cookies';

const processRefreshToken = async (
  request: NextRequest,
  refreshToken: string,
) => {
  console.log('accessToken 없음');
  // const refreshRoute = new URL('/api/auth/token-reissue', request.url);
  // const headers = new Headers({ 'Content-Type': 'application/json' });
  // return NextResponse.rewrite(refreshRoute, { headers: headers });

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

      const res = NextResponse.next();

      setCookie(res, 'accessToken', accessToken, accessTokenMaxAge);

      res.headers.set('Authorization', `Bearer ${accessToken}`);

      console.log('새로운 액세스토큰이 쿠키에 저장되었습니다.');

      // return (
      //   NextResponse.json({ message: '토큰 갱신 성공' }),
      //   { headers: res.headers }
      // );

      // return res;
      // return processAccessToken(request, accessToken);
      return NextResponse.redirect(request.url, { headers: res.headers });
    }
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }
    return NextResponse.json(
      {
        errorMessage: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 500 },
    );
  }
};

export default processRefreshToken;
