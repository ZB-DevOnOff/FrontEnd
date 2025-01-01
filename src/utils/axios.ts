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
    if (error.response && error.response.status === 401) {
      console.log('토큰 문제 발생. 로그인이 필요합니다.');

      // 약간의 지연을 주어 alert가 보일 수 있도록 함
      setTimeout(() => {
        resetStore();
        window.location.href = '/signin';
      }, 3000);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
