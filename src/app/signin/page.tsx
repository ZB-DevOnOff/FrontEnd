import { Metadata } from 'next';
import SignInForm from '@/app/signin/components/SignInForm';

export const metadata: Metadata = {
  title: '로그인 - 온오프라인 개발 스터디 플랫폼 DevOnOff',
  description: 'DevOnOff 로그인 페이지입니다.',
};

const SingInPage = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">로그인</h2>
      <SignInForm />
    </div>
  );
};

export default SingInPage;
