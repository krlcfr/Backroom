import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const start = Date.now();
  try {
    const res = await fetch("https://hxammkcbwqpbeqgixogv.supabase.co/auth/v1/health");
    return NextResponse.json({ ok: true, time: Date.now() - start, status: res.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, time: Date.now() - start, error: e.message });
  }
}
