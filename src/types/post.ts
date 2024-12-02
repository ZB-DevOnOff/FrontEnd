export type StudySubject =
  | 'CONCEPT_LEARNING'
  | 'PROJECT'
  | 'CHALLENGE'
  | 'CERTIFICATION'
  | 'JOB_PREPARATION'
  | 'ETC';

export type StudyDifficulty = 'HIGH' | 'MEDIUM' | 'LOW';

export type StudyMeetingType = 'ONLINE' | 'HYBRID';

export type StudyStatus = 'RECRUITING' | 'IN_PROGRESS' | 'CANCELED';

// 요일은 비트 플래그로 처리
export const DayTypeFlags = {
  MONDAY: 1, // 2^0
  TUESDAY: 2, // 2^1
  WEDNESDAY: 4, // 2^2
  THURSDAY: 8, // 2^3
  FRIDAY: 16, // 2^4
  SATURDAY: 32, // 2^5
  SUNDAY: 64, // 2^6
} as const;

export interface StudyPost extends BasePost {
  subject: StudySubject;
  difficulty: StudyDifficulty;
  thumbnail?: string;
  recruitmentStartDate: string;
  recruitmentEndDate: string;
  studyStartDate: string;
  studyEndDate: string;
  currentMembers: number;
  maxMembers: number;
  meetingTime: string;
  status: StudyStatus;
  meeting_type: StudyMeetingType;
  days: number[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface StudyResponse {
  data: StudyPost[];
  page: number;
  size: number;
  total_pages: number;
}

export interface BasePost {
  id: number;
  title: string;
  content: string;
  thumbnail?: string;
  createdAt: string;
  authorId: number;
}

export type InfoPost = BasePost;
export type QnAPost = BasePost;

export interface PostResponse<T> {
  data: T[];
  page: number;
  size: number;
  total_pages: number;
}
