import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-pathname', request.nextUrl.pathname)

    let supabaseResponse = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

                    // 2. Preserve requestHeaders when Supabase refreshes cookies
                    supabaseResponse = NextResponse.next({
                        request: {
                            headers: requestHeaders,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user }, error,
    } = await supabase.auth.getUser()

    console.log('Middleware User:', user?.email ?? 'No user found')
    console.log('Middleware Error:', error?.message ?? 'No error')

    const pathname = request.nextUrl.pathname

    const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

    const protectedRoutes = ['/dashboard', '/account']
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
    
    const isVerifyRoute = pathname.startsWith('/auth/')
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (isVerifyRoute && !sessionId) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.search = '' 
        return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        const response = NextResponse.redirect(url)
        const flashData = JSON.stringify({
            title: 'Already Logged In!',
            message: 'You are already logged in.',
            path: '/dashboard',
        })
        response.cookies.set('auth_flash_message', encodeURIComponent(flashData), {
            maxAge: 20,
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })
        return response
    }

    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        const response = NextResponse.redirect(url)
        const flashData = JSON.stringify({
            title: 'Access Restricted!',
            message: 'Please log in or sign up to access your dashboard.',
            path: '/login',
        })
        response.cookies.set('auth_flash_message', encodeURIComponent(flashData), {
            maxAge: 20,
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        })
        return response
    }

    if (pathname.startsWith('/auth/') || pathname.includes('?error')) {
        supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        supabaseResponse.headers.set('Pragma', 'no-cache')
        supabaseResponse.headers.set('Expires', '0')
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}