'use client';
import React from 'react';
import { PiHandTapFill } from 'react-icons/pi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

type Card = { title: string; description: string };

const FeatureCard = ({ title, description }: Card) => (
  <div className="w-full p-6 rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
      {title}
    </h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);
const HomePage = () => {
  const router = useRouter();
  const StudyListButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push('/community/study');
  };

  const features = [
    {
      title: '📚 스터디 모집부터 진행까지, 한 번에 해결!',
      description:
        'DevOnOff는 스터디 모집, 참여, 관리까지 모든 것을 간편하게 할 수 있는 올인원 플랫폼입니다. 더 이상 여러 서비스를 돌아다닐 필요 없이 한 곳에서 해결하세요!',
    },
    {
      title: '💬 스터디원들과 실시간 소통, 언제든지 가능!',
      description:
        '실시간 채팅과 화상 채팅 기능을 통해 스터디원들과 언제든지 소통하며, 장소와 시간에 구애받지 않고 효율적으로 온라인 스터디를 진행해보세요.',
    },
    {
      title: '💪 스터디 상위 랭킹 Top10 도전!',
      description:
        '온라인 스터디 참여율을 높여 스터디 상위 랭킹을 목표로 도전하세요. 서로를 자극하며 꾸준한 학습이 가능합니다!',
    },
    {
      title: '🙋 개발 중 궁금한 점, 이제는 쉽게 해결!',
      description:
        'Q&A 게시판을 통해 스터디원들과 개발 관련 질문을 주고받으며 실시간으로 문제를 해결하세요. 여러분의 궁금증을 신속하게 해결할 수 있습니다.',
    },
    {
      title: '🌱 개발 정보를 나누며 함께 성장하는 커뮤니티!',
      description:
        '정보 공유 게시판에서 유용한 개발 정보를 함께 나누고, 서로의 지식을 쌓으며 실력을 한층 더 향상시킬 수 있습니다.',
    },
  ];

  return (
    <div className="min-h-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center mb-8">
          {/* <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            DevOnOff
          </h1> */}
          <Image
            src={'/devonoff-logo.png'}
            alt={'DevOnOff 로고'}
            width={300}
            height={300}
            className="object-contain -mt-44 -mb-28"
          />
          <p className="text-lg text-gray-500 mb-8 whitespace-pre-line">
            {
              'DevOnOff는 Dev와 On/Off를 결합한 이름으로,\n 개발 스터디를 온라인과 온·오프라인 모두 지원하는 플랫폼입니다.'
            }
          </p>
          <button
            className="px-8 py-3 bg-gray-800 text-white rounded-full font-semibold hover:text-white hover:bg-teal-500 transition-colors duration-300 flex items-center gap-2 mx-auto"
            onClick={StudyListButtonClick}
          >
            스터디 둘러보기
            <PiHandTapFill size={22} />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
