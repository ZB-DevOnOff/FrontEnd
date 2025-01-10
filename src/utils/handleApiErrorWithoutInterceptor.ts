const handleApiErrorWithoutInterceptor = (
  error: any,
  handleError: (message: string | null) => void,
  errorCodeHandlers?: { [key: string]: string }, // 특정 에러 코드 처리 매핑
) => {
  if (error?.response?.data) {
    const defaultErrorMessage =
      '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
    // const status = error?.response?.status;
    const errorCode = error?.response?.data?.errorCode; // 백엔드에서 정의한 에러 코드
    const errorMessage =
      errorCode && errorCodeHandlers?.[errorCode]
        ? errorCodeHandlers[errorCode] // 에러 코드로 정의된 메시지
        : error?.response?.data?.errorMessage || defaultErrorMessage; // 기본 메시지
    handleError(errorMessage);
  } else {
    handleError('네트워크 오류가 발생했습니다. 다시 시도해 주세요.');
  }
};

export default handleApiErrorWithoutInterceptor;
