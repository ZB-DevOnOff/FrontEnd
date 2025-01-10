import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { SiNotion } from 'react-icons/si';

export default function Footer() {
  return (
    <footer className="footer footer-center p-6 text-base-content bg-gray-50">
      <div className="flex flex-col md:flex-row justify-center items-start w-full gap-12 md:gap-52">
        {/* Repository Section */}
        <div className="text-center md:text-left">
          <p className="font-medium text-lg mb-4">Repository</p>
          <div className="flex flex-col gap-2">
            <a
              href="https://github.com/ZB-DevOnOff"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-black flex items-center gap-2"
            >
              <FaGithub size={20} />
              DevOnOff
            </a>
            <a
              href="https://github.com/ZB-DevOnOff/FrontEnd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-black flex items-center gap-2"
            >
              <FaGithub size={20} />
              Frontend
            </a>
            <a
              href="https://github.com/ZB-DevOnOff/BackEnd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-black flex items-center gap-2"
            >
              <FaGithub size={20} />
              Backend
            </a>
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="font-medium text-lg mb-4">Team Members</p>
          <div className="flex flex-col gap-2">
            {[
              { name: 'SwanyCastle', github: 'https://github.com/SwanyCastle' },
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
                className="text-gray-700 hover:text-black flex items-center gap-2"
              >
                <FaGithub size={20} />
                {member.name}
              </a>
            ))}
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="font-medium text-lg mb-4">Notion</p>
          <div className="flex flex-col gap-2">
            <a
              href="https://www.notion.so/DevOnOff-f315721711c84a79ad3e7e3daae98c8b?pvs=4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-black flex items-center gap-2"
            >
              <SiNotion size={20} />
              DevOnOff
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
