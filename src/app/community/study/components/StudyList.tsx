'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MEETING_TYPE } from '@/types/study';
import OnlineStudyList from './OnlineStudyList';
import HybridStudyList from './HybridStudyList';
import { useAuthStore } from '@/store/authStore';

type StudyType = 'ONLINE' | 'HYBRID';

export default function StudyList() {
  const { isSignedIn } = useAuthStore();
  const [studyType, setStudyType] = useState<StudyType>('ONLINE');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTypeChange = (type: StudyType) => {
    setStudyType(type);
    const newSearchParams = new URLSearchParams(searchParams);
    const currentFilters = {
      page: newSearchParams.get('page'),
      subjects: newSearchParams.getAll('subjects'),
      status: newSearchParams.getAll('status'),
      difficulty: newSearchParams.getAll('difficulty'),
      dayType: newSearchParams.getAll('dayType'),
    };

    newSearchParams.set('type', type);
    if (currentFilters.page) newSearchParams.set('page', currentFilters.page);
    currentFilters.subjects.forEach(subject =>
      newSearchParams.append('subjects', subject),
    );
    currentFilters.status.forEach(status =>
      newSearchParams.append('status', status),
    );
    currentFilters.difficulty.forEach(difficulty =>
      newSearchParams.append('difficulty', difficulty),
    );
    currentFilters.dayType.forEach(day =>
      newSearchParams.append('dayType', day),
    );

    router.push(`?${newSearchParams.toString()}`);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">스터디 모집</h1>
        {isSignedIn && (
          <Link
            href={`/community/study/write?type=${studyType}`}
            className="btn btn-primary"
          >
            스터디 모집하기
          </Link>
        )}
      </div>

      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${studyType === 'ONLINE' ? 'tab-active' : ''}`}
          onClick={() => handleTypeChange('ONLINE')}
        >
          {MEETING_TYPE.ONLINE}
        </button>
        <button
          className={`tab ${studyType === 'HYBRID' ? 'tab-active' : ''}`}
          onClick={() => handleTypeChange('HYBRID')}
        >
          {MEETING_TYPE.HYBRID}
        </button>
      </div>

      {studyType === 'ONLINE' ? <OnlineStudyList /> : <HybridStudyList />}
    </div>
  );
}
