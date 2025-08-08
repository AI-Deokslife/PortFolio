import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const PASSWORD_FILE = join(process.cwd(), '.admin-password')

// 현재 저장된 비밀번호 가져오기
const getStoredPassword = (): string => {
  try {
    if (existsSync(PASSWORD_FILE)) {
      return readFileSync(PASSWORD_FILE, 'utf8').trim()
    }
  } catch (error) {
    console.error('Error reading password file:', error)
  }
  return process.env.INITIAL_ADMIN_PASSWORD || 'deokslife'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    const serverPassword = getStoredPassword()
    
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