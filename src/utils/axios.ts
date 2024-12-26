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
  error => {
    if (error.response && error.response.status === 401) {
      console.error('axios interceptor 인증 에러');
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
