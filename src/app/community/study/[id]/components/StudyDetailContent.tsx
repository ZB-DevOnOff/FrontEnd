'use client';

import { useEffect, useState } from 'react';
import { BaseStudyPost } from '@/types/study';
import { useAuthStore } from '@/store/authStore';
import dayjs from 'dayjs';
import Comments from './Comments';
import { StudyApplication } from './StudyApplication';
import StudyLocation from './StudyLocation';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { convertDifficultyToKorean, convertMeetingType } from '@/utils/study';
import CustomAlert from '@/components/common/Alert';

interface StudyDetailContentProps {
  studyId: string;
}

export default function StudyDetailContent({
  studyId,
}: StudyDetailContentProps) {
  const { isSignedIn, userInfo } = useAuthStore();
  const [study, setStudy] = useState<BaseStudyPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

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
        setAlertMessage(error.response?.data?.message);
        setShowAlert(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudy();
  }, [studyId]);

  if (isLoading) return <div>Loading...</div>;
  if (!study) return <div>스터디를 찾을 수 없습니다.</div>;

  const isAuthor = isSignedIn && userInfo?.id === study.user?.id;

  const handleEdit = () => {
    router.push(`/community/study/edit/${studyId}`);
  };

  const handleCancel = async () => {
    if (!window.confirm('정말로 이 스터디 모집을 취소하시겠습니까?')) return;

    try {
      const response = await axios.patch(`/api/study-posts/${studyId}/cancel`);
      if (response.status === 200) {
        await queryClient.invalidateQueries({ queryKey: ['studies'] });
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
      setAlertMessage('스터디 모집 취소에 실패했습니다. 다시 시도해주세요.');
      setShowAlert(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{study.title}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {study.createdAt.substring(0, 10)}
            </span>
            {isAuthor && study.status === 'RECRUITING' && (
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="btn border-gray-800 bg-white text-gray-800 hover:bg-teal-50 hover:border-teal-500 hover:text-teal-500"
                >
                  수정
                </button>
                <button
                  onClick={handleCancel}
                  className="btn border-gray-800 bg-white text-gray-780 hover:bg-red-50 hover:border-customRed hover:text-customRed"
                >
                  모집 취소
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>작성자: {study.user?.nickname || '알 수 없음'}</span>
        </div>

        <div className="flex gap-8 mt-8">
          <div className="flex-1 prose max-w-none whitespace-pre-wrap">
            {study.description || '내용이 없습니다.'}
          </div>

          {study.thumbnailImgUrl && (
            <div className="w-64 flex-shrink-0">
              <img
                src={study.thumbnailImgUrl}
                alt="스터디 썸네일"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>

        <div className="divider" />

        {/* 스터디 기본 정보 */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm text-base-content/70">
            <p>스터디명: {study.studyName}</p>
            <p>난이도: {convertDifficultyToKorean(study.difficulty)}</p>
            <p>
              모집 기한: {dayjs(study.recruitmentPeriod).format('YYYY.MM.DD')}
              까지
            </p>
            <p>
              모집 인원: {study.currentParticipants + 1}/{study.maxParticipants}
              명
            </p>
            <p>
              스터디 기간: {dayjs(study.startDate).format('YYYY.MM.DD')} ~{' '}
              {dayjs(study.endDate).format('YYYY.MM.DD')}
            </p>
            <p>
              스터디 시간: {study.startTime} ~ {study.endTime}
            </p>
            <p>스터디 요일: {study.dayType.join(', ')}</p>
            <p>진행 방식: {convertMeetingType(study.meetingType)}</p>
          </div>
        </div>

        {/* 모집 중일 때만 신청 섹션 표시 */}
        {study.status === 'RECRUITING' && (
          <StudyApplication
            study={study}
            isAuthor={isAuthor}
            setStudy={setStudy}
          />
        )}
        <Comments studyId={studyId} postType="STUDY" />
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
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
