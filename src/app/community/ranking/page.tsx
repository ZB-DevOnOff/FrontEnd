'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FaTrophy } from 'react-icons/fa';

interface RankingData {
  ranking: number;
  studyId: number;
  studyName: string;
  totalStudyTime: string;
  percent: number;
}

export default function RankingPage() {
  const { data: rankings, isLoading } = useQuery<RankingData[]>({
    queryKey: ['rankings'],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/total-study-time/ranking`,
      );
      return response.data;
    },
  });

  const getTrophyColor = (ranking: number) => {
    switch (ranking) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">스터디 랭킹</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="text-center">
              <th className="w-1/6">순위</th>
              <th className="w-2/6">스터디명</th>
              <th className="w-2/6">총 공부시간</th>
              <th className="w-1/6">상위</th>
            </tr>
          </thead>
          <tbody>
            {rankings?.map(rank => (
              <tr key={rank.studyId} className="hover text-center">
                <td className="flex items-center justify-center">
                  <FaTrophy
                    className={`mr-2 ${getTrophyColor(rank.ranking)}`}
                  />
                  {rank.ranking}
                </td>
                <td>{rank.studyName}</td>
                <td>{rank.totalStudyTime}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <progress
                      className="progress w-full"
                      value={rank.percent}
                      max="100"
                    ></progress>
                    <span className="text-sm">{rank.percent.toFixed(2)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
