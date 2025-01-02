import React from 'react';
import { FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="footer footer-center p-6 text-base-content bg-teal-50">
      <div className="flex flex-col md:flex-row justify-center items-center w-full">
        <div className="mb-6 md:mb-0 md:mr-12 text-center md:text-left">
          <p className="font-medium text-lg">DevOnOff</p>
          <p className="text-gray-700 mt-2">스마트한 개발 스터디 플랫폼</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-lg">Repository</p>
          <div className="flex gap-6 mt-4 justify-center">
            <a
              href="https://github.com/ZB-DevOnOff"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-black flex items-center gap-2"
            >
              <FaGithub size={20} />
              DevOnOff
            </a>
            <a
              href="https://github.com/ZB-DevOnOff/FrontEnd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-black flex items-center gap-2"
            >
              <FaGithub size={20} />
              Frontend
            </a>
            <a
              href="https://github.com/your-backend-repo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-black flex items-center gap-2"
            >
              <FaGithub size={20} />
              Backend
            </a>
          </div>
          <div className="mt-6">
            <p className="font-medium text-lg">Team Members</p>
            <div className="flex flex-wrap gap-6 justify-center mt-3">
              {[
                {
                  name: 'SwanyCastle',
                  github: 'https://github.com/SwanyCastle',
                },
                { name: 'yoon627', github: 'https://github.com/yoon627' },
                { name: 'hjkim22', github: 'https://github.com/hjkim22' },
                { name: 'heekuukuu', github: 'https://github.com/heekuukuu' },
                { name: 'sim0102', github: 'https://github.com/sim0102' },
                { name: 'jyeoney', github: 'https://github.com/jyeoney' },
              ].map((member, index) => (
                <a
                  key={index}
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-black flex items-center gap-2"
                >
                  <FaGithub size={20} />
                  {member.name}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-2 pt-6">
            <div className="flex justify-center gap-4">
              {/* <a href="/terms" className="text-sm text-gray-700 hover:underline">
              이용약관
            </a>
            <a
              href="/privacy"
              className="text-sm text-gray-700 hover:underline"
            >
              개인정보처리방침
            </a> */}
              {/* <p className="font-semibold">
              Copyright © {new Date().getFullYear()} - All rights reserved by
              DevOnOff
            </p> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
