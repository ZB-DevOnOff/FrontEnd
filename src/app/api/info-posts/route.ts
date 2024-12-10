import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { message: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    // 파일 처리
    const thumbnail = formData.get('thumbnail');
    const transformedFormData = new FormData();

    if (thumbnail && thumbnail instanceof File) {
      transformedFormData.append('thumbnail', thumbnail);
    }

    // 나머지 필드들 추가
    const fields = {
      title: formData.get('title'),
      content: formData.get('content'),
      userId: Number(formData.get('userId')),
    };

    // FormData에 필드 추가
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        transformedFormData.append(key, String(value));
      }
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/info-posts`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: transformedFormData,
      },
    );

    if (!response.ok) {
      throw new Error('정보공유 글 작성 실패');
    }

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error('API Route 에러:', error);
    return NextResponse.json(
      { message: '정보공유 글 작성에 실패했습니다.' },
      { status: 500 },
    );
  }
}
