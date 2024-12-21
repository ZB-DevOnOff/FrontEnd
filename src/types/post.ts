// 공통으로 사용되는 User 인터페이스
export interface User {
  id: number;
  email?: string;
  profileImageUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  nickname: string;
  signinType?: string | null;
}

// 정보공유 게시글
export interface InfoPost {
  id: number;
  user: User;
  thumbnailImgUrl: string | null;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// QnA 게시글
export interface QnAPost {
  id: number;
  user: User;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  thumbnailImgUrl: string | null;
}

// 스터디 게시글
export interface StudyPost {
  id: number;
  title: string;
  studyName: string;
  subject: string;
  difficulty: string;
  dayType: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  meetingType: string;
  recruitmentPeriod: string;
  description: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  status: 'RECRUITING' | 'CLOSED' | 'CANCELED';
  thumbnailImgUrl: string | null;
  maxParticipants: number;
  currentParticipants: number;
  user: User;
  createdAt: string;
  updatedAt: string;
}

// 페이지네이션 응답 인터페이스
export interface PostResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalPages: number;
}
