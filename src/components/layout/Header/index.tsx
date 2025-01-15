'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import CustomConfirm from '@/components/common/Confirm';
import CustomAlert from '@/components/common/Alert';
import { FiBell } from 'react-icons/fi';
import axiosInstance from '@/utils/axios';
import handleApiError from '@/utils/handleApiError';
import NotificationModal, { Notification } from './NotificationModal';
import useNotification from '@/hooks/useNotification';

type NavigationItem = {
  path: string;
  label: string;
  id: string;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  { path: '/community/study', label: '스터디', id: 'study' },
  { path: '/community/info', label: '정보 공유', id: 'info' },
  { path: '/community/qna', label: 'Q&A', id: 'qna' },
  { path: '/community/ranking', label: '랭킹', id: 'ranking' },
];

const Logo = () => (
  <Link
    href="/"
    className="btn btn-ghost text-base-content text-center overflow-hidden"
  >
    <div className="flex flex-col items-center">
      <span className="block text-xs text-black">
        스마트한 개발 스터디 플랫폼
      </span>
      <span className="block text-xl font-bold text-teal-500">
        <Image
          src={'/devonoff-logo.png'}
          alt={'DevOnOff 로고'}
          width={185}
          height={185}
          className="object-contain -mt-20"
          priority
        />
      </span>
    </div>
  </Link>
);

const NotificationButton = ({
  count,
  onClick,
  isActive,
}: {
  count: number;
  onClick: () => void;
  isActive: boolean;
}) => (
  <button
    className={`btn btn-ghost relative ${isActive ? 'btn-active' : ''}`}
    onClick={onClick}
  >
    <FiBell size={24} />
    {count > 0 && (
      <div className="absolute -top-1 -right-0.5 bg-customRed text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-xs">
        {count > 99 ? '99+' : count}
      </div>
    )}
  </button>
);

const Navigation = ({
  items,
  activeMenu,
  onMenuClick,
  className = '',
  itemClassName = '',
}: {
  items: NavigationItem[];
  activeMenu: string;
  onMenuClick: (menu: string) => void;
  className?: string;
  itemClassName?: string;
}) => (
  <nav className={className}>
    {items.map(item => (
      <Link
        key={item.id}
        href={item.path}
        className={`btn ${itemClassName} ${activeMenu === item.id ? 'btn-active' : ''}`}
        onClick={() => onMenuClick(item.id)}
      >
        {item.label}
      </Link>
    ))}
  </nav>
);

const AuthLinks = ({
  isSignedIn,
  userInfo,
  onSignOut,
  activeMenu,
  onMenuClick,
  className = '',
  linkClassName = '',
}: {
  isSignedIn: boolean;
  userInfo: any;
  onSignOut: () => void;
  activeMenu: string;
  onMenuClick: (menu: string) => void;
  className?: string;
  linkClassName?: string;
}) => (
  <div className={className}>
    {isSignedIn ? (
      <>
        <Link
          href={`/mypage/${userInfo?.id}`}
          className={`btn ${linkClassName} ${activeMenu === 'mypage' ? 'btn-active' : ''}`}
          onClick={() => onMenuClick('mypage')}
        >
          마이페이지
        </Link>
        <button className={`btn ${linkClassName}`} onClick={onSignOut}>
          로그아웃
        </button>
      </>
    ) : (
      <>
        <Link href="/signin" className={`btn ${linkClassName}`}>
          로그인
        </Link>
        <Link href="/signup" className={`btn ${linkClassName}`}>
          회원가입
        </Link>
      </>
    )}
  </div>
);

const MobileMenu = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-end">
      <div ref={menuRef} className="w-2/3 max-w-xs bg-white h-full p-6">
        <button
          className="btn btn-ghost"
          onClick={onClose}
          aria-label="메뉴 닫기"
        >
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
        {children}
      </div>
    </div>
  );
};

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

  const [userId, setUserId] = useState<number | null>(null);
  const { newNotifications, connect, disconnect } = useNotification(
    userId || 0,
  );
  const [isNotificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(
    notifications.length,
  );

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedSignedIn = useAuthStore.getState().isSignedIn;
    console.log('로그인 상태는', storedSignedIn);
    setIsSignedIn(storedSignedIn);
    setIsLoading(false);
  }, [setIsSignedIn]);

  useEffect(() => {
    console.log('userInfo는', userInfo);
    console.log(`닉네임: ${userInfo?.nickname}`);
    console.log(`profileImageUrl: ${userInfo?.profileImageUrl}`);
  }, [userInfo]);

  useEffect(() => {
    if (isSignedIn && userInfo?.id && userInfo?.id > 0) {
      setUserId(userInfo.id);
      connect();

      if (newNotifications.length > 0) {
        // 중복되지 않는 알림만 추가하기
        const uniqueNotifications = newNotifications.filter(
          newNotification =>
            !notifications.some(
              existingNotification =>
                existingNotification.id === newNotification.id,
            ),
        );

        // 중복되지 않는 알림만 상태에 추가
        if (uniqueNotifications.length > 0) {
          setNotifications(prev => [...prev, ...uniqueNotifications]);
          setNotificationCount(prev => prev + uniqueNotifications.length);
        }
      }
    } else {
      setUserId(null);
      disconnect();
    }
  }, [isSignedIn, userInfo, connect, disconnect, newNotifications]);

  useEffect(() => {
    fetchNotifications(); // 컴포넌트가 마운트될 때 알림 조회
  }, [isSignedIn, userInfo]);

  // useEffect(() => {
  //   if (userInfo?.id && userInfo?.id > 0) {
  //     setUserId(userInfo.id);
  //   } else {
  //     setUserId(null);
  //   }
  // }, [userInfo]);

  // useEffect(() => {
  //   if (isSignedIn && userInfo?.id) {
  //     connect();
  //   } else {
  //     setUserId(null);
  //     disconnect();
  //   }
  // }, [isSignedIn, connect, disconnect]);

  // pathname이 변경될 때마다 현재 활성화된 메뉴 설정
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'auto';
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

  const toggleNotificationModal = () => {
    setNotificationModalOpen(prev => !prev);
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
    setIsNavOpen(false);
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);
  };

  const showSignOutConfirm = () => {
    setConfirmMessage('로그아웃 하시겠습니까?');
    setOnConfirmCallback(() => handleSignOutClick);
    setShowConfirm(true);
  };

  const showErrorAlert = (errorMessage: string | null) => {
    setAlertMessage(
      errorMessage ||
        '로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요. 잠시 후 다시 시도해 주세요.',
    );
    setShowAlert(true);
  };

  const fetchNotifications = async () => {
    try {
      if (isSignedIn && userInfo?.id) {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/notification/?page=0`,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
        if (response.status === 200 && response.data) {
          const fetchedNotifications = response.data.content || [];
          console.log('알림 조회 데이터:', response.data.content);
          setNotifications(fetchedNotifications);
          setNotificationCount(
            fetchedNotifications.filter(
              (notification: any) => !notification.read,
            ).length,
          ); // 읽지 않은 알림 카운트
        }
      }
    } catch (error: any) {
      console.error('알림 조회 실패:', error);
      handleApiError(error, showErrorAlert);
    } finally {
      setShowConfirm(false);
    }
  };

  // 알림 삭제 후 상태 갱신 함수
  const updateNotificationCount = (updatedNotifications: Notification[]) => {
    setNotifications(updatedNotifications);
    setNotificationCount(
      updatedNotifications.filter((notification: any) => !notification.read)
        .length,
    );
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
        disconnect();
        setUserId(null);
        router.push('/');
        setAlertMessage('로그아웃이 완료되었습니다.');
        setShowAlert(true);
      } else {
        setAlertMessage('액세스 토큰이 없어 로그아웃을 할 수 없습니다.');
        setShowAlert(true);
      }
    } catch (error: any) {
      handleApiError(error, showErrorAlert);
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <header className="navbar bg-base-100 shadow-md fixed w-full z-40">
      <div className="navbar-start">
        <Logo />
      </div>

      <div className="navbar-center hidden lg:block">
        <Navigation
          items={NAVIGATION_ITEMS}
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
          className="join"
          itemClassName="join-item"
        />
      </div>

      <div className="navbar-end hidden lg:flex space-x-2">
        {isSignedIn && (
          <NotificationButton
            count={notificationCount}
            onClick={toggleNotificationModal}
            isActive={isNotificationModalOpen}
          />
        )}
        <AuthLinks
          isSignedIn={isSignedIn}
          userInfo={userInfo}
          onSignOut={showSignOutConfirm}
          activeMenu={activeMenu}
          onMenuClick={handleMenuClick}
          className="flex space-x-2"
          linkClassName="btn-ghost"
        />
      </div>

      {/* 모바일 네브바 */}
      <div className="navbar-end lg:hidden">
        {isSignedIn && (
          <NotificationButton
            count={notificationCount}
            onClick={toggleNotificationModal}
            isActive={isNotificationModalOpen}
          />
        )}
        <button
          className="btn btn-ghost"
          onClick={toggleNav}
          aria-label={isNavOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
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

      <MobileMenu isOpen={isNavOpen} onClose={toggleNav}>
        <div className="flex flex-col mt-8 space-y-4">
          <Navigation
            items={NAVIGATION_ITEMS}
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
            className="flex flex-col space-y-4"
          />
          <div className="border-t border-gray-200 my-4" />
          <AuthLinks
            isSignedIn={isSignedIn}
            userInfo={userInfo}
            onSignOut={showSignOutConfirm}
            activeMenu={activeMenu}
            onMenuClick={handleMenuClick}
            className="flex flex-col space-y-4"
          />
        </div>
      </MobileMenu>

      {isNotificationModalOpen && (
        <NotificationModal
          notifications={notifications}
          setNotifications={setNotifications}
          setNotificationCount={setNotificationCount}
          onDeleteNotification={updateNotificationCount}
          onClose={toggleNotificationModal}
        />
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
