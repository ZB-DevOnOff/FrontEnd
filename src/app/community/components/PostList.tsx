'use client';

import { InfoPost, QnAPost } from '@/types/post';
interface PostListProps<T> {
  title: string;
  posts: T[];
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  renderPostCard: (post: T) => React.ReactNode;
  showFilters?: boolean;
  filterComponent?: React.ReactNode;
  onWrite?: () => void;
  isSignedIn?: boolean;
  searchForm?: React.ReactNode;
}

export function PostList<T extends InfoPost | QnAPost>({
  title,
  posts,
  totalPages,
  currentPage,
  isLoading,
  onPageChange,
  renderPostCard,
  showFilters = false,
  filterComponent,
  onWrite,
  isSignedIn,
  searchForm,
}: PostListProps<T>) {
  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        {onWrite && isSignedIn && (
          <button onClick={onWrite} className="btn btn-primary">
            글쓰기
          </button>
        )}
      </div>

      {/* 검색 영역 */}
      {searchForm && <div className="mb-6">{searchForm}</div>}

      {/* 필터 영역 */}
      {showFilters && filterComponent}

      {/* 게시물 목록 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 gap-x-0">
            {posts.map(post => (
              <div className="flex justify-center" key={post.id}>
                {renderPostCard(post)}
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          <div className="flex justify-center mt-8">
            <div className="join">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`join-item btn ${currentPage === i ? 'btn-active' : ''}`}
                  onClick={() => onPageChange(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
