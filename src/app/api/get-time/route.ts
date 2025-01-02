import { NextResponse } from 'next/server';

export const GET = () => {
  const currentTime = new Date().toISOString();
  return NextResponse.json({ currentTime });
};
