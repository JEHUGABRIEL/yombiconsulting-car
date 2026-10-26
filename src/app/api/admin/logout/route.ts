import { NextResponse } from 'next/server';
import { clearedSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/admin/login', req.url), 303);
  res.cookies.set(clearedSessionCookie());
  return res;
}
