'use client';

import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import Image from 'next/image';
import {
  FaCrown,
  FaCalendarAlt,
  FaClock,
  FaCommentDots,
  FaChalkboardTeacher,
} from 'react-icons/fa';
import {
  convertSubjectToKorean,
  convertDifficultyToKorean,
  convertStudyStatus,
} from '@/utils/study';
import CustomAlert from '@/components/common/Alert';
import { useState } from 'react';

interface MyStudyCardProps {
  post: MyStudyCardData;
}

export interface MyStudyCardData {
  id: number;
  studyName: string;
  subject: string;
  difficulty: string;
  dayType: string[]; // 요일
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: string;
  studyPostId: number;
  studyLeaderId: number;
  totalParticipants: number;
  thumbnailImgUrl?: string;
}

const MyStudyCard = ({ post }: MyStudyCardProps) => {
  const router = useRouter();
  const { userInfo } = useAuthStore();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 텍스트 길이 제한 함수
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  // 시간에서 :00을 제거하는 함수
  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const checkStudyTime = () => {
    const now = new Date();
    const currentDay = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
    const currentTime = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    if (!post.dayType.includes(currentDay)) {
      setAlertMessage('오늘은 스터디 진행 요일이 아닙니다.');
      setShowAlert(true);
      return false;
    }

    if (currentTime < post.startTime || currentTime > post.endTime) {
      setAlertMessage('현재는 스터디 시간이 아닙니다.');
      setShowAlert(true);
      return false;
    }

    return true;
  };

  // 스터디룸 버튼의 onClick 핸들러 수정
  const handleStudyRoomClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (checkStudyTime()) {
      router.push(
        `/studyroom?studyId=${post.id}&nickname=${userInfo?.nickname}`,
      );
    }
  };

  return (
    <div
      className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow w-full min-w-[320px] max-w-[320px] group"
      onClick={() => router.push(`/community/study/${post.studyPostId}`)}
    >
      <figure className="px-4 pt-4">
        <Image
          src={post.thumbnailImgUrl || '/default-profile-image.png'}
          alt={post.studyName}
          width={500}
          height={300}
          className="rounded-xl h-48 w-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-xl items-center">
          {truncateText(post.studyName, 20)}
          {userInfo?.id === post.studyLeaderId && (
            <div className="absolute top-4 right-4 flex flex-col items-center space-y-1 bg-rose-500 p-2 rounded-lg shadow-md">
              <FaCrown className="text-white text-2xl" />
              <span className="text-white text-xs font-bold">스터디장</span>
            </div>
          )}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="badge badge-lg bg-primary/70 px-4 py-3 rounded-full">
            {truncateText(convertSubjectToKorean(post.subject), 7)}
          </div>
          <div className="badge badge-lg bg-accent/70 px-2 py-3 rounded-full">
            {truncateText(convertDifficultyToKorean(post.difficulty), 5)}
          </div>
          <div className="badge badge-lg bg-secondary px-4 py-3 rounded-full">
            {convertStudyStatus(post.status)}
          </div>
          <div className="flex flex-wrap gap-1">
            {post.dayType.map((day, index) => (
              <div
                key={index}
                className="badge badge-lg bg-info/30 px-2 py-3 rounded-full"
              >
                {truncateText(day, 7)}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2 text-base">
            <FaCalendarAlt className="text-gray-500" />
            <span className="font-base text-gray-700">스터디 기간</span>
            <span className="ml-auto font-semibold text-gray-700">
              {dayjs(post.startDate).format('YY.MM.DD')} ~{' '}
              {dayjs(post.endDate).format('YY.MM.DD')}
            </span>
          </div>
          <div className="flex items-center gap-2 text-base">
            <FaClock className="text-gray-500" />
            <span className="font-base text-gray-700">스터디 시간</span>
            <span className="ml-auto font-semibold text-gray-700">
              {formatTime(post.startTime)} ~ {formatTime(post.endTime)}
            </span>
          </div>
        </div>

        <div className="card-actions justify-center mt-4 space-x-4">
          <button
            className="btn btn-base bg-blue-400 text-base hover:bg-blue-500 text-white rounded-full flex items-center gap-2 px-8 py-2"
            onClick={async e => {
              e.stopPropagation();
              try {
                const response = await axios.post(
                  `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/chat/study/${post.id}/participant/${userInfo?.id}`,
                  {},
                  {
                    headers: { 'Content-Type': 'application/json' },
                  },
                );
                if (response.status === 200) {
                  const { chatRoomId, studyId, studyName } = response.data;
                  router.push(
                    `/chat/${chatRoomId}/study/${studyId}?studyName=${studyName}`,
                  );
                } else {
                  setAlertMessage(
                    '채팅방에 참여할 수 없습니다. 잠시 후 다시 시도해주세요.',
                  );
                  setShowAlert(true);
                }
              } catch (error) {
                console.error('채팅방 참가 중 오류 발생:', error);
                setAlertMessage(
                  '채팅방 참가 중 오류가 발생했습니다. 관리자에게 문의하세요.',
                );
                setShowAlert(true);
              }
            }}
          >
            <FaCommentDots />
            채팅
          </button>
          <button
            className="btn btn-base bg-green-400 text-base hover:bg-green-500 text-white rounded-full flex items-center gap-2 px-6 py-2"
            onClick={handleStudyRoomClick}
          >
            <FaChalkboardTeacher /> 스터디룸
          </button>
        </div>
        <div className="text-right mt-4">
          <span className="text-base py-1 px-3 text-gray-500 rounded-full font-semibold btn-ghost group-hover:bg-gray-300 group-hover:text-black transition-colors">
            상세보기 →
          </span>
        </div>
      </div>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default MyStudyCard;
