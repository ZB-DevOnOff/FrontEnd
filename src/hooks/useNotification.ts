import { Client } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Notification } from '@/components/layout/Header/NotificationModal';
const useNotification = (userId: number) => {
  const stompClient = useRef<Client | null>(null);
  const [newNotifications, setNewNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

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
        console.log('userId: ' + userId);
        client.subscribe(`/topic/notifications/${userId}`, message => {
          console.log('새 알림 메시지 수신:', message.body);
          const notification = JSON.parse(message.body);
          // 중복 체크: 동일한 알림 ID가 이미 존재하는지 확인
          setNewNotifications(prev => {
            const isDuplicate = prev.some(
              existingNotification =>
                existingNotification.id === notification.id,
            );

            // 중복되지 않으면 알림 추가
            if (isDuplicate) {
              return prev;
            } else {
              return [...prev, notification];
            }
          });
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
    console.log('WebSocket 클라이언트 활성화 시작');
    client.activate();
  }, [userId]);

  const disconnect = useCallback(() => {
    if (stompClient.current?.connected) {
      stompClient.current.deactivate();
      stompClient.current = null;
      setIsConnected(false);
    }
  }, [userId]);

  useEffect(() => {
    console.log('현재 userId:', userId);
    if (userId) connect();
    // connect();
    return () => disconnect();
  }, [userId, connect, disconnect]);

  return { newNotifications, isConnected, connect, disconnect };
};

export default useNotification;
