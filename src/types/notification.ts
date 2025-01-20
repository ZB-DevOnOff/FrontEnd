import { User } from './post';

export type Notification = {
  id: number;
  userId: number;
  sender: User;
  type: NotificationType;
  createdAt: string;
  postType: string;
  postTitle: string | null;
  postContent: string | null;
  commentContent: string | null;
  replyContent: string | null;
  studyName: string | null;
  targetId: number;
  read: boolean;
};

export enum PostType {
  STUDY = 'STUDY',
  INFO = 'INFO',
  QNA = 'QNA',
}

export type NotificationModalProps = {
  notifications: Notification[];
  onUpdateNotifications: (notifications: Notification[]) => void;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage?: boolean;
  onClose: () => void;
};

export interface NotificationContent {
  postTitle?: string | null;
  postContent?: string | null;
  commentContent?: string | null;
  replyContent?: string | null;
  studyName?: string | null;
}

export const NotificationType = {
  COMMENT_ADDED: 'COMMENT_ADDED',
  REPLY_ADDED: 'REPLY_ADDED',
  STUDY_SIGNUP_ADDED: 'STUDY_SIGNUP_ADDED',
  STUDY_SIGNUP_APPROVED: 'STUDY_SIGNUP_APPROVED',
  STUDY_SIGNUP_REJECTED: 'STUDY_SIGNUP_REJECTED',
  STUDY_CREATED: 'STUDY_CREATED',
} as const;

type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface NotificationMessage {
  icon: string;
  prefix: string;
  getMessage: (notification: Notification) => string;
}

export const NOTIFICATION_MESSAGES: Record<
  NotificationType,
  NotificationMessage
> = {
  [NotificationType.COMMENT_ADDED]: {
    icon: '🔔',
    prefix: '댓글',
    getMessage: notification =>
      `님이 <strong>${notification.postTitle}</strong> 게시글에 댓글을 남겼습니다.`,
  },
  [NotificationType.REPLY_ADDED]: {
    icon: '🔔',
    prefix: '답글',
    getMessage: () => '님이 당신의 댓글에 답글을 남겼습니다.',
  },
  [NotificationType.STUDY_SIGNUP_ADDED]: {
    icon: '🔥',
    prefix: '스터디',
    getMessage: notification =>
      `님이 <strong>${notification.studyName}</strong> 스터디 신청 요청을 보냈습니다.`,
  },
  [NotificationType.STUDY_SIGNUP_APPROVED]: {
    icon: '🔥',
    prefix: '스터디',
    getMessage: notification =>
      `님이 <strong>${notification.studyName}</strong> 스터디 신청을 수락했습니다.`,
  },
  [NotificationType.STUDY_SIGNUP_REJECTED]: {
    icon: '🔥',
    prefix: '스터디',
    getMessage: notification =>
      `님이 <strong>${notification.studyName}</strong> 스터디 신청을 거절했습니다.`,
  },
  [NotificationType.STUDY_CREATED]: {
    icon: '🔥',
    prefix: '스터디',
    getMessage: notification =>
      `님이 <strong>${notification.studyName}</strong> 스터디를 개설했습니다. 마이페이지에서 채팅 및 스터디룸 이용이 가능합니다!`,
  },
};
