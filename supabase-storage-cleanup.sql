-- Supabase Storage 정책 정리 및 재설정 스크립트
-- 먼저 이 스크립트를 실행하여 기존 정책들을 정리합니다.

-- 1. 기존 Storage 정책들 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 2. 모든 기존 정책들 삭제 (안전하게)
DO $$
DECLARE
    policy_record record;
BEGIN
    -- storage.objects 테이블의 모든 정책 삭제
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
        RAISE NOTICE '정책 삭제: %', policy_record.policyname;
    END LOOP;
END $$;

-- 3. project-files 버킷 확인 및 생성
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('project-files', 'project-files', true, null, 52428800)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit;

-- 4. 새로운 정책들 생성 (project-files 버킷 전용)
CREATE POLICY "project_files_select_policy"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-files');

CREATE POLICY "project_files_insert_policy"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'project-files');

CREATE POLICY "project_files_update_policy"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'project-files');

CREATE POLICY "project_files_delete_policy"
ON storage.objects
FOR DELETE
USING (bucket_id = 'project-files');

-- 5. RLS 활성화 확인
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- 6. 설정 확인
SELECT 'Storage 설정 완료' as status;
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;