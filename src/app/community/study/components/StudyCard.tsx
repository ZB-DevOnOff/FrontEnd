// 'use client';

import { useRouter } from 'next/navigation';
import { StudyPost } from '@/types/post';
import Image from 'next/image';
import {
  convertSubjectToKorean,
  convertDifficultyToKorean,
} from '@/utils/study';
import { FaCalendarAlt, FaClock, FaBook } from 'react-icons/fa';
import { RiTeamFill } from 'react-icons/ri';
import { SiLevelsdotfyi } from 'react-icons/si';
import { BsCalendar2WeekFill } from 'react-icons/bs';
import { STATUS_DISPLAY } from './StudyFilter';

interface StudyCardProps {
  post: StudyPost;
}

export function StudyCard({ post }: StudyCardProps) {
  const router = useRouter();

  // 텍스트 길이 제한 함수
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  // 시간에서 :00을 제거하는 함수
  const formatTime = (time: string) => {
    return time.slice(0, 5); // "HH:mm:ss" -> "HH:mm"
  };

  const formatDayType = (days: string[]) => {
    if (days.length <= 3) {
      return days;
    }
    return [...days.slice(0, 2), `+${days.length - 2}`];
  };

  // 날짜 형식을 변경하는 함수 추가
  const formatDate = (date: string) => {
    return date.substring(2).replace(/-/g, '.');
  };

  const status = STATUS_DISPLAY[post.status as keyof typeof STATUS_DISPLAY];

  return (
    <div
      className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow w-full min-w-[330px] max-w-[330px] group h-[540px]"
      onClick={() => router.push(`/community/study/${post.id}`)}
    >
      <figure className="px-4 pt-4">
        <Image
          src={post.thumbnailImgUrl || '/default-study-thumbnail.png'}
          alt={post.title}
          width={500}
          height={300}
          className="rounded-xl h-48 w-full object-cover"
        />
      </figure>
      <div className="card-body flex flex-col justify-between">
        <h2 className="card-title text-xl mb-2">
          {truncateText(post.title, 20)}
          <div
            className={`absolute top-4 left-4 flex flex-col items-center space-y-1 p-2 rounded-lg shadow-md ${status.color}`}
          >
            <span className="text-white text-xs font-bold">{status.label}</span>
          </div>
        </h2>

        {/* 정보 뱃지 그리드 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <FaBook className="text-gray-500" />
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
            <RiTeamFill className="text-gray-500" />
            <div className="badge badge-md border-teal-500 text-teal-500 bg-white text-md px-4 py-3 rounded-full">
              {post.currentParticipants + 1}/{post.maxParticipants}명
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

        {/* 하단 시간 정보 */}
        <div className="mt-2 space-y-4">
          {/* 모집 마감일 */}
          <div className="flex items-center gap-2 text-base">
            <FaCalendarAlt className="text-gray-500" />
            <span className="text-gray-700 text-sm">모집 마감일</span>
            <span className="ml-auto font-semibold text-sm text-gray-700">
              {formatDate(post.recruitmentPeriod)}
            </span>
          </div>
          {/* 스터디 기간 */}
          <div className="flex items-center gap-2 text-base">
            <FaCalendarAlt className="text-gray-500" />
            <span className="text-gray-700 text-sm">스터디 기간</span>
            <span className="ml-auto font-semibold text-sm text-gray-700">
              {formatDate(post.startDate)} ~ {formatDate(post.endDate)}
            </span>
          </div>
          {/* 스터디 시간 */}
          <div className="flex items-center gap-2 text-base">
            <FaClock className="text-gray-500" />
            <span className="text-gray-700 text-sm">스터디 시간</span>
            <span className="ml-auto font-semibold text-sm text-gray-700">
              {formatTime(post.startTime)} ~ {formatTime(post.endTime)}
            </span>
          </div>
        </div>

        {/* 상세보기 버튼 */}
        <div className="text-right mt-4">
          <span className="text-sm font-semibold text-gray-500 rounded-full px-1 py-1 btn-ghost group-hover:bg-gray-300 group-hover:text-black transition-colors">
            상세보기 →
          </span>
        </div>
      </div>
    </div>
  );
}
