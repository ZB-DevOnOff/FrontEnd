import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const PATCH = async (request: NextRequest) => {
  const userId = request.nextUrl.pathname.split('/')[4] as string;

  try {
    const response = await axios.patch(
      `${process.env.API_URL}/notification/user/${userId}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (response.status === 200) {
      return NextResponse.json(
        {
          message:
            '모든 알림이 성공적으로 읽음 상태로 변경되었습니다. 새로운 알림이 있을 때 다시 알려드릴게요!',
        },
        { status: response.status },
      );
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
  const userId = request.nextUrl.pathname.split('/')[4] as string;

  try {
    const response = await axios.delete(
      `${process.env.API_URL}/notification/user/${userId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (response.status === 200) {
      return NextResponse.json(
        {
          message:
            '모든 알림이 성공적으로 삭제되었습니다. 새로운 알림이 있을 때 다시 알려드릴게요!',
        },
        { status: response.status },
      );
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
