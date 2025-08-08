-- admin_settings 테이블 생성 (간단한 버전)
CREATE TABLE IF NOT EXISTS admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 비밀번호 삽입
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('admin_password', 'deokslife')
ON CONFLICT (setting_key) DO NOTHING;

-- RLS 정책 (모든 사용자가 읽기/쓰기 가능하도록 임시 설정)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 접근 가능하도록 정책 설정 (임시)
CREATE POLICY "Allow all access to admin_settings" 
ON admin_settings FOR ALL 
USING (true);

-- 확인
SELECT * FROM admin_settings WHERE setting_key = 'admin_password';