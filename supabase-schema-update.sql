-- Supabase 데이터베이스 스키마 업데이트
-- 이 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요.

-- 1. category 컬럼 추가 (이미 있으면 무시)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'apps' AND column_name = 'category') THEN
        ALTER TABLE apps ADD COLUMN category TEXT DEFAULT '웹 프로젝트';
    END IF;
END $$;

-- 2. development_date 컬럼 추가 (이미 있으면 무시)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'apps' AND column_name = 'development_date') THEN
        ALTER TABLE apps ADD COLUMN development_date TEXT;
    END IF;
END $$;

-- 3. 테이블 구조 확인
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'apps';

-- 4. 기존 데이터 확인
SELECT id, title, category, development_date 
FROM apps 
LIMIT 5;

-- 5. admin_settings 테이블 생성 (관리자 비밀번호 저장용)
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 기본 관리자 비밀번호 삽입
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('admin_password', 'deokslife')
ON CONFLICT (setting_key) DO NOTHING;

-- 7. RLS 정책 설정 (Row Level Security)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 8. 모든 사용자가 접근 가능하도록 정책 설정
CREATE POLICY "Allow all access to admin_settings" 
ON admin_settings FOR ALL 
USING (true);

-- 9. admin_settings 테이블 확인
SELECT * FROM admin_settings WHERE setting_key = 'admin_password';