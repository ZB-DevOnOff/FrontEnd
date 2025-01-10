const LoadingSpinner = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full mt-4 mb-4">
      <div className="animate-spin rounded-full h-[2.5rem] w-[2.5rem] min-h-[2.5rem] min-w-[2.5rem] border-t-2 border-b-2 border-teal-500"></div>
      <span className="mt-4 text-teal-500 text-center whitespace-pre-line sm:whitespace-nowrap">
        {'잠시만 기다려 주세요!\n 데이터를 불러오는 중입니다.'}
      </span>
    </div>
  );
};

export default LoadingSpinner;
