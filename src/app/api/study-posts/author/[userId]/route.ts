import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const GET = async (
  req: NextRequest,
  { params }: { params: { userId: string } },
) => {
  const { userId } = await params;
  try {
    const response = await axios.get(
      `${process.env.API_URL}/study-posts/author/${userId}`,
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
