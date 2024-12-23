'use client';

import { QnAPost } from '@/types/post';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaUser, FaRegCalendar } from 'react-icons/fa';

interface MyPostCardProps {
  post: QnAPost;
}

const MyQnAPostCard = ({ post }: MyPostCardProps) => {
  const router = useRouter();

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const formatDate = (date: string) => {
    const d = date.replace('T', ' ').substring(2, 16);
    return d.replace(/-/g, '.').replace(' ', ' ');
  };

  return (
    <div
      className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow w-full min-w-[330px] max-w-[330px] group h-[500px]"
      onClick={() => router.push(`/community/qna/${post.id}`)}
    >
      <figure className="px-4 pt-4">
        <Image
          src={post?.thumbnailImgUrl || '/default-study-thumbnail.png'}
          alt={post.title}
          width={500}
          height={300}
          className="rounded-xl h-48 w-full object-cover"
        />
      </figure>
      <div className="card-body flex flex-col justify-between">
        <h2 className="card-title text-xl">{truncateText(post.title, 50)}</h2>
        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-2 text-base">
            <FaUser className="text-gray-500" />
            <span className="font-semibold text-sm text-gray-500">작성자</span>
            <span className="ml-auto font-base text-sm text-gray-500">
              {post.user.nickname}
            </span>
          </div>
          <div className="flex items-center gap-2 text-base">
            <FaRegCalendar className="text-gray-500" />
            <span className="font-semibold text-sm text-gray-500">작성일</span>
            <span className="ml-auto font-base text-gray-90 text-sm text-gray-500">
              {formatDate(post.createdAt)}
            </span>
          </div>
          <div className="flex items-center bg-slate-100 px-3 py-3 rounded-lg mb-2 h-20">
            <span className="ml-auto font-base text-sm text-gray-900 line-clamp-3 text-left w-full">
              {post.content}
            </span>
          </div>
        </div>

        <div className="text-right mt-4">
          <span className="text-sm font-semibold text-gray-500 rounded-full px-1 py-1 btn-ghost group-hover:bg-gray-300 group-hover:text-black transition-colors">
            상세보기 →
          </span>
        </div>
      </div>
    </div>
  );
};

export default MyQnAPostCard;
