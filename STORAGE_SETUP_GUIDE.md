# 🔧 Supabase Storage 설정 가이드

기존 정책 충돌로 인한 Storage 업로드 오류를 해결하는 방법입니다.

## 📋 **해결 방법 (Supabase 대시보드에서 실행)**

### 1단계: 데이터베이스 컬럼 추가

```sql
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_url TEXT;
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_filename TEXT; 
ALTER TABLE apps ADD COLUMN IF NOT EXISTS download_filesize BIGINT;
```

### 2단계: Storage 버킷 생성/업데이트

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('project-files', 'project-files', true, 52428800)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800;
```

### 3단계: 기존 정책 확인

먼저 어떤 정책들이 있는지 확인:

```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
```

### 4단계: 문제가 되는 정책 삭제

```sql
DROP POLICY IF EXISTS "Enable insert for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable read for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable update for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for all users" ON storage.objects;
```

### 5단계: project-files 전용 정책 생성

```sql
-- 읽기 권한
CREATE POLICY "project_files_read" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-files');

-- 쓰기 권한  
CREATE POLICY "project_files_write" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'project-files');

-- 수정 권한
CREATE POLICY "project_files_update" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'project-files');

-- 삭제 권한
CREATE POLICY "project_files_delete" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'project-files');
```

## 🚨 **문제 발생 시**

### "policy already exists" 에러가 나는 경우:

1. 기존 정책들을 모두 확인:
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';
```

2. 충돌하는 정책 삭제:
```sql
DROP POLICY "[정책이름]" ON storage.objects;
```

3. 그 후 5단계 다시 실행

### 권한 부족 에러가 나는 경우:

Supabase 대시보드의 **SQL Editor**에서 실행하세요. 일반 API에서는 Storage 정책을 변경할 권한이 없습니다.

## ✅ **설정 완료 확인**

```sql
-- 버킷 확인
SELECT * FROM storage.buckets WHERE name = 'project-files';

-- 정책 확인  
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
AND policyname LIKE '%project_files%'
ORDER BY policyname;
```

## 🎯 **대안 방법**

만약 위 방법이 복잡하다면, **Supabase 대시보드 > Storage > Policies**에서 GUI로:

1. 기존 policies를 모두 삭제
2. "New policy" 버튼으로 새 정책 생성:
   - Policy name: `project_files_all`
   - Allowed operation: `ALL` 
   - Policy definition: `bucket_id = 'project-files'`

이렇게 하면 project-files 버킷에 대해서만 모든 작업이 허용됩니다.