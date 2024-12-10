import { NextRequest, NextResponse } from 'next/server';
import handleRedirectToSignIn from './handleRedirectToSignIn';

const processRefreshToken = (request: NextRequest, accessToken: string) => {
  console.log('accessToken 없음');
  const refreshRoute = new URL('/api/auth/token-reissue', request.url);
  return NextResponse.rewrite(refreshRoute);
};

export default processRefreshToken;

// import { NextRequest, NextResponse } from 'next/server';
// import axios from 'axios';
// const processRefreshToken = async (refreshToken: string) => {
//   try {
//     const response = await axios.post(
//       `${process.env.API_URL}/auth/token-reissue`,
//       { refreshToken },
//       {
//         headers: { 'Content-Type': 'application/json' },
//       },
//     );

//     if (response.status === 200) {
//       return response.data;
//     }

//     throw new Error('accessToken 재발급에 실패했습니다.');
//   } catch (error: any) {
//     console.error('accessToken 재발급 중 오류가 발생했습니다.');
//     throw error;
//   }
// };

// export default processRefreshToken;
