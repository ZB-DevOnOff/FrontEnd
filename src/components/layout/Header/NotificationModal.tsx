'use client';

import CustomAlert from '@/components/common/Alert';
import CustomConfirm from '@/components/common/Confirm';
import { useAuthStore } from '@/store/authStore';
import axiosInstance from '@/utils/axios';
import handleApiError from '@/utils/handleApiError';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaCheck, FaTrashAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import NotificationItem from './NotificationItem';
import { NotificationModalProps } from '@/types/notification';

const NotificationModal = ({
  notifications,
  onUpdateNotifications,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  onClose,
}: NotificationModalProps) => {
  const { ref: infiniteScrollRef, inView } = useInView({
    threshold: 0.1,
  });

  const router = useRouter();
  const { userInfo } = useAuthStore();
  const [serverTime, setServerTime] = useState<string | null>(null);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState<() => void>(
    () => () => {},
  );

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    console.log('NotificationModal에 전달된 notifications:', notifications);
    // 서버에서 현재 시간을 가져오는 API 호출
    const fetchServerTime = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/get-time`,
        );
        if (response.status === 200) {
        }
        setServerTime(response.data.currentTime);
      } catch (error) {
        console.error('서버 시간을 가져오는 데 실패하였습니다.', error);
      }
    };

    fetchServerTime();
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const showErrorAlert = (errorMessage: string | null) => {
    setAlertMessage(
      errorMessage ||
        '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    );
    setShowAlert(true);
  };

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/notification/${notificationId}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      if (response.status === 200) {
        console.log(response.data.read);
        return response.data;
      }
    } catch (error: any) {
      handleApiError(error, showErrorAlert);
    }
  };

  const handleNotificationClick = async (notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    if (!notification.read) {
      const updatedNotification = await markNotificationAsRead(notificationId);

      if (updatedNotification) {
        const updatedNotifications = notifications.map(notification =>
          notification.id === updatedNotification.id
            ? { ...notification, read: true }
            : notification,
        );
        onUpdateNotifications(updatedNotifications);
      }
    }

    switch (notification.postType) {
      case 'STUDY':
        router.push(`/community/study/${notification.targetId}`);
        break;
      case 'QNA':
        router.push(`/community/qna/${notification.targetId}`);
        break;
      case 'INFO':
        router.push(`/community/info/${notification.targetId}`);
        break;
      default:
        setAlertMessage('페이지가 삭제되었거나 찾을 수 없습니다.');
        setShowAlert(true);
        return;
    }
    onClose();
  };

  const handleAllNotificationsReadClick = async (userId: number) => {
    // 로그인된 사용자 ID와 알림을 받는 사용자의 ID가 일치해야 삭제할 수 있음
    if (userInfo?.id !== notifications[0]?.userId) {
      setAlertMessage('사용자 정보가 불일치합니다.');
      setShowAlert(true);
      return;
    }

    setConfirmMessage('모든 알림을 읽음 상태로 변경하시겠습니까?');
    setOnConfirmCallback(() => async () => {
      try {
        const response = await axiosInstance.patch(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/notification/user/${userId}`,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
        if (response.status === 200) {
          setAlertMessage(
            '모든 알림이 읽음 상태로 변경되었습니다. \n 새로운 알림이 있을 때 다시 알려드릴게요!',
          );
          setShowAlert(true);

          // 알림 읽음 처리 후 read 상태 갱신
          const updatedNotifications = notifications.map(notification => ({
            ...notification,
            read: true,
          }));
          onUpdateNotifications(updatedNotifications);
        }
      } catch (error: any) {
        handleApiError(error, showErrorAlert);
      } finally {
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handleNotificationDeleteClick = async (
    notificationId: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    setConfirmMessage('알림을 삭제하시겠습니까?');
    setOnConfirmCallback(() => async () => {
      try {
        const response = await axiosInstance.delete(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/notification/${notificationId}`,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
        if (response.status === 200) {
          setAlertMessage('알림이 삭제되었습니다.');
          setShowAlert(true);

          // 해당 알림만 삭제하고 상태 업데이트
          const updatedNotifications = notifications.filter(
            notification => notification.id !== notificationId,
          );
          onUpdateNotifications(updatedNotifications);
        }
      } catch (error: any) {
        handleApiError(error, showErrorAlert);
      } finally {
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handleAllNotificationsDeleteClick = (userId: number) => {
    // 로그인된 사용자 ID와 알림을 받는 사용자의 ID가 일치해야 삭제할 수 있음
    if (userInfo?.id !== notifications[0]?.userId) {
      setAlertMessage('사용자 정보가 불일치합니다.');
      setShowAlert(true);
      return;
    }

    setConfirmMessage('모든 알림을 삭제하시겠습니까?');
    setOnConfirmCallback(() => async () => {
      try {
        const response = await axiosInstance.delete(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/notification/user/${userId}`,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
        if (response.status === 200) {
          setAlertMessage(
            '모든 알림이 삭제되었습니다. 새로운 알림이 있을 때 다시 알려드릴게요!',
          );
          setShowAlert(true);

          // 알림 삭제 후 상태 갱신
          onUpdateNotifications([]);
        }
      } catch (error: any) {
        handleApiError(error, showErrorAlert);
      } finally {
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={handleBackdropClick} />
      <div className="absolute top-16 right-16 lg:right-48 z-50">
        <div className="bg-white rounded-lg shadow-custom-strong p-6 w-full max-w-xs">
          <h2 className="text-lg font-bold mb-2">알림</h2>
          <div className="text-center text-sm mb-6">
            <p className="text-gray-400">
              최근 14일 동안 받은 알림을 확인할 수 있습니다.
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex justify-between items-center mb-4 text-gray-600">
              <button
                onClick={() =>
                  handleAllNotificationsReadClick(userInfo?.id || 0)
                }
                className="bg-white text-sm hover:text-teal-500 flex items-center space-x-2"
              >
                <FaCheck size={16} className="mr-2" />
                모두 읽음
              </button>
              <button
                onClick={() =>
                  handleAllNotificationsDeleteClick(userInfo?.id || 0)
                }
                className="bg-white text-sm hover:text-red-500 flex items-center space-x-2"
              >
                <FaTrashAlt size={16} className="mr-2" />
                모두 삭제
              </button>
            </div>
          )}

          {notifications.length > 0 ? (
            <div className="overflow-y-auto max-h-[60vh]">
              <ul className="space-y-2 text-md">
                {notifications
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .map((notification, index) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      serverTime={serverTime}
                      onClick={handleNotificationClick}
                      onDelete={handleNotificationDeleteClick}
                      isLast={index === notifications.length - 1}
                      lastItemRef={infiniteScrollRef}
                    />
                  ))}
              </ul>
              {isFetchingNextPage && (
                <div className="text-center py-4 text-gray-500">
                  알림을 불러오는 중..
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">새로운 알림이 없습니다.</p>
          )}
        </div>
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
      </div>
    </>
  );
};

export default NotificationModal;
