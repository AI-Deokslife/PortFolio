import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const adminPassword = formData.get('admin_password') as string

    // 관리자 비밀번호 확인
    const expectedPassword = process.env.INITIAL_ADMIN_PASSWORD || 'deokslife'
    if (!adminPassword || adminPassword.trim() !== expectedPassword.trim()) {
      return NextResponse.json({ 
        error: '관리자 비밀번호가 일치하지 않습니다.' 
      }, { status: 401 })
    }

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
    }

    // 파일 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: '지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 지원)' 
      }, { status: 400 })
    }

    // 파일 크기 체크 (5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: '파일 크기는 5MB를 초과할 수 없습니다.' 
      }, { status: 400 })
    }

    // 파일명 생성
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    
    // ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // 버킷이 존재하는지 확인하고 없으면 생성
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === 'project-images')
    
    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket('project-images', {
        public: true
      })
      
      if (createBucketError) {
        console.error('Failed to create bucket:', createBucketError)
        // 버킷 생성에 실패해도 업로드를 시도해봄 (이미 존재할 가능성)
      }
    }

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(`uploads/${fileName}`, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ 
        error: '파일 업로드에 실패했습니다: ' + error.message 
      }, { status: 500 })
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(`uploads/${fileName}`)

    return NextResponse.json({ 
      success: true,
      url: urlData.publicUrl,
      fileName: fileName
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: '파일 업로드 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}