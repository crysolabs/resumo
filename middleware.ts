import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Get the token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    // Check if the user is authenticated
    const isAuthenticated = !!token

    // Define protected routes
    const protectedRoutes = ["/dashboard"]
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    // Define auth routes (login, register)
    const authRoutes = ["/login", "/register"]
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

    // Redirect logic
    if (isProtectedRoute && !isAuthenticated) {
        // Redirect to login if trying to access protected route without authentication
        const url = new URL("/login", request.url)
        url.searchParams.set("callbackUrl", encodeURI(pathname))
        return NextResponse.redirect(url)
    }

    if (isAuthRoute && isAuthenticated) {
        // Redirect to dashboard if already authenticated
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
}

