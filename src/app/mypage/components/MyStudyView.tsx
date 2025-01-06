'use client';

import { StudyPost, InfoPost, QnAPost } from '@/types/post';
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import MyStudyCard from './MyStudyCard';
import { MyStudyCardData } from './MyStudyCard';
import { StudyCard } from '@/app/community/study/components/StudyCard';
import MyInfoPostCard from './MyInfoPostCard';
import MyQnAPostCard from './MyQnAPostCard';
import Pagination from './Pagination';
import axiosInstance from '@/utils/axios';
import handleApiError from '@/utils/handleApiError';

const MyStudyView = () => {
  const { userInfo, isSignedIn } = useAuthStore();
  const [activeTab, setActiveTab] = useState('myStudy'); // 기본값을 'myStudy'
  const [, setIsLoading] = useState(false);
  const [myStudies, setMyStudies] = useState<MyStudyCardData[]>([]);
  const [myStudyPosts, setMyStudyPosts] = useState<StudyPost[]>([]);
  const [myInfoPosts, setMyInfoPosts] = useState<InfoPost[]>([]);
  const [myQnAPosts, setMyQnAPosts] = useState<QnAPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalElements: 0,
  });

  const tabConfigs = {
    myStudy: {
      url: `/study/author/${userInfo?.id}`,
      setData: setMyStudies,
      logMessage: '나의 스터디 불러오기 성공',
    },
    myStudyPost: {
      url: `/study-posts/author/${userInfo?.id}`,
      setData: setMyStudyPosts,
      logMessage: '나의 스터디 모집 글 불러오기 성공',
    },
    myInfoPost: {
      url: `/info-posts/author/${userInfo?.id}`,
      setData: setMyInfoPosts,
      logMessage: '나의 정보 공유 게시글 불러오기 성공',
    },
    myQnAPost: {
      url: `/qna-posts/author/${userInfo?.id}`,
      setData: setMyQnAPosts,
      logMessage: '나의 Q&A 게시글 불러오기 성공',
    },
  };

  const getTabText = (tab: string) => {
    const texts = {
      myStudy: {
        mobile: '내가\n속한\n스터디',
        desktop: '내가 속한 스터디',
      },
      myStudyPost: {
        mobile: '나의\n스터디\n모집 글',
        desktop: '나의 스터디 모집 글',
      },
      myInfoPost: {
        mobile: '나의\n정보\n공유',
        desktop: '나의 정보 공유',
      },
      myQnAPost: {
        mobile: '나의\nQ&A',
        desktop: '나의 Q&A',
      },
    };

    return (
      <span>
        <span className="hidden sm:inline">
          {texts[tab as keyof typeof texts].desktop}
        </span>
        <span className="inline sm:hidden whitespace-pre-line">
          {texts[tab as keyof typeof texts].mobile}
        </span>
      </span>
    );
  };

  const handleTabClick = useCallback(
    async (tab: keyof typeof tabConfigs, page = 0) => {
      setActiveTab(tab);
      setError(null);
      setIsLoading(true);

      const config = tabConfigs[tab];

      if (userInfo?.id) {
        try {
          // NEXT_PUBLIC_API_ROUTE_URL의 끝에 슬래시가 있으면 제거
          const apiRouteUrl = process.env.NEXT_PUBLIC_API_ROUTE_URL?.replace(
            /\/$/,
            '',
          );

          // config.url이 '/'로 시작하지 않으면 '/'를 추가하여 결합
          const url = `${apiRouteUrl}${config.url.startsWith('/') ? config.url : `/${config.url}`}?page=${page}`;

          console.log('Request URL: ', url); // URL 로그로 확인
          const response = await axiosInstance.get(url);

          if (response.status === 200 && response.data) {
            config.setData(response.data.content);

            setPagination({
              currentPage: response.data.pageable.pageNumber + 1,
              pageSize: response.data.pageable.pageSize,
              totalElements: response.data.totalElements,
            });
            console.log(config.logMessage);
          }
        } catch (error: any) {
          handleApiError(error, setError);
        } finally {
          setIsLoading(false);
        }
      }
    },
    [userInfo?.id],
  );

  useEffect(() => {
    if (isSignedIn && userInfo?.id) {
      handleTabClick('myStudy');
    }
  }, [isSignedIn, userInfo, handleTabClick]);

  const handlePageChange = (newPage: number) => {
    handleTabClick(activeTab as keyof typeof tabConfigs, newPage);
  };

  const renderTabContent = () => {
    const contentMap = {
      myStudy: {
        data: myStudies,
        component: MyStudyCard,
        emptyMessage: '내가 속한 스터디가 없습니다.',
      },
      myStudyPost: {
        data: myStudyPosts,
        component: StudyCard,
        emptyMessage: '작성한 스터디 모집 글이 없습니다.',
      },
      myInfoPost: {
        data: myInfoPosts,
        component: MyInfoPostCard,
        emptyMessage: '작성한 정보 공유 게시글이 없습니다.',
      },
      myQnAPost: {
        data: myQnAPosts,
        component: MyQnAPostCard,
        emptyMessage: '작성한 Q&A 게시글이 없습니다.',
      },
    };

    const currentTab = contentMap[activeTab as keyof typeof contentMap];
    if (!isSignedIn) return <p>로그인이 필요합니다.</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!currentTab.data || currentTab.data.length === 0)
      return <p>{currentTab.emptyMessage}</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentTab.data.map((post: any) => (
          <div className="flex justify-center" key={post.id}>
            <currentTab.component post={post} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div role="tablist" className="tabs tabs-lifted tabs-lg hover:tab-lifted">
        {Object.keys(tabConfigs).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab as keyof typeof tabConfigs)}
            className={`tab tab-lg text-xs sm:text-sm md:text-base hover:font-bold hover:text-md hover:text-black hover:shadow-lg ${
              activeTab === tab
                ? 'tab-active text-black font-bold text-xs sm:text-sm md:text-base'
                : 'bg-white text-gray-500'
            } `}
          >
            {getTabText(tab)}
          </button>
        ))}
      </div>
      <div className="p-4">
        {renderTabContent()}
        <Pagination
          totalElements={pagination.totalElements}
          pageSize={pagination.pageSize}
          currentPage={pagination.currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default MyStudyView;
