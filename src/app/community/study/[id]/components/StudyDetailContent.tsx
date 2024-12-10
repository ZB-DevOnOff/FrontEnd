'use client';

import { useEffect, useState } from 'react';
import { StudyPost } from '@/types/study';
import { useAuthStore } from '@/store/authStore';
import dayjs from 'dayjs';
import Comments from './Comments';
import { StudyApplication } from './StudyApplication';
import StudyLocation from './StudyLocation';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import StudyParticipants from './StudyParticipants';

interface StudyDetailContentProps {
  studyId: string;
}

export default function StudyDetailContent({
  studyId,
}: StudyDetailContentProps) {
  const { isSignedIn, userInfo } = useAuthStore();
  const [study, setStudy] = useState<StudyPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/study-posts/${studyId}`,
        );
        if (response.status === 200) {
          setStudy(response.data);
        }
      } catch (error: any) {
        console.error('스터디 정보 조회 실패:', error);
        alert(error.response?.data?.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudy();
  }, [studyId]);

  if (isLoading) return <div>Loading...</div>;
  if (!study) return <div>스터디를 찾을 수 없습니다.</div>;

  const isAuthor = isSignedIn && userInfo?.id === study.userId;

  const handleEdit = () => {
    router.push(`/community/study/edit/${studyId}`);
  };

  const handleCancel = async () => {
    if (!window.confirm('정말로 이 스터디 모집을 취소하시겠습니까?')) return;

    try {
      const response = await axios.put(`/api/study-posts/${studyId}/close`);
      if (response.status === 200) {
        setStudy(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'CANCELED',
          };
        });
      }
    } catch (error) {
      console.error('스터디 모집 취소 실패:', error);
      alert('스터디 모집 취소에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{study.title}</h1>
        {isAuthor && study.status === 'RECRUITING' && (
          <div className="flex gap-2">
            <button onClick={handleEdit} className="btn btn-primary">
              수정하기
            </button>
            <button onClick={handleCancel} className="btn btn-error">
              모집 취소
            </button>
          </div>
        )}
      </div>
      <div className="bg-base-100 shadow-xl rounded-lg p-6">
        {/* 스터디 기본 정보 */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm text-base-content/70">
            <p>
              모집 기한: {dayjs(study.recruitmentPeriod).format('YYYY.MM.DD')}
              까지
            </p>
            <p>
              모집 인원: {study.currentParticipants}/{study.maxParticipants}명
            </p>
            <p>
              스터디 기간: {dayjs(study.startDate).format('YYYY.MM.DD')} ~
              {dayjs(study.endDate).format('YYYY.MM.DD')}
            </p>
            <p>스터디 요일: {study.dayType.join(', ')}</p>
          </div>
        </div>

        {/* 스터디 상세 내용 */}
        <div className="prose max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: study.content }} />
        </div>

        {/* 참여자 목록 */}
        <StudyParticipants studyId={studyId} />

        {/* 댓글 섹션 */}
        <Comments studyId={studyId} />

        {/* 신청 섹션 */}
        <StudyApplication
          study={study}
          isAuthor={isAuthor}
          setStudy={setStudy}
        />
      </div>
      {study.meetingType === 'HYBRID' &&
        study.latitude &&
        study.longitude &&
        study.address && (
          <div className="mt-8">
            <StudyLocation
              post={{
                latitude: study.latitude,
                longitude: study.longitude,
                address: study.address,
              }}
            />
          </div>
        )}
    </div>
  );
}
