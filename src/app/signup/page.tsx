import { Metadata } from 'next';
import SignUpForm from '@/app/signup/components/SignUpForm';

export const metadata: Metadata = {
  title: '회원가입 - 온오프라인 개발 스터디 플랫폼 DevOnOff',
  description: 'DevOnOff 회원가입 페이지입니다.',
};

const SingUpPage = () => {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">회원가입</h2>
      <SignUpForm />
    </div>
  );
};

export default SingUpPage;
