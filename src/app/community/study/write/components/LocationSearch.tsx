'use client';

import { useState, useEffect, useRef } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        services: {
          Places: new () => any;
          Status: {
            OK: string;
          };
        };
        LatLng: new (lat: number, lng: number) => any;
        Map: new (container: HTMLElement, options: any) => any;
        Marker: new (options: any) => any;
        LatLngBounds: new () => any;
      };
    };
  }
}

export default function LocationSearch({
  onLocationSelect,
}: LocationSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [places, setPlaces] = useState<any>(null);

  const loadKakaoMap = () => {
    return new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById('kakao-maps-sdk');
      if (existingScript) {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
          resolve();
          return;
        }
      }

      const script = document.createElement('script');
      script.id = 'kakao-maps-sdk';
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
      script.async = true;

      script.onload = () => {
        window.kakao.maps.load(() => {
          // services 라이브러리가 로드될 때까지 대기
          const checkServices = () => {
            if (window.kakao.maps.services) {
              resolve();
            } else {
              setTimeout(checkServices, 100);
            }
          };
          checkServices();
        });
      };

      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    let isSubscribed = true;

    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        await loadKakaoMap();
        if (!isSubscribed) return;

        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.978),
          level: 3,
        };

        const mapInstance = new window.kakao.maps.Map(mapRef.current, options);
        const markerInstance = new window.kakao.maps.Marker({
          position: options.center,
        });
        const placesInstance = new window.kakao.maps.services.Places();

        markerInstance.setMap(mapInstance);
        setMap(mapInstance);
        setMarker(markerInstance);
        setPlaces(placesInstance);
      } catch (error) {
        console.error('카카오맵 초기화 실패:', error);
      }
    };

    initMap();

    return () => {
      isSubscribed = false;
      if (marker) {
        marker.setMap(null);
      }
    };
  }, []);

  const handleSearch = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (!places || !keyword.trim()) return;

    places.keywordSearch(keyword, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        console.log('검색 결과:', result); // 디버깅용
        setResults(result);

        // 첫 번째 검색 결과로 지도 중심 이동
        if (result.length > 0) {
          const firstResult = result[0];
          const moveLatLng = new window.kakao.maps.LatLng(
            firstResult.y,
            firstResult.x,
          );
          map.setCenter(moveLatLng);
          marker.setPosition(moveLatLng);
        }
      } else {
        console.log('검색 실패:', status); // 디버깅용
      }
    });
  };

  const handleLocationSelect = (place: any) => {
    if (!map || !marker) return;

    const location: Location = {
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
      address: place.address_name,
    };

    const moveLatLng = new window.kakao.maps.LatLng(place.y, place.x);
    map.setCenter(moveLatLng);
    marker.setPosition(moveLatLng);
    map.setLevel(3); // 지도 확대

    onLocationSelect(location);
    setResults([]);
    setKeyword('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(e);
            }
          }}
          className="input input-bordered flex-1"
          placeholder="장소를 검색하세요"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="btn bg-white text-gray-800 border-gray-800 hover:bg-teal-50 hover:text-teal-500 hover:border-teal-500"
        >
          검색
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          ref={mapRef}
          className="w-full h-[300px] rounded-lg border border-base-300"
        />

        {results.length > 0 && (
          <div className="w-full h-[300px] overflow-y-auto border border-base-300 rounded-lg">
            <ul className="menu bg-base-200 w-full">
              {results.map(place => (
                <li
                  key={place.id}
                  className="border-b border-base-300 last:border-none"
                >
                  <button
                    type="button"
                    onClick={() => handleLocationSelect(place)}
                    className="py-3 px-4 hover:bg-base-300 w-full text-left"
                  >
                    <p className="font-semibold">{place.place_name}</p>
                    <p className="text-sm text-base-content/70">
                      {place.address_name}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
