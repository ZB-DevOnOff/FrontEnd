'use client';

import Link from 'next/link';
import Image from 'next/image';

const Logo = () => (
  <Link
    href="/"
    className="btn btn-ghost text-base-content text-center overflow-hidden"
  >
    <div className="flex flex-col items-center">
      <span className="block text-xs text-black">
        스마트한 개발 스터디 플랫폼
      </span>
      <span className="block text-xl font-bold text-teal-500">
        <Image
          src={'/devonoff-logo.png'}
          alt={'DevOnOff 로고'}
          width={185}
          height={185}
          className="object-contain -mt-20"
          priority
        />
      </span>
    </div>
  </Link>
);

export default Logo;
