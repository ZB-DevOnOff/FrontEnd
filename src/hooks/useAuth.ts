import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  nickname: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
        } catch {
          console.error('Failed to parse user data');
          setUser(null);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
      }

      setIsLoading(false);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const getAuthHeader = (): HeadersInit => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    user,
    isLoading,
    isLoggedIn: !!user,
    isAuthor: (authorId: number) => user?.id === authorId,
    getAuthHeader,
  };
};
