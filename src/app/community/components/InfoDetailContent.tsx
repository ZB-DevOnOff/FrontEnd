'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { InfoPost } from '@/types/post';
import Comments from '@/app/community/study/[id]/components/Comments';
import { useQueryClient } from '@tanstack/react-query';
import CustomAlert from '@/components/common/Alert/index';

interface InfoDetailContentProps {
  postId: string;
}

export default function InfoDetailContent({ postId }: InfoDetailContentProps) {
  const [post, setPost] = useState<InfoPost | null>(null);
  const { isSignedIn, userInfo } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/info-posts/${postId}`,
        );
        setPost(response.data);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
      }
    };

    fetchPost();
  }, [postId]);

  const isAuthor = isSignedIn && userInfo?.email === post?.user.email;

  const handleDelete = async () => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/info-posts/${postId}`,
        );
        await queryClient.invalidateQueries({ queryKey: ['info-posts'] });
        setAlertMessage('게시글이 삭제되었습니다.');
        setShowAlert(true);
      } catch (error) {
        console.error('삭제 실패:', error);
        setAlertMessage('게시글 삭제에 실패했습니다.');
        setShowAlert(true);
      }
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-base-100 shadow-xl rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          <div className="flex justify-between text-sm text-base-content/60">
            <span>작성자: {post.user.nickname}</span>
            <span>
              작성일: {dayjs(post.createdAt).format('YYYY.MM.DD HH:mm')}
            </span>
          </div>
        </div>

        <div className="flex gap-8">
          <div className="flex-1 prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.description || '' }} />
          </div>

          {post.thumbnailImgUrl && (
            <div className="w-64 flex-shrink-0">
              <img
                src={post.thumbnailImgUrl}
                alt="게시글 썸네일"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>

        {isAuthor && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => router.push(`/community/info/edit/${post.id}`)}
              className="btn border-gray-800 bg-white text-gray-800 hover:bg-teal-50 hover:border-teal-500 hover:text-teal-500"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="btn border-gray-800 bg-white text-gray-780 hover:bg-red-50 hover:border-customRed hover:text-customRed"
            >
              삭제
            </button>
          </div>
        )}

        <div className="mt-8">
          <Comments studyId={postId} postType="INFO" />
        </div>
      </div>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          onConfirm={() => router.push('/community/info')}
        />
      )}
    </div>
  );
}
