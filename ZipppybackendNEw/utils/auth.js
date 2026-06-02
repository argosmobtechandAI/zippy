import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Helper to authenticate JWT token
export async function authenticateToken(req) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized: Missing or invalid token format', status: 401 };
  }

  const token = authHeader.split(' ')[1];
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  
  try {
    const { payload } = await jwtVerify(token, secret);
    return { user: payload }; // payload usually contains id and type
  } catch (error) {
    return { error: 'Unauthorized: Invalid token', status: 401 };
  }
}

// Wrapper for API routes that require authentication
export function withAuth(handler) {
  return async (req, context) => {
    const authResult = await authenticateToken(req);
    
    if (authResult.error) {
      return NextResponse.json({ success: false, message: authResult.error }, { status: authResult.status });
    }
    
    // Pass the user data into the request object (or a custom wrapper)
    // For Next.js Route Handlers, modifying req directly is not strictly recommended but we can attach properties.
    // Alternatively, we can pass it as a third argument to the handler.
    return handler(req, context, authResult.user);
  };
}
