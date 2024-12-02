export interface Application {
  id: number;
  userId: number;
  studyId: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  user: {
    id: number;
    nickname: string;
  };
}
