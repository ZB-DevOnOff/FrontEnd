import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import checkAuth from './app/middlewares/auth';

const middleware = (request: NextRequest) => {
  const authResponse = checkAuth(request);
  if (authResponse) {
    const requestCookieHeader = request.headers.get('cookie');
    console.log(`Request cookies: ${requestCookieHeader}`);
    return authResponse;
  }
  return NextResponse.next();
};

export const config = {
  matcher: [
    '/api/study-posts/:path*/participants',
    '/api/study-posts/:path*/applications',
    '/api/study-posts/:path*/close',
    '/api/comments',
    '/api/study-posts/:path*/PUT',
    '/api/qna-posts/:path*/PUT',
    '/api/info-posts/:path*/PUT',
  ],
};

export default middleware;
