'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { StudyResponse, StudyPost } from '@/types/study';
import { StudyFilter } from './StudyFilter';
import { StudyCard } from './StudyCard';

type FilterType = 'subjects' | 'status' | 'difficulty' | 'days';

export default function OnlineStudyList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 상태 읽기
  const page = Number(searchParams.get('page')) || 0;
  const selectedSubjects = searchParams.getAll('subjects');
  const selectedStatus = searchParams.getAll('status');
  const selectedDifficulty = searchParams.getAll('difficulty');
  const selectedDays = searchParams.getAll('days');

  const { data: posts, isLoading } = useQuery<StudyResponse>({
    queryKey: [
      'studies',
      'online',
      {
        page,
        selectedSubjects,
        selectedStatus,
        selectedDifficulty,
        selectedDays,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '12',
        meetingType: 'ONLINE',
      });

      selectedSubjects.forEach(subject => params.append('subject[]', subject));
      selectedStatus.forEach(status => params.append('status[]', status));
      selectedDifficulty.forEach(difficulty =>
        params.append('difficulty[]', difficulty),
      );
      selectedDays.forEach(day => params.append('dayType[]', day));

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/study-posts/search`,
        { params },
      );
      return response.data;
    },
  });

  const handleFilterChange = (type: FilterType, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    const currentValues = searchParams.getAll(type);

    if (currentValues.includes(value)) {
      // 값이 이미 있으면 제거
      newSearchParams.delete(type);
      currentValues
        .filter(v => v !== value)
        .forEach(v => newSearchParams.append(type, v));
    } else {
      // 값이 없으면 추가
      newSearchParams.append(type, value);
    }

    // 페이지 초기화
    newSearchParams.set('page', '0');

    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <div className="space-y-4">
      <StudyFilter
        selectedSubjects={selectedSubjects}
        selectedStatus={selectedStatus}
        selectedDifficulty={selectedDifficulty}
        selectedDays={selectedDays}
        onFilterChange={handleFilterChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div>로딩 중...</div>
        ) : posts?.content ? (
          posts.content.map((post: StudyPost) => (
            <StudyCard key={post.id} post={post} />
          ))
        ) : (
          <div>데이터가 없습니다.</div>
        )}
      </div>

      <div className="flex justify-center mt-8">
        <div className="join">
          {Array.from({ length: posts?.totalPages || 0 }).map((_, i) => (
            <button
              key={i}
              className={`join-item btn ${page === i ? 'btn-active' : ''}`}
              onClick={() => handlePageChange(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
