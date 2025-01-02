'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import OnlineForm from '../../write/components/OnlineForm';
import HybridForm from '../../write/components/HybridForm';
import { BaseStudyPost } from '@/types/study';
import { useAuthStore } from '@/store/authStore';
import CustomAlert from '@/components/common/Alert';

export default function StudyEditPage() {
  const params = useParams();
  const router = useRouter();
  const [study, setStudy] = useState<BaseStudyPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isSignedIn, userInfo } = useAuthStore();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/signin');
      return;
    }

    const fetchStudy = async () => {
      try {
        const response = await axios.get(`/api/study-posts/${params.id}`);
        const studyData = response.data;

        if (userInfo?.id !== studyData.user.id) {
          setAlertMessage('수정 권한이 없습니다.');
          setShowAlert(true);
          router.push('/community/study');
          return;
        }

        setStudy(studyData);
      } catch (error) {
        console.error('스터디 정보 로딩 실패:', error);
        setAlertMessage('스터디 정보를 불러오는데 실패했습니다.');
        setShowAlert(true);
        router.push('/community/study');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudy();
  }, [params.id, isSignedIn, userInfo?.id]);

  if (isLoading) return <div>로딩 중...</div>;
  if (!study) return <div>스터디 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">스터디 모집 글 수정</h1>
      {study.meetingType === 'ONLINE' ? (
        <OnlineForm initialData={study} isEdit={true} />
      ) : (
        <HybridForm initialData={study} isEdit={true} />
      )}
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
