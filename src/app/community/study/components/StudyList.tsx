'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MEETING_TYPE } from '@/types/study';
import OnlineStudyList from './OnlineStudyList';
import HybridStudyList from './HybridStudyList';
import { useAuthStore } from '@/store/authStore';

type StudyType = 'ONLINE' | 'HYBRID';

export default function StudyList() {
  const { isSignedIn } = useAuthStore();
  const [studyType, setStudyType] = useState<StudyType>('ONLINE');

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">스터디 모집</h1>
        {isSignedIn && (
          <Link
            href={`/community/study/write?type=${studyType}`}
            className="btn bg-teal-500 text-white hover:bg-teal-600 hover:text-black"
          >
            스터디 모집하기
          </Link>
        )}
      </div>

      <div className="tabs">
        <button
          className={`tab ${studyType === 'ONLINE' ? 'text-teal-500 border-b-2 border-teal-500 font-bold' : 'text-gray-700 border-b-2 border-transparent hover:text-teal-500 hover:font-bold'}`}
          onClick={() => setStudyType('ONLINE')}
        >
          {MEETING_TYPE.ONLINE}
        </button>
        <button
          className={`tab ${studyType === 'HYBRID' ? 'text-teal-500 border-b-2 border-teal-500 font-bold' : 'text-gray-700 border-b-2 border-transparent hover:text-teal-500 hover:font-bold'}`}
          onClick={() => setStudyType('HYBRID')}
        >
          {MEETING_TYPE.HYBRID}
        </button>
      </div>

      {studyType === 'ONLINE' ? <OnlineStudyList /> : <HybridStudyList />}
    </div>
  );
}
