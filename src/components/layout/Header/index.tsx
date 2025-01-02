'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CustomConfirm from '@/components/common/Confirm';
import CustomAlert from '@/components/common/Alert';
import { FiBell } from 'react-icons/fi';
import axiosInstance from '@/utils/axios';

const Header = () => {
  const { isSignedIn, setIsSignedIn, userInfo, resetStore } = useAuthStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState<() => void>(
    () => () => {},
  );
  const [, setIsLoading] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>('');

  const [notificationCount] = useState(99);

  const pathname = usePathname();
  const router = useRouter();

  // pathname이 변경될 때마다 현재 활성화된 메뉴 설정
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
    };

    // pathname이 변경될 때마다 스크롤 처리
    handleRouteChange();

    if (pathname === '/') {
      setActiveMenu('');
    } else if (pathname.includes('/community/study')) {
      setActiveMenu('study');
    } else if (pathname.includes('/community/info')) {
      setActiveMenu('info');
    } else if (pathname.includes('/community/qna')) {
      setActiveMenu('qna');
    } else if (pathname.includes('/community/ranking')) {
      setActiveMenu('ranking');
    } else if (pathname.includes('/mypage')) {
      setActiveMenu('mypage');
    }
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = 'auto';
  }, []);

  const NotificationButton = () => (
    <button className="btn btn-ghost relative">
      <FiBell size={24} />
      {notificationCount > 0 && (
        <div className="absolute -top-1 -right-0.5 bg-customRed text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-xs">
          {notificationCount > 99 ? '99+' : notificationCount}
        </div>
      )}
    </button>
  );

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    if (isNavOpen) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    setIsNavOpen(false);
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const storedSignedIn = useAuthStore.getState().isSignedIn;
    console.log('로그인 상태는', storedSignedIn);
    setIsSignedIn(storedSignedIn);
    setIsLoading(false);
  }, [setIsSignedIn]);

  useEffect(() => {
    console.log(`닉네임: ${userInfo?.nickname}`);
    console.log(`profileImageUrl: ${userInfo?.profileImageUrl}`);
  }, [userInfo]);

  const showSignOutConfirm = () => {
    setConfirmMessage('로그아웃 하시겠습니까?');
    setOnConfirmCallback(() => handleSignOutClick);
    setShowConfirm(true);
  };

  const handleSignOutClick = async () => {
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/auth/sign-out`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      if (response.status === 200) {
        resetStore();
        router.push('/');
        setAlertMessage('로그아웃이 완료되었습니다.');
        setShowAlert(true);
      } else {
        setAlertMessage('액세스 토큰이 없어 로그아웃을 할 수 없습니다.');
        setShowAlert(true);
      }
    } catch (error: any) {
      const { status } = error.response;
      if (error.response) {
        if (status === 401) {
          setAlertMessage('액세스 토큰이 없어 로그아웃을 할 수 없습니다.');
        } else if (status === 400) {
          setAlertMessage('로그아웃에 실패했습니다. 다시 시도해 주세요.');
        } else if (status === 404) {
          setAlertMessage('사용자를 찾을 수 없습니다.');
        } else {
          setAlertMessage(
            '서버에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          );
        }
      } else {
        setAlertMessage(
          '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.',
        );
      }
      setShowAlert(true);
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <header className="navbar bg-base-100 shadow-md fixed w-full z-40">
      <div className="navbar-start">
        <Link href="/" className="btn btn-ghost text-base-content text-center">
          <div>
            <span className="block text-xs text-black">
              스마트한 개발 스터디 플랫폼
            </span>
            <span className="block text-xl font-bold text-teal-500">
              <Image
                src={'/devonoff-logo.png'}
                alt={'DevOnOff logo'}
                width={190}
                height={190}
                className="object-contain -mt-20"
              />
            </span>
          </div>
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <div className="join">
          <Link
            href="/community/study"
            className={`btn join-item ${activeMenu === 'study' ? 'btn-active' : ''}`}
            onClick={() => handleMenuClick('study')}
          >
            스터디
          </Link>
          <Link
            href="/community/info"
            className={`btn join-item ${activeMenu === 'info' ? 'btn-active' : ''}`}
            onClick={() => handleMenuClick('info')}
          >
            정보 공유
          </Link>
          <Link
            href="/community/qna"
            className={`btn join-item ${activeMenu === 'qna' ? 'btn-active' : ''}`}
            onClick={() => handleMenuClick('qna')}
          >
            Q&A
          </Link>
          <Link
            href="/community/ranking"
            className={`btn join-item ${activeMenu === 'ranking' ? 'btn-active' : ''}`}
            onClick={() => handleMenuClick('ranking')}
          >
            랭킹
          </Link>
        </div>
      </div>

      <div className="navbar-end hidden lg:flex space-x-2">
        {/* <button className="btn btn-ghost">
          <FiBell size={24} />
        </button> */}
        <NotificationButton />
        {isSignedIn ? (
          <>
            <Link
              href={`/mypage/${userInfo?.id}`}
              className={`btn btn-ghost ${activeMenu === 'mypage' ? 'btn-active' : ''}`}
              onClick={() => handleMenuClick('mypage')}
            >
              마이페이지
            </Link>
            <button className="btn btn-ghost" onClick={showSignOutConfirm}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link href="/signin" className="btn btn-ghost">
              로그인
            </Link>
            <Link href="/signup" className="btn btn-ghost">
              회원가입
            </Link>
          </>
        )}
      </div>

      <div className="navbar-end lg:hidden">
        {/* <button className="btn btn-ghost">
          <FiBell size={24} />
        </button> */}
        <NotificationButton />
        <button className="btn btn-ghost" onClick={toggleNav}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {isNavOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
          <div className="w-2/3 max-w-xs bg-white h-full p-6">
            <button className="btn btn-ghost" onClick={toggleNav}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex flex-col mt-8 space-y-4">
              <Link
                href="/community/study"
                className={`btn ${activeMenu === 'study' ? 'btn-active' : ''}`}
                onClick={() => handleMenuClick('study')}
              >
                스터디
              </Link>
              <Link
                href="/community/info"
                className={`btn ${activeMenu === 'info' ? 'btn-active' : ''}`}
                onClick={() => handleMenuClick('info')}
              >
                정보 공유
              </Link>
              <Link
                href="/community/qna"
                className={`btn ${activeMenu === 'qna' ? 'btn-active' : ''}`}
                onClick={() => handleMenuClick('qna')}
              >
                Q&A
              </Link>
              <Link
                href="/community/ranking"
                className={`btn ${activeMenu === 'ranking' ? 'btn-active' : ''}`}
                onClick={() => handleMenuClick('ranking')}
              >
                랭킹
              </Link>
            </div>

            <div className="border-t border-gray-200 my-4" />

            <div className="flex flex-col space-y-4">
              {isSignedIn ? (
                <>
                  <Link
                    href={`/mypage/${userInfo?.id}`}
                    className={`btn ${activeMenu === 'mypage' ? 'btn-active' : ''}`}
                    onClick={() => handleMenuClick('mypage')}
                  >
                    마이페이지
                  </Link>
                  <button
                    className="btn btn-ghost"
                    onClick={showSignOutConfirm}
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="btn"
                    onClick={() => handleMenuClick('signin')}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="btn"
                    onClick={() => handleMenuClick('signup')}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {showConfirm && (
        <CustomConfirm
          message={confirmMessage}
          onConfirm={onConfirmCallback}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </header>
  );
};

export default Header;
