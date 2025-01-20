'use client';
import React from 'react';
import {
  getNotificationMessage,
  calculateTimeDifference,
} from './NotificationMessage';
import { Notification } from '@/types/notification';

export interface NotificationItemProps {
  notification: Notification;
  serverTime: string | null;
  onDelete: (notificationId: number, e: React.MouseEvent) => void;
  onClick: (notificationId: number) => void;
  isLast?: boolean;
  lastItemRef?: (node?: Element | null) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  serverTime,
  onDelete,
  onClick,
  isLast,
  lastItemRef,
}) => {
  return (
    <li
      ref={isLast ? lastItemRef : null}
      onClick={() => onClick(notification.id)}
      className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-200 ${
        notification.read
          ? 'bg-gray-100 text-gray-700 opacity-70'
          : 'text-gray-800'
      }`}
    >
      <div>{getNotificationMessage(notification)}</div>
      <div className="flex justify-between items-center mt-2">
        <div className="text-gray-500 text-sm text-right">
          {serverTime
            ? calculateTimeDifference(notification.createdAt, serverTime)
            : '로딩 중...'}
        </div>
        <button
          onClick={e => onDelete(notification.id, e)}
          className="text-sm text-red-500 hover:text-red-700"
        >
          삭제
        </button>
      </div>
    </li>
  );
};

export default NotificationItem;
