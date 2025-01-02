export const handleApiError = (
  error: any,
  handleError: (message: string | null) => void,
  errorCodeHandlers?: { [key: string]: string }, // 특정 에러 코드 처리 매핑
) => {
  const defaultErrorMessage = '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  const status = error?.status;
  const errorCode = error?.data?.errorCode; // 백엔드에서 정의한 에러 코드
  const errorMessage =
    errorCode && errorCodeHandlers?.[errorCode]
      ? errorCodeHandlers[errorCode] // 에러 코드로 정의된 메시지
      : error?.data?.errorMessage || defaultErrorMessage; // 기본 메시지

  if (status === 401 || status === 403) {
    handleError('인증이 필요합니다. 다시 로그인 해주세요.');
    // 추가 로직 (예: 리다이렉트)
  } else {
    handleError(errorMessage);
  }
};
