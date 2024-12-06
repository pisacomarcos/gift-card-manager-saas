import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Error interno del servidor' 
      }, 
      { status: 500 }
    )
  }
}

export const config = {
  matcher: '/api/:path*',
} 