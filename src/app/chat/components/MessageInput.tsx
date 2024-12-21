import { useState, useRef } from 'react';
import { FiSend } from 'react-icons/fi';

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => Promise<void>;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !fileInputRef.current?.files?.[0]) return;

    setIsLoading(true);
    try {
      await onSendMessage(content, fileInputRef.current?.files?.[0]);
      setContent('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);

      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
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
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          onInput={e => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto'; // 높이를 초기화
            target.style.height = `${target.scrollHeight}px`; // 내용에 따라 높이 조정
          }}
          placeholder="메시지를 입력하세요..."
          className="flex-1 textarea textarea-bordered w-full bg-white text-base sm:text-lg max-h-60 overflow-y-auto"
          disabled={isLoading}
          autoFocus
        />
        <button
          type="submit"
          className="btn btn-base bg-green-400 text-base hover:bg-green-500 text-white rounded-full flex items-center gap-2 px-8 py-2"
          disabled={isLoading}
        >
          {isLoading ? '전송 중...' : '전송'}
          {!isLoading && <FiSend className="text-lg" />}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
