'use client';

import { useAuthStore } from '@/store/authStore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import CustomAlert from '@/components/common/Alert';
export default function QnAEditPage() {
  const params = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isSignedIn, userInfo } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/signin');
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/qna-posts/${params.id}`,
        );
        const post = response.data;

        if (userInfo?.email !== post.user.email) {
          setAlertMessage('수정 권한이 없습니다.');
          setShowAlert(true);
          router.push('/community/qna');
          return;
        }

        setTitle(post.title);
        setContent(post.content);
        if (post.thumbnailImgUrl) {
          setFilePreview(post.thumbnailImgUrl);
        }
      } catch (error) {
        console.error('게시글 조회 실패:', error);
        router.push('/community/qna');
      }
    };

    fetchPost();
  }, [isSignedIn, params.id, router, userInfo?.email]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('author', userInfo?.email || '');

    // 새로운 파일이 첨부된 경우
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    // 기존 이미지가 있고 새로운 파일이 첨부되지 않은 경우
    else if (
      filePreview &&
      filePreview !==
        'https://devonoffbucket.s3.ap-northeast-2.amazonaws.com/default/thumbnail.png'
    ) {
      formData.append('thumbnailImgUrl', filePreview);
    }
    // 기본 이미지인 경우
    else {
      formData.append(
        'thumbnailImgUrl',
        'https://devonoffbucket.s3.ap-northeast-2.amazonaws.com/default/thumbnail.png',
      );
    }

    try {
      await axios.post(`/api/qna-posts/${params.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await queryClient.invalidateQueries({ queryKey: ['qna-posts'] });
      router.push(`/community/qna/${params.id}`);
    } catch (error) {
      console.error('게시글 수정 실패:', error);
      setAlertMessage('게시글 수정에 실패했습니다.');
      setShowAlert(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">이미지</span>
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full"
          />
          <button
            type="button"
            onClick={() => {
              setFilePreview(
                'https://devonoffbucket.s3.ap-northeast-2.amazonaws.com/default/thumbnail.png',
              );
              setSelectedFile(null);
            }}
            className="btn border-gray-800 bg-white text-gray-800 hover:bg-teal-50 hover:border-teal-500 hover:text-teal-500"
          >
            기본 이미지로 변경
          </button>
        </div>
        {filePreview && (
          <div className="mt-2">
            <img
              src={filePreview}
              alt="이미지 미리보기"
              className="w-full max-w-xs rounded-lg"
            />
          </div>
        )}
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">제목</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="input input-bordered"
          required
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">내용</span>
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="textarea textarea-bordered h-32"
          required
        />
      </div>

      <button
        type="submit"
        className="btn w-full bg-teal-500 text-white hover:bg-teal-600 hover:text-black"
      >
        수정하기
      </button>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          onConfirm={() => router.push(`/community/qna/${params.id}`)}
        />
      )}
    </form>
  );
}
