'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import axios from 'axios';

// dayjs 플러그인 설정
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Seoul');

interface CommentsProps {
  studyId: string;
  postType: 'STUDY' | 'INFO' | 'QNA';
}

interface CommentResponse {
  content: Comment[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isSecret?: boolean;
  user?: {
    id: number;
    nickname: string;
    email: string;
    profileImageUrl: string | null;
  };
  userDto?: {
    id: number;
    nickname: string;
    email: string;
    profileImageUrl: string | null;
  };
  replies: Comment[];
}

const getCommentsEndpoint = (postType: string, postId: string) => {
  switch (postType) {
    case 'STUDY':
      return `/study-posts/${postId}/comments`;
    case 'INFO':
      return `/info-posts/${postId}/comments`;
    case 'QNA':
      return `/qna-posts/${postId}/comments`;
    default:
      throw new Error('Invalid post type');
  }
};

const getReplyEndpoint = (postType: string) => {
  switch (postType) {
    case 'STUDY':
      return `/study-posts/comments`;
    case 'INFO':
      return `/info-posts/comments`;
    case 'QNA':
      return `/qna-posts/comments`;
    default:
      throw new Error('Invalid post type');
  }
};

const getCommentEndpoint = (postType: string, commentId: number) => {
  switch (postType) {
    case 'STUDY':
      return `/study-posts/comments/${commentId}`;
    case 'INFO':
      return `/info-posts/comments/${commentId}`;
    case 'QNA':
      return `/qna-posts/comments/${commentId}`;
    default:
      throw new Error('Invalid post type');
  }
};

const getReplyEndpointForEdit = (postType: string, replyId: number) => {
  switch (postType) {
    case 'STUDY':
      return `/study-posts/replies/${replyId}`;
    case 'INFO':
      return `/info-posts/replies/${replyId}`;
    case 'QNA':
      return `/qna-posts/replies/${replyId}`;
    default:
      throw new Error('Invalid post type');
  }
};

export default function Comments({ studyId, postType }: CommentsProps) {
  const { isSignedIn } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyToUser, setReplyToUser] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get<CommentResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/${postType.toLowerCase()}-posts/${studyId}/comments?page=${page}`,
        );
        if (response.status === 200) {
          const { content: commentData, totalPages: total } = response.data;
          setComments(commentData);
          setTotalPages(total);
        }
      } catch (error) {
        console.error('댓글 목록 조회 실패:', error);
        setComments([]);
      }
    };

    fetchComments();
  }, [studyId, page, postType]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isSignedIn) return;

    try {
      const response = await axios.post(
        replyTo
          ? `${process.env.NEXT_PUBLIC_API_ROUTE_URL}${getReplyEndpoint(postType)}/${replyTo}`
          : `${process.env.NEXT_PUBLIC_API_ROUTE_URL}${getCommentsEndpoint(postType, studyId)}`,
        {
          content: content,
          isSecret: false,
        },
      );

      if (response.status === 200) {
        const newComment = response.data;
        if (replyTo) {
          setComments(prev =>
            prev.map(comment =>
              comment.id === replyTo
                ? {
                    ...comment,
                    replies: Array.isArray(comment.replies)
                      ? [...comment.replies, newComment]
                      : [newComment],
                  }
                : comment,
            ),
          );
        } else {
          setComments(prev => [...prev, { ...newComment, replies: [] }]);
        }
        setContent('');
        setReplyTo(null);
        setReplyToUser(null);
        setPage(0);
      }
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    }
  };

  const handleReplyClick = (commentId: number, userNickname: string) => {
    setReplyTo(commentId);
    setReplyToUser(userNickname);
  };

  const CommentItem = ({
    comment,
    isReply = false,
  }: {
    comment: Comment;
    isReply?: boolean;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const { userInfo } = useAuthStore();

    const isCommentAuthor =
      userInfo?.id === (comment.user?.id || comment.userDto?.id);

    const handleEdit = async () => {
      try {
        const endpoint = isReply
          ? getReplyEndpointForEdit(postType, comment.id)
          : getCommentEndpoint(postType, comment.id);

        await axios.put(`${process.env.NEXT_PUBLIC_API_ROUTE_URL}${endpoint}`, {
          content: editContent,
          isSecret: comment.isSecret,
        });

        setComments(prev =>
          prev.map(c => {
            if (c.id === comment.id) {
              return { ...c, content: editContent };
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map(r =>
                  r.id === comment.id ? { ...r, content: editContent } : r,
                ),
              };
            }
            return c;
          }),
        );
        setIsEditing(false);
      } catch (error) {
        console.error('댓글 수정 실패:', error);
      }
    };

    const handleDelete = async () => {
      if (!window.confirm('정말로 삭제하시겠습니까?')) return;

      try {
        const endpoint = isReply
          ? getReplyEndpointForEdit(postType, comment.id)
          : getCommentEndpoint(postType, comment.id);

        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}${endpoint}?post_type=${postType}`,
        );

        setComments(prev =>
          isReply
            ? prev.map(c => ({
                ...c,
                replies: c.replies?.filter(r => r.id !== comment.id) || [],
              }))
            : prev.filter(c => c.id !== comment.id),
        );
      } catch (error) {
        console.error('댓글 삭제 실패:', error);
      }
    };

    return (
      <div className="mb-4">
        <div className="bg-base-200 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">
              {comment.user?.nickname || comment.userDto?.nickname}
            </span>
            <span className="text-sm text-gray-500">
              {dayjs.utc(comment.createdAt).tz().format('YYYY.MM.DD HH:mm')}
            </span>
          </div>

          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="btn btn-sm text-teal-50 bg-teal-500 hover:bg-teal-600 hover:text-black"
                >
                  수정
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn btn-sm text-black"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="mb-2">{comment.content}</p>
              <div className="flex gap-2">
                {isSignedIn && !isReply && (
                  <button
                    onClick={() =>
                      handleReplyClick(
                        comment.id,
                        comment.user?.nickname ||
                          comment.userDto?.nickname ||
                          '',
                      )
                    }
                    className="text-sm text-gray-500 hover:underline"
                  >
                    답글 달기
                  </button>
                )}
                {isCommentAuthor && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-teal-500 hover:underline"
                    >
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-sm text-customRed hover:underline"
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="ml-8 mt-2">
            {comment.replies.map((reply: Comment) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">댓글</h3>

      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-4 border rounded-lg resize-none focus:outline-teal-500"
            placeholder="댓글을 입력하세요..."
            rows={3}
          />
          <div className="flex justify-end mt-2 items-center">
            {replyTo && replyToUser && (
              <>
                <span className="text-sm text-gray-600 mr-2">
                  @{replyToUser}님에게 답글 작성
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyToUser(null);
                  }}
                  className="btn btn-ghost mr-2"
                >
                  답글 취소
                </button>
              </>
            )}
            <button
              type="submit"
              className="btn border-gray-800 bg-white text-gray-800 hover:bg-teal-50 hover:border-teal-500 hover:text-teal-500"
            >
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

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="join">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`join-item btn ${page === i ? 'btn-active' : ''}`}
                onClick={() => handlePageChange(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
