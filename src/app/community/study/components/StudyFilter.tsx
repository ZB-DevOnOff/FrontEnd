'use client';

type FilterType = 'subjects' | 'status' | 'difficulty' | 'days';

// 영어 Enum -> 한글 표시용 매핑
const STATUS_DISPLAY = {
  RECRUITING: '모집 중',
  COMPLETED: '모집 완료',
  IN_PROGRESS: '진행 중',
  CANCELED: '종료',
};

const DIFFICULTY_DISPLAY = {
  HIGH: '상',
  MEDIUM: '중',
  LOW: '하',
};

const SUBJECT_DISPLAY = {
  CONCEPT_LEARNING: '개념 학습',
  PROJECT: '프로젝트',
  ALGORITHM: '알고리즘',
  CODING_TEST: '코딩테스트',
  CHALLENGE: '챌린지',
  CERTIFICATION: '자격증/시험',
  JOB_PREPARATION: '취업/코테',
  ETC: '기타',
};

interface StudyFilterProps {
  selectedSubjects: string[];
  selectedStatus: string[];
  selectedDifficulty: string[];
  selectedDays: string[];
  onFilterChange: (type: FilterType, value: string) => void;
}

export function StudyFilter({
  selectedSubjects,
  selectedStatus,
  selectedDifficulty,
  selectedDays,
  onFilterChange,
}: StudyFilterProps) {
  return (
    <div className="h-[330px] overflow-y-auto bg-base-200 p-4 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <h3 className="font-semibold mb-2">주제</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SUBJECT_DISPLAY).map(([key, value]) => (
              <button
                key={key}
                onClick={() => onFilterChange('subjects', key)}
                className={`btn btn-sm ${
                  selectedSubjects.includes(key) ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">상태</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_DISPLAY).map(([key, value]) => (
              <button
                key={key}
                onClick={() => onFilterChange('status', key)}
                className={`btn btn-sm ${
                  selectedStatus.includes(key) ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">난이도</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(DIFFICULTY_DISPLAY).map(([key, value]) => (
              <button
                key={key}
                onClick={() => onFilterChange('difficulty', key)}
                className={`btn btn-sm ${
                  selectedDifficulty.includes(key)
                    ? 'btn-primary'
                    : 'btn-outline'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">요일</h3>
          <div className="flex flex-wrap gap-2">
            {['월', '화', '수', '목', '금', '토', '일'].map(day => (
              <button
                key={day}
                onClick={() => onFilterChange('days', day)}
                className={`btn btn-sm ${
                  selectedDays.includes(day) ? 'btn-primary' : 'btn-outline'
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
