'use client'
import { useState, useEffect } from 'react'
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
  z-index: 2000;
  padding: 2rem;
`

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
`

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  background: rgba(255, 255, 255, 0.8);

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`

const Button = styled.button`
  flex: 1;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

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

interface App {
  id: number;
  title: string;
  description: string;
  url: string;
  github_url?: string;
  image_url?: string;
  tech_stack?: string;
}

interface AppFormProps {
  app?: App | null;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function AppForm({ app, onSubmit, onCancel }: AppFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    github_url: '',
    image_url: '',
    tech_stack: '',
    admin_password: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (app) {
      setFormData({
        title: app.title || '',
        description: app.description || '',
        url: app.url || '',
        github_url: app.github_url || '',
        image_url: app.image_url || '',
        tech_stack: app.tech_stack || '',
        admin_password: ''
      })
    }
  }, [app])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const method = app ? 'PUT' : 'POST'
      const url = app ? `/api/apps/${app.id}` : '/api/apps'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onSubmit()
      } else {
        const data = await response.json()
        alert(data.error || '저장에 실패했습니다.')
      }
    } catch (error) {
      console.error('앱 저장에 실패했습니다:', error)
      alert('앱 저장에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !window.getSelection()?.toString()) {
      onCancel()
    }
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <FormContainer>
        <Title>{app ? '앱 수정' : '새 앱 추가'}</Title>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="title">앱 이름 *</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="예: 날씨 앱"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">설명</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="앱에 대한 간단한 설명을 입력하세요"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="url">앱 URL</Label>
            <Input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://myapp.com"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="image_url">이미지 URL</Label>
            <Input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="admin_password">관리자 비밀번호 *</Label>
            <Input
              type="password"
              id="admin_password"
              name="admin_password"
              value={formData.admin_password}
              onChange={handleChange}
              required
              placeholder="관리자 비밀번호를 입력하세요"
            />
          </FormGroup>

          <Actions>
            <Button type="button" className="secondary" onClick={onCancel}>
              취소
            </Button>
            <Button type="submit" className="primary" disabled={loading}>
              {app ? '수정하기' : '추가하기'}
            </Button>
          </Actions>
        </form>
      </FormContainer>
    </Overlay>
  )
}