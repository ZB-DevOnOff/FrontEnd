'use client';
import { NOTIFICATION_MESSAGES, Notification } from '@/types/notification';
import { ReactNode } from 'react';

export const getNotificationMessage = (
  notification: Notification,
): ReactNode => {
  if (notification.type in NOTIFICATION_MESSAGES) {
    const messageConfig = NOTIFICATION_MESSAGES[notification.type];
    return (
      <>
        <span>
          [{messageConfig.icon} {messageConfig.prefix}]{' '}
        </span>
        <strong>{notification.sender.nickname}</strong>{' '}
        <span
          dangerouslySetInnerHTML={{
            __html: messageConfig.getMessage(notification),
          }}
        />
      </>
    );
  }

  return '알 수 없는 알림 유형입니다.';
};

// 시간 차이를 계산하는 함수
export const calculateTimeDifference = (
  createdAt: string,
  serverTime: string,
) => {
  const serverDate = new Date(serverTime);
  const createdDate = new Date(createdAt);

  const diffInSeconds = Math.floor(
    (serverDate.getTime() - createdDate.getTime()) / 1000,
  );
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInYears >= 1) return `${diffInYears}년 전`;
  if (diffInMonths >= 1) return `${diffInMonths}개월 전`;
  if (diffInDays >= 1) return `${diffInDays}일 전`;
  if (diffInHours >= 1) return `${diffInHours}시간 전`;
  if (diffInMinutes >= 1) return `${diffInMinutes}분 전`;
  return '방금 전';
};
