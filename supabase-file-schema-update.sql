-- 파일 다운로드 기능을 위한 스키마 업데이트

-- apps 테이블에 파일 다운로드 관련 컬럼 추가
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_url TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_filename TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_filesize BIGINT;

-- 컬럼에 대한 설명 추가
COMMENT ON COLUMN apps.download_url IS '다운로드 파일의 URL (Supabase Storage)';
COMMENT ON COLUMN apps.download_filename IS '원본 파일명';
COMMENT ON COLUMN apps.download_filesize IS '파일 크기 (바이트 단위)';

-- project-files 버킷 생성 (이미 존재한다면 무시됨)
-- 이 명령은 Supabase 대시보드에서 실행하거나 앱에서 자동으로 처리됩니다.
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES ('project-files', 'project-files', true, null, 52428800)
ON CONFLICT (id) DO NOTHING;

-- 모든 기존 정책들 삭제 (여러 가지 이름으로 존재할 수 있음)
DROP POLICY IF EXISTS "Allow public read access on project-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload access on project-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow update access on project-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete access on project-files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for project-files" ON storage.objects;
DROP POLICY IF EXISTS "Public insert access for project-files" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for project-files" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for project-files" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for all users" ON storage.objects;

-- project-files 버킷 전용 정책 생성
-- 1. project-files 버킷의 파일 읽기 허용 (다운로드)
CREATE POLICY "project_files_select_policy"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-files');

-- 2. project-files 버킷에 파일 업로드 허용
CREATE POLICY "project_files_insert_policy"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'project-files');

-- 3. project-files 버킷의 파일 업데이트 허용
CREATE POLICY "project_files_update_policy"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'project-files');

-- 4. project-files 버킷의 파일 삭제 허용
CREATE POLICY "project_files_delete_policy"
ON storage.objects
FOR DELETE
USING (bucket_id = 'project-files');

-- RLS(Row Level Security) 활성화 확인
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;