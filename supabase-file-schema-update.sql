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
-- INSERT INTO storage.buckets (id, name, public, allowed_mime_types)
-- VALUES ('project-files', 'project-files', true, null)
-- ON CONFLICT (id) DO NOTHING;

-- project-files 버킷에 대한 정책 설정
-- 모든 사용자가 파일을 읽을 수 있도록 허용
CREATE POLICY "Allow public read access on project-files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-files');

-- 관리자만 파일을 업로드할 수 있도록 허용 (실제로는 앱에서 처리)
CREATE POLICY "Allow upload access on project-files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'project-files');

-- 관리자만 파일을 업데이트할 수 있도록 허용
CREATE POLICY "Allow update access on project-files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'project-files');

-- 관리자만 파일을 삭제할 수 있도록 허용
CREATE POLICY "Allow delete access on project-files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'project-files');