import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // 서버에서는 환경변수 또는 기본값 확인
    const serverPassword = process.env.INITIAL_ADMIN_PASSWORD || 'deokslife'
    
    if (password?.trim() === serverPassword) {
      return NextResponse.json({ valid: true })
    } else {
      return NextResponse.json({ valid: false }, { status: 401 })
    }
  } catch (error) {
    console.error('Password check error:', error)
    return NextResponse.json({ error: 'Password check failed' }, { status: 500 })
  }
}