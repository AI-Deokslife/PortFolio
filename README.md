# 웹앱 포트폴리오

Next.js와 Supabase를 사용한 동적 포트폴리오 사이트입니다.

## 🚀 기능

- ✅ **프로젝트 관리**: 프로젝트 추가/수정/삭제
- ✅ **이미지 업로드**: 드래그&드롭으로 이미지 업로드
- ✅ **스킬 편집**: 기술 스택 동적 편집
- ✅ **관리자 인증**: 모든 편집 기능에 비밀번호 보호
- ✅ **반응형 디자인**: 모바일/태블릿/데스크탑 지원

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript, Styled-Components
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## 🔧 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정 (.env.local 파일 생성)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
INITIAL_ADMIN_PASSWORD=your_admin_password

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 🌐 라이브 데모

**배포 URL**: https://webapp-g3upr3a6q-ssidal.vercel.app

## 🔐 관리자 기능

관리자 비밀번호로 다음 기능을 사용할 수 있습니다:
- 프로젝트 추가/수정/삭제
- 스킬 편집
- 이미지 업로드

## 📝 프로젝트 구조

```
src/
  app/
    api/          # API 라우트
    components/   # React 컴포넌트
    globals.css   # 전역 스타일
    layout.tsx    # 루트 레이아웃
    page.tsx      # 메인 페이지
```

## 🤝 기여

이슈나 개선 제안이 있으시면 언제든지 Issue를 생성해주세요!

## 📄 라이선스

MIT License