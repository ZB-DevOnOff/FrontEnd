import { FaCheck } from 'react-icons/fa';

type NotificationModalProps = {
  notifications: { message: string; isRead: boolean }[];
  onClose: () => void;
  // onAllMessagesRead: () => void
};
const NotificationModal = ({
  notifications,
  onClose,
  // onAllMessagesRead,
}: NotificationModalProps) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={handleBackdropClick} />
      <div className="absolute top-16 right-16 lg:right-48 z-50">
        <div className="bg-white rounded-lg shadow-custom-strong p-6 w-full max-w-xs">
          <h2 className="text-lg font-bold mb-4">알림</h2>
          {notifications.length > 0 && (
            <div className="flex justify-end mb-4 text-gray-600">
              <button
                className="bg-white text-sm hover:text-teal-500 flex items-center space-x-2"
                // onClick={onMarkAllAsRead}
              >
                <FaCheck size={16} className="mr-2" />
                모두 읽음 처리
              </button>
            </div>
          )}

          {notifications.length > 0 ? (
            <ul className="space-y-2">
              {notifications.map((notification, index) => (
                <li
                  key={index}
                  className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-200 ${notification.isRead ? 'bg-gray-100 text-gray-700 opacity-70' : 'text-gray-800'}`}
                >
                  {notification.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">새로운 알림이 없습니다.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationModal;
