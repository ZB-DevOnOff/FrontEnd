'use client';

import { useGroupChat } from '@/hooks/useGroupChat';
import MessageInput from './MessageInput';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { FaCrown } from 'react-icons/fa';
import CustomAlert from '@/components/common/Alert';

interface ChatRoomProps {
  chatRoomId: string;
  // studyId: string;
}

const ChatRoom = ({ chatRoomId }: ChatRoomProps) => {
  const searchParams = useSearchParams();
  const studyName = searchParams.get('studyName');

  const { userInfo } = useAuthStore();
  const userId = userInfo?.id || 111;
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isConnecting = useRef(false);
  const isInitialLoad = useRef(true);
  const isLoadingPrevMessages = useRef(false);
  const lastMessageLength = useRef(0);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage] = useState('');
  const [alertCallback] = useState<() => void>(() => () => {});

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

  // Intersection Observer 설정
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '50px 0px 0px 0px', // 상단 50px 이전에 트리거
  });

  const handleFetchPreviousMessages = async () => {
    if (
      !hasNextPage ||
      isFetchingNextPage ||
      !chatContainerRef.current ||
      isLoadingPrevMessages.current
    )
      return;

    try {
      isLoadingPrevMessages.current = true;
      // const currentScrollHeight = chatContainerRef.current.scrollHeight;

      await fetchNextPage();

      // 스크롤 위치 유지를 위한 처리는 useEffect에서 수행
    } catch (error) {
      console.error('이전 메시지 로드 실패:', error);
      setLoadError('이전 메시지를 가져오는 데 실패했습니다.');
      isLoadingPrevMessages.current = false;
    }
  };

  // Intersection Observer를 통한 이전 메시지 로드
  useEffect(() => {
    if (
      inView &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isInitialLoad.current
    ) {
      handleFetchPreviousMessages();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  // 최초 로드 시 스크롤을 맨 아래로
  useEffect(() => {
    if (messages.length && chatContainerRef.current && isInitialLoad.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      lastMessageLength.current = messages.length;
      isInitialLoad.current = false;
    }
  }, [messages]);

  // 이전 메시지 로드 시 스크롤 위치 유지
  useEffect(() => {
    if (
      !isInitialLoad.current &&
      isLoadingPrevMessages.current &&
      chatContainerRef.current &&
      messages.length !== lastMessageLength.current
    ) {
      const newScrollHeight = chatContainerRef.current.scrollHeight;
      const targetScrollTop = newScrollHeight - lastMessageLength.current * 100;
      chatContainerRef.current.scrollTop = targetScrollTop;
      lastMessageLength.current = messages.length;
      isLoadingPrevMessages.current = false;
    }
  }, [messages]);

  useEffect(() => {
    if (
      chatContainerRef.current &&
      messages.length > lastMessageLength.current
    ) {
      const container = chatContainerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        500;

      const lastMessage = messages[messages.length - 1];
      const isMyMessage = lastMessage?.user.id === userId;

      if (isNearBottom || isMyMessage) {
        container.scrollTop = container.scrollHeight;
      }

      lastMessageLength.current = messages.length;
    }
  }, [messages, userId]);

  const handleSendMessage = async (content: string, file?: File) => {
    try {
      await sendMessage(content, file);
    } catch (error) {
      console.error('메시지 전송에 실패했습니다:', error);
      setShowAlert(true); // 전역적인 알림 표시 등으로 대체
    }
  };

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

  if (chatState.error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="alert alert-error">
          <span>{chatState.error}</span>
        </div>
        <button
          onClick={connect}
          disabled={isConnecting.current}
          className="btn bg-teal-500"
        >
          {isConnecting.current ? '연결 중...' : '채팅방 재연결'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start h-[screen]">
      <div className="mt-1 w-[100%] max-w-5xl bg-white rounded-lg shadow-lg relative overflow-hidden">
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
          className="flex-1 h-[350px] sm:h-[400px] overflow-y-auto space-y-4 px-6 pb-6"
        >
          {hasNextPage && !isFetchingNextPage && (
            <div ref={ref} className="h-1" />
          )}

          {isFetchingNextPage && (
            <div className="text-center text-gray-500 py-2">
              이전 메시지 로딩 중...
            </div>
          )}
          {loadError && !isFetchingNextPage && (
            <div className="text-center text-customRed">{loadError}</div>
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
              <div className="mt-4" key={msg.timestamp || idx}>
                {showDate && (
                  <div className="text-center mb-4 font-base text-gray-500 text-sm md:text-md">
                    {new Date(msg.timestamp).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}

                <div
                  className={`flex items-end ${
                    msg.user.id === userId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.user.id !== userId && (
                    <div className="flex flex-col items-center min-w-[70px]">
                      <img
                        src={
                          msg.user.profileImageUrl ||
                          'http://via.placeholder.com/150'
                        }
                        alt={`${msg.user.id}'s profile`}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                      />
                      <div
                        className="text-xs sm:text-sm text-gray-600 truncate max-w-[70px] mt-1"
                        title={msg.user.nickname}
                      >
                        {msg.user.nickname}
                      </div>
                    </div>
                  )}

                  <div
                    className={`relative max-w-[70%] px-4 py-2 rounded-lg ${
                      msg.user.id === userId
                        ? 'bg-blue-500 text-white self-end'
                        : 'bg-gray-200 text-black'
                    } break-words`}
                  >
                    <div className="text-sm md:text-md">{msg.content}</div>
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
                    <div
                      className={`absolute bottom-0 w-0 h-0 border-t-[20px] ${
                        msg.user.id === userId
                          ? 'border-blue-500 right-[-6px] border-r-[10px] border-r-transparent'
                          : 'border-gray-200 left-[-6px] border-l-[10px] border-l-transparent'
                      }`}
                    />
                  </div>

                  {msg.user.id === userId && (
                    <div className="flex flex-col items-center min-w-[70px]">
                      {/* 실제 스터디장 프로필에 표시하는 것으로 수정 예정 */}
                      <FaCrown size={20} className="text-teal-500" />
                      <img
                        src={
                          msg.user.profileImageUrl ||
                          'http://via.placeholder.com/150'
                        }
                        alt="My profile"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
                      />
                      <div
                        className="text-xs sm:text-sm text-gray-600 truncate max-w-[70px] mt-1"
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
        </div>

        <div className="p-6 border-t border-gray-300">
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => {
            setShowAlert(false);
            alertCallback();
          }}
        />
      )}
    </div>
  );
};

export default ChatRoom;
