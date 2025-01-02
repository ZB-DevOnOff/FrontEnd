'use client';
import axiosInstance from '@/utils/axios';
import { useState, useEffect } from 'react';

interface authTimerProps {
  isActive: boolean;
  onTimerEnd: () => void;
}

export const AuthTimer = ({ isActive, onTimerEnd }: authTimerProps) => {
  const [serverStartTime, setServerStartTime] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(180);

  useEffect(() => {
    if (!isActive) return;

    const initTimer = async () => {
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/get-time`,
        );
        setServerStartTime(response.data.currentTime);
      } catch (error) {
        console.error('서버 시간을 가져오는 데 실패하였습니다.', error);
      }
    };

    initTimer();
  }, [isActive]);

  useEffect(() => {
    if (!serverStartTime) return;

    const interval = setInterval(() => {
      const startTime = new Date(serverStartTime).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(180 - elapsed, 0);

      if (remaining <= 0) {
        clearInterval(interval);
        onTimerEnd();
      }

      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [serverStartTime, onTimerEnd]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;
  };

  return isActive ? (
    <span className="ml-4 text-red-500 text-sm sm:text-base">
      {formatTime(remainingTime)}
    </span>
  ) : null;
};
