'use client';

import { useState } from 'react';
import Link from 'next/link';
import OnlineStudyList from './components/OnlineStudyList';
import HybridStudyList from './components/HybridStudyList';
import { MEETING_TYPE } from '@/types/study';

type StudyType = 'ONLINE' | 'HYBRID';

export default function StudyListPage() {
  const [studyType, setStudyType] = useState<StudyType>('ONLINE');

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">스터디 모집</h1>
        <Link href="/community/study/write" className="btn btn-primary">
          스터디 모집하기
        </Link>
      </div>

      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${studyType === 'ONLINE' ? 'tab-active' : ''}`}
          onClick={() => setStudyType('ONLINE')}
        >
          {MEETING_TYPE.ONLINE}
        </button>
        <button
          className={`tab ${studyType === 'HYBRID' ? 'tab-active' : ''}`}
          onClick={() => setStudyType('HYBRID')}
        >
          {MEETING_TYPE.HYBRID}
        </button>
      </div>

      {studyType === 'ONLINE' ? <OnlineStudyList /> : <HybridStudyList />}
    </div>
  );
}
