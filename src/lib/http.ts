import { NextResponse } from 'next/server';

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Ne fuite le détail d'une exception qu'en développement. */
export function internalError(err: unknown, context: string) {
  console.error(`${context} error:`, err);
  const isDev = process.env.NODE_ENV !== 'production';
  return NextResponse.json(
    { error: isDev && err instanceof Error ? err.message : 'Erreur interne du serveur' },
    { status: 500 }
  );
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0].trim() || '';
}

/** Lit un corps JSON en tolérant un corps vide ou malformé. */
export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
