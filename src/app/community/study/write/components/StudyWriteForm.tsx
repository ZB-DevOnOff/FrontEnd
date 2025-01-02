'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OnlineForm from './OnlineForm';
import HybridForm from './HybridForm';
import { MEETING_TYPE } from '@/types/study';

type StudyType = 'ONLINE' | 'HYBRID';

export default function StudyWriteForm() {
  const [studyType, setStudyType] = useState<StudyType>('ONLINE');
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'HYBRID') {
      setStudyType('HYBRID');
    }
  }, [searchParams]);

  return (
    <>
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

      {studyType === 'ONLINE' ? <OnlineForm /> : <HybridForm />}
    </>
  );
}
