import { useCallback, useEffect, useState } from 'react';
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';
import useWebSocket from './useWebSocket';
import { Notification } from '@/types/notification';

const NOTIFICATION_QUERY_KEY = 'notifications';

const useNotification = (userId: number) => {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // 알림 쿼리 키 생성 함수
  const getNotificationsQueryKey = useCallback(
    () => [NOTIFICATION_QUERY_KEY, userId],
    [userId],
  );

  // 알림 데이터 조회 함수
  const fetchNotificationPage = async ({ pageParam = 0 }) => {
    if (!userId)
      return {
        content: [],
        last: true,
        totalElements: 0,
        totalPages: 0,
      };
    const [notificationsResponse, unreadCountResponse] = await Promise.all([
      axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/notification/?page=${pageParam}`,
      ),
      axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/notification/unread`,
      ),
    ]);

    const initialUnreadCount = unreadCountResponse.data;
    setUnreadCount(initialUnreadCount);

    return {
      ...notificationsResponse.data,
      unreadCount: initialUnreadCount,
    };
  };

  // 읽지 않은 알림 개수 조회 함수
  const fetchUnreadCount = async () => {
    if (!userId) return 0;
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/notification/unread`,
      );
      const unreadCount = response.data;
      setUnreadCount(unreadCount);
      return unreadCount;
    } catch (error) {
      console.error('읽지 않은 알림 개수 가져오기 에러:', error);
    }
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
    async (updater: (prev: Notification[]) => Notification[]) => {
      queryClient.setQueryData(getNotificationsQueryKey(), (old: any) => {
        if (!old?.pages) return old;

        const updatedPages = old.pages.map((page: any) => ({
          ...page,
          content: updater(page.content),
        }));

        return {
          ...old,
          pages: updatedPages,
        };
      });

      // unreadCount를 업데이트
      const newUnreadCount = await fetchUnreadCount();
      setUnreadCount(newUnreadCount);
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
    unreadCount,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    status,
    isConnected: webSocketState.isConnected,
    updateNotificationCache,
  };
};

export default useNotification;
