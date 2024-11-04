import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Get the token from environment variables
    const validToken = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN

    // Check if the request is for an API route
    if (request.nextUrl.pathname.startsWith('/api')) {
        // Get the token from the request headers
        const token = request.headers.get('authorization');

        // Validate the token
        if (!token || token !== `Bearer ${validToken}`) {
            return NextResponse.json(
                { message: 'Forbidden: Invalid or missing token' },
                { status: 403 }
            );
        }
    }

    // Allow the request to proceed if token is valid or not an API route
    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'], // Only match API routes
};
