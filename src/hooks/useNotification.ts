import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Notification } from '@/components/layout/Header/NotificationModal';
import { useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axios';

const NOTIFICATION_QUERY_KEY = 'notifications';

// 알림 데이터 타입 정의
// interface NotificationResponse {
//   content: Notification[];
//   last: boolean;
//   totalElements: number;
//   totalPages: number;
// }

const useNotification = (userId: number) => {
  const queryClient = useQueryClient();
  const stompClient = useRef<Client | null>(null);
  const [, setIsConnected] = useState(false);

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

  // WebSocket 연결 함수
  const connect = useCallback(() => {
    if (!userId || stompClient.current?.connected) return;

    const socket = new SockJS(
      `${process.env.NEXT_PUBLIC_CHAT_SOCKET_URL}/ws` as string,
    );
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);
        console.log('알림 WebSocket 연결 성공');
        client.subscribe(`/topic/notifications/${userId}`, message => {
          try {
            const notification = JSON.parse(message.body);
            addNewNotification(notification);
          } catch (error) {
            console.error('알림 메시지 파싱 오류:', error);
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.log('알림 WebSocket 연결 해제됨');
      },
      onStompError: error => {
        console.error('WebSocket 오류:', error);
      },
    });

    stompClient.current = client;
    client.activate();
  }, [userId, addNewNotification]);

  // WebSocket 연결 해제 함수
  const disconnect = useCallback(() => {
    if (stompClient.current?.connected) {
      stompClient.current.deactivate();
      stompClient.current = null;
      setIsConnected(false);
    }
  }, []);

  // WebSocket 연결 관리
  useEffect(() => {
    if (userId) connect();
    return () => disconnect();
  }, [userId, connect, disconnect]);

  return {
    notifications,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    status,
    connect,
    disconnect,
    updateNotificationCache,
  };
};

export default useNotification;
