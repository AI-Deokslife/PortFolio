-- 기존 apps 데이터를 보존하면서 admin_settings만 추가
-- 기존 프로젝트 데이터는 그대로 유지됩니다

-- 1. admin_settings 테이블만 삭제 후 재생성 (apps는 건드리지 않음)
DROP TABLE IF EXISTS admin_settings CASCADE;

-- 2. admin_settings 테이블 생성
CREATE TABLE admin_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(50) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS 정책 설정
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 4. 접근 정책 생성
CREATE POLICY "Allow all access to admin_settings" 
ON admin_settings FOR ALL 
USING (true);

-- 5. 기본 관리자 비밀번호 삽입
INSERT INTO admin_settings (setting_key, setting_value)
VALUES ('admin_password', 'deokslife');

-- 6. 확인
SELECT '기존 프로젝트 데이터:' as info;
SELECT COUNT(*) as project_count FROM apps;

SELECT 'admin_settings 테이블:' as info;
SELECT * FROM admin_settings;