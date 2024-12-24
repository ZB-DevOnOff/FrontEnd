'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import CustomAlert from '@/components/common/Alert/index';

export default function InfoWritePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const { isSignedIn } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/signin');
    }
  }, [isSignedIn]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const fileInput = (e.target as HTMLFormElement).querySelector(
        'input[name="file"]',
      ) as HTMLInputElement;
      const file = fileInput.files?.[0];

      if (file) {
        formData.append('file', file);
      }

      formData.append('title', title);
      formData.append('description', description);

      await axios.post('/api/info-posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await queryClient.invalidateQueries({ queryKey: ['info-posts'] });
      setAlertMessage('게시글이 작성되었습니다!');
      setShowAlert(true);
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      setAlertMessage('게시글 작성에 실패했습니다.');
      setShowAlert(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">이미지</span>
        </label>
        <input
          type="file"
          name="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full"
        />
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
          name="title"
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
          name="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="textarea textarea-bordered h-32"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary w-full">
        작성하기
      </button>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          onConfirm={() => router.push('/community/info')}
        />
      )}
    </form>
  );
}
