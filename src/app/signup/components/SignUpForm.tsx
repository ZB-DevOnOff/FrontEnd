'use client';
import CustomAlert from '@/components/common/Alert';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { AuthTimer } from './AuthTimer';
import handleApiErrorWithoutInterceptor from '@/utils/handleApiErrorWithoutInterceptor';

const SignUpForm = () => {
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [authCodeVerified, setAuthCodeVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [nickname, setNickname] = useState('');
  const [nicknameAvailable, setNicknameAvailable] = useState(false);

  const [emailMessage, setEmailMessage] = useState('');
  const [emailMessageType, setEmailMessageType] = useState<
    'success' | 'error' | ''
  >('');
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [nicknameMessageType, setNicknameMessageType] = useState<
    'success' | 'error' | ''
  >('');

  const [authCodeMessage, setAuthCodeMessage] = useState('');
  const [authCodeMessageType, setAuthCodeMessageType] = useState<
    'success' | 'error' | ''
  >('');

  const [passwordError, setPasswordError] = useState('');

  const [passwordCheckMessage, setPasswordCheckMessage] = useState('');
  const [passwordCheckMessageType, setPasswordCheckMessageType] = useState<
    'success' | 'error' | ''
  >('');

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordCheckVisible, setPasswordCheckVisible] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const [isTimerActive, setIsTimerActive] = useState(false);

  const router = useRouter();

  const showEmailErrorAlert = (errorMessage: string | null) => {
    setEmailMessage(
      errorMessage ||
        '인증 번호 전송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    );
    setEmailMessageType('error');
  };

  const showAuthCodeErrorAlert = (errorMessage: string | null) => {
    setAuthCodeMessage(
      errorMessage ||
        '인증 번호 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    );
    setAuthCodeMessageType('error');
  };

  const showNickNameAlert = (errorMessage: string | null) => {
    setNicknameMessage(
      errorMessage ||
        '닉네임 중복 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    );
    setNicknameMessageType('error');
    setNicknameAvailable(false);
  };

  const showSignUpErrorAlert = (errorMessage: string | null) => {
    setAlertMessage(
      errorMessage || '회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.',
    );
    setShowAlert(true);
  };

  // 이메일 형식 확인
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    // 이메일이 .com, .co.kr 같은 형식만 허용되도록 정교하게 확장
    const domainRegex = /\.(com|co\.kr|net|org|io|ai|gov|edu|info|biz)$/;
    return emailRegex.test(email) && domainRegex.test(email);
  };

  // 비밀번호 형식 확인 (비밀번호는 최소 8자 이상이며, 하나 이상의 영문자, 숫자, 특수문자가 포함되어야 함)
  const isValidPassword = (password: string) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password,
    );

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const togglePasswordCheckVisibility = () => {
    setPasswordCheckVisible(!passwordCheckVisible);
  };

  const handleAuthCodeSendClick = async () => {
    if (!isValidEmail(email)) {
      setEmailMessage('유효한 이메일 형식이 아닙니다.');
      setEmailMessageType('error');
      return;
    }

    try {
      const authCodeResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/email-send`,
        {
          email,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (authCodeResponse.status === 200) {
        setEmailSent(true);
        setEmailMessage('인증 번호가 발송되었습니다.');
        setEmailMessageType('success');
        setIsTimerActive(false);

        // 타이머를 초기화하고 다시 시작
        setIsTimerActive(false);
        setTimeout(() => {
          setIsTimerActive(true);
        }, 0);
      } else {
        setEmailMessage('인증 번호 전송에 실패했습니다.');
        setEmailMessageType('error');
      }
    } catch (error: any) {
      handleApiErrorWithoutInterceptor(error, showEmailErrorAlert);
      // if (error.response) {
      //   const { status, data } = error.response;
      //   console.log(`status: ${status}`);
      //   const errorCode = data?.errorCode;
      //   console.log(`errorRes: ${errorCode}`);

      //   if (status === 400) {
      //     if (errorCode === 'EMAIL_ALREADY_REGISTERED') {
      //       setEmailMessage('이미 사용 중인 이메일입니다.');
      //       setEmailMessageType('error');
      //     } else {
      //       setEmailMessage('잘못된 요청입니다. 다시 시도해주세요.');
      //       setEmailMessageType('error');
      //     }
      //   } else if (status === 500 && errorCode === 'EMAIL_SEND_FAILED') {
      //     setEmailMessage('인증번호 전송에 실패했습니다.');
      //     setEmailMessageType('error');
      //   } else {
      //     setEmailMessage('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      //     setEmailMessageType('error');
      //   }
      // } else {
      //   setEmailMessage(
      //     '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.',
      //   );
      //   setEmailMessageType('error');
      // }
    }
  };

  // 인증 번호 확인
  const handleAuthCodeVerifyClick = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/email-certification`,
        {
          email,
          certificationNumber: authCode,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      if (response.status === 200) {
        setAuthCodeVerified(true);
        setAuthCodeMessage('인증되었습니다.');
        setAuthCodeMessageType('success');
        setIsTimerActive(false);
      }
    } catch (error: any) {
      handleApiErrorWithoutInterceptor(error, showAuthCodeErrorAlert);
      // if (error.response) {
      //   const { data } = error.response;
      //   const message = data?.errorMessage;
      //   setAuthCodeMessage(message);
      //   setAuthCodeMessageType('error');
      // } else {
      //   setAuthCodeMessage(
      //     '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.',
      //   );
      //   setAuthCodeMessageType('error');
      // }
    }
  };

  // 타이머 종료 시
  const handleTimerEnd = () => {
    setIsTimerActive(false);
    setAuthCodeMessage('인증 번호가 만료되었습니다. 재발송해 주세요.');
    setAuthCodeMessageType('error');
  };

  // 닉네임 중복 확인
  const handleNicknameAvailabilityCheckClick = async () => {
    if (!nickname.trim()) {
      setNicknameMessage('닉네임을 입력하세요.');
      setNicknameMessageType('error');
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/check-nickname`,
        {
          nickname,
        },
      );
      if (response.status === 200) {
        setNicknameMessage('사용 가능한 닉네임입니다.');
        setNicknameMessageType('success');
        setNicknameAvailable(true);
      }
    } catch (error: any) {
      handleApiErrorWithoutInterceptor(error, showNickNameAlert);
      // if (error.response) {
      //   const { status, data } = error.response;
      //   const errorCode = data?.errorCode;

      //   if (status === 400) {
      //     if (errorCode === 'NICKNAME_ALREADY_REGISTERED') {
      //       setNicknameMessage('이미 사용 중인 닉네임입니다.');
      //       setNicknameMessageType('error');
      //       setNicknameAvailable(false);
      //     } else {
      //       setNicknameMessage('잘못된 요청입니다. 다시 시도해주세요.');
      //       setNicknameMessageType('error');
      //     }
      //   } else {
      //     setNicknameMessage('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      //     setNicknameMessageType('error');
      //   }
      // } else {
      //   setNicknameMessage(
      //     '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.',
      //   );
      //   setNicknameMessageType('error');
      // }
    }
  };

  // 비밀번호 형식 확인
  const handlePasswordValidate = (password: string) => {
    if (!isValidPassword(password)) {
      setPasswordError(
        '비밀번호는 최소 8자 이상이며, 하나 이상의 영문자, 숫자, 특수문자가 포함되어야 합니다.',
      );
    } else {
      setPasswordError('');
    }
    handlePasswordCheck(passwordCheck, password);
  };

  // 비밀번호 확인
  const handlePasswordCheck = (
    checkValue: string,
    currentPassword: string = password,
  ) => {
    if (checkValue !== currentPassword) {
      setPasswordCheckMessage('비밀번호가 일치하지 않습니다.');
      setPasswordCheckMessageType('error');
    } else {
      setPasswordCheckMessage('비밀번호가 일치합니다.');
      setPasswordCheckMessageType('success');
    }
  };

  // 회원가입 제출
  const handleSignUpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setEmailMessage('유효한 이메일을 입력해 주세요.');
      setEmailMessageType('error');
      return;
    }

    if (!authCodeVerified) {
      setEmailMessage('이메일 인증을 완료해 주세요.');
      setEmailMessageType('error');
      return;
    }

    if (!nickname.trim()) {
      setNicknameMessage('닉네임을 입력해 주세요.');
      setNicknameMessageType('error');
      return;
    } else if (!nicknameAvailable) {
      setNicknameMessage('닉네임 중복 확인을 완료해 주세요.');
      setNicknameMessageType('error');
      return;
    }
    if (!isValidPassword(password)) {
      setPasswordError(
        '비밀번호는 최소 8자 이상이며, 하나 이상의 영문자, 숫자, 특수문자가 포함되어야 합니다.',
      );
      return;
    }

    if (password !== passwordCheck) {
      setPasswordCheckMessage('비밀번호가 일치하지 않습니다.');
      setPasswordCheckMessageType('error');
      return;
    } else {
      setPasswordCheckMessage('비밀번호가 일치합니다.');
      setPasswordCheckMessageType('success');
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/sign-up`,
        { nickname, email, password },
        { headers: { 'Content-Type': 'application/json' } },
      );
      if (response.status === 200) {
        setAlertMessage('회원가입이 성공적으로 완료되었습니다!');
        setShowAlert(true);
        router.push('/signin');
      } else {
        setAlertMessage('회원가입 중 문제가 발생했습니다. 다시 시도해 주세요.');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('회원가입 요청 중 오류', error);
      handleApiErrorWithoutInterceptor(error, showSignUpErrorAlert);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
      <form onSubmit={handleSignUpSubmit} className="w-full">
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
              placeholder="example@example.com"
              onChange={e => {
                setEmail(e.target.value);
                setAuthCodeVerified(false); // 이메일 수정 시 인증 초기화
                setEmailMessage('');
                setEmailMessageType('');
              }}
              required
              className="w-full flex-grow input input-bordered px-4 py-2 focus:outline-teal-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={handleAuthCodeSendClick}
              className={`ml-2 px-4 py-2 ${
                isValidEmail(email)
                  ? 'btn bg-white border-teal-500 text-teal-500 hover:text-teal-50 hover:bg-teal-500 text-sm sm:text-base hover:text-teal-50'
                  : 'btn bg-gray-100 border-gray-400 text-gray-400 text-sm sm:text-base'
              }`}
            >
              {emailSent ? '재발송' : '인증 번호 전송'}
            </button>
          </div>
          <div className="mt-2 min-h-[20px]">
            {' '}
            {emailMessage && (
              <p
                className={`text-sm sm:text-base ${
                  emailMessageType === 'success'
                    ? 'text-teal-500'
                    : 'text-red-500'
                }`}
              >
                {emailMessage}
              </p>
            )}
          </div>
        </div>

        {emailSent && (
          <div className="mb-4">
            <label htmlFor="authCode" className="block mb-2 font-semibold">
              인증 번호
            </label>
            <div className="flex items-center">
              <input
                id="authCode"
                type="text"
                value={authCode}
                onChange={e => setAuthCode(e.target.value.trim())}
                required
                className="w-full flex-grow input input-bordered px-4 py-2 focus:outline-teal-500 text-sm sm:text-base"
              />
              <AuthTimer isActive={isTimerActive} onTimerEnd={handleTimerEnd} />
              <button
                type="button"
                onClick={handleAuthCodeVerifyClick}
                disabled={authCodeVerified}
                className="ml-2 px-4 py-2 btn bg-white border-teal-500 text-teal-500 hover:text-teal-50 hover:bg-teal-500 text-sm sm:text-base hover:text-teal-50"
              >
                {authCodeVerified ? '완료' : '확인'}
              </button>
            </div>
            {authCodeMessage && (
              <p
                className={`mt-2 ${
                  authCodeMessageType === 'success'
                    ? 'text-teal-500'
                    : 'text-red-500'
                }`}
              >
                {authCodeMessage}
              </p>
            )}
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="nickname"
            className="block mb-2 font-semibold text-sm sm:text-base"
          >
            닉네임
          </label>
          <div className="flex items-center">
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={e => {
                setNickname(e.target.value);
                setNicknameAvailable(false); // 닉네임 수정 시 중복 확인 초기화
                setNicknameMessage('');
                setNicknameMessageType('');
              }}
              placeholder="닉네임을 입력해 주세요."
              required
              className="w-full flex-grow input input-bordered px-4 py-2 focus:outline-teal-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={handleNicknameAvailabilityCheckClick}
              disabled={nicknameAvailable}
              className="ml-2 px-4 py-2 btn bg-white border-teal-500 text-teal-500 hover:text-teal-50 hover:bg-teal-500 text-sm sm:text-base hover:text-teal-50"
            >
              중복 확인
            </button>
          </div>
          <div className="mt-2 min-h-[20px]">
            {nicknameMessage && (
              <p
                className={`text-sm sm:text-base ${
                  nicknameMessageType === 'success'
                    ? 'text-teal-500'
                    : 'text-red-500'
                }`}
              >
                {nicknameMessage}
              </p>
            )}
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
                handlePasswordValidate(e.target.value);
              }}
              placeholder="비밀번호를 입력해 주세요."
              required
              className="w-full input input-bordered px-4 py-2 focus:outline-teal-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 mr-2"
              aria-label={
                passwordVisible ? '비밀번호 숨기기' : '비밀번호 보이기'
              }
            >
              {passwordVisible ? (
                <FaRegEye size={20} />
              ) : (
                <FaRegEyeSlash size={20} />
              )}
            </button>
          </div>
          <p className="text-red-500 mt-2 text-sm sm:text-base">
            {passwordError}
          </p>
        </div>
        <div className="mb-6">
          <label
            htmlFor="passwordCheck"
            className="block mb-2 font-semibold text-sm sm:text-base"
            aria-label={
              passwordCheckVisible
                ? '비밀번호 확인 숨기기'
                : '비밀번호 확인 보이기'
            }
          >
            비밀번호 확인
          </label>
          <div className="relative">
            <input
              id="passwordCheck"
              type={passwordCheckVisible ? 'text' : 'password'}
              value={passwordCheck}
              onChange={e => {
                setPasswordCheck(e.target.value);
                handlePasswordCheck(e.target.value);
              }}
              placeholder="비밀번호를 한 번 더 입력해 주세요."
              required
              className="w-full input input-bordered px-4 py-2 focus:outline-teal-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={togglePasswordCheckVisibility}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm sm:text-base"
            >
              {passwordCheckVisible ? (
                <FaRegEye size={20} />
              ) : (
                <FaRegEyeSlash size={20} />
              )}
            </button>
          </div>
          {passwordCheckMessage && (
            <p
              className={`mt-2 text-sm sm:text-base ${
                passwordCheckMessageType === 'success'
                  ? 'text-teal-500'
                  : 'text-red-500'
              }`}
            >
              {passwordCheckMessage}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full btn bg-teal-500 text-teal-50 hover:text-black hover:bg-teal-600 text-sm sm:text-base"
        >
          회원가입
        </button>
      </form>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
};

export default SignUpForm;
