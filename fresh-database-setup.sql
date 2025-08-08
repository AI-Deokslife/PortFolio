-- 완전한 데이터베이스 재설정 (기존 데이터는 모두 삭제됩니다!)
-- 주의: 이 SQL은 기존 프로젝트 데이터를 모두 삭제합니다.

-- 1. 기존 테이블들 완전 삭제 (정책도 함께 삭제됨)
DROP TABLE IF EXISTS admin_settings CASCADE;
DROP TABLE IF EXISTS apps CASCADE;

-- 2. apps 테이블 새로 생성 (모든 필요한 컬럼 포함)
CREATE TABLE apps (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  github_url TEXT,
  image_url TEXT,
  tech_stack TEXT,
  category TEXT DEFAULT '웹 프로젝트',
  development_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. admin_settings 테이블 생성
CREATE TABLE admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS 정책 설정
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 5. 모든 접근 허용 정책 생성
CREATE POLICY "Allow all access to apps" 
ON apps FOR ALL 
USING (true);

CREATE POLICY "Allow all access to admin_settings" 
ON admin_settings FOR ALL 
USING (true);

-- 6. 기본 관리자 비밀번호 삽입
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('admin_password', 'deokslife');

-- 7. 테스트용 샘플 프로젝트 삽입 (선택사항)
INSERT INTO apps (title, description, url, github_url, tech_stack, category, development_date)
VALUES 
('포트폴리오 사이트', '개인 포트폴리오 웹사이트', 'https://example.com', 'https://github.com/user/portfolio', 'Next.js, React, TypeScript', '웹 프로젝트', '2024-08');

-- 8. 결과 확인
SELECT 'apps 테이블:' as table_info;
SELECT * FROM apps;

SELECT 'admin_settings 테이블:' as table_info;
SELECT * FROM admin_settings;

-- 9. 테이블 구조 확인
SELECT 'apps 테이블 구조:' as info;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'apps'
ORDER BY ordinal_position;

SELECT 'admin_settings 테이블 구조:' as info;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'admin_settings'
ORDER BY ordinal_position;