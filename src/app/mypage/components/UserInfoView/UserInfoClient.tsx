'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import CustomConfirm from '@/components/common/Confirm';
import CustomAlert from '@/components/common/Alert';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axiosInstance from '@/utils/axios';
import { IoPerson } from 'react-icons/io5';
import { MdEmail } from 'react-icons/md';
import { FaCircle } from 'react-icons/fa';
import { RiLockPasswordFill } from 'react-icons/ri';
import handleApiError from '@/utils/handleApiError';
import { User } from '@/types/post';

interface UserInfoClientProps {
  initialUserData: User;
}

const MAX_NICKNAME_LENGTH = 20;

const UserInfoClient = ({ initialUserData }: UserInfoClientProps) => {
  const { userInfo, setUserInfo, resetStore } = useAuthStore();
  const [nickname, setNickname] = useState(initialUserData.nickname || '');
  const [profileImageUrl, setProfileImageUrl] = useState(
    initialUserData.profileImageUrl || '/default-profile-image.png',
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);
  const [isConfirmPasswordRequired, setIsConfirmPasswordRequired] =
    useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmCallback, setConfirmCallback] = useState<() => void>(
    () => () => {},
  );
  const [alertCallback, setAlertCallback] = useState<() => void>(
    () => () => {},
  );

  const showErrorAlert = (errorMessage: string | null) => {
    setAlertMessage(
      errorMessage ||
        '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    );
    setShowAlert(true);
  };

  const router = useRouter();

  // 회원 탈퇴 & 비밀번호 변경 요청 상태 관리
  const [shouldWithdrawal, setShouldWithdrawal] = useState(false);
  const [shouldChangePassword, setShouldChangePassword] = useState(false);

  const changePasswordErrorCodeHandlers = {
    INVALID_PASSWORD:
      '비밀번호가 일치하지 않습니다. 입력한 내용을 다시 확인해 주세요.',
    SAME_PASSWORD:
      '기존 비밀번호와 동일한 비밀번호를 사용할 수 없습니다. 다른 비밀번호를 입력해주세요.',
  };

  const withdrawalErrorCodeHandlers = {
    INVALID_PASSWORD:
      '비밀번호가 일치하지 않습니다. 입력한 내용을 다시 확인해 주세요.',
    BAD_REQUEST:
      '비밀번호 형식이 올바르지 않습니다. 입력한 내용을 다시 확인해 주세요.',
  };

  useEffect(() => {
    if (userInfo && userInfo.nickname) {
      setNickname(userInfo?.nickname);
      setProfileImageUrl(
        userInfo?.profileImageUrl || '/default-profile-image.png',
      );
    }
  }, [userInfo]);

  // 프로필 이미지 삭제
  const handleImageDeleteButtonClick = async () => {
    setConfirmMessage('프로필 이미지를 삭제하시겠습니까?');
    setConfirmCallback(() => async () => {
      try {
        const response = await axiosInstance.delete(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/users/${userInfo?.id}/profile-image`,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (response.status === 200 && response.data) {
          const updatedUserInfo = response.data;
          setUserInfo(updatedUserInfo);
          setProfileImageUrl(
            updatedUserInfo.profileImageUrl || '/default-profile-image.png',
          );
          setSelectedImage(null);
          setAlertMessage('프로필 이미지가 삭제되었습니다.');
          setShowAlert(true);
        }
      } catch (error: any) {
        handleApiError(error, showErrorAlert);
      } finally {
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  // 프로필 이미지 변경
  const handleImageChangeConfirmButtonClick = async () => {
    if (!selectedImage) {
      setAlertMessage('이미지를 선택해주세요.');
      setShowAlert(true);
      return;
    }
    setConfirmMessage('프로필 이미지를 변경하시겠습니까?');
    setConfirmCallback(() => async () => {
      try {
        const formData = new FormData();

        if (selectedImage) {
          formData.append('profileImage', selectedImage);
          console.log('FormData:', formData);
        }

        const response = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/users/${userInfo?.id}/profile-image`,

          formData,

          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        );

        if (response.status === 200 && response.data.profileImageUrl) {
          const updatedUserInfo = response.data;
          setUserInfo(updatedUserInfo);
          setProfileImageUrl(
            updatedUserInfo.profileImageUrl || '/default-profile-image.png',
          );
          setSelectedImage(null);
          setAlertMessage('프로필 이미지가 변경되었습니다.');
          console.log(`response: ${response.data}`);
          setShowAlert(true);
        }
      } catch (error: any) {
        handleApiError(error, showErrorAlert);
      } finally {
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChangeCancelButtonClick = () => {
    setSelectedImage(null);
    setProfileImageUrl(
      userInfo?.profileImageUrl || '/default-profile-image.png',
    );
  };

  // 닉네임 변경
  const handleNicknameButtonClick = async () => {
    setConfirmMessage('닉네임을 변경하시겠습니까?');
    setConfirmCallback(() => async () => {
      try {
        if (!nickname || nickname.trim().length === 0) {
          setAlertMessage('닉네임을 입력해주세요.');
          setShowAlert(true);
          return;
        }

        // 닉네임 길이 검증 (2-20자)
        if (nickname.length < 2) {
          setAlertMessage('닉네임은 최소 2자 이상이어야 합니다.');
          setShowAlert(true);
          return;
        }

        if (nickname.length > MAX_NICKNAME_LENGTH) {
          setAlertMessage('닉네임은 최대 20자까지 입력 가능합니다.');
          setShowAlert(true);
          return;
        }

        if (nickname === '탈퇴한 회원') {
          setAlertMessage('사용할 수 없는 닉네임입니다.');
          setShowAlert(true);
          return;
        }

        const response = await axiosInstance.put(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/users/${userInfo?.id}`,
          { nickname },
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (response.status === 200 && response.data) {
          const updatedUserInfo = response.data;
          setUserInfo(updatedUserInfo);
          setAlertMessage('닉네임이 변경되었습니다.');
          setShowAlert(true);
        }
      } catch (error: any) {
        handleApiError(error, showErrorAlert);
      } finally {
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  // 비밀번호 변경
  useEffect(() => {
    const changePassword = async () => {
      if (!shouldChangePassword) return;

      try {
        if (!password || !newPassword || !confirmPassword) {
          setAlertMessage('입력되지 않은 항목이 있습니다.');
          setShowAlert(true);
          setShouldChangePassword(false);
          return;
        }

        if (newPassword !== confirmPassword) {
          setAlertMessage('새 비밀번호가 일치하지 않습니다.');
          setShowAlert(true);
          setShouldChangePassword(false);
          return;
        }

        const response = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/auth/change-password/${userInfo?.id}`,
          {
            currentPassword: password,
            newPassword: newPassword,
          },
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (response.status === 200) {
          setAlertMessage('비밀번호가 성공적으로 변경되었습니다.');
          setShowAlert(true);
        } else {
          setAlertMessage('다시 시도해 주세요.');
          setShowAlert(true);
        }
      } catch (error: any) {
        handleApiError(error, showErrorAlert, changePasswordErrorCodeHandlers);
      } finally {
        setShouldChangePassword(false);
        setShowConfirm(false);
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsPasswordRequired(false);
        setIsNewPasswordRequired(false);
        setIsConfirmPasswordRequired(false);
      }
    };

    changePassword();
  }, [
    shouldChangePassword,
    password,
    newPassword,
    confirmPassword,
    userInfo?.id,
  ]);

  // 회원 탈퇴
  useEffect(() => {
    const withdrawal = async () => {
      if (!shouldWithdrawal) return;

      try {
        if (userInfo?.signinType === 'GENERAL' && !password) {
          setAlertMessage('현재 비밀번호를 입력해주세요.');
          setShowAlert(true);
          setShouldWithdrawal(false);
          return;
        }

        const body =
          userInfo?.signinType === 'GENERAL'
            ? { password } // 일반 로그인 시 비밀번호 포함
            : ''; // 소셜 로그인 시 빈 객체

        const response = await axiosInstance.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/auth/withdrawal`,
          body,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (response.status === 200) {
          resetStore();
          setAlertMessage(
            '회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.',
          );
          setAlertCallback(() => () => router.push('/'));
          setShowAlert(true);
        } else {
          setAlertMessage('회원 탈퇴에 실패하셨습니다. 다시 시도해 주세요.');
          setShowAlert(true);
        }
      } catch (error: any) {
        handleApiError(error, showErrorAlert, withdrawalErrorCodeHandlers);
      } finally {
        setShouldWithdrawal(false);
        setShowConfirm(false);
        setPassword('');
        setIsPasswordRequired(false);
      }
    };

    withdrawal();
  }, [shouldWithdrawal, password, resetStore, router]);

  const handlePasswordButtonClick = () => {
    setConfirmMessage('비밀번호를 변경하시겠습니까?');
    setIsPasswordRequired(true);
    setIsNewPasswordRequired(true);
    setIsConfirmPasswordRequired(true);
    setConfirmCallback(() => () => {
      setShouldChangePassword(true);
    });
    setShowConfirm(true);
  };

  const handleWithdrawalButtonClick = () => {
    setConfirmMessage(
      '회원 탈퇴를 진행하시겠습니까? \n 탈퇴 시 회원 정보 및 모든 데이터가 삭제되며 \n 복구할 수 없습니다.',
    );
    setIsPasswordRequired(true);
    setConfirmCallback(() => () => {
      setShouldWithdrawal(true);
    });
    setShowConfirm(true);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8 max-w-5xl mx-auto">
      {/* 프로필 이미지 섹션 */}
      <div className="flex flex-col items-center w-full md:w-1/3 md:border-r md:pr-4">
        <div className="relative">
          <Image
            src={profileImageUrl || '/default-profile-image.png'}
            alt="Profile"
            width={500}
            height={300}
            className="w-48 h-48 rounded-full object-cover border"
          />
        </div>
        <div className="mt-4 flex flex-col gap-4 w-full">
          <div className="flex gap-2 w-full justify-between">
            {!selectedImage ? (
              <>
                {profileImageUrl && (
                  <button
                    onClick={handleImageDeleteButtonClick}
                    className="btn hover:border-2 border-gray-800 bg-white text-gray-780 w-1/2 hover:bg-red-50 hover:border-customRed hover:text-customRed"
                  >
                    삭제
                  </button>
                )}
                <label className="btn hover:border-2 border-gray-800 bg-white text-gray-800 w-1/2 cursor-pointer hover:bg-teal-50 hover:border-teal-500 hover:text-teal-500">
                  변경
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg"
                  />
                </label>
              </>
            ) : (
              <>
                <button
                  onClick={handleImageChangeCancelButtonClick}
                  className="btn hover:border-2 border-customRed bg-white text-customRed w-1/2 hover:bg-red-50 hover:border-customRed hover:text-customRed"
                >
                  취소
                </button>
                <button
                  onClick={handleImageChangeConfirmButtonClick}
                  className="btn hover:border-2 border-teal-500 bg-white text-teal-500 w-1/2 hover:bg-teal-50 hover:border-teal-500 hover:text-teal-500"
                >
                  완료
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 사용자 정보 섹션 */}
      <div className="flex flex-col w-full md:w-2/3 space-y-6 flex-grow">
        <div className="space-y-4">
          {/* 입력 필드들을 감싸는 컨테이너에 일관된 구조 적용 */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
            <label className="font-medium text-lg md:col-span-3 flex items-center">
              <IoPerson className="text-xl mr-2 text-gray-800" />
              닉네임
            </label>
            <div className="md:col-span-6">
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                className="input input-bordered w-full focus:outline-teal-500"
              />
            </div>
            <div className="md:col-span-3">
              <button
                onClick={handleNicknameButtonClick}
                className="btn hover:border-2 border-gray-800 bg-white text-gray-800 w-full hover:bg-teal-50 hover:border-teal-500 hover:text-teal-500"
              >
                변경
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
            <label className="font-medium text-lg md:col-span-3 flex items-center">
              <MdEmail className="text-xl mr-2 text-gray-800" />
              이메일
            </label>
            <div className="md:col-span-9">
              <input
                type="email"
                value={initialUserData?.email || ''}
                className="input input-bordered w-full"
                disabled
              />
            </div>
          </div>

          {initialUserData?.signinType === 'GENERAL' && (
            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
              <label className="font-medium text-lg md:col-span-3 flex items-center">
                <RiLockPasswordFill className="text-xl mr-2 text-gray-800" />
                비밀번호
              </label>
              <div className="md:col-span-6 relative">
                <input
                  type="password"
                  className="input input-bordered w-full pl-10"
                  disabled
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-700">
                  <FaCircle className="text-xs mr-1" />
                  <FaCircle className="text-xs mr-1" />
                  <FaCircle className="text-xs mr-1" />
                  <FaCircle className="text-xs mr-1" />
                  <FaCircle className="text-xs mr-1" />
                  <FaCircle className="text-xs mr-1" />
                  <FaCircle className="text-xs mr-1" />
                  <FaCircle className="text-xs" />
                </div>
              </div>

              <div className="md:col-span-3">
                <button
                  onClick={handlePasswordButtonClick}
                  className="btn hover:border-2 border-gray-800 bg-white text-gray-800 w-full hover:bg-teal-50 hover:border-teal-500 hover:text-teal-500"
                >
                  변경
                </button>
              </div>
            </div>
          )}
          <div
            onClick={handleWithdrawalButtonClick}
            className="text-right mt-10"
          >
            <span className="text-sm font-semibold text-gray-500 rounded-full px-1 py-1 btn-ghost group-hover:bg-gray-300 group-hover:text-black transition-colors cursor-pointer">
              회원 탈퇴 →
            </span>
          </div>
        </div>
      </div>

      {showConfirm && (
        <CustomConfirm
          message={confirmMessage}
          onConfirm={confirmCallback}
          onCancel={() => {
            setShowConfirm(false);
            setPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsPasswordRequired(false);
            setIsNewPasswordRequired(false);
            setIsConfirmPasswordRequired(false);
          }}
          requirePasswordInput={
            isPasswordRequired && userInfo?.signinType === 'GENERAL'
          }
          requireNewPasswordInput={isNewPasswordRequired}
          requireConfirmPasswordInput={isConfirmPasswordRequired}
          currentPasswordValue={password}
          onCurrentPasswordChange={setPassword}
          newPasswordValue={newPassword}
          onNewPasswordChange={setNewPassword}
          confirmPasswordValue={confirmPassword}
          onConfirmPasswordChange={setConfirmPassword}
        />
      )}

      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => {
            setShowAlert(false);
            alertCallback();
          }}
        />
      )}
    </div>
  );
};

export default UserInfoClient;
