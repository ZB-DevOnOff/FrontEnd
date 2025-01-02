import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_ROUTE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  config => {
    if (config.headers['Content-Type'] === 'multipart/form-data') {
      return config;
    }
    return config;
  },

  error => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const { resetStore } = useAuthStore.getState();
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401 || status === 403) {
        console.log('토큰 문제 발생. 로그인이 필요합니다.');

        // 약간의 지연을 주어 alert가 보일 수 있도록 함
        setTimeout(() => {
          resetStore();
          window.location.href = '/signin';
        }, 3000);
      }
      return Promise.reject({
        status,
        data,
        errorCode: data?.errorCode,
        errorMessage: data?.errorMessage || error.message,
      });
    }

    return Promise.reject({
      status: null,
      errorCode: 'NETWORK_ERROR',
      errorMessage: '네트워크 문제로 요청을 처리할 수 없습니다.',
    });
  },
);

export default axiosInstance;
