import { StudyPost } from './post';

export interface StudyApplication {
  signupId: number;
  userId: number;
  nickname: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export type { StudyPost as BaseStudyPost };

export interface StudyResponse {
  content: StudyPost[];
  page: number;
  size: number;
  totalPages: number;
}
export const SUBJECT_OPTIONS = {
  CONCEPT_LEARNING: '개념학습',
  PROJECT: '프로젝트',
  CHALLENGE: '챌린지',
  CERTIFICATION: '자격증/시험',
  JOB_PREPARATION: '취업/코테',
  ETC: '기타',
} as const;

export const DIFFICULTY_OPTIONS = {
  HIGH: '상',
  MEDIUM: '중',
  LOW: '하',
} as const;

export const MEETING_TYPE = {
  ONLINE: '온라인',
  HYBRID: '병행',
} as const;

export const STATUS_OPTIONS = {
  RECRUITING: '모집 중',
  IN_PROGRESS: '진행 중',
  CANCELED: '모집 취소',
} as const;

export const DAY_KOREAN = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
} as const;

export type StudyDifficulty = 'HIGH' | 'MEDIUM' | 'LOW';

export type StudySubject =
  | 'CONCEPT_LEARNING'
  | 'PROJECT'
  | 'CHALLENGE'
  | 'CERTIFICATION'
  | 'JOB_PREPARATION'
  | 'ETC';
