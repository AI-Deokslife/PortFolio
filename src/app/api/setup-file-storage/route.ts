import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmeipyonfxlgufnanewn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZWlweW9uZnhsZ3VmbmFuZXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTI2NDksImV4cCI6MjA3MDEyODY0OX0.aI7PQe6PVQGJQ_M3hMMbKUpC1g_gSewTvJLI_NtIDMI'
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const results = []

    // 1. project-files 버킷 생성
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (listError) {
        results.push({ step: 'list-buckets', success: false, error: listError.message })
      } else {
        const bucketExists = buckets?.some(bucket => bucket.name === 'project-files')
        
        if (!bucketExists) {
          const { data: createData, error: createError } = await supabase.storage.createBucket('project-files', {
            public: true,
            allowedMimeTypes: ['*/*'],
            fileSizeLimit: 52428800 // 50MB
          })
          
          if (createError) {
            // 버킷 생성 실패해도 계속 진행 (이미 존재할 수 있음)
            results.push({ step: 'create-bucket', success: false, error: createError.message, warning: 'Bucket may already exist' })
          } else {
            results.push({ step: 'create-bucket', success: true, data: createData })
          }
        } else {
          results.push({ step: 'create-bucket', success: true, message: 'Bucket already exists' })
        }
      }
    } catch (error: any) {
      results.push({ step: 'bucket-setup', success: false, error: error.message, warning: 'Continuing with tests' })
    }

    // 2. 테스트 파일 업로드로 권한 확인
    try {
      const testContent = 'test file for storage setup'
      const testBuffer = new TextEncoder().encode(testContent)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-files')
        .upload('test/setup-test.txt', testBuffer, {
          contentType: 'text/plain',
          upsert: true
        })

      if (uploadError) {
        results.push({ step: 'test-upload', success: false, error: uploadError.message })
      } else {
        results.push({ step: 'test-upload', success: true, data: uploadData })
        
        // 테스트 파일 삭제
        await supabase.storage.from('project-files').remove(['test/setup-test.txt'])
      }
    } catch (error: any) {
      results.push({ step: 'test-upload', success: false, error: error.message })
    }

    // 3. 버킷 정보 조회
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('project-files')
      
      if (bucketError) {
        results.push({ step: 'bucket-info', success: false, error: bucketError.message })
      } else {
        results.push({ step: 'bucket-info', success: true, data: bucketData })
      }
    } catch (error: any) {
      results.push({ step: 'bucket-info', success: false, error: error.message })
    }

    // 전체 성공 여부 확인
    const allSuccessful = results.every(result => result.success)

    return NextResponse.json({ 
      success: allSuccessful,
      message: allSuccessful ? 'Storage setup completed successfully' : 'Some setup steps failed',
      results: results
    })

  } catch (error: any) {
    console.error('Storage setup error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Storage setup failed: ' + error.message,
      results: []
    }, { status: 500 })
  }
}