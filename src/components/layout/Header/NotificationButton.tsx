'use client';

import { FiBell } from 'react-icons/fi';

const NotificationButton = ({
  count,
  onClick,
  isActive,
}: {
  count: number;
  onClick: () => void;
  isActive: boolean;
}) => (
  <button
    className={`btn btn-ghost relative ${isActive ? 'btn-active' : ''}`}
    onClick={onClick}
  >
    <FiBell size={24} />
    {count > 0 && (
      <div className="absolute -top-1 -right-0.5 bg-customRed text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-xs">
        {count > 99 ? '99+' : count}
      </div>
    )}
  </button>
);

export default NotificationButton;
