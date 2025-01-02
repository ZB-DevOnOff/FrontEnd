import { useState, useRef, useCallback, useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { User } from '@/types/post';
import axiosInstance from '@/utils/axios';

interface UseGroupChatParams {
  chatRoomId: string;
  userId: number;
}

interface ChatMessage {
  id: number;
  chatRoomId: number;
  content: string;
  createdAt: string;
  timestamp: string;
  user: User;
}

interface ChatState {
  isConnected: boolean;
  error: string | null;
}

const MESSAGES_QUERY_KEY = 'chatMessages';

export const useGroupChat = ({ chatRoomId, userId }: UseGroupChatParams) => {
  const queryClient = useQueryClient();
  const stompClient = useRef<Client | null>(null);
  const [chatState, setChatState] = useState<ChatState>({
    isConnected: false,
    error: null,
  });
  const isConnecting = useRef(false);

  // 메시지 쿼리 키 생성 함수
  const getMessagesQueryKey = useCallback(
    () => [MESSAGES_QUERY_KEY, chatRoomId],
    [chatRoomId],
  );

  // 메시지 가져오기 함수
  const fetchMessages = async ({
    pageParam = 0,
    signal,
  }: {
    pageParam: number;
    signal: AbortSignal;
  }) => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/chat/${chatRoomId}/messages`,
        {
          params: { page: pageParam },
          signal,
        },
      );

      const { content, pageable, last } = response.data;
      const hasMorePages = pageParam === 0 ? true : !last;

      return {
        messages: content.map((msg: ChatMessage) => ({
          ...msg,
          timestamp: msg.createdAt,
        })),
        page: pageable.pageNumber,
        hasNextPage: hasMorePages,
      };
    } catch (error) {
      console.error('메시지 로드 실패:', error);
      throw error;
    }
  };

  // React Query infinity query 설정
  const {
    data: messagesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: getMessagesQueryKey(),
    queryFn: fetchMessages,
    getNextPageParam: lastPage =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
    staleTime: 0,
    gcTime: 1000 * 60 * 5, // 5분
  });

  // 새 메시지 추가 함수
  const addNewMessage = useCallback(
    (newMessage: ChatMessage) => {
      queryClient.setQueryData(getMessagesQueryKey(), (oldData: any) => {
        if (!oldData) {
          return {
            pages: [{ messages: [newMessage] }],
            pageParams: [0],
          };
        }

        // 첫 번째 페이지에 새 메시지 추가
        const newPages = oldData.pages.map((page: any, index: number) => {
          if (index === oldData.pages.length - 1) {
            return {
              ...page,
              messages: [...page.messages, newMessage],
            };
          }
          return page;
        });

        return {
          ...oldData,
          pages: newPages,
        };
      });
    },
    [queryClient, getMessagesQueryKey],
  );

  // 연결 해제 함수
  const disconnect = useCallback(() => {
    if (stompClient.current?.connected) {
      stompClient.current.deactivate();
      stompClient.current = null;
      setChatState(prev => ({ ...prev, isConnected: false }));
      console.log('WebSocket 연결 해제됨');

      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: getMessagesQueryKey() });
    }
  }, [queryClient, getMessagesQueryKey]);

  // 연결 함수
  const connect = useCallback(async () => {
    if (isConnecting.current || stompClient.current?.connected) {
      return;
    }

    isConnecting.current = true;
    setChatState(prev => ({ ...prev, error: null }));

    try {
      const socket = new SockJS(
        `${process.env.NEXT_PUBLIC_CHAT_SOCKET_URL}/ws` as string,
      );

      await new Promise<void>((resolve, reject) => {
        const client = new Client({
          webSocketFactory: () => socket,
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,

          onConnect: () => {
            client.subscribe(`/topic/chat/${chatRoomId}`, messageOutput => {
              const newMessage = JSON.parse(messageOutput.body) as ChatMessage;
              newMessage.timestamp = newMessage.createdAt;
              // addNewMessage(newMessage);
              // 현재 캐시된 데이터 확인
              console.log('보낸 메시지', newMessage);
              const currentData = queryClient.getQueryData(
                getMessagesQueryKey(),
              ) as any;

              // 중복 체크
              const isDuplicate = currentData?.pages.some((page: any) =>
                page.messages.some(
                  (msg: ChatMessage) => msg.id === newMessage.id,
                ),
              );

              // 중복이 아닌 경우만 추가
              if (!isDuplicate) {
                addNewMessage(newMessage);
              }
            });

            setChatState({
              isConnected: true,
              error: null,
            });
            isConnecting.current = false;
            resolve();
          },

          onDisconnect: () => {
            setChatState(prev => ({ ...prev, isConnected: false }));
            // 연결이 끊겼을 때 캐시 무효화
            queryClient.invalidateQueries({ queryKey: getMessagesQueryKey() });
          },

          onStompError: frame => {
            reject(
              new Error(frame.headers.message || '연결 오류가 발생했습니다.'),
            );
          },
        });

        stompClient.current = client;
        client.activate();
      });
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : '알 수 없는 오류가 발생했습니다.',
      }));
      isConnecting.current = false;
      throw error;
    }
  }, [chatRoomId, addNewMessage, queryClient, getMessagesQueryKey]);

  // 메시지 전송 함수
  const sendMessage = async (content: string, file?: File) => {
    if (!chatState.isConnected) {
      await connect();
    }

    let imgUrl: string | undefined;
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await axios.post('/photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imgUrl = response.data;
      } catch (error) {
        console.error('파일 업로드 실패:', error);
        throw error;
      }
    }

    if (content || imgUrl) {
      const messagePayload = {
        senderId: userId,
        content,
        imgUrl,
      };

      try {
        stompClient.current?.publish({
          destination: `/app/chat/${chatRoomId}/send-messages`,
          body: JSON.stringify(messagePayload),
        });
      } catch (error) {
        console.error('메시지 전송 실패:', error);
        throw error;
      }
    }
  };

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // 메시지 정렬 및 중복 제거
  const messages = messagesData?.pages.flatMap(page => page.messages) ?? [];
  const uniqueMessages = Array.from(
    new Map(messages.map(m => [m.id, m])).values(),
  ).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  return {
    messages: uniqueMessages,
    chatState,
    sendMessage,
    connect,
    disconnect,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  };
};
