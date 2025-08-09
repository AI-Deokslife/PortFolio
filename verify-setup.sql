-- =============================================
-- Supabase 설정 확인 스크립트
-- =============================================

-- 1. admin_settings 테이블 확인
SELECT '=== admin_settings 테이블 ===' AS section;
SELECT setting_key, setting_value, created_at FROM admin_settings;

-- 2. apps 테이블 구조 확인 (새 컬럼들)
SELECT '=== apps 테이블 컬럼 구조 ===' AS section;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'apps' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Storage 버킷 확인
SELECT '=== Storage 버킷 ===' AS section;
SELECT id, name, public, file_size_limit, 
       CASE WHEN allowed_mime_types IS NOT NULL THEN array_length(allowed_mime_types, 1) ELSE 0 END as mime_types_count,
       created_at 
FROM storage.buckets 
WHERE name IN ('project-images', 'project-files')
ORDER BY name;

-- 4. Storage 정책 확인
SELECT '=== Storage RLS 정책 ===' AS section;
SELECT policyname, cmd, 
       CASE 
           WHEN policyname LIKE '%project_images%' THEN 'project-images'
           WHEN policyname LIKE '%project_files%' THEN 'project-files'
           ELSE 'other'
       END as bucket_name
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
  AND (policyname LIKE '%project_images%' OR policyname LIKE '%project_files%')
ORDER BY bucket_name, cmd;

-- 5. 기존 앱 데이터 확인 (새 컬럼 포함)
SELECT '=== 기존 앱 데이터 (처음 3개) ===' AS section;
SELECT id, title, category, development_date, 
       CASE WHEN download_url IS NOT NULL THEN 'YES' ELSE 'NO' END as has_download,
       CASE WHEN image_url IS NOT NULL THEN 'YES' ELSE 'NO' END as has_image
FROM apps 
ORDER BY id 
LIMIT 3;

-- 6. 전체 상태 요약
SELECT '=== 설정 상태 요약 ===' AS section;
SELECT 
    (SELECT COUNT(*) FROM admin_settings WHERE setting_key = 'admin_password') as admin_password_set,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'apps' AND column_name = 'category') as category_column,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'apps' AND column_name = 'download_url') as download_columns,
    (SELECT COUNT(*) FROM storage.buckets WHERE name = 'project-images') as project_images_bucket,
    (SELECT COUNT(*) FROM storage.buckets WHERE name = 'project-files') as project_files_bucket,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%project_%') as storage_policies;