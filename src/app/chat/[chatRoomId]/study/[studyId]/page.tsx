import ChatRoom from '@/app/chat/components/ChatRoom';

type ChatPageProps = {
  params: Promise<{
    chatRoomId: string;
    studyId: string;
  }>;
};

const ChatPage = async ({ params }: ChatPageProps) => {
  const { chatRoomId } = await params;

  return (
    <div className="p-4 space-y-4">
      <div className="mt-4">
        <ChatRoom chatRoomId={chatRoomId} />
      </div>
    </div>
  );
};

export default ChatPage;
