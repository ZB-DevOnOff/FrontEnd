'use client';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SiNaver } from 'react-icons/si';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { RiKakaoTalkFill } from 'react-icons/ri';
import handleApiErrorWithoutInterceptor from '@/utils/handleApiErrorWithoutInterceptor';

const SingInPage = () => {
  const signInErrorCodeHandlers = {
    INVALID_CREDENTIALS:
      '이메일 혹은 비밀번호가 일치하지 않습니다. 입력한 내용을 다시 확인해 주세요.',
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { setIsSignedIn, setUserInfo } = useAuthStore();
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSignInSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      setError('');

      if (!email || !password) {
        setError('이메일과 비밀번호를 입력해주세요.');
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/auth/sign-in`,
        {
          email,
          password,
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
      handleApiErrorWithoutInterceptor(
        error,
        setError,
        signInErrorCodeHandlers,
      );
      // if (error.response) {
      //   const { status, data } = error.response;
      //   console.log(`status: ${status}`);
      //   const errorCode = data?.errorCode;
      //   console.log(`errorRes: ${errorCode}`);
      //   if (status === 401) {
      //     setError(
      //       '이메일 혹은 비밀번호가 일치하지 않습니다. 입력한 내용을 다시 확인해 주세요.',
      //     );
      //   } else if (status === 403) {
      //     setError('탈퇴한 계정입니다.');
      //   } else if (status === 404) {
      //     setError('사용자를 찾을 수 없습니다.');
      //   } else {
      //     setError('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      //   }
      // } else {
      //   setError('서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.');
      // }
    }
  };

  const handleNaverSignInButtonClick = async () => {
    try {
      const state = Math.trunc(Math.random() * 1e6) + '';
      // 네이버 로그인 페이지로 리디렉션
      const naverAuthURL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI}&state=${state}`;
      window.location.href = naverAuthURL;
    } catch (error) {
      console.error('네이버 로그인 오류:', error);
    }
  };

  const handleKakaoSignInButtonClick = async () => {
    try {
      // 카카오 로그인 페이지로 리디렉션
      const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI}&response_type=code&scope=profile_nickname,account_email`;
      window.location.href = kakaoAuthURL;
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
      <form onSubmit={handleSignInSubmit} className="w-full">
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-2 font-semibold text-sm sm:text-base"
          >
            이메일
          </label>
          <div className="flex items-center">
            <input
              id="email"
              type="email"
              value={email}
              placeholder="이메일을 입력해 주세요."
              onChange={e => {
                setEmail(e.target.value);
                setError('');
              }}
              className="w-full flex-grow input input-bordered px-4 py-2 focus:outline-teal-500 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block mb-2 font-semibold text-sm sm:text-base"
          >
            비밀번호
          </label>
          <div className="relative">
            <input
              id="password"
              type={passwordVisible ? 'text' : 'password'}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="비밀번호를 입력해 주세요."
              className="w-full input input-bordered px-4 py-2 focus:outline-teal-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 mr-2"
            >
              {passwordVisible ? (
                <FaRegEye size={20} />
              ) : (
                <FaRegEyeSlash size={20} />
              )}
            </button>
          </div>
        </div>
        {error && (
          <p className="text-red-500 mt-2 text-sm sm:text-base">{error}</p>
        )}
        <button
          type="submit"
          className="w-full btn bg-teal-500 text-teal-50 hover:text-black hover:bg-teal-600 text-sm sm:text-base"
        >
          로그인
        </button>
      </form>
      <div className="mt-4 w-full space-y-4">
        <button
          name="Naver"
          className="flex items-center justify-center w-full btn bg-green-500 hover:bg-green-600 hover:text-white text-sm sm:text-base"
          onClick={handleNaverSignInButtonClick}
        >
          <SiNaver className="mr-2 text-white" size={16} />
          <span className="font-medium">Naver</span> 로그인
        </button>
        <button
          name="Kakao"
          className="flex items-center justify-center w-full btn text-yellow-950 bg-yellow-300 hover:bg-yellow-500 hover:text-white text-sm sm:text-base"
          onClick={handleKakaoSignInButtonClick}
        >
          <RiKakaoTalkFill className="mr-2 text-yellow-950" size={24} />
          <span className="font-medium">Kakao</span> 로그인
        </button>
      </div>
    </div>
  );
};

export default SingInPage;
