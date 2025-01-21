import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface WebSocketState {
  isConnected: boolean;
  error: string | null;
}

const useWebSocket = (
  userId: number,
  // onMessageReceived: (message: any) => void,
) => {
  const stompClient = useRef<Client | null>(null);
  const subscriptions = useRef<Map<string, StompSubscription>>(new Map());
  const isConnecting = useRef<boolean>(false);
  const [webSocketState, setWebSocketState] = useState<WebSocketState>({
    isConnected: false,
    error: null,
  });
  // const [, setIsConnected] = useState(false);

  // WebSocket 연결 함수
  const connect = useCallback(() => {
    if (!userId || isConnecting.current || stompClient.current?.connected)
      return;

    isConnecting.current = true;

    const socket = new SockJS(
      `${process.env.NEXT_PUBLIC_CHAT_SOCKET_URL}/ws` as string,
    );

    if (stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
    }

    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        isConnecting.current = false;
        setWebSocketState({ isConnected: true, error: null });
        console.log('알림 WebSocket 연결 성공');
        // client.subscribe(`/topic/notifications/${userId}`, message => {
        //   try {
        //     const parsedMessage = JSON.parse(message.body);
        //     onMessageReceived(parsedMessage);
        //   } catch (error) {
        //     console.error('알림 메시지 파싱 오류:', error);
        //   }
        // });
      },
      onDisconnect: () => {
        isConnecting.current = false;
        setWebSocketState(prev => ({ ...prev, isConnected: false }));
        console.log('알림 WebSocket 연결 해제됨');
      },
      onStompError: error => {
        isConnecting.current = false;
        setWebSocketState(prev => ({
          ...prev,
          error: error.headers?.message || '연결 오류가 발생했습니다.',
        }));
        console.error('WebSocket 오류:', error);
      },
    });

    stompClient.current = client;
    client.activate();
  }, [userId]);

  // 토픽 구독 함수
  const subscribe = useCallback(
    (topic: string, callback: (message: any) => void) => {
      if (!stompClient.current?.connected) {
        throw new Error('WebSocket이 연결되어 있지 않습니다.');
      }

      if (!subscriptions.current.has(topic)) {
        const subscription = stompClient.current.subscribe(topic, message => {
          try {
            const parsedMessage = JSON.parse(message.body);
            callback(parsedMessage);
          } catch (error) {
            console.error('메시지 파싱 오류:', error);
          }
        });
        subscriptions.current.set(topic, subscription);
        console.log(`${topic} 구독 성공`);
      }
    },
    [],
  );

  // 토픽 구독 해제 함수
  const unsubscribe = useCallback((topic: string) => {
    const subscription = subscriptions.current.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      subscriptions.current.delete(topic);
      console.log(`${topic} 구독 취소`);
    }
  }, []);

  // WebSocket 연결 해제 함수
  const disconnect = useCallback(() => {
    // 모든 구독 취소
    subscriptions.current.forEach(subscription => {
      subscription.unsubscribe();
    });
    subscriptions.current.clear();

    if (stompClient.current?.connected) {
      stompClient.current.deactivate();
      stompClient.current = null;
      setWebSocketState({ isConnected: false, error: null });
    }
  }, []);

  // 웹소켓 publish 함수(채팅)
  const publish = useCallback((destination: string, body: string) => {
    if (!stompClient.current?.connected) {
      throw new Error('WebSocket이 연결되어 있지 않습니다.');
    }

    stompClient.current.publish({
      destination,
      body,
    });
  }, []);

  // WebSocket 연결 관리
  useEffect(() => {
    if (userId) connect();
    return () => disconnect();
  }, [userId, connect, disconnect]);

  return {
    webSocketState,
    subscribe,
    unsubscribe,
    publish,
    connect,
    disconnect,
  };
};

export default useWebSocket;
