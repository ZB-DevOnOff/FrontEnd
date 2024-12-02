export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    nickname: string;
  };
  parentId: string | null;
  replies: Comment[];
}
