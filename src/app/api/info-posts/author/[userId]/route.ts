import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const GET = async (
  request: NextRequest,
  { params }: { params: { userId: string } },
) => {
  const { userId } = await params;

  try {
    const response = await axios.get(
      `${process.env.API_URL}/info-posts/author/${userId}?page=1`, // 백엔드 서버 URL
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 200) {
      if (response.status === 200) {
        return NextResponse.json(response.data, { status: response.status });
      }
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
