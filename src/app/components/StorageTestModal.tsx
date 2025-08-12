'use client'
import { useState } from 'react'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 2rem;
`

const ModalContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
`

const Title = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.8rem;
  font-weight: 600;
`

const TestResult = styled.div<{ success?: boolean }>`
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.success ? '#d1edff' : '#ffe6e6'};
  border: 1px solid ${props => props.success ? '#0084ff' : '#ff4444'};
  
  .test-name {
    font-weight: 600;
    color: ${props => props.success ? '#0066cc' : '#cc0000'};
    margin-bottom: 0.5rem;
  }
  
  .test-details {
    font-size: 0.9rem;
    color: #666;
    white-space: pre-wrap;
  }
`

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0.5rem;

  &.primary {
    background: linear-gradient(45deg, #4ECDC4, #44A08D);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(78, 205, 196, 0.3);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }

  &.secondary {
    background: #f8f9fa;
    color: #495057;
    border: 2px solid #dee2e6;

    &:hover {
      background: #e9ecef;
    }
  }
`

const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`

interface StorageTestModalProps {
  onClose: () => void;
}

interface TestResult {
  step: string;
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export default function StorageTestModal({ onClose }: StorageTestModalProps) {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const runStorageTest = async () => {
    setTesting(true)
    setResults([])

    try {
      const response = await fetch('/api/setup-file-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      
      if (data.results) {
        setResults(data.results.map((result: any) => ({
          step: result.step,
          success: result.success,
          message: result.message,
          error: result.error,
          data: result.data
        })))
      } else {
        setResults([{
          step: 'storage-test',
          success: false,
          error: data.error || 'Unknown error occurred'
        }])
      }
    } catch (error: any) {
      setResults([{
        step: 'storage-test',
        success: false,
        error: `네트워크 오류: ${error.message}`
      }])
    } finally {
      setTesting(false)
    }
  }

  const getStepName = (step: string) => {
    switch (step) {
      case 'list-buckets': return '버킷 목록 조회'
      case 'create-bucket': return '버킷 생성'
      case 'test-upload': return '테스트 업로드'
      case 'bucket-info': return '버킷 정보 확인'
      default: return step
    }
  }

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContainer>
        <Title>🔧 Storage 연결 테스트</Title>
        
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
          Supabase Storage 설정과 연결 상태를 확인합니다.
        </p>

        {results.length === 0 && (
          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            <Button 
              className="primary" 
              onClick={runStorageTest} 
              disabled={testing}
            >
              {testing ? '테스트 중...' : 'Storage 테스트 시작'}
            </Button>
          </div>
        )}

        {results.map((result, index) => (
          <TestResult key={index} success={result.success}>
            <div className="test-name">
              {result.success ? '✅' : '❌'} {getStepName(result.step)}
            </div>
            <div className="test-details">
              {result.success 
                ? (result.message || '성공') 
                : (result.error || '실패')}
              {result.data && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  데이터: {JSON.stringify(result.data, null, 2)}
                </div>
              )}
            </div>
          </TestResult>
        ))}

        <Actions>
          {results.length > 0 && (
            <Button className="secondary" onClick={() => setResults([])}>
              다시 테스트
            </Button>
          )}
          <Button className="secondary" onClick={onClose}>
            닫기
          </Button>
        </Actions>
      </ModalContainer>
    </Overlay>
  )
}