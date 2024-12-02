'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Comment } from '@/types/comments';
import dayjs from 'dayjs';

interface CommentsProps {
  studyId: string;
}

export default function Comments({ studyId }: CommentsProps) {
  const { isLoggedIn, getAuthHeader } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments?studyId=${studyId}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error('댓글 목록 조회 실패:', error);
      }
    };

    fetchComments();
  }, [studyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isLoggedIn) return;

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          studyId,
          content,
          parentId: replyTo,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev =>
          replyTo
            ? prev.map(comment =>
                comment.id === replyTo
                  ? { ...comment, replies: [...comment.replies, newComment] }
                  : comment,
              )
            : [...prev, newComment],
        );
        setContent('');
        setReplyTo(null);
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const CommentItem = ({ comment }: { comment: Comment }) => (
    <div className="mb-4">
      <div className="bg-base-200 p-4 rounded-lg">
        <div className="flex justify-between mb-2">
          <span className="font-semibold">{comment.author.nickname}</span>
          <span className="text-sm text-gray-500">
            {dayjs(comment.createdAt).format('YYYY.MM.DD HH:mm')}
          </span>
        </div>
        <p className="mb-2">{comment.content}</p>
        {isLoggedIn && (
          <button
            onClick={() => setReplyTo(comment.id)}
            className="text-sm text-primary hover:underline"
          >
            답글 달기
          </button>
        )}
      </div>
      {comment.replies.length > 0 && (
        <div className="ml-8 mt-2">
          {comment.replies.map(reply => (
            <CommentItem key={reply.id} comment={reply} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">댓글</h3>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="댓글을 입력하세요..."
            rows={3}
          />
          <div className="flex justify-end mt-2">
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="btn btn-ghost mr-2"
              >
                답글 취소
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              {replyTo ? '답글 작성' : '댓글 작성'}
            </button>
          </div>
        </form>
      ) : (
        <div className="alert alert-info mb-6">
          <span>댓글을 작성하려면 로그인이 필요합니다.</span>
        </div>
      )}

      <div className="space-y-4">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
