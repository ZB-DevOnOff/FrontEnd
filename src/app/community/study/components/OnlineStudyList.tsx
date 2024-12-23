'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PostResponse, StudyPost } from '@/types/post';
import { StudyFilter } from './StudyFilter';
import { StudyCard } from './StudyCard';
import SearchForm from '@/app/community/components/SearchForm';

type FilterType = 'subjects' | 'status' | 'difficulty' | 'dayType';

const DAY_BIT_FLAGS = {
  월: 1,
  화: 2,
  수: 4,
  목: 8,
  금: 16,
  토: 32,
  일: 64,
} as const;

export default function OnlineStudyList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 상태 읽기
  const page = Number(searchParams.get('page')) || 0;
  const selectedSubjects = searchParams.getAll('subjects');
  const selectedStatus = searchParams.getAll('status');
  const selectedDifficulty = searchParams.getAll('difficulty');
  const selectedDays = searchParams.getAll('dayType');

  const { data: posts, isLoading } = useQuery<PostResponse<StudyPost>>({
    queryKey: [
      'studies',
      'online',
      {
        page,
        title: searchParams.get('title'),
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

      const title = searchParams.get('title');
      if (title) {
        params.append('title', title);
      }

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

    if (type === 'dayType') {
      let currentBitFlag = Number(searchParams.get('dayType') || '0');
      const dayBit = DAY_BIT_FLAGS[value as keyof typeof DAY_BIT_FLAGS];

      if ((currentBitFlag & dayBit) !== 0) {
        currentBitFlag &= ~dayBit;
      } else {
        currentBitFlag |= dayBit;
      }

      if (currentBitFlag > 0) {
        newSearchParams.set('dayType', currentBitFlag.toString());
      } else {
        newSearchParams.delete('dayType');
      }
    } else {
      const currentValue = searchParams.get(type);

      if (currentValue === value) {
        newSearchParams.delete(type);
      } else {
        newSearchParams.set(type, value);
      }
    }

    newSearchParams.set('page', '0');
    router.push(`?${newSearchParams.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', newPage.toString());
    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      <SearchForm
        initialKeyword={searchParams.get('title') || ''}
        placeholder="스터디 제목을 검색하세요"
      />
      <StudyFilter
        searchParams={searchParams}
        selectedSubjects={selectedSubjects}
        selectedStatus={selectedStatus}
        selectedDifficulty={selectedDifficulty}
        selectedDays={selectedDays}
        onFilterChange={handleFilterChange}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 gap-x-0">
        {isLoading ? (
          <div>로딩 중...</div>
        ) : posts?.content ? (
          posts.content.map((post: StudyPost) => (
            <div className="flex justify-center" key={post.id}>
              <StudyCard post={post} />
            </div>
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
