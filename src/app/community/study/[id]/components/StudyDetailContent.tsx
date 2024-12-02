'use client';

import { useEffect, useState } from 'react';
import { StudyPost } from '@/types/post';
import { useAuth } from '@/hooks/useAuth';
import dayjs from 'dayjs';
import Comments from './Comments';
import { StudyApplication } from './StudyApplication';
import StudyLocation from './StudyLocation';

interface StudyDetailContentProps {
  studyId: string;
}

export default function StudyDetailContent({
  studyId,
}: StudyDetailContentProps) {
  const { user } = useAuth();
  const [study, setStudy] = useState<StudyPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const response = await fetch(`/api/study-posts/${studyId}`);
        if (!response.ok) {
          throw new Error('스터디 정보를 불러올 수 없습니다.');
        }
        const data = await response.json();
        setStudy(data);
      } catch (error) {
        console.error('스터디 정보 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudy();
  }, [studyId]);

  if (isLoading) return <div>Loading...</div>;
  if (!study) return <div>스터디를 찾을 수 없습니다.</div>;

  const isAuthor = user?.id === study.authorId;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-base-100 shadow-xl rounded-lg p-6">
        {/* 스터디 기본 정보 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">{study.title}</h1>
          <div className="grid grid-cols-2 gap-4 text-sm text-base-content/70">
            <p>
              모집 기한: {dayjs(study.recruitmentEndDate).format('YYYY.MM.DD')}
              까지
            </p>
            <p>
              모집 인원: {study.currentMembers}/{study.maxMembers}명
            </p>
            <p>
              스터디 기간: {dayjs(study.studyStartDate).format('YYYY.MM.DD')} ~
              {dayjs(study.studyEndDate).format('YYYY.MM.DD')}
            </p>
          </div>
        </div>

        {/* 스터디 상세 내용 */}
        <div className="prose max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: study.content }} />
        </div>

        {/* 댓글 섹션 */}
        <Comments studyId={studyId} />

        {/* 신청 섹션 */}
        <StudyApplication
          study={study}
          isAuthor={isAuthor}
          setStudy={setStudy}
        />
      </div>
      {study.meeting_type === 'HYBRID' && study.location && (
        <div className="mt-8">
          <StudyLocation post={study} />
        </div>
      )}
    </div>
  );
}
