'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import dayjs from 'dayjs';
import { debounce } from 'lodash';

interface StudyPost {
  id: number;
  title: string;
  subject:
    | '개념 학습'
    | '프로젝트'
    | '알고리즘'
    | '코딩테스트'
    | '챌린지'
    | '자격증/시험'
    | '취업/코테'
    | '기타';
  difficulty: '상' | '중' | '하';
  thumbnail: string;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
  studyStartDate: string;
  studyEndDate: string;
  currentMembers: number;
  maxMembers: number;
  meetingTime: string;
  status: '모집 중' | '모집 완료' | '진행 중' | '종료';
  meeting_type: 'Online' | '오프라인';
  days: ('월' | '화' | '수' | '목' | '금' | '토' | '일')[];
}

interface StudyResponse {
  data: StudyPost[];
  page: number;
  size: number;
  total_pages: number;
}

export default function StudyListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<StudyResponse | null>(null);
  const [page, setPage] = useState(0);
  const [searchTitle, setSearchTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const subjects = [
    '개념 학습',
    '프로젝트',
    '알고리즘',
    '코딩테스트',
    '챌린지',
    '자격증/시험',
    '취업/코테',
    '기타',
  ];
  const statuses = ['모집 중', '모집 완료', '진행 중', '종료'];
  const difficulties = ['상', '중', '하'];
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '12',
        searchTitle,
      });

      selectedSubjects.forEach(subject => params.append('subjects[]', subject));
      selectedStatus.forEach(status => params.append('status[]', status));
      selectedDifficulty.forEach(difficulty =>
        params.append('difficulty[]', difficulty),
      );
      selectedDays.forEach(day => params.append('days[]', day));

      const response = await axios.get('/api/study-posts/search', { params });
      setPosts(response.data);
    } catch (error) {
      console.error('스터디 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [
    page,
    searchTitle,
    selectedSubjects,
    selectedStatus,
    selectedDifficulty,
    selectedDays,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const toggleFilter = (
    value: string,
    currentSelected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setSelected(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value],
    );
    setPage(0);
  };

  const getStatusBadgeStyle = (status: string) => {
    const baseStyle =
      'absolute top-4 right-4 rounded-full px-3 py-1 text-sm font-semibold';
    switch (status) {
      case '모집 중':
        return `${baseStyle} bg-success text-success-content`;
      case '진행 중':
        return `${baseStyle} bg-warning text-warning-content`;
      default:
        return `${baseStyle} bg-neutral text-neutral-content`;
    }
  };

  const handleSearchInput = useCallback(
    debounce((value: string) => {
      if (value.length >= 2 || value.length === 0) {
        setSearchTitle(value);
      }
    }, 500),
    [],
  );

  return (
    <div className="container mx-auto p-4">
      {/* 기존 헤더 부분 유지 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">스터디 모집</h1>
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              onChange={e => handleSearchInput(e.target.value)}
              placeholder="스터디 검색..."
              className="input input-bordered w-full max-w-xs"
            />
            <button type="submit" className="btn btn-primary">
              검색
            </button>
          </form>
          <button
            onClick={() => router.push('/study/create')}
            className="btn btn-secondary"
          >
            스터디 만들기
          </button>
        </div>
      </div>

      {/* 필터 섹션 추가 */}
      <div className="mb-6 space-y-4 bg-base-200 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h3 className="font-semibold mb-2">주제</h3>
            <div className="flex flex-wrap gap-2">
              {subjects.map(subject => (
                <button
                  key={subject}
                  onClick={() =>
                    toggleFilter(subject, selectedSubjects, setSelectedSubjects)
                  }
                  className={`btn btn-sm ${
                    selectedSubjects.includes(subject)
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">상태</h3>
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() =>
                    toggleFilter(status, selectedStatus, setSelectedStatus)
                  }
                  className={`btn btn-sm ${
                    selectedStatus.includes(status)
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">난이도</h3>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  onClick={() =>
                    toggleFilter(
                      difficulty,
                      selectedDifficulty,
                      setSelectedDifficulty,
                    )
                  }
                  className={`btn btn-sm ${
                    selectedDifficulty.includes(difficulty)
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">요일</h3>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() =>
                    toggleFilter(day, selectedDays, setSelectedDays)
                  }
                  className={`btn btn-sm ${
                    selectedDays.includes(day) ? 'btn-primary' : 'btn-outline'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-[1300px] mx-auto">
            {posts?.data.map(post => (
              <div
                key={post.id}
                className="card bg-base-100 shadow-xl relative"
              >
                <figure className="px-4 pt-4">
                  <img
                    src={post.thumbnail || '/default-study-thumbnail.png'}
                    alt={post.title}
                    className="rounded-xl h-48 w-full object-cover"
                  />
                </figure>
                <div className={getStatusBadgeStyle(post.status)}>
                  {post.status}
                </div>
                <div className="card-body">
                  <div className="flex gap-2 mb-2">
                    <span className="badge badge-outline">{post.subject}</span>
                    <span className="badge badge-outline">
                      난이도: {post.difficulty}
                    </span>
                    <span className="badge badge-outline">
                      {post.meetingTime}
                    </span>
                  </div>
                  <h2 className="card-title">{post.title}</h2>
                  <div className="text-sm space-y-1 text-base-content/80">
                    <p>
                      모집 기한:{' '}
                      {dayjs(post.recruitmentEndDate).format('YY.MM.DD')}까지
                    </p>
                    <p>
                      모집 인원: {post.currentMembers}/{post.maxMembers}명
                    </p>
                    <p>
                      스터디 기간:{' '}
                      {dayjs(post.studyStartDate).format('YY.MM.DD')} ~
                      {dayjs(post.studyEndDate).format('YY.MM.DD')}
                    </p>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => router.push(`/study/${post.id}`)}
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <div className="join">
              {Array.from({ length: posts?.total_pages || 0 }).map((_, i) => (
                <button
                  key={i}
                  className={`join-item btn ${page === i ? 'btn-active' : ''}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
