import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmeipyonfxlgufnanewn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZWlweW9uZnhsZ3VmbmFuZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI2NDksImV4cCI6MjA3MDEyODY0OX0.aI7PQe6PVQGJQ_M3hMMbKUpC1g_gSewTvJLI_NtIDMI'
const supabase = createClient(supabaseUrl, supabaseKey)

// 앱 수정
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { admin_password, ...appData } = body
    const resolvedParams = await params

    // 관리자 비밀번호 확인 (서버 기본값만 체크, localStorage는 클라이언트에서 처리)
    const expectedPassword = process.env.INITIAL_ADMIN_PASSWORD || 'deokslife'
    if (!admin_password || admin_password.trim() !== expectedPassword.trim()) {
      return NextResponse.json({ error: '관리자 비밀번호가 일치하지 않습니다.' }, { status: 401 })
    }

    // 기존 컬럼과 새 컬럼 안전하게 처리 (DB 컬럼이 있을 때만 포함)
    const safeAppData = {
      title: appData.title,
      description: appData.description,
      url: appData.url,
      github_url: appData.github_url,
      image_url: appData.image_url,
      tech_stack: appData.tech_stack,
      updated_at: new Date().toISOString(),
      // 조건부로 새 필드 포함 (DB 스키마가 업데이트되면 자동 작동)
      ...(appData.category && { category: appData.category }),
      ...(appData.development_date && { development_date: appData.development_date })
    }

    const { data, error } = await supabase
      .from('apps')
      .update(safeAppData)
      .eq('id', resolvedParams.id)
      .select()
    
    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ 
        error: '데이터 수정에 실패했습니다: ' + error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error updating app:', error)
    return NextResponse.json({ error: 'Failed to update app' }, { status: 500 })
  }
}

// 앱 삭제
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const { admin_password } = body
    const resolvedParams = await params

    // 관리자 비밀번호 확인 (서버 기본값만 체크, localStorage는 클라이언트에서 처리)
    const expectedPassword = process.env.INITIAL_ADMIN_PASSWORD || 'deokslife'
    
    if (!admin_password || admin_password.trim() !== expectedPassword.trim()) {
      return NextResponse.json({ 
        error: '관리자 비밀번호가 일치하지 않습니다.'
      }, { status: 401 })
    }

    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', resolvedParams.id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting app:', error)
    return NextResponse.json({ error: 'Failed to delete app' }, { status: 500 })
  }
}