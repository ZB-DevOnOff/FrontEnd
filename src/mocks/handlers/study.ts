// import { rest } from 'msw';
// import {
//   StudySubject,
//   BaseStudyPost,
//   StudyDifficulty,
//   DAY_KOREAN,
//   MEETING_TYPE,
// } from '@/types/study';

// // 온라인 전용 스터디
// const mockOnlineStudies = Array.from({ length: 15 }, (_, index) => ({
//   id: index + 1,
//   title: `[온라인] 스터디 모집합니다 ${index + 1}`,
//   content: `<p>온라인 스터디 상세 내용 ${index + 1}</p>`,
//   subject: [
//     'CONCEPT_LEARNING',
//     'PROJECT',
//     'CHALLENGE',
//     'CERTIFICATION',
//     'JOB_PREPARATION',
//     'ETC',
//   ][index % 6] as BaseStudyPost['subject'],
//   difficulty: ['HIGH', 'MEDIUM', 'LOW'][
//     index % 3
//   ] as BaseStudyPost['difficulty'],
//   thumbnail: '',
//   recruitmentStartDate: '2024-01-01',
//   recruitmentEndDate: '2024-02-01',
//   studyStartDate: '2024-02-01',
//   studyEndDate: '2024-03-01',
//   currentMembers: Math.floor(Math.random() * 3) + 1,
//   maxMembers: 4,
//   meetingTime: '20:00',
//   status: ['RECRUITING', 'IN_PROGRESS', 'CANCELED'][
//     index % 3
//   ] as BaseStudyPost['status'],
//   meeting_type: 'ONLINE' as typeof MEETING_TYPE.ONLINE,
//   dayType: [DAY_KOREAN.MONDAY, DAY_KOREAN.WEDNESDAY, DAY_KOREAN.FRIDAY],
//   createdAt: new Date(
//     Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000,
//   ).toISOString(),
//   location: null,
// }));

// // 온/오프라인 병행 스터디
// const mockHybridStudies = Array.from({ length: 15 }, (_, index) => {
//   const latitude = 37.5665 + (Math.random() * 0.02 - 0.01);
//   const longitude = 126.978 + (Math.random() * 0.02 - 0.01);
//   const address = `서울시 중구 테스트동 ${index + 1}번지`;

//   return {
//     id: index + 16, // 온라인 스터디 다음 번호부터
//     title: `[온/오프라인] 스터디 모집합니다 ${index + 1}`,
//     content: `<p>온/오프라인 병행 스터디 상세 내용 ${index + 1}</p>`,
//     subject: [
//       'CONCEPT_LEARNING',
//       'PROJECT',
//       'CHALLENGE',
//       'CERTIFICATION',
//       'JOB_PREPARATION',
//       'ETC',
//     ][index % 6] as BaseStudyPost['subject'],
//     difficulty: ['HIGH', 'MEDIUM', 'LOW'][
//       index % 3
//     ] as BaseStudyPost['difficulty'],
//     thumbnail: '',
//     recruitmentStartDate: '2024-01-01',
//     recruitmentEndDate: '2024-02-01',
//     studyStartDate: '2024-02-01',
//     studyEndDate: '2024-03-01',
//     currentMembers: Math.floor(Math.random() * 3) + 1,
//     maxMembers: 4,
//     meetingTime: '20:00',
//     status: ['RECRUITING', 'IN_PROGRESS', 'CANCELED'][
//       index % 3
//     ] as BaseStudyPost['status'],
//     meeting_type: 'HYBRID' as (typeof MEETING_TYPE)[keyof typeof MEETING_TYPE],
//     dayType: [DAY_KOREAN.TUESDAY, DAY_KOREAN.THURSDAY, DAY_KOREAN.SATURDAY],
//     createdAt: new Date(
//       Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000,
//     ).toISOString(),
//     location: { latitude, longitude, address },
//   };
// });

// // 두 배열 합치기
// const mockStudies: Array<
//   BaseStudyPost & {
//     id: number;
//     createdAt: string;
//     location: null | { latitude: number; longitude: number; address: string };
//   }
// > = [...mockOnlineStudies, ...mockHybridStudies];

// export const studyHandlers = [
//   rest.get('/api/study-posts/search', (req, res, ctx) => {
//     const page = parseInt(req.url.searchParams.get('page') || '0');
//     const size = parseInt(req.url.searchParams.get('size') || '12');
//     const searchTitle = req.url.searchParams.get('searchTitle') || '';
//     const subjects = req.url.searchParams.getAll('subjects[]');
//     const status = req.url.searchParams.getAll('status[]');
//     const difficulty = req.url.searchParams.getAll('difficulty[]');
//     const days = req.url.searchParams.getAll('days[]');
//     const meeting_type = req.url.searchParams.get('meeting_type') || '';

//     let filteredData = [...mockStudies];

//     // 제목 검색
//     if (searchTitle) {
//       filteredData = filteredData.filter(study =>
//         study.title.toLowerCase().includes(searchTitle.toLowerCase()),
//       );
//     }

//     // 주제 필터
//     if (subjects.length > 0) {
//       filteredData = filteredData.filter(study =>
//         subjects.includes(study.subject),
//       );
//     }

//     // 상태 필터
//     if (status.length > 0) {
//       filteredData = filteredData.filter(study =>
//         status.includes(study.status),
//       );
//     }

//     // 난이도 필터
//     if (difficulty.length > 0) {
//       filteredData = filteredData.filter(study =>
//         difficulty.includes(study.difficulty),
//       );
//     }

//     // 요일 필터
//     if (days.length > 0) {
//       filteredData = filteredData.filter(study =>
//         study.dayType.some(day => days.includes(day)),
//       );
//     }

//     // 미팅 타입 필터
//     if (meeting_type) {
//       filteredData = filteredData.filter(
//         study => study.meeting_type === meeting_type,
//       );
//     }

//     const start = page * size;
//     const end = start + size;
//     const paginatedData = filteredData.slice(start, end);

//     return res(
//       ctx.status(200),
//       ctx.json({
//         data: paginatedData,
//         page,
//         size,
//         total_pages: Math.ceil(filteredData.length / size),
//       }),
//     );
//   }),
//   rest.get('/api/study-posts/:id', (req, res, ctx) => {
//     const { id } = req.params;
//     const study = mockStudies.find(
//       study => study.id === parseInt(id as string),
//     );

//     if (!study) {
//       return res(
//         ctx.status(404),
//         ctx.json({ message: '스터디를 찾을 수 없습니다.' }),
//       );
//     }

//     return res(
//       ctx.status(200),
//       ctx.json({
//         ...study,
//         participants: [
//           {
//             id: 1,
//             nickname: '스터디장',
//             profileImageUrl: null,
//             role: 'LEADER',
//           },
//           {
//             id: 2,
//             nickname: '참가자1',
//             profileImageUrl: null,
//             role: 'MEMBER',
//           },
//           {
//             id: 3,
//             nickname: '참가자2',
//             profileImageUrl: null,
//             role: 'MEMBER',
//           },
//         ],
//         comments: [
//           {
//             id: 1,
//             content: '첫 번째 댓글입니다.',
//             author: {
//               id: 1,
//               nickname: '댓글작성자1',
//               profileImageUrl: null,
//             },
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString(),
//           },
//         ],
//         author: {
//           id: 1,
//           nickname: '스터디장',
//           profileImageUrl: null,
//         },
//       }),
//     );
//   }),
//   rest.put('/api/study-posts/:id', (req, res, ctx) => {
//     const { id } = req.params;
//     const updatedStudy = req.body as Partial<BaseStudyPost>;

//     // 스터디 찾기
//     const studyIndex = mockStudies.findIndex(
//       study => study.id === parseInt(id as string),
//     );

//     if (studyIndex === -1) {
//       return res(
//         ctx.status(404),
//         ctx.json({ message: '스터디를 찾을 수 없습니다.' }),
//       );
//     }

//     // 스터디 업데이트
//     mockStudies[studyIndex] = {
//       ...mockStudies[studyIndex],
//       ...updatedStudy,
//     };

//     return res(
//       ctx.status(200),
//       ctx.json({ message: '스터디 모집 글이 업데이트되었습니다.' }),
//     );
//   }),
//   rest.post('/api/study-posts', (req, res, ctx) => {
//     const studyPost = req.body as {
//       title: string;
//       studyName: string;
//       subject: StudySubject;
//       difficulty: StudyDifficulty;
//       dayType: (typeof DAY_KOREAN)[keyof typeof DAY_KOREAN][];
//       startDate: string;
//       endDate: string;
//       startTime: string;
//       endTime: string;
//       meetingType: typeof MEETING_TYPE.ONLINE;
//       recruitmentPeriod: string;
//       description: string;
//       maxParticipants: number;
//       latitude?: number;
//       longitude?: number;
//       userId: number;
//     };

//     const newStudy = {
//       id: mockStudies.length + 1,
//       title: studyPost.title,
//       content: studyPost.description,
//       subject: studyPost.subject,
//       difficulty: studyPost.difficulty,
//       thumbnail: '',
//       recruitmentStartDate: studyPost.recruitmentPeriod,
//       recruitmentEndDate: studyPost.recruitmentPeriod,
//       studyStartDate: studyPost.startDate,
//       studyEndDate: studyPost.endDate,
//       currentMembers: 1,
//       maxMembers: studyPost.maxParticipants,
//       meetingTime: studyPost.startTime,
//       status: 'RECRUITING' as const,
//       meeting_type: studyPost.meetingType,
//       dayType: studyPost.dayType,
//       createdAt: new Date().toISOString(),
//       location:
//         studyPost.latitude && studyPost.longitude
//           ? {
//               latitude: studyPost.latitude,
//               longitude: studyPost.longitude,
//               address: '',
//             }
//           : null,
//     };

//     mockStudies.push(newStudy);
//     return res(ctx.status(200), ctx.json(newStudy));
//   }),
// ];
