import { useEffect, useState } from 'react';
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
} from 'react-icons/fa';

interface PaginationProps {
  totalElements: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  totalElements,
  pageSize,
  currentPage,
  onPageChange,
}: PaginationProps) => {
  const [pageGroupSize, setPageGroupSize] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      setPageGroupSize(window.innerWidth <= 640 ? 3 : 5); // 화면 크기에 맞게 페이지 그룹 크기 설정
    };

    handleResize();
    window.addEventListener('resize', handleResize);
  }, []);

  const totalPages = Math.ceil(totalElements / pageSize);
  const currentPageZeroBased = currentPage - 1;

  if (totalPages < 1) return null;

  const currentGroup = Math.trunc(currentPageZeroBased / pageGroupSize);
  const groupStart = currentGroup * pageGroupSize + 1;
  const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);

  const pageNumbers = Array.from(
    { length: groupEnd - groupStart + 1 },
    (_, i) => groupStart + i,
  );

  return (
    <div className="flex justify-center mt-8">
      <div className="join">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(0)}
          className={'join-item btn text-gray-700'}
          aria-label={'첫 페이지로 이동'}
        >
          <FaAngleDoubleLeft size={24} />
        </button>
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPageZeroBased - 1)}
          className={'join-item btn text-gray-700'}
          aria-label={'이전 페이지로 이동'}
        >
          <FaAngleLeft size={24} />
        </button>

        {pageNumbers.map(pageNum => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum - 1)}
            className={`join-item btn ${currentPage === pageNum ? 'btn-active text-teal-500 text-base' : 'text-base'}`}
          >
            {pageNum}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPageZeroBased + 1)}
          className={'join-item btn text-gray-700'}
          aria-label={'다음 페이지로 이동'}
        >
          <FaAngleRight size={24} />
        </button>
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages - 1)}
          className={'join-item btn text-gray-700'}
          aria-label={'마지막 페이지로 이동'}
        >
          <FaAngleDoubleRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
