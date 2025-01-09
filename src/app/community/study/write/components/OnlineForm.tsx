'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  SUBJECT_OPTIONS,
  DIFFICULTY_OPTIONS,
  DAY_KOREAN,
  BaseStudyPost,
} from '@/types/study';
import { useAuthStore } from '@/store/authStore';
import { useQueryClient } from '@tanstack/react-query';
import CustomAlert from '@/components/common/Alert';

interface OnlineFormProps {
  initialData?: BaseStudyPost;
  isEdit?: boolean;
}

export default function OnlineForm({ initialData, isEdit }: OnlineFormProps) {
  const router = useRouter();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [studyStartDate, setStudyStartDate] = useState<string>('');
  const [recruitmentEndDate, setRecruitmentEndDate] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (initialData && isEdit) {
      setSelectedDays(initialData.dayType);
      if (initialData.thumbnailImgUrl) {
        setThumbnailPreview(initialData.thumbnailImgUrl);
      }
    }
  }, [initialData, isEdit]);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append('file', selectedFile);
      } else if (
        thumbnailPreview &&
        thumbnailPreview !==
          'https://devonoffbucket.s3.ap-northeast-2.amazonaws.com/default/thumbnail.png'
      ) {
        formData.append('thumbnailImgUrl', thumbnailPreview);
      } else {
        formData.append(
          'thumbnailImgUrl',
          'https://devonoffbucket.s3.ap-northeast-2.amazonaws.com/default/thumbnail.png',
        );
      }

      const requiredFields = {
        title: (e.currentTarget.elements.namedItem('title') as HTMLInputElement)
          .value,
        studyName: (
          e.currentTarget.elements.namedItem('studyName') as HTMLInputElement
        ).value,
        subject: (
          e.currentTarget.elements.namedItem('subject') as HTMLSelectElement
        ).value,
        difficulty: (
          e.currentTarget.elements.namedItem('difficulty') as HTMLSelectElement
        ).value,
        dayType: selectedDays,
        startDate: (
          e.currentTarget.elements.namedItem(
            'studyStartDate',
          ) as HTMLInputElement
        ).value,
        endDate: (
          e.currentTarget.elements.namedItem('studyEndDate') as HTMLInputElement
        ).value,
        startTime: (
          e.currentTarget.elements.namedItem(
            'meetingStartTime',
          ) as HTMLInputElement
        ).value,
        endTime: (
          e.currentTarget.elements.namedItem(
            'meetingEndTime',
          ) as HTMLInputElement
        ).value,
        meetingType: 'ONLINE',
        recruitmentPeriod: (
          e.currentTarget.elements.namedItem(
            'recruitmentEndDate',
          ) as HTMLInputElement
        ).value,
        maxParticipants:
          Number(
            (
              e.currentTarget.elements.namedItem(
                'maxMembers',
              ) as HTMLInputElement
            ).value,
          ) + 1,
        description: (
          e.currentTarget.elements.namedItem(
            'description',
          ) as HTMLTextAreaElement
        ).value,
        userId: userInfo?.id,
        status: initialData?.status || 'RECRUITING',
      };

      // FormData에 필드 추가
      Object.entries(requiredFields).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'dayType' && Array.isArray(value)) {
            formData.append(key, value.join(','));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      if (isEdit && initialData) {
        try {
          await axios.post(`/api/study-posts/${initialData.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setAlertMessage('스터디 글이 수정되었습니다!');
          setShowAlert(true);
        } catch (error: any) {
          console.error('스터디 글 수정 실패:', error);
          setAlertMessage(
            error.response?.data?.message ||
              '스터디 글 수정에 실패했습니다. 다시 시도해주세요.',
          );
          setShowAlert(true);
          return;
        }
      } else {
        try {
          await axios.post('/api/study-posts', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          setAlertMessage('스터디 글이 작성되었습니다!');
          setShowAlert(true);
          await queryClient.invalidateQueries({ queryKey: ['studies'] });
        } catch (error: any) {
          console.error('스터디 글 작성/수정 실패:', error);
          setAlertMessage(
            error.response?.data?.errorMessage ||
              '스터디 글 작성/수정에 실패했습니다. 다시 시도해주세요.',
          );
          setShowAlert(true);
          return;
        }
      }
    } catch (error: any) {
      console.error('요청 실패:', error);
      setAlertMessage('요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text">썸네일 이미지</span>
        </label>
        <input
          type="file"
          name="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          className="file-input file-input-bordered w-full"
        />
        {thumbnailPreview && (
          <div className="mt-2">
            <img
              src={thumbnailPreview}
              alt="썸네일 미리보기"
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
          defaultValue={initialData?.title}
          required
          className="input input-bordered"
          placeholder="모집 글의 제목을 입력하세요"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">스터디명</span>
        </label>
        <input
          type="text"
          name="studyName"
          defaultValue={initialData?.studyName}
          required
          className="input input-bordered"
          placeholder="스터디명을 입력하세요"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">스터디 주제</span>
        </label>
        <select
          name="subject"
          required
          className="select select-bordered"
          defaultValue={initialData?.subject || ''}
        >
          <option value="">주제 선택</option>
          {Object.entries(SUBJECT_OPTIONS).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">난이도</span>
        </label>
        <select
          name="difficulty"
          required
          className="select select-bordered"
          defaultValue={initialData?.difficulty || 'BEGINNER'}
        >
          {Object.entries(DIFFICULTY_OPTIONS).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">모집 마감일</span>
        </label>
        <input
          type="date"
          name="recruitmentEndDate"
          defaultValue={initialData?.recruitmentPeriod}
          required
          className="input input-bordered"
          min={dayjs().format('YYYY-MM-DD')}
          max={dayjs().add(1, 'month').format('YYYY-MM-DD')}
          onChange={e => setRecruitmentEndDate(e.target.value)}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">스터디 기간</span>
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            name="studyStartDate"
            defaultValue={initialData?.startDate}
            required
            className="input input-bordered flex-1"
            min={dayjs(recruitmentEndDate).format('YYYY-MM-DD')}
            max={dayjs(recruitmentEndDate).add(7, 'day').format('YYYY-MM-DD')}
            onChange={e => setStudyStartDate(e.target.value)}
          />
          <span className="self-center">~</span>
          <input
            type="date"
            name="studyEndDate"
            defaultValue={initialData?.endDate}
            required
            className="input input-bordered flex-1"
            min={studyStartDate || dayjs().format('YYYY-MM-DD')}
            max={dayjs(studyStartDate).add(60, 'day').format('YYYY-MM-DD')}
            disabled={!studyStartDate}
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">모집 인원</span>
        </label>
        <input
          type="number"
          name="maxMembers"
          required
          min={1}
          max={9}
          defaultValue={
            initialData?.maxParticipants ? initialData.maxParticipants - 1 : 1
          }
          step={1}
          className="input input-bordered"
          placeholder="모집할 인원을 1~9명 사이로 입력하세요"
          onChange={e => {
            const value = parseInt(e.target.value);
            e.target.value = String(Math.min(Math.max(value, 1), 9));
          }}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">스터디 시간</span>
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="time"
            name="meetingStartTime"
            defaultValue={initialData?.startTime}
            required
            className="input input-bordered flex-1"
          />
          <span className="text-base-content/70">~</span>
          <input
            type="time"
            name="meetingEndTime"
            defaultValue={initialData?.endTime}
            required
            className="input input-bordered flex-1"
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">스터디 요일</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.values(DAY_KOREAN).map(day => (
            <button
              key={day}
              type="button"
              className={`btn btn-sm border-black ${
                selectedDays.includes(day)
                  ? 'border-teal-500 text-teal-500 bg-white'
                  : 'bg-white hover:bg-white hover:border-teal-500 hover:text-teal-500'
              }`}
              onClick={() => handleDayToggle(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">스터디 소개</span>
        </label>
        <textarea
          name="description"
          defaultValue={initialData?.description}
          required
          className="textarea textarea-bordered h-32"
          placeholder="스터디에 대해 자세히 설명해주세요"
        />
      </div>

      <button
        type="submit"
        className="btn w-full bg-teal-500 text-white hover:bg-teal-600 hover:text-black"
        disabled={isLoading}
      >
        {isLoading
          ? isEdit
            ? '수정 중...'
            : '작성 중...'
          : isEdit
            ? '수정 완료'
            : '작성 완료'}
      </button>

      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          onConfirm={() => {
            if (isEdit && initialData) {
              router.push(`/community/study/${initialData.id}`);
            } else {
              router.push('/community/study');
            }
          }}
        />
      )}
    </form>
  );
}
