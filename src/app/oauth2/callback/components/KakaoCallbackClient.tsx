'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import CustomAlert from '@/components/common/Alert';
import axiosInstance from '@/utils/axios';

const KakaoCallbackClient = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  console.log(`code: ${code}`);
  const router = useRouter();
  const { setIsSignedIn, setUserInfo } = useAuthStore();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const sendKakaoAuthCode = async () => {
      if (!code) {
        setAlertMessage('카카오 인증 코드가 없습니다.');
        setShowAlert(true);
        router.push('/signin');
        return;
      }

      try {
        const response = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/auth/sign-in/kakao`,
          {
            code,
          },
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
        if (response.status === 200 && response.data.userInfo) {
          setIsSignedIn(true);
          setUserInfo(response.data.userInfo);

          console.log('현재 사용자 정보: ', response.data.userInfo);
          console.log('현재 로그인 상태: ', true);

          router.push('/community/study');
        }
      } catch (error: any) {
        if (error) {
          const { status, errorMessage, errorCode } = error;

          if (status === 500 && errorCode === 'INTERNAL_SERVER_ERROR') {
            setAlertMessage(errorMessage);
            setShowAlert(true);
          } else {
            setAlertMessage(
              '카카오 로그인에 실패했습니다. 다시 시도해 주세요.',
            );
            setShowAlert(true);
          }
        } else {
          setAlertMessage(
            '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.',
          );
          setShowAlert(true);
        }
      }
    };

    sendKakaoAuthCode();
  }, [code]);

  return (
    <>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </>
  );
};

export default KakaoCallbackClient;
