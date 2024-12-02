'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { StudyResponse } from '@/types/post';
import { StudyFilter } from './StudyFilter';
import { StudyCard } from './StudyCard';

type FilterType = 'subjects' | 'status' | 'difficulty' | 'days';

export default function OnlineStudyList() {
  const [posts, setPosts] = useState<StudyResponse | null>(null);
  const [page, setPage] = useState(0);
  const [searchTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '12',
        searchTitle,
        meeting_type: 'ONLINE',
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
  }, [
    page,
    searchTitle,
    selectedSubjects,
    selectedStatus,
    selectedDifficulty,
    selectedDays,
  ]);

  useEffect(() => {
    fetchPosts();
  }, [
    page,
    searchTitle,
    selectedSubjects,
    selectedStatus,
    selectedDifficulty,
    selectedDays,
    fetchPosts,
  ]);

  const handleFilterChange = (type: FilterType, value: string) => {
    const setters = {
      subjects: setSelectedSubjects,
      status: setSelectedStatus,
      difficulty: setSelectedDifficulty,
      days: setSelectedDays,
    };

    setters[type](prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value],
    );
    setPage(0);
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
        ) : (
          posts?.data.map(post => <StudyCard key={post.id} post={post} />)
        )}
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
    </div>
  );
}
