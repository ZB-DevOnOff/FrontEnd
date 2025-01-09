'use client';

import { useEffect, useState } from 'react';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

type CustomConfirmProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  requirePasswordInput?: boolean;
  requireNewPasswordInput?: boolean;
  requireConfirmPasswordInput?: boolean;
  currentPasswordValue?: string;
  newPasswordValue?: string;
  confirmPasswordValue?: string;
  onCurrentPasswordChange?: (value: string) => void;
  onNewPasswordChange?: (value: string) => void;
  onConfirmPasswordChange?: (value: string) => void;
};

const CustomConfirm = ({
  message,
  onConfirm,
  onCancel,
  requirePasswordInput = false,
  requireNewPasswordInput = false,
  requireConfirmPasswordInput = false,
  currentPasswordValue = '',
  newPasswordValue = '',
  confirmPasswordValue = '',
  onCurrentPasswordChange = () => {},
  onNewPasswordChange = () => {},
  onConfirmPasswordChange = () => {},
}: CustomConfirmProps) => {
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).id === 'custom-confirm') {
        onCancel();
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [onCancel]);

  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const toggleCurrentPasswordVisibility = () => {
    setCurrentPasswordVisible(!currentPasswordVisible);
  };

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible(!newPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };
  return (
    <div
      id="custom-confirm"
      className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-[28rem] max-w-lg">
        <p className="text-lg font-semibold text-center whitespace-pre-wrap break-words mb-6">
          {message}
        </p>
        {requirePasswordInput && (
          <div className="relative mb-6">
            <label
              htmlFor="current-password"
              className="block font-medium text-sm sm:text-base text-gray-500 mb-1"
            >
              현재 비밀번호
            </label>
            <input
              id="current-password"
              type={currentPasswordVisible ? 'text' : 'password'}
              value={currentPasswordValue}
              onChange={e => onCurrentPasswordChange(e.target.value)}
              placeholder="현재 비밀번호를 입력해 주세요."
              className="w-full input input-bordered px-4 py-2 focus:outline-teal-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={toggleCurrentPasswordVisibility}
              className="absolute right-2 top-[calc(50%+0.8rem)] transform -translate-y-1/2 mr-2"
              aria-label={
                currentPasswordVisible
                  ? '현재 비밀번호 숨기기'
                  : '현재 비밀번호 보이기'
              }
            >
              {currentPasswordVisible ? (
                <FaRegEye size={20} />
              ) : (
                <FaRegEyeSlash size={20} />
              )}
            </button>
          </div>
        )}

        {requireNewPasswordInput && (
          <div className="relative mb-6">
            <label
              htmlFor="current-password"
              className="block font-medium text-sm sm:text-base text-gray-500 mb-1"
            >
              새 비밀번호
            </label>
            <input
              type={newPasswordVisible ? 'text' : 'password'}
              value={newPasswordValue}
              onChange={e => onNewPasswordChange(e.target.value)}
              placeholder="새 비밀번호를 입력해 주세요."
              className="w-full input input-bordered px-4 py-2 focus:outline-teal-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={toggleNewPasswordVisibility}
              className="absolute right-2 top-[calc(50%-0.9rem)] transform -translate-y-1/2 mr-2"
              aria-label={
                newPasswordVisible ? '새 비밀번호 숨기기' : '새 비밀번호 보이기'
              }
            >
              {newPasswordVisible ? (
                <FaRegEye size={20} />
              ) : (
                <FaRegEyeSlash size={20} />
              )}
            </button>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              비밀번호는 최소 <b>8자 이상</b>이어야 하며,{' '}
              <b>하나 이상의 영문자</b>,<b>숫자</b>, <b>특수문자</b>(예:
              !@#$%^&*)를 포함해야 합니다.
            </p>
          </div>
        )}

        {requireConfirmPasswordInput && (
          <div className="relative mb-6">
            <label
              htmlFor="current-password"
              className="block font-medium text-sm sm:text-base text-gray-500 mb-1"
            >
              새 비밀번호 확인
            </label>
            <input
              type={confirmPasswordVisible ? 'text' : 'password'}
              value={confirmPasswordValue}
              onChange={e => onConfirmPasswordChange(e.target.value)}
              placeholder="새 비밀번호를 한 번 더 입력해 주세요."
              className="w-full input input-bordered px-4 py-2 focus:outline-teal-500 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute right-2 top-[calc(50%+0.8rem)] transform -translate-y-1/2 mr-2"
              aria-label={
                confirmPasswordVisible
                  ? '새 비밀번호 확인 숨기기'
                  : '새 비밀번호 확인 보이기'
              }
            >
              {confirmPasswordVisible ? (
                <FaRegEye size={20} />
              ) : (
                <FaRegEyeSlash size={20} />
              )}
            </button>
          </div>
        )}
        <div className="mt-6 flex justify-center space-x-4">
          <button className="btn text-black" onClick={onCancel}>
            아니오
          </button>
          <button
            className="btn text-teal-50 bg-teal-500 hover:bg-teal-600 hover:text-black"
            onClick={onConfirm}
          >
            네
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomConfirm;
