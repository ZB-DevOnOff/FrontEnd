'use client';

import { useGroupChat } from '@/hooks/useGroupChat';
import MessageInput from './MessageInput';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
interface ChatRoomProps {
  chatRoomId: string;
  studyId: string;
}

const ChatRoom = ({ chatRoomId, studyId }: ChatRoomProps) => {
  console.log('studyId', studyId);
  const searchParams = useSearchParams();
  const studyName = searchParams.get('studyName');

  const { userInfo } = useAuthStore();
  const userId = userInfo?.id || 111;
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isConnecting = useRef(false);

  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    sendMessage,
    chatState,
    connect,
  } = useGroupChat({ chatRoomId, userId });

  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const handleFetchPreviousMessages = async () => {
    if (!hasNextPage || isFetchingNextPage || !chatContainerRef.current) return;

    try {
      const previousScrollHeight = chatContainerRef.current.scrollHeight;
      const previousScrollTop = chatContainerRef.current.scrollTop;

      await fetchNextPage();

      // 스크롤 위치 조정 - 새로운 메시지 로드 후 스크롤 유지
      if (chatContainerRef.current) {
        const newScrollHeight = chatContainerRef.current.scrollHeight;
        chatContainerRef.current.scrollTop =
          newScrollHeight - previousScrollHeight + previousScrollTop;
      }
    } catch (error) {
      console.error('이전 메시지 로드 실패:', error);
      setLoadError('이전 메시지를 가져오는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    console.log('메시지 변경 감지:', messages);
  }, [messages]);
  const shouldLoadMore =
    inView && hasNextPage && !isFetchingNextPage && !loadError;

  useEffect(() => {
    console.log('이전 메시지 로드 조건', {
      inView,
      hasNextPage,
      isFetchingNextPage,
      loadError,
      shouldLoadMore,
      currentMessageCount: messages.length,
    });

    if (shouldLoadMore) {
      handleFetchPreviousMessages();
    }
  }, [shouldLoadMore]);

  // // 스크롤 맨 아래로 이동
  // useEffect(() => {
  //   if (chatContainerRef.current) {
  //     chatContainerRef.current.scrollTop =
  //       chatContainerRef.current.scrollHeight;
  //   }
  // }, [messages]);
  useEffect(() => {
    if (messages.length && chatContainerRef.current) {
      // 메시지가 추가될 때 스크롤 유지
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (chatState.error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="alert alert-error">
          <span>{chatState.error}</span>
        </div>
        <button
          onClick={connect}
          disabled={isConnecting.current}
          className="btn btn-primary"
        >
          {isConnecting.current ? '연결 중...' : '채빙방 재연결'}
        </button>
      </div>
    );
  }
  const isDateChanged = (
    currentTimestamp: string,
    prevTimestamp: string | null,
  ) => {
    const currentDate = new Date(currentTimestamp).toDateString();
    const prevDate = prevTimestamp
      ? new Date(prevTimestamp).toDateString()
      : null;
    return currentDate !== prevDate;
  };

  return (
    <div className="flex justify-center items-start h-screen">
      <div className="mt-4 w-[80%] max-w-5xl bg-white rounded-lg shadow-lg relative overflow-hidden">
        <div className="bg-gray-900 text-gray-100 p-4 flex items-center gap-2">
          <div className="bg-red-500 w-3 h-3 rounded-full"></div>
          <div className="bg-yellow-500 w-3 h-3 rounded-full"></div>
          <div className="bg-green-500 w-3 h-3 rounded-full"></div>
        </div>
        <div className="flex items-center bg-gray-100 p-3 border-b border-gray-300">
          <div className="w-full text-lg text-center font-bold focus:outline-none bg-white border border-gray-300 rounded-md p-2">
            {studyName}
          </div>
        </div>
        <div
          ref={chatContainerRef}
          className="flex-1 h-[500px] overflow-y-auto space-y-4 px-6 pb-6"
        >
          {isFetchingNextPage && (
            <div className="text-center text-gray-500 py-2">
              이전 메시지 로딩 중...
            </div>
          )}
          {loadError && !isFetchingNextPage && (
            <div className="text-center text-red-500">{loadError}</div>
          )}

          {messages.length === 0 && !isFetchingNextPage && (
            <div className="text-center text-gray-500">메시지가 없습니다.</div>
          )}

          {messages.map((msg, idx) => {
            const prevMessage = messages[idx - 1] || null;
            const showDate =
              !prevMessage ||
              isDateChanged(msg.timestamp, prevMessage?.timestamp);

            return (
              <div key={msg.timestamp || idx}>
                {/* 날짜 구분 라인 */}
                {showDate && (
                  <div className="text-center text-gray-500 text-sm">
                    {new Date(msg.timestamp).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}

                {/* 채팅 메시지 */}
                <div
                  className={`flex items-end ${
                    msg.user.id === userId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* 상대방 프로필 이미지 및 유저 ID */}
                  {msg.user.id !== userId && (
                    <div className="flex flex-col items-center">
                      <img
                        src={
                          msg.user.profileImageUrl ||
                          'http://via.placeholder.com/150'
                        }
                        alt={`${msg.user.id}'s profile`}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                      />
                      <div
                        className="text-xs text-gray-600 truncate max-w-[70px] nickname"
                        title={msg.user.nickname}
                      >
                        {msg.user.nickname}
                      </div>
                    </div>
                  )}

                  {/* 메시지 말풍선 */}
                  <div
                    className={`relative max-w-[70%] px-4 py-2 rounded-lg ${
                      msg.user.id === userId
                        ? 'bg-blue-500 text-white self-end'
                        : 'bg-gray-200 text-black'
                    }`}
                  >
                    <div>{msg.content}</div>
                    <div
                      className={`mt-2 text-xs sm:text-sm ${
                        msg.user.id === userId
                          ? 'text-gray-300'
                          : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {/* {msg.imgUrl && (
                    <img
                      src={msg.imgUrl}
                      alt="첨부 이미지"
                      className="mt-2 rounded-lg max-w-[200px]"
                    />
                  )} */}

                    {/* 말풍선 꼬리 */}
                    <div
                      className={`absolute bottom-0 w-0 h-0 border-t-[10px] ${
                        msg.user.id === userId
                          ? 'border-blue-500 right-[-6px] border-r-[10px] border-r-transparent'
                          : 'border-gray-200 left-[-6px] border-l-[10px] border-l-transparent'
                      }`}
                    />
                  </div>

                  {/* 자신의 프로필 이미지 및 유저 ID */}
                  {msg.user.id === userId && (
                    <div className="flex flex-col items-center">
                      <img
                        src={
                          msg.user.profileImageUrl ||
                          'http://via.placeholder.com/150'
                        }
                        alt="My profile"
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                      />
                      <div
                        className="text-xs text-gray-600 truncate max-w-[70px] nickname"
                        title={msg.user.nickname}
                      >
                        {msg.user.nickname}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {/* 스크롤이 최상단에 도달하면 트리거 됨 */}
          {hasNextPage && !isFetchingNextPage && (
            <div ref={ref} className="h-1"></div>
          )}
        </div>

        {/* 메시지 입력 */}
        <div className="p-6 border-t border-gray-300">
          <MessageInput onSendMessage={sendMessage} />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
