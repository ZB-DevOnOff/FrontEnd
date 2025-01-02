import { NextRequest, NextResponse } from 'next/server';

const handleRedirectToSignIn = (request: NextRequest) => {
  console.log('accessToken 및 refreshToken이 모두 없음');

  const isApiRequest = request.nextUrl.pathname.startsWith('/api/');
  if (isApiRequest) {
    // API 요청일 경우 JSON 형식의 403 응답 반환
    return new NextResponse(
      JSON.stringify({
        errorMessage: '인증이 만료되었습니다. 다시 로그인해 주세요.',
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  // 페이지 요청일 경우 로그인 페이지로 리다이렉트
  const signInUrl = new URL('/signin', request.url);
  return NextResponse.redirect(signInUrl);
};

export default handleRedirectToSignIn;
