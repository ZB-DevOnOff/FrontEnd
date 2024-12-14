import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import processAccessToken from './processAccessToken';
import processRefreshToken from './processRefreshToken';
import handleRedirectToSignIn from './handleRedirectToSignIn';
import { checkPath } from './checkPath';

const checkAuth = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (checkPath(request)) {
    return NextResponse.next(); // 미들웨어 실행하지 않는 경로 건너뛰기
  }

  console.log('미들웨어 실행됨:', pathname);
  const accessToken = request.cookies.get('accessToken')?.value;
  console.log('Access token:', accessToken);
  const refreshToken = request.cookies.get('refreshToken')?.value;
  console.log('Refresh token:', refreshToken);

  console.log('미들웨어 토큰 체크:', {
    accessToken: accessToken ? '존재' : '없음',
    refreshToken: refreshToken ? '존재' : '없음',
  });

  if (accessToken) {
    return processAccessToken(request, accessToken);
  }

  if (refreshToken) {
    // const refreshResponse = await processRefreshToken(request, refreshToken);
    // const newAccessToken = refreshResponse.cookies.get('accessToken')?.value;
    // if (newAccessToken) {
    //   return processAccessToken(request, newAccessToken);
    // }
    // return handleRedirectToSignIn(request);

    return await processRefreshToken(request, refreshToken);

    // const refreshResponse = await processRefreshToken(request, refreshToken);
    // if (refreshResponse.status === 200) {
    // const newAccessToken = refreshResponse.headers
    //   .get('Authorization')
    //   ?.replace('Bearer ', '');
    // if (newAccessToken) {
    //   return processAccessToken(request, newAccessToken);
    // }
    // refreshResponse.headers.append('Set-Cookie', `accessToken=${newAccessToken}; Path=/; HttpOnly; Secure; SameSite=Strict`)
  }

  // return refreshResponse;
  // }

  return handleRedirectToSignIn(request);
};

export default checkAuth;
