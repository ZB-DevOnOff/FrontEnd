import axios from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (!accessToken) {
    return NextResponse.json(
      { message: '인증이 필요합니다.' },
      { status: 401 },
    );
  }

  try {
    await axios.put(
      `${process.env.API_BASE_URL}/study-posts/${params.id}/close`,
      { status: 'CANCELED' },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return NextResponse.json({ message: '스터디 모집이 취소되었습니다.' });
  } catch {
    return NextResponse.json(
      { message: '스터디 모집 취소에 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const response = await axios.get(
      `${process.env.API_URL}/study-posts/${params.id}`,
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('스터디 조회 실패:', error);
    return NextResponse.json(
      { message: error.response?.data?.message },
      { status: error.response?.status || 404 },
    );
  }
}
