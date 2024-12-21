// 'use client';

import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { StudyPost } from '@/types/post';
import Image from 'next/image';
import {
  convertSubjectToKorean,
  convertDifficultyToKorean,
} from '@/utils/study';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

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

  return (
    <div
      className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow w-full min-w-[320px] max-w-[320px] group"
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
      <div className="card-body">
        <h2 className="card-title text-xl mb-4">
          {truncateText(post.title, 20)}
        </h2>

        {/* 정보 뱃지 그리드 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="badge badge-lg bg-primary/70 px-4 py-3 rounded-full">
            {truncateText(convertSubjectToKorean(post.subject), 7)}
          </div>
          <div className="badge badge-lg bg-accent/70 px-2 py-3 rounded-full">
            {truncateText(convertDifficultyToKorean(post.difficulty), 5)}
          </div>
          <div className="badge badge-lg bg-secondary px-4 py-3 rounded-full">
            {post.currentParticipants + 1}/{post.maxParticipants}명
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

        {/* 하단 시간 정보 */}
        <div className="mt-6 space-y-4">
          {/* 모집 마감일 */}
          <div className="flex items-center gap-2 text-base">
            <FaCalendarAlt className="text-red-400" />
            <span className="text-gray-700">모집 마감일</span>
            <span className="ml-auto font-semibold text-gray-700">
              {dayjs(post.recruitmentPeriod).format('YY.MM.DD')}
            </span>
          </div>
          {/* 스터디 기간 */}
          <div className="flex items-center gap-2 text-base">
            <FaCalendarAlt className="text-gray-500" />
            <span className="text-gray-700">스터디 기간</span>
            <span className="ml-auto font-semibold text-gray-700">
              {dayjs(post.startDate).format('YY.MM.DD')} ~{' '}
              {dayjs(post.endDate).format('YY.MM.DD')}
            </span>
          </div>
          {/* 스터디 시간 */}
          <div className="flex items-center gap-2 text-base">
            <FaClock className="text-gray-500" />
            <span className="text-gray-700">스터디 시간</span>
            <span className="ml-auto font-semibold text-gray-700">
              {formatTime(post.startTime)} ~ {formatTime(post.endTime)}
            </span>
          </div>
        </div>

        {/* 상세보기 버튼 */}
        <div className="text-right mt-4">
          <span className="text-base py-1 px-3 text-gray-500 rounded-full font-semibold btn-ghost ml-auto group-hover:bg-gray-300 group-hover:text-black transition-colors">
            상세보기 →
          </span>
        </div>
      </div>
    </div>
  );
}
