// 관리자 비밀번호 관련 유틸리티 함수들

export const getStoredPassword = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminPassword') || 'deokslife'
  }
  return 'deokslife' // 서버사이드에서는 기본값 사용
}

export const setStoredPassword = (newPassword: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminPassword', newPassword)
  }
}

export const validatePassword = (inputPassword: string): boolean => {
  const storedPassword = getStoredPassword()
  return inputPassword.trim() === storedPassword
}