import { useState, useRef, FormEvent } from 'react';
import { FiSend } from 'react-icons/fi';

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => Promise<void>;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [byteExceeded, setByteExceeded] = useState(false);
  const [exceedingCharacters, setExceedingCharacters] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // 한글 문자와 기타 문자의 바이트 크기를 계산하는 함수
  const calculateBytes = (str: string) => {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charAt(i);
      // 한글은 2바이트로 계산, 나머지 문자는 1바이트로 계산
      if (/[\u3131-\uD79D]/.test(char)) {
        byteLength += 2; // 한글 문자
      } else {
        byteLength += 1; // 영어 및 특수 문자
      }
    }
    return byteLength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent && !fileInputRef.current?.files?.[0]) return;

    // 750 바이트 초과시 전송 방지
    if (byteExceeded) {
      return;
    }

    setIsLoading(true);

    try {
      await onSendMessage(trimmedContent, fileInputRef.current?.files?.[0]);
      setContent('');
      setByteExceeded(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('메시지 전송에 실패했습니다.', error);
    } finally {
      setIsLoading(false);

      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const byteLength = calculateBytes(newContent);

    if (byteLength <= 750) {
      setContent(newContent);
      setByteExceeded(false);
      setExceedingCharacters(0);
    } else {
      setContent(newContent.slice(0, newContent.length - 1)); // 마지막 문자 제거하여 750바이트 이하로 유지
      setByteExceeded(true);
      setExceedingCharacters(Math.ceil((byteLength - 750) / 2)); // 초과된 바이트 수 계산
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();

      if (!isLoading) {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(fakeEvent);
      }
    }
  };

  const handleTextareaInput = (e: FormEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 w-full max-w-3xl mx-auto px-4"
    >
      <div className="flex gap-2 items-center">
        {/* <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={() => {
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-circle btn-ghost"
          disabled={isLoading}
        >
          📎
        </button> */}
        <textarea
          ref={messageInputRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onInput={handleTextareaInput}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 textarea textarea-bordered w-full bg-white text-base sm:text-lg max-h-60 overflow-y-auto"
          disabled={isLoading}
          autoFocus
        />
        <button
          type="submit"
          className="btn btn-base bg-green-400 text-base hover:bg-green-500 text-white rounded-full flex items-center gap-2 px-8 py-2"
          disabled={isLoading || byteExceeded}
        >
          {isLoading ? '전송 중...' : '전송'}
          {!isLoading && <FiSend className="text-lg" />}
        </button>
      </div>
      {byteExceeded && (
        <p className="text-red-500 text-sm mt-2">
          현재 입력하신 텍스트는 {exceedingCharacters}글자를 초과했습니다.
        </p>
      )}
    </form>
  );
};

export default MessageInput;
