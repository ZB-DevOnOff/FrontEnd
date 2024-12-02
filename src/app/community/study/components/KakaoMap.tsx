'use client';

import { useEffect, useRef, useState } from 'react';
import { StudyPost } from '@/types/post';

interface KakaoMapProps {
  studies: StudyPost[];
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function KakaoMap({ studies, userLocation }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infowindows, setInfowindows] = useState<any[]>([]);

  // 지도 레벨을 조정하여 최소 5개의 스터디가 보이도록 하는 함수
  const adjustMapLevel = (
    mapInstance: any,
    visibleStudies: any[],
    center: any,
  ) => {
    let level = 4;
    let visibleCount = 0;
    const bounds = new window.kakao.maps.LatLngBounds();
    bounds.extend(center);

    while (level <= 8 && visibleCount < 5) {
      mapInstance.setLevel(level);
      visibleCount = 0;

      visibleStudies.forEach(study => {
        if (!study.location) return;
        const position = new window.kakao.maps.LatLng(
          study.location.latitude,
          study.location.longitude,
        );
        bounds.extend(position);

        if (mapInstance.getBounds().contain(position)) {
          visibleCount++;
        }
      });

      if (visibleCount >= 5) {
        break;
      }
      level++;
    }

    mapInstance.setBounds(bounds);
    mapInstance.setLevel(level);
    mapInstance.setCenter(center);
  };

  useEffect(() => {
    const loadKakaoMap = () => {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
      script.async = true;

      script.onload = () => {
        window.kakao.maps.load(() => {
          if (!mapRef.current) return;

          let centerLocation;
          if (studies.length === 1 && studies[0].location) {
            centerLocation = {
              latitude: studies[0].location.latitude,
              longitude: studies[0].location.longitude,
            };
          } else if (userLocation) {
            centerLocation = userLocation;
          } else {
            centerLocation = {
              latitude: 37.5665,
              longitude: 126.978,
            };
          }

          const center = new window.kakao.maps.LatLng(
            centerLocation.latitude,
            centerLocation.longitude,
          );

          const options = {
            center: center,
            level: studies.length === 1 ? 3 : 7,
          };

          const mapInstance = new window.kakao.maps.Map(
            mapRef.current,
            options,
          );

          if (studies.length > 1) {
            adjustMapLevel(mapInstance, studies, center);
          }

          setMap(mapInstance);
        });
      };

      document.head.appendChild(script);
    };

    loadKakaoMap();

    return () => {
      markers.forEach(marker => marker.setMap(null));
      infowindows.forEach(infowindow => infowindow.close());
    };
  }, [studies, userLocation]);

  // 스터디 위치 마커 표시
  useEffect(() => {
    if (!map) return;

    // 기존 마커와 인포윈도우 제거
    markers.forEach(marker => marker.setMap(null));
    infowindows.forEach(infowindow => infowindow.close());

    const newMarkers: any[] = [];

    studies.forEach(study => {
      if (!study.location) return;

      const position = new window.kakao.maps.LatLng(
        study.location.latitude,
        study.location.longitude,
      );

      const marker = new window.kakao.maps.Marker({
        map: map,
        position: position,
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
    setInfowindows([]); // 인포윈도우 배열은 빈 배열로 설정
  }, [map, studies]);

  return (
    <div
      style={{ height: '300px' }}
      className="w-full rounded-lg overflow-hidden"
    >
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
