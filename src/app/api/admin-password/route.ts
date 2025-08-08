import { NextRequest, NextResponse } from 'next/server'
import { writeFileSync, readFileSync, existsSync } from 'fs'
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

// 비밀번호 저장하기
const savePassword = (password: string): boolean => {
  try {
    writeFileSync(PASSWORD_FILE, password, 'utf8')
    return true
  } catch (error) {
    console.error('Error saving password file:', error)
    return false
  }
}

// 현재 비밀번호 검증
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    const storedPassword = getStoredPassword()
    
    if (password?.trim() === storedPassword) {
      return NextResponse.json({ valid: true })
    } else {
      return NextResponse.json({ valid: false }, { status: 401 })
    }
  } catch (error) {
    console.error('Password check error:', error)
    return NextResponse.json({ error: 'Password check failed' }, { status: 500 })
  }
}

// 비밀번호 변경
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    // 현재 비밀번호 확인
    const storedPassword = getStoredPassword()
    if (currentPassword?.trim() !== storedPassword) {
      return NextResponse.json({ error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 401 })
    }

    // 새 비밀번호 유효성 검사
    if (!newPassword || newPassword.trim().length < 4) {
      return NextResponse.json({ error: '새 비밀번호는 최소 4자 이상이어야 합니다.' }, { status: 400 })
    }

    // 새 비밀번호 저장
    if (savePassword(newPassword.trim())) {
      return NextResponse.json({ success: true, message: '비밀번호가 변경되었습니다.' })
    } else {
      return NextResponse.json({ error: '비밀번호 저장에 실패했습니다.' }, { status: 500 })
    }
  } catch (error) {
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Password change failed' }, { status: 500 })
  }
}