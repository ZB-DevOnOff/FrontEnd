import { NextRequest } from 'next/server';
import { IGNORED_PATHS } from './pathConstants';

const checkPath = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const shouldIgnore = IGNORED_PATHS.some(ignoredPath => {
    if (ignoredPath.includes('*')) {
      const regexPattern = ignoredPath
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace('\\*', '[^/]+?');
      const regex = new RegExp('^' + regexPattern + '$');
      return regex.test(pathname);
    }
    return ignoredPath === pathname;
  });
  if (shouldIgnore) {
    console.log('미들웨어 건너뛰기: ', pathname);
    return true;
  }
  return false;
};

export { checkPath };
