-- admin_settings 테이블만 생성 (기존 apps 테이블은 건드리지 않음)
-- Supabase 대시보드 SQL Editor에서 실행하세요

-- 1. admin_settings 테이블 생성
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 기본 관리자 비밀번호 삽입
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('admin_password', 'deokslife')
ON CONFLICT (setting_key) DO NOTHING;

-- 3. RLS 정책 설정 (Row Level Security)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 4. 접근 정책 설정 (모든 사용자 접근 허용)
CREATE POLICY "Allow all access to admin_settings" 
ON admin_settings FOR ALL 
USING (true);

-- 5. 결과 확인
SELECT * FROM admin_settings WHERE setting_key = 'admin_password';