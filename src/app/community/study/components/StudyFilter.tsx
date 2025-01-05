'use client';

import { ReadonlyURLSearchParams } from 'next/navigation';
import { RiCloseCircleLine } from 'react-icons/ri';
import { FaBook, FaHourglassStart } from 'react-icons/fa';
import { BsCalendar2WeekFill } from 'react-icons/bs';
import { SiLevelsdotfyi } from 'react-icons/si';

type FilterType = 'subjects' | 'status' | 'difficulty' | 'dayType';

// 영어 Enum -> 한글 표시용 매핑
export const STATUS_DISPLAY = {
  RECRUITING: { label: '모집 중', color: 'bg-teal-500' },
  CLOSED: { label: '모집 완료', color: 'bg-gray-800' },
  CANCELED: { label: '모집 취소', color: 'bg-gray-500' },
};

const DIFFICULTY_DISPLAY = {
  HIGH: '상',
  MEDIUM: '중',
  LOW: '하',
};

const SUBJECT_DISPLAY = {
  CONCEPT_LEARNING: '개념 학습',
  PROJECT: '프로젝트',
  CHALLENGE: '챌린지',
  CERTIFICATION: '자격증/시험',
  JOB_PREPARATION: '취업/코테',
  ETC: '기타',
} as const;

const DAY_BIT_FLAGS = {
  월: 1,
  화: 2,
  수: 4,
  목: 8,
  금: 16,
  토: 32,
  일: 64,
} as const;

interface StudyFilterProps {
  selectedSubjects: string[];
  selectedStatus: string[];
  selectedDifficulty: string[];
  selectedDays: string[];
  searchParams: ReadonlyURLSearchParams;
  onFilterChange: (
    type: FilterType,
    value: string,
    isBitFlag?: boolean,
  ) => void;
  onReset: () => void;
}

export function StudyFilter({
  selectedSubjects,
  selectedStatus,
  selectedDifficulty,
  searchParams,
  onFilterChange,
  onReset,
}: StudyFilterProps) {
  const handleDayChange = (day: string) => {
    onFilterChange('dayType', day, true);
  };

  const isSelected = (day: string) => {
    const currentBitFlag = Number(searchParams.get('dayType') || '0');
    const dayBit = DAY_BIT_FLAGS[day as keyof typeof DAY_BIT_FLAGS];
    return (currentBitFlag & dayBit) !== 0;
  };

  return (
    <div className="h-[230px] overflow-y-auto bg-base-200 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">필터</h2>
        <button
          onClick={onReset}
          className="btn btn-sm border-black bg-white hover:bg-teal-50 hover:border-teal-500 hover:text-teal-500"
        >
          <RiCloseCircleLine size={16} />
          전체 해제
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <FaBook className="text-gray-500 mr-2" />
            주제
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SUBJECT_DISPLAY).map(([key, value]) => (
              <button
                key={key}
                onClick={() => onFilterChange('subjects', key)}
                className={`btn btn-sm border-black ${
                  selectedSubjects.includes(key)
                    ? 'border-teal-500 text-teal-500 bg-white'
                    : 'bg-white hover:bg-white hover:border-teal-500 hover:text-teal-500'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <SiLevelsdotfyi className="text-gray-500 mr-2" />
            난이도
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(DIFFICULTY_DISPLAY).map(([key, value]) => (
              <button
                key={key}
                onClick={() => onFilterChange('difficulty', key)}
                className={`btn btn-sm border-black ${
                  selectedDifficulty.includes(key)
                    ? 'border-teal-500 text-teal-500 bg-white'
                    : 'bg-white hover:bg-white hover:border-teal-500 hover:text-teal-500'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <FaHourglassStart className="text-gray-500 mr-2" />
            상태
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_DISPLAY).map(([key, value]) => (
              <button
                key={key}
                onClick={() => onFilterChange('status', key)}
                className={`btn btn-sm border-black ${
                  selectedStatus.includes(key)
                    ? 'border-teal-500 text-teal-500 bg-white'
                    : 'bg-white hover:bg-white hover:border-teal-500 hover:text-teal-500'
                }`}
              >
                {value.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <BsCalendar2WeekFill className="text-gray-500 mr-2" />
            요일
          </h3>
          <div className="flex flex-wrap gap-2">
            {['월', '화', '수', '목', '금', '토', '일'].map(day => (
              <button
                key={day}
                onClick={() => handleDayChange(day)}
                className={`btn btn-sm border-black ${
                  isSelected(day)
                    ? 'border-teal-500 text-teal-500 bg-white'
                    : 'bg-white hover:bg-white hover:border-teal-500 hover:text-teal-500'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
