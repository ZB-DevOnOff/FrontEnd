import { useCallback, useEffect } from 'react';
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import useWebSocket from './useWebSocket';
import { Notification } from '@/types/notification';

const NOTIFICATION_QUERY_KEY = 'notifications';

const useNotification = (userId: number) => {
  const queryClient = useQueryClient();

  // 알림 쿼리 키 생성 함수
  const getNotificationsQueryKey = useCallback(
    () => [NOTIFICATION_QUERY_KEY, userId],
    [userId],
  );

  // 알림 데이터 조회 함수
  const fetchNotificationPage = async ({ pageParam = 0 }) => {
    if (!userId)
      return { content: [], last: true, totalElements: 0, totalPages: 0 };
    const response = await axiosInstance.get(
      `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/notification/?page=${pageParam}`,
    );
    return response.data;
  };

  // React Query의 Infinite Query를 사용한 알림 데이터 관리
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: getNotificationsQueryKey(),
      queryFn: fetchNotificationPage,
      initialPageParam: 0,
      getNextPageParam: lastPage => {
        return lastPage.last ? undefined : lastPage.pageable.pageNumber + 1;
      },
      enabled: !!userId,
      staleTime: 1000 * 60,
    });

  //  중복 제거 헬퍼 함수
  const removeDuplicates = (notifications: Notification[]) => {
    const uniqueNotifications = new Map();
    for (const notification of notifications) {
      uniqueNotifications.set(notification.id, notification);
    }

    return Array.from(uniqueNotifications.values());
  };

  // 모든 알림을 플랫하게 만들어주는 헬퍼 함수
  const notifications = removeDuplicates(
    data?.pages.flatMap(page => page.content) ?? [],
  );

  // 알림 캐시 업데이트 함수
  const updateNotificationCache = useCallback(
    (updater: (prev: Notification[]) => Notification[]) => {
      queryClient.setQueryData(getNotificationsQueryKey(), (old: any) => {
        if (!old?.pages) return old;

        // 첫 페이지의 데이터만 업데이트
        const updatedFirstPage = {
          ...old.pages[0],
          content: updater(old.pages[0].content),
        };

        return {
          ...old,
          pages: [updatedFirstPage, ...old.pages.slice(1)],
        };
      });
    },
    [queryClient, getNotificationsQueryKey],
  );

  // 새 알림 추가 함수
  const addNewNotification = useCallback(
    (newNotification: Notification) => {
      updateNotificationCache(prev => {
        const isDuplicate = prev.some(n => n.id === newNotification.id);
        return isDuplicate ? prev : [newNotification, ...prev];
      });
    },
    [updateNotificationCache],
  );

  // 웹소켓 메시지 처리 함수
  const onMessageReceived = useCallback(
    (newNotification: Notification) => {
      addNewNotification(newNotification);
    },
    [addNewNotification],
  );

  // 웹소켓 연결 관리
  const { webSocketState, subscribe, unsubscribe } = useWebSocket(userId);

  // 알림 구독 설정
  useEffect(() => {
    if (webSocketState.isConnected && userId) {
      try {
        subscribe(`/topic/notifications/${userId}`, onMessageReceived);
      } catch (error) {
        console.error('알림 구독 실패', error);
      }
    }

    return () => {
      if (userId) {
        unsubscribe(`/topic/notifications/${userId}`);
      }
    };
  }, [
    userId,
    webSocketState.isConnected,
    subscribe,
    unsubscribe,
    onMessageReceived,
  ]);

  return {
    notifications,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    status,
    isConnected: webSocketState.isConnected,
    updateNotificationCache,
  };
};

export default useNotification;
