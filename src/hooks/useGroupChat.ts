import { useCallback, useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { User } from '@/types/post';
import axiosInstance from '@/utils/axios';
import useWebSocket from './useWebSocket';

interface UseGroupChatParams {
  chatRoomId: string;
  userId: number;
}

interface ChatMessage {
  id: number;
  chatRoomId: number;
  content: string;
  createdAt: string;
  // timestamp: string;
  user: User;
}

const MESSAGES_QUERY_KEY = 'chatMessages';

export const useGroupChat = ({ chatRoomId, userId }: UseGroupChatParams) => {
  const queryClient = useQueryClient();
  // const stompClient = useRef<Client | null>(null);
  // const [chatState, setChatState] = useState<ChatState>({
  //   isConnected: false,
  //   error: null,
  // });
  // const isConnecting = useRef(false);
  const { webSocketState, subscribe, unsubscribe, publish } =
    useWebSocket(userId);

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
          createdAt: msg.createdAt,
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

  // 채팅방 구독 설정
  useEffect(() => {
    if (webSocketState.isConnected && chatRoomId) {
      try {
        subscribe(`/topic/chat/${chatRoomId}`, (newMessage: ChatMessage) => {
          newMessage.createdAt = newMessage.createdAt;
          const currentData = queryClient.getQueryData(
            getMessagesQueryKey(),
          ) as any;

          const isDuplicate = currentData?.pages.some((page: any) =>
            page.messages.some((msg: ChatMessage) => msg.id === newMessage.id),
          );

          if (!isDuplicate) {
            addNewMessage(newMessage);
          }
        });
      } catch (error) {
        console.error('채팅방 구독 실패:', error);
      }
    }

    return () => {
      if (chatRoomId) {
        unsubscribe(`/topic/chat/${chatRoomId}`);
      }
    };
  }, [
    chatRoomId,
    webSocketState.isConnected,
    subscribe,
    unsubscribe,
    queryClient,
    getMessagesQueryKey,
    addNewMessage,
  ]);

  // 메시지 전송 함수
  const sendMessage = async (content: string, file?: File) => {
    if (!webSocketState.isConnected) {
      throw new Error('WebSocket이 연결되어 있지 않습니다.');
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
        publish(
          `/app/chat/${chatRoomId}/send-messages`,
          JSON.stringify(messagePayload),
        );
      } catch (error) {
        console.error('메시지 전송 실패:', error);
        throw error;
      }
    }
  };

  // 메시지 정렬 및 중복 제거
  const messages = messagesData?.pages.flatMap(page => page.messages) ?? [];
  const uniqueMessages = Array.from(
    new Map(messages.map(m => [m.id, m])).values(),
  ).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return {
    messages: uniqueMessages,
    chatState: webSocketState,
    sendMessage,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  };
};
