import { NextResponse } from 'next/server';

export function middleware(request) {
  // Handle CORS preflight request globally
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
      },
    });
  }

  // Continue for other requests, Next.js config handles headers for normal requests
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
