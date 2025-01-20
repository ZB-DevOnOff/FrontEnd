'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import CustomAlert from '@/components/common/Alert';
import axios from 'axios';
import handleApiErrorWithoutInterceptor from '@/utils/handleApiErrorWithoutInterceptor';

const KakaoCallbackClient = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  console.log(`code: ${code}`);
  const router = useRouter();
  const { setIsSignedIn, setUserInfo } = useAuthStore();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const showErrorAlert = (errorMessage: string | null) => {
    setAlertMessage(errorMessage || '알 수 없는 오류가 발생했습니다.');
    setShowAlert(true);
  };

  useEffect(() => {
    const sendKakaoAuthCode = async () => {
      if (!code) {
        setAlertMessage('카카오 인증 코드가 없습니다.');
        setShowAlert(true);
        router.push('/signin');
        return;
      }

      try {
        const response = await axios.post(
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
        handleApiErrorWithoutInterceptor(error, showErrorAlert);
      }
    };

    sendKakaoAuthCode();
  }, [code]);

  return (
    <>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => {
            setShowAlert(false);
          }}
        />
      )}
    </>
  );
};

export default KakaoCallbackClient;
