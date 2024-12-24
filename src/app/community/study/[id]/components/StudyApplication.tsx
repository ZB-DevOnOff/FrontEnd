'use client';

import { StudyPost } from '@/types/post';
import type { StudyApplication } from '@/types/study';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import axios from 'axios';
import CustomAlert from '@/components/common/Alert';
export function StudyApplication({
  study,
  isAuthor,
  setStudy,
}: {
  study: StudyPost;
  isAuthor: boolean;
  setStudy: React.Dispatch<React.SetStateAction<StudyPost | null>>;
}) {
  const { userInfo, isSignedIn } = useAuthStore();
  const [applications, setApplications] = useState<StudyApplication[]>([]);
  const [myApplication, setMyApplication] = useState<StudyApplication | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 신청 목록 조회
  useEffect(() => {
    const fetchApplications = async () => {
      if (!isSignedIn) return;

      try {
        const response = await axios.get(
          `/api/study-signup?studyPostId=${study.id}`,
        );
        const data = response.data;

        if (isAuthor) {
          setApplications(data);
        } else {
          const myApp = data.find(
            (app: StudyApplication) => app.userId === userInfo?.id,
          );
          setMyApplication(myApp || null);
        }
      } catch (error) {
        console.error('신청 목록 조회 실패:', error);
      }
    };

    fetchApplications();
  }, [study.id, isSignedIn, isAuthor, userInfo?.id]);

  // 신청하기
  const handleApply = async () => {
    if (!isSignedIn || !userInfo) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/study-signup', {
        studyPostId: study.id,
        userId: userInfo.id,
      });

      if (response.status === 200) {
        setMyApplication(response.data);
        setAlertMessage('스터디 신청이 완료되었습니다.');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('스터디 신청 실패:', error);
      setError('스터디 신청에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 신청 상태 변경 (수락/거절)
  const handleStatusChange = async (
    applicationId: number,
    newStatus: 'APPROVED' | 'REJECTED',
  ) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/study-signup/${applicationId}?newStatus=${newStatus}`,
      );

      if (response.status === 200) {
        setApplications(prev =>
          prev.map(app =>
            app.signupId === applicationId
              ? { ...app, status: newStatus }
              : app,
          ),
        );
        setAlertMessage(
          newStatus === 'APPROVED'
            ? '신청이 수락되었습니다.'
            : '신청이 거절되었습니다.',
        );
        setShowAlert(true);
      }
    } catch (error: any) {
      console.error('신청 상태 변경 실패:', error);
      if (error.response?.data?.errorMessage) {
        setAlertMessage(error.response.data.errorMessage);
      } else {
        setAlertMessage('신청 상태 변경에 실패했습니다.');
      }
      setShowAlert(true);
    }
  };

  // 신청 취소 기능
  const handleCancelApplication = async (applicationId: number) => {
    try {
      const response = await axios.delete(`/api/study-signup/${applicationId}`);

      if (response.status === 200) {
        setMyApplication(null);
        setAlertMessage('신청 취소가 완료되었습니다.');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('신청 취소 실패:', error);
    }
  };

  // 스터디 마감 기능
  const handleCloseRecruitment = async () => {
    if (!window.confirm('정말로 이 스터디 모집을 마감하시겠습니까?')) return;

    try {
      const response = await axios.patch(`/api/study-posts/${study.id}/close`);
      if (response.status === 200) {
        setStudy(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'CLOSED',
          };
        });
        setAlertMessage('스터디 모집이 마감되었습니다.');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('스터디 마감 실패:', error);
      setAlertMessage('스터디 모집 마감에 실패했습니다. 다시 시도해주세요.');
      setShowAlert(true);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="alert alert-info">
        <span>스터디 신청은 로그인 후 가능합니다.</span>
      </div>
    );
  }

  if (isAuthor) {
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">신청 현황</h3>
          {study.status === 'RECRUITING' && (
            <button
              onClick={handleCloseRecruitment}
              className="btn btn-secondary"
            >
              모집 마감하기
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>닉네임</th>
                <th>신청일</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.signupId}>
                  <td>{app.nickname}</td>
                  <td>{dayjs(app.createdAt).format('YYYY.MM.DD')}</td>
                  <td>{app.status}</td>
                  <td>
                    {app.status === 'PENDING' && (
                      <div className="space-x-2">
                        <button
                          className="btn btn-success btn-xs"
                          onClick={() =>
                            handleStatusChange(app.signupId, 'APPROVED')
                          }
                        >
                          수락
                        </button>
                        <button
                          className="btn btn-error btn-xs"
                          onClick={() =>
                            handleStatusChange(app.signupId, 'REJECTED')
                          }
                        >
                          거절
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showAlert && (
          <CustomAlert
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}
      </div>
    );
  }

  if (myApplication) {
    return (
      <div className="alert">
        <div className="flex justify-between items-center w-full">
          <span>
            신청 상태: {myApplication.status === 'PENDING' && '검토 중'}
            {myApplication.status === 'APPROVED' && '수락됨'}
            {myApplication.status === 'REJECTED' && '거절됨'}
          </span>
          {myApplication.status === 'PENDING' && (
            <button
              onClick={() => handleCancelApplication(myApplication.signupId)}
              className="btn btn-error btn-sm"
            >
              신청 취소
            </button>
          )}
        </div>
        {showAlert && (
          <CustomAlert
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  // 모집 상태가 아닌 경우 신청 버튼을 비활성화
  if (study.status !== 'RECRUITING') {
    return (
      <div className="alert">
        <span>
          {study.status === 'CLOSED' && '모집 완료된 스터디입니다.'}
          {study.status === 'CANCELED' && '취소된 스터디입니다.'}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        className="btn btn-primary w-full"
        onClick={handleApply}
        disabled={isLoading}
      >
        {isLoading ? '신청 중...' : '스터디 신청하기'}
      </button>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
