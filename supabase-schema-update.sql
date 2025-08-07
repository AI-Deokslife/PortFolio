-- Supabase 데이터베이스에 새로운 컬럼 추가
-- 이 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요.

-- 1. category 컬럼 추가 (기본값: '웹 프로젝트')
ALTER TABLE apps 
ADD COLUMN category TEXT DEFAULT '웹 프로젝트';

-- 2. development_date 컬럼 추가 (YYYY-MM 형식)
ALTER TABLE apps 
ADD COLUMN development_date TEXT;

-- 3. 테이블 구조 확인
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'apps';

-- 4. 기존 데이터 확인
SELECT id, title, category, development_date 
FROM apps 
LIMIT 5;