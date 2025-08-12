import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmeipyonfxlgufnanewn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZWlweW9uZnhsZ3VmbmFuZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI2NDksImV4cCI6MjA3MDEyODY0OX0.aI7PQe6PVQGJQ_M3hMMbKUpC1g_gSewTvJLI_NtIDMI'
const supabase = createClient(supabaseUrl, supabaseKey)

// Storage 설정 확인 및 초기화
async function ensureStorageSetup() {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw new Error(`Storage 서비스 연결 실패: ${listError.message}`)
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'project-files')
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket('project-files', {
        public: true,
        allowedMimeTypes: ['*/*'],
        fileSizeLimit: 104857600 // 100MB
      })
      
      if (createError) {
        throw new Error(`Storage 버킷 생성 실패: ${createError.message}`)
      }
      
      console.log('project-files bucket created successfully')
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Storage setup error:', error)
    return { success: false, error: error.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
    }

    // 파일 검증 - 허용된 파일 형식 대폭 확장
    const allowedTypes = [
      // 이미지
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff',
      
      // 실행 파일 및 압축 파일
      'application/x-msdownload', 'application/x-msdos-program', 
      'application/octet-stream', 'application/exe', 'application/x-exe',
      'application/zip', 'application/x-zip-compressed', 'application/gzip',
      'application/x-rar-compressed', 'application/x-7z-compressed',
      
      // Microsoft Office 문서
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      
      // 문서 및 텍스트
      'application/pdf', 'text/plain', 'application/json', 'text/csv',
      'application/rtf', 'text/xml', 'application/xml',
      
      // 기타 문서 형식
      'application/vnd.oasis.opendocument.text', // .odt
      'application/vnd.oasis.opendocument.spreadsheet', // .ods
      'application/vnd.oasis.opendocument.presentation', // .odp
      
      // 개발 관련
      'text/html', 'text/css', 'text/javascript', 'application/javascript',
      'text/x-python', 'text/x-java-source', 'text/x-c', 'text/x-c++',
      
      // 기타
      'application/x-executable', 'application/x-deb', 'application/x-rpm'
    ]

    // 확장자로도 검증 - 대폭 확장
    const fileName = file.name.toLowerCase()
    const allowedExtensions = [
      // 이미지
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.ico',
      
      // 실행파일 & 설치파일
      '.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm', '.appimage',
      
      // 압축파일
      '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz',
      
      // Microsoft Office
      '.xls', '.xlsx', '.xlsm', '.xlsb', // Excel
      '.doc', '.docx', '.docm', // Word  
      '.ppt', '.pptx', '.pptm', // PowerPoint
      
      // 문서
      '.pdf', '.txt', '.rtf', '.csv', '.json', '.xml', '.html', '.htm',
      
      // OpenOffice/LibreOffice
      '.odt', '.ods', '.odp', '.odg',
      
      // 개발 파일
      '.js', '.ts', '.py', '.java', '.c', '.cpp', '.h', '.css', '.scss', '.less',
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart',
      
      // 설정 파일
      '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf',
      
      // 기타
      '.sql', '.md', '.log', '.bat', '.sh', '.ps1'
    ]
    const hasAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext))

    if (!allowedTypes.includes(file.type) && !hasAllowedExtension) {
      return NextResponse.json({ 
        error: '지원하지 않는 파일 형식입니다. 대부분의 문서, 이미지, 실행파일, 압축파일을 지원합니다.' 
      }, { status: 400 })
    }

    // 파일 크기 체크 (100MB)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: '파일 크기는 100MB를 초과할 수 없습니다.' 
      }, { status: 400 })
    }

    // 파일명 생성 - 안전한 파일명으로 변환
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const finalFileName = `${timestamp}-${safeFileName}`
    
    // ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Storage 설정 확인
    const setupResult = await ensureStorageSetup()
    if (!setupResult.success) {
      return NextResponse.json({ 
        error: setupResult.error
      }, { status: 500 })
    }

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('project-files')
      .upload(`downloads/${finalFileName}`, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: true
      })

    if (error) {
      console.error('Supabase upload error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // 구체적인 에러 메시지 제공
      let errorMessage = '파일 업로드에 실패했습니다.'
      
      if (error.message.includes('Invalid key')) {
        errorMessage = '파일명에 사용할 수 없는 문자가 포함되어 있습니다.'
      } else if (error.message.includes('Payload too large')) {
        errorMessage = '파일 크기가 너무 큽니다. 100MB 이하의 파일을 업로드해주세요.'
      } else if (error.message.includes('bucket')) {
        errorMessage = 'Storage 버킷 설정에 문제가 있습니다. 관리자에게 문의해주세요.'
      } else if (error.message.includes('policy') || error.message.includes('permission')) {
        errorMessage = 'Storage 권한 설정에 문제가 있습니다. Storage 정책을 확인해주세요.'
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: error.message,
        code: 'UPLOAD_FAILED'
      }, { status: 500 })
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('project-files')
      .getPublicUrl(`downloads/${finalFileName}`)

    return NextResponse.json({ 
      success: true,
      url: urlData.publicUrl,
      fileName: finalFileName,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      storage: 'supabase'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: '파일 업로드 중 오류가 발생했습니다.' 
    }, { status: 500 })
  }
}