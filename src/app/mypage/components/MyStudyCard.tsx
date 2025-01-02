'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import {
  FaCrown,
  FaCalendarAlt,
  FaClock,
  FaCommentDots,
  FaChalkboardTeacher,
  FaHourglassStart,
} from 'react-icons/fa';
import { BiSolidCategoryAlt } from 'react-icons/bi';
import { SiLevelsdotfyi } from 'react-icons/si';
import { BsCalendar2WeekFill } from 'react-icons/bs';
import {
  convertSubjectToKorean,
  convertDifficultyToKorean,
  convertStudyStatus,
} from '@/utils/study';
import CustomAlert from '@/components/common/Alert';
import { useState } from 'react';
import axiosInstance from '@/utils/axios';

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
  meetingType: string;
  status: string;
  studyPostId: number;
  studyLeaderId: number;
  totalParticipants: number;
  thumbnailImgUrl?: string;
}

const MEETING_TYPES = {
  ONLINE: '온라인',
  HYBRID: '병행',
};

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

  const formatDayType = (days: string[]) => {
    if (days.length <= 3) {
      return days;
    }
    return [...days.slice(0, 2), `+${days.length - 2}`];
  };

  const formatDate = (date: string) => {
    return date.substring(2).replace(/-/g, '.');
  };

  const checkStudyTime = () => {
    const now = new Date();
    const currentDay = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
    const currentTime = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    // 시작 시간 1분 전 시간 계산
    const startTimeDate = new Date();
    const [startHour, startMinute] = post.startTime.split(':');
    startTimeDate.setHours(parseInt(startHour, 10));
    startTimeDate.setMinutes(parseInt(startMinute, 10) - 1);
    const adjustedStartTime = startTimeDate.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    if (!post.dayType.includes(currentDay)) {
      setAlertMessage('오늘은 스터디 진행 요일이 아닙니다.');
      setShowAlert(true);
      return false;
    }

    if (currentTime < adjustedStartTime || currentTime > post.endTime) {
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
      className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow w-full min-w-[330px] max-w-[330px] group h-[548px]"
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
      <div className="card-body flex flex-col justify-between">
        <h2 className="card-title text-xl items-center">
          {truncateText(post.studyName, 20)}
          {userInfo?.id === post.studyLeaderId && (
            <div className="absolute top-4 right-4 flex flex-col items-center space-y-1 bg-white border-2 border-gray-800 p-2 rounded-lg shadow-md">
              <FaCrown className="text-gray-800 text-2xl" />
              <span className="text-gray-800 text-xs font-bold">스터디장</span>
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-col items-center space-y-1 bg-gray-800 p-2 rounded-lg shadow-md">
            <span className="text-white text-xs font-bold">
              {MEETING_TYPES[post.meetingType as keyof typeof MEETING_TYPES]}
            </span>
          </div>
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <BiSolidCategoryAlt className="text-gray-500" />
            <div className="badge badge-md border-teal-500 text-teal-500 bg-white text-md px-4 py-3 rounded-full">
              {truncateText(convertSubjectToKorean(post.subject), 7)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SiLevelsdotfyi className="text-gray-500" />
            <div className="badge badge-md border-teal-500 text-teal-500 bg-white text-md px-2 py-3 rounded-full">
              {truncateText(convertDifficultyToKorean(post.difficulty), 5)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaHourglassStart className="text-gray-500" />
            <div className="badge badge-md border-teal-500 text-teal-500 bg-white text-md px-4 py-3 rounded-full">
              {convertStudyStatus(post.status)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BsCalendar2WeekFill className="text-gray-500" />
            <div className="flex flex-wrap gap-1">
              {formatDayType(post.dayType).map((day, index) => (
                <div
                  key={index}
                  className="badge badge-md border-teal-500 text-teal-500 bg-white text-md px-2 py-3 rounded-full"
                >
                  {truncateText(day, 7)}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2 space-y-4">
          <div className="flex items-center gap-2 text-base flex-shrink-0">
            <FaCalendarAlt className="text-gray-500" />
            <span className="font-base text-sm text-gray-700">스터디 기간</span>
            <span className="ml-auto text-sm font-semibold text-gray-700 whitespace-nowrap">
              {formatDate(post.startDate)} ~ {formatDate(post.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-base">
            <FaClock className="text-gray-500" />
            <span className="font-base text-sm text-gray-700">스터디 시간</span>
            <span className="ml-auto text-sm font-semibold text-gray-700">
              {formatTime(post.startTime)} ~ {formatTime(post.endTime)}
            </span>
          </div>
        </div>

        <div className="card-actions flex justify-between mt-2 space-x-2">
          <button
            className="btn btn-base text-teal-50 bg-teal-500 text-sm hover:bg-teal-600 hover:border-teal-500 hover:text-black rounded-full flex-1 px-4 py-2 min-w-[120px] max-w-[140px] relative"
            onClick={async e => {
              e.stopPropagation();
              try {
                const response = await axiosInstance.post(
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
            {/* {unreadMessagesCount > 0 && (
              <div className="absolute -top-1 -right-0.5 bg-customRed text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-xs">
                {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
              </div>
            )} */}
          </button>
          <button
            className="btn btn-base border-2 border-teal-500 text-teal-500 text-sm hover:bg-teal-50 hover:border-teal-500 hover:text-black rounded-full flex-1 px-4 py-2 min-w-[120px] max-w-[140px]"
            onClick={handleStudyRoomClick}
          >
            <FaChalkboardTeacher /> 스터디룸
          </button>
        </div>
        <div className="text-right mt-1">
          <span className="text-sm font-semibold text-gray-500 rounded-full px-1 py-1 btn-ghost group-hover:bg-gray-300 group-hover:text-black transition-colors">
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
