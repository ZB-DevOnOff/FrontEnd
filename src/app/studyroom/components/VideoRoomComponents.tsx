'use client';

import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomAlert from '@/components/common/Alert';

export default function VideoRoomComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 studyId와 nickname을 가져옴
  const studyIdParam = searchParams.get('studyId');
  const nicknameParam = searchParams.get('nickname');

  // studyId와 myKey ref 초기화
  const studyId = useRef(studyIdParam || '1');
  const myKey = useRef(
    nicknameParam || Math.random().toString(36).substring(2, 11),
  );

  // 주요 상태 및 참조 변수들
  const pcListMap = useRef(new Map()); // WebRTC 연결을 저장하는 맵
  const otherKeyList = useRef<string[]>([]); // 다른 참가자들의 키 목록
  const localStream = useRef<MediaStream>(); // 로컬 미디어 스트림
  const stompClient = useRef<any>(null); // WebSocket 클라이언트

  // 비디오/오디오/화면공유 상태 관리
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false); // 모달 상태 추가

  const [alertMessage, setAlertMessage] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);

  const sendAnswer = (pc: RTCPeerConnection, otherKey: string) => {
    pc.createAnswer().then(answer => {
      pc.setLocalDescription(answer);
      stompClient.current.send(
        `/app/peer/answer/${otherKey}/${studyId.current}`,
        {},
        JSON.stringify({
          key: myKey.current,
          body: answer,
        }),
      );
      console.log('Send answer');
    });
  };

  const onTrack = (event: RTCTrackEvent, otherKey: string) => {
    if (document.getElementById(`video-${otherKey}`) === null) {
      const videoContainer = document.createElement('div');
      videoContainer.className = 'relative aspect-video';

      const video = document.createElement('video');
      video.id = `video-${otherKey}`;
      video.autoplay = true;
      video.playsInline = true;
      video.className = 'w-full h-full object-cover rounded-lg cursor-pointer';
      video.srcObject = event.streams[0];

      video.onloadedmetadata = () => {
        console.log(`Video metadata loaded for ${otherKey}`);
        video.play().catch(e => console.error('Video play failed:', e));
      };

      const label = document.createElement('span');
      label.className =
        'absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded';
      label.textContent = otherKey;

      videoContainer.appendChild(video);
      videoContainer.appendChild(label);

      const remoteStreamDiv = document.getElementById('remoteStreamDiv');
      if (remoteStreamDiv) {
        remoteStreamDiv.appendChild(videoContainer);
      }

      console.log('Remote video added:', otherKey);
      console.log('Stream tracks:', event.streams[0].getTracks());
    } else {
      const existingVideo = document.getElementById(
        `video-${otherKey}`,
      ) as HTMLVideoElement;
      if (existingVideo && existingVideo.srcObject !== event.streams[0]) {
        existingVideo.srcObject = event.streams[0];
        console.log('Updated existing video stream:', otherKey);

        existingVideo.onloadedmetadata = () => {
          console.log(`Existing video metadata loaded for ${otherKey}`);
          existingVideo
            .play()
            .catch(e => console.error('Existing video play failed:', e));
        };
      }
    }
  };

  const createPeerConnection = (otherKey: string) => {
    // STUN/TURN 서버 설정
    const configuration = {
      iceServers: [
        { urls: process.env.NEXT_PUBLIC_STUN_URL || '' },
        {
          urls: process.env.NEXT_PUBLIC_TURN_URL || '',
          username: process.env.NEXT_PUBLIC_TURN_USERNAME || '',
          credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || '',
        },
      ],
    };

    const pc = new RTCPeerConnection(configuration);
    try {
      pc.addEventListener('icecandidate', event => {
        if (event.candidate) {
          console.log('ICE candidate');
          stompClient.current?.send(
            `/app/peer/iceCandidate/${otherKey}/${studyId.current}`,
            {},
            JSON.stringify({
              key: myKey.current,
              body: event.candidate,
            }),
          );
        }
      });

      pc.ontrack = event => {
        console.log('Track event details:', {
          otherKey,
          trackKind: event.track.kind,
          streamId: event.streams[0]?.id,
          trackId: event.track.id,
          existingVideo: document.getElementById(`video-${otherKey}`),
          streamActive: event.streams[0]?.active,
          trackEnabled: event.track.enabled,
          trackMuted: event.track.muted,
        });
        onTrack(event, otherKey);
      };

      if (localStream.current) {
        localStream.current.getTracks().forEach(track => {
          console.log('Adding local track to peer connection:', track.kind);
          pc.addTrack(track, localStream.current!);
        });
      }

      console.log('PeerConnection created for:', otherKey);

      // ICE 연결 상태 모니터링
      pc.addEventListener('iceconnectionstatechange', () => {
        console.log(
          `ICE Connection State (${otherKey}): ${pc.iceConnectionState}`,
        );
        if (pc.iceConnectionState === 'connected') {
          console.log(`Peer connection with ${otherKey} established.`);
        } else if (
          pc.iceConnectionState === 'failed' ||
          pc.iceConnectionState === 'disconnected'
        ) {
          console.warn(
            `Peer connection with ${otherKey} ${pc.iceConnectionState}`,
          );
          // 연결 실패나 끊김 상태일 때 일정 시간 후에도 상태가 변하지 않으면 참가자 제거
          setTimeout(() => {
            if (
              pc.iceConnectionState === 'failed' ||
              pc.iceConnectionState === 'disconnected'
            ) {
              console.log(
                `Removing participant ${otherKey} due to connection ${pc.iceConnectionState}`,
              );
              removeParticipant(otherKey);
            }
          }, 1000); // 1초 후 체크
        }
      });
    } catch (error) {
      console.error('PeerConnection failed: ', error);
    }
    return pc;
  };

  const startCam = async () => {
    if (navigator.mediaDevices) {
      try {
        console.log('미디어 장치 접근 시도...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        console.log('스트림 획득 성공:', stream.getTracks());
        localStream.current = stream;

        const localVideo = document.getElementById(
          'localStream',
        ) as HTMLVideoElement;
        console.log('비디오 엘리먼트:', localVideo);

        if (localVideo) {
          localVideo.srcObject = stream;
          console.log('스트림이 비디오에 설정됨');

          // 메타데이터 로드 이벤트 추가
          localVideo.onloadedmetadata = () => {
            console.log('비디오 메타데이터 로드됨');
            localVideo.play().catch(e => console.error('비디오 재생 실패:', e));
          };
        }
      } catch (error) {
        console.error('미디어 장치 접근 오류:', error);
      }
    }
  };

  const connectSocket = async () => {
    const socketUrl = process.env.NEXT_PUBLIC_STUDY_SOCKET_URL;

    if (!socketUrl) {
      console.error('Socket URL is not configured');
      return;
    }

    stompClient.current = Stomp.over(new SockJS(`${socketUrl}/signaling`));
    stompClient.current.debug = () => {};

    stompClient.current.connect(
      {
        studyId: studyId.current,
        nickname: myKey.current,
      },
      function () {
        console.log('Connected to WebRTC server');

        stompClient.current.subscribe(
          `/topic/peer/iceCandidate/${myKey.current}/${studyId.current}`,
          (candidate: any) => {
            const key = JSON.parse(candidate.body).key;
            const message = JSON.parse(candidate.body).body;
            pcListMap.current.get(key)?.addIceCandidate(
              new RTCIceCandidate({
                candidate: message.candidate,
                sdpMLineIndex: message.sdpMLineIndex,
                sdpMid: message.sdpMid,
              }),
            );
          },
        );

        stompClient.current.subscribe(
          `/topic/peer/offer/${myKey.current}/${studyId.current}`,
          (offer: any) => {
            const key = JSON.parse(offer.body).key;
            const message = JSON.parse(offer.body).body;

            pcListMap.current.set(key, createPeerConnection(key));
            pcListMap.current.get(key)?.setRemoteDescription(
              new RTCSessionDescription({
                type: message.type,
                sdp: message.sdp,
              }),
            );
            sendAnswer(pcListMap.current.get(key)!, key);
          },
        );

        stompClient.current.subscribe(
          `/topic/peer/answer/${myKey.current}/${studyId.current}`,
          async (answer: any) => {
            try {
              const key = JSON.parse(answer.body).key;
              const message = JSON.parse(answer.body).body;
              const pc = pcListMap.current.get(key);

              // 안전 장치 추가
              if (pc && pc.signalingState === 'have-local-offer') {
                await pc.setRemoteDescription(
                  new RTCSessionDescription(message),
                );
              } else {
                console.warn('Unexpected signaling state:', pc?.signalingState);
                // 잘못된 상태일 때는 그냥 무시 (기존 연결 유지)
              }
            } catch (error) {
              console.debug('Error setting remote description:', error);
              // 에러가 발생해도 기존 연결은 유지
            }
          },
        );

        stompClient.current.subscribe(`/topic/call/key`, () => {
          stompClient.current.send(
            `/app/send/key`,
            {},
            JSON.stringify(myKey.current),
          );
        });

        stompClient.current.subscribe(`/topic/send/key`, (message: any) => {
          const key = JSON.parse(message.body);
          if (
            myKey.current !== key &&
            otherKeyList.current.find(mapKey => mapKey === myKey.current) ===
              undefined
          ) {
            otherKeyList.current.push(key);
          }
        });

        // 알림 구독 추가
        stompClient.current.subscribe(
          `/topic/alarm/${studyId.current}/${myKey.current}`,
          (message: { body: string }) => {
            const msg = JSON.parse(message.body);
            if (msg.type === 'ALARM') {
              console.log(msg.message);
              setAlertMessage(msg.message);
              setShowAlert(true);
            } else if (msg.type === 'END') {
              console.log(msg.message);
              setAlertMessage(msg.message);
              setShowAlert(true);
              confirmDisconnect();
            }
          },
        );
      },
    );
    setTimeout(() => {
      startStreaming(); // 자동으로 스트리밍 시작
      console.log('startStreaming');
    }, 3000);
  };

  const startStreaming = async () => {
    // 스트리밍 시작 및 피어 연결 설정
    try {
      // 먼저 로컬 스트림이 준비되었는지 확인
      if (!localStream.current?.active) {
        console.warn('Local stream not ready');
        await startCam(); // 필요한 경우 다시 시도
      }

      // 서버에 키 전송
      await stompClient.current?.send(`/app/call/key`, {}, {});

      // 피어 연결 설정을 위한 시간 증가 (1초 -> 2초)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 각 피어에 대해 연결 설정
      for (const key of otherKeyList.current) {
        if (!pcListMap.current.has(key)) {
          try {
            const pc = createPeerConnection(key);
            pcListMap.current.set(key, pc);

            // ICE gathering 상태 모니터링 추가
            pc.onicegatheringstatechange = () => {
              console.log(
                `ICE gathering state for ${key}:`,
                pc.iceGatheringState,
              );
            };

            // offer 생성 및 전송
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            stompClient.current?.send(
              `/app/peer/offer/${key}/${studyId.current}`,
              {},
              JSON.stringify({
                key: myKey.current,
                body: offer,
              }),
            );
            console.log('Send offer to:', key);
          } catch (error) {
            console.error(`Error creating connection for peer ${key}:`, error);
            // 실패한 연결 정리
            if (pcListMap.current.has(key)) {
              pcListMap.current.get(key)?.close();
              pcListMap.current.delete(key);
            }
          }
        }
      }
    } catch (error) {
      console.error('스트리밍 시작 오류:', error);
    }
  };

  const removeParticipant = (otherKey: string) => {
    // 참가자 제거 및 관련 리소스 정리
    const videoContainer = document.getElementById(
      `video-${otherKey}`,
    )?.parentElement;
    if (videoContainer) {
      videoContainer.remove();
    }

    otherKeyList.current = otherKeyList.current.filter(key => key !== otherKey);

    const pc = pcListMap.current.get(otherKey);
    if (pc) {
      pc.close();
      pcListMap.current.delete(otherKey);
    }
  };

  // 미디어 제어 함수들
  const toggleVideo = () => {
    // 비디오 ON/OFF 토글
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    // 오디오 ON/OFF 토글
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    // 화면 공유 시작/중지
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const videoTrack = screenStream.getVideoTracks()[0];

        // 화면 공유 종료 시 자동으로 카메라로 복귀
        videoTrack.onended = () => {
          const cameraTrack = localStream.current?.getVideoTracks()[0];
          if (cameraTrack) {
            pcListMap.current.forEach(pc => {
              const sender = pc
                .getSenders()
                .find((s: RTCRtpSender) => s.track?.kind === 'video');
              if (sender) sender.replaceTrack(cameraTrack);
            });
          }
          setIsScreenSharing(false);
        };

        // 모든 피어 연결에 화면 공유 트랙으로 교체
        pcListMap.current.forEach(pc => {
          const sender = pc
            .getSenders()
            .find((s: RTCRtpSender) => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(videoTrack);
        });

        setIsScreenSharing(true);
      } else {
        // 화면 하단의 화면 공유 중지 버튼 클릭시 카메라로 복귀
        const videoTrack = localStream.current?.getVideoTracks()[0];
        if (videoTrack) {
          pcListMap.current.forEach(pc => {
            const sender = pc
              .getSenders()
              .find((s: RTCRtpSender) => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(videoTrack);
          });
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      setIsScreenSharing(false);
    }
  };

  const handleDisconnectClick = () => {
    setShowExitModal(true); // 모달 표시
  };

  const confirmDisconnect = async () => {
    try {
      // 1. 미디어 트랙 정리
      localStream.current?.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind);
        track.stop();
      });

      // 2. 피어 연결 정리
      pcListMap.current.forEach((pc, key) => {
        console.log('Closing peer connection:', key);
        pc.close();
        removeParticipant(key);
      });
      pcListMap.current.clear();

      // 3. STOMP 연결 종료
      if (stompClient.current?.connected) {
        await stompClient.current.send(
          `/app/send/end/${studyId.current}/${myKey.current}`,
          {},
          {},
        );

        stompClient.current.disconnect(() => {
          console.log('WebSocket 연결이 정상적으로 종료되었습니다.');
        });
      }

      // 4. 페이지 이동
      router.push(`/`);
    } catch (error) {
      console.error('연결 종료 중 오류 발생:', error);
      // 에러가 발생해도 페이지 이동
      router.push(`/`);
    }
  };

  useEffect(() => {
    const init = async () => {
      await startCam();
      await connectSocket();
    };
    init();

    return () => {
      // 컴포넌트 언마운트 시 정리 작업만 수행
      localStream.current?.getTracks().forEach(track => track.stop());
      pcListMap.current.forEach((pc, key) => {
        pc.close();
        removeParticipant(key);
      });
      pcListMap.current.clear();
      if (stompClient.current?.connected) {
        stompClient.current.disconnect();
      }
      otherKeyList.current = [];
    };
  }, []);

  // UI 렌더링
  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* 로컬 비디오 */}
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <video
              id="localStream"
              autoPlay
              playsInline
              controls
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              나
            </span>
          </div>

          {/* 원격 비디오 */}
          <div id="remoteStreamDiv" className="contents">
            {/* 동적으로 추가되는 비디오들 */}
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-wrap justify-center gap-2 bg-black/50 p-2 rounded-lg backdrop-blur-sm z-50">
        <button
          onClick={toggleAudio}
          className={`px-4 py-2 rounded transition-colors ${
            isAudioEnabled
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isAudioEnabled ? '마이크 끄기' : '마이크 켜기'}
        </button>
        <button
          onClick={toggleVideo}
          className={`px-4 py-2 rounded transition-colors ${
            isVideoEnabled
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isVideoEnabled ? '카메라 끄기' : '카메라 켜기'}
        </button>
        <button
          onClick={toggleScreenShare}
          className={`px-4 py-2 rounded transition-colors ${
            isScreenSharing
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isScreenSharing ? '화면 공유 중지' : '화면 공유'}
        </button>
        <button
          onClick={handleDisconnectClick}
          className="px-4 py-2 rounded transition-colors bg-red-500 hover:bg-red-600 text-white"
        >
          나가기
        </button>
      </div>

      {/* 모달 수정 */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white">
              스터디룸을 나가시겠습니까?
            </h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowExitModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDisconnect}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlert && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
    </div>
  );
}
