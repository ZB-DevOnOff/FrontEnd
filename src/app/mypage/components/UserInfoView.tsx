'use client';
import { useEffect, useState } from 'react';
import { UserInfo, useAuthStore } from '@/store/authStore';
import axios from 'axios';

const UserInfoView = () => {
  const { userInfo, setUserInfo } = useAuthStore();
  const [nickname, setNickname] = useState(userInfo?.nickname || '');
  const [profileImageUrl, setProfileImageUrl] = useState(
    userInfo?.profileImageUrl || '/default-profile-image.png',
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    if (userInfo) {
      setNickname(userInfo?.nickname || '');
      setProfileImageUrl(
        userInfo?.profileImageUrl || '/default-profile-image.png',
      );
    }
  }, [userInfo]);

  const handleImageDeleteButtonClick = async () => {
    const isConfirmed = window.confirm('프로필 이미지를 삭제하시겠습니까?');
    if (isConfirmed) {
      try {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/users/${userInfo?.id}/profile-image`,
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (response.status === 200) {
          setUserInfo({
            ...userInfo,
            profileImageUrl: null,
          } as UserInfo);
          setProfileImageUrl('/default-profile-image.png');
          setSelectedImage(null);
          alert('프로필 이미지가 삭제되었습니다.');
        }
      } catch (error: any) {
        if (error.response) {
          const { status, data } = error.response;
          const errorCode = data?.errorCode;
          const message =
            data?.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

          if (status === 404) {
            alert(message);
          } else {
            alert(
              '프로필 이미지를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.',
            );
          }
        } else {
          alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    }
  };
  const handleImageChangeConfirmButtonClick = async () => {
    const isConfirmed = window.confirm('프로필 이미지를 변경하시겠습니까?');
    if (isConfirmed) {
      if (!selectedImage) {
        alert('이미지를 선택해주세요.');
        return;
      }

      try {
        const formData = new FormData();

        if (selectedImage) {
          formData.append('profileImage', selectedImage);
          console.log('FormData:', formData);
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/users/${userInfo?.id}/profile-image`,

          formData,

          {
            headers: { 'Content-Type': 'multipart/form-data' },
          },
        );

        console.log('API Response:', response.data);

        if (response.status === 200 && response.data.profileImageUrl) {
          const { profileImageUrl } = response.data;
          setUserInfo({
            ...userInfo,
            profileImageUrl,
          } as UserInfo);
          setProfileImageUrl(profileImageUrl);
          setSelectedImage(null);
          alert('프로필 이미지가 변경되었습니다.');
        }
      } catch (error: any) {
        console.error('Error occurred:', error);
        if (error.response) {
          const { status, data } = error.response;
          const errorCode = data?.errorCode;
          const message =
            data?.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

          if (status === 404) {
            alert(message);
          } else {
            alert(
              '프로필 이미지를 변경하지 못했습니다. 잠시 후 다시 시도해주세요.',
            );
          }
        } else {
          alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    }
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

  const handleNicknameButtonClick = async () => {
    const isConfirmed = window.confirm('닉네임을 변경하시겠습니까?');
    if (isConfirmed) {
      try {
        if (!nickname || nickname.trim().length === 0) {
          alert('닉네임을 입력해주세요.');
          return;
        }

        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_ROUTE_URL}/users/${userInfo?.id}`,
          { nickname },
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (response.status === 200 && response.data.nickname) {
          const { nickname } = response.data;
          setUserInfo({
            ...userInfo,
            nickname,
          } as UserInfo);
          alert('닉네임이 변경되었습니다.');
        }
      } catch (error: any) {
        if (error.response) {
          const { status, data } = error.response;
          const errorCode = data?.errorCode;
          const message =
            data?.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

          if (status === 404) {
            alert(message);
          } else if (
            status === 400 &&
            errorCode === 'NICKNAME_ALREADY_REGISTERED'
          ) {
            alert('이미 사용 중인 닉네임입니다.');
          } else {
            alert('닉네임 변경에 실패했습니다. 다시 시도해주세요.');
          }
        } else {
          alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    } else {
      alert('닉네임 변경이 취소되었습니다.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8 max-w-4xl mx-auto">
      <div className="flex flex-col items-center w-full md:w-1/3 border-r pr-4">
        <div className="relative">
          <img
            src={profileImageUrl || '/default-avatar.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border"
          />
        </div>
        <div className="mt-4 flex flex-col gap-4 w-full">
          {profileImageUrl && (
            <button
              onClick={handleImageDeleteButtonClick}
              className="btn btn-secondary w-full"
            >
              이미지 삭제
            </button>
          )}

          {!selectedImage && (
            <label className="btn btn-primary w-full cursor-pointer">
              이미지 변경
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
              />
            </label>
          )}

          {selectedImage && (
            <div className="flex gap-2 mt-2 w-full justify-between">
              <button
                onClick={handleImageChangeCancelButtonClick}
                className="btn btn-accent w-1/2"
              >
                취소
              </button>
              <button
                onClick={handleImageChangeConfirmButtonClick}
                className="btn btn-primary w-1/2"
              >
                완료
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col w-full md:w-2/3 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <label className="font-medium text-lg w-full md:w-1/3">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              className="input input-bordered w-full"
            />
            <button
              onClick={handleNicknameButtonClick}
              className="btn btn-primary w-full md:w-auto"
            >
              닉네임 변경
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <label className="font-medium text-lg w-full md:w-1/3">
              이메일
            </label>
            <div className="input input-bordered w-full cursor-not-allowed bg-gray-100 flex items-center justify-center">
              {userInfo?.email}
            </div>
            <button className="btn btn-secondary w-full md:w-auto">
              비밀번호 변경
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoView;
