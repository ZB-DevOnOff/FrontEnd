import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const POST = async (request: NextRequest) => {
  const notificationId = request.nextUrl.pathname.split('/')[3] as string;

  try {
    const response = await axios.post(
      `${process.env.API_URL}/notification/${notificationId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 200) {
      return NextResponse.json(response.data, { status: response.status });
    }
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

export const DELETE = async (request: NextRequest) => {
  const notificationId = request.nextUrl.pathname.split('/')[3] as string;
  try {
    const response = await axios.get(
      `${process.env.API_URL}/notification/${notificationId}`, // 백엔드 서버 URL
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 200) {
      return NextResponse.json(
        { message: '알림이 성공적으로 삭제되었습니다.' },
        { status: response.status },
      );
    }
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      return NextResponse.json(data, { status });
    }

    // 네트워크 오류 처리
    return NextResponse.json(
      { message: '네트워크 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
};
