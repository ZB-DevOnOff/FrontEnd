'use client';

import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { StudyPost } from '@/types/study';

interface StudyCardProps {
  post: StudyPost;
}

export function StudyCard({ post }: StudyCardProps) {
  const router = useRouter();

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure className="px-4 pt-4">
        <img
          src={post.thumbnailImgUrl || '/default-study-thumbnail.png'}
          alt={post.title}
          className="rounded-xl h-48 w-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-lg">{post.title}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>모집 인원:</span>
            <span>
              {post.currentParticipants}/{post.maxParticipants}명
            </span>
          </div>
          <div className="flex justify-between">
            <span>주제:</span>
            <span>{post.subject}</span>
          </div>
          <div className="flex justify-between">
            <span>난이도:</span>
            <span>{post.difficulty}</span>
          </div>
          <div className="flex justify-between">
            <span>기간:</span>
            <span>
              {dayjs(post.startDate).format('MM.DD')} ~{' '}
              {dayjs(post.endDate).format('MM.DD')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>시간:</span>
            <span>
              {post.startTime} ~ {post.endTime}
            </span>
          </div>
        </div>
        <div className="card-actions justify-end mt-4">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => router.push(`/community/study/${post.id}`)}
          >
            상세보기
          </button>
        </div>
      </div>
    </div>
  );
}
