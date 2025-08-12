-- 간단한 Storage 설정 스크립트 (단계별 실행)

-- === 1단계: 데이터베이스 컬럼 추가 ===
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_url TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_filename TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_filesize BIGINT;

-- === 2단계: 기존 정책들 확인 (실행만, 결과 확인용) ===
-- SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- === 3단계: project-files 버킷 생성 또는 업데이트 ===
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('project-files', 'project-files', true, 52428800)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800;

-- === 4단계: 기존의 일반적인 정책들 삭제 (충돌 방지) ===
-- 아래 명령들을 하나씩 실행해보세요. 없는 정책이면 에러가 나도 무시하셔도 됩니다.

-- DROP POLICY IF EXISTS "Enable insert for all users" ON storage.objects;
-- DROP POLICY IF EXISTS "Enable read for all users" ON storage.objects;  
-- DROP POLICY IF EXISTS "Enable update for all users" ON storage.objects;
-- DROP POLICY IF EXISTS "Enable delete for all users" ON storage.objects;

-- === 5단계: project-files 전용 정책 생성 ===
-- 이 명령들도 하나씩 실행하세요. 이미 존재한다는 에러가 나면 다음으로 넘어가세요.

-- CREATE POLICY "project_files_read" ON storage.objects FOR SELECT USING (bucket_id = 'project-files');
-- CREATE POLICY "project_files_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-files');
-- CREATE POLICY "project_files_update" ON storage.objects FOR UPDATE USING (bucket_id = 'project-files');
-- CREATE POLICY "project_files_delete" ON storage.objects FOR DELETE USING (bucket_id = 'project-files');

-- === 완료 확인 ===
-- SELECT 'Database setup completed' as status;