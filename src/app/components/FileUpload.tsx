'use client'
import { useState, useRef } from 'react'
import styled from 'styled-components'

const FileUploadArea = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${props => props.isDragging ? '#667eea' : '#e1e5e9'};
  border-radius: 10px;
  padding: 2rem;
  text-align: center;
  background: ${props => props.isDragging ? 'rgba(102, 126, 234, 0.05)' : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }

  .upload-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
    color: #667eea;
  }

  .upload-text {
    color: #555;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .upload-hint {
    color: #999;
    font-size: 0.8rem;
  }
`

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e1e5e9;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);

  .file-icon {
    font-size: 2rem;
    color: #667eea;
  }

  .file-info {
    flex: 1;
    
    .filename {
      font-weight: 500;
      color: #333;
      margin-bottom: 0.25rem;
      word-break: break-all;
    }
    
    .filesize {
      font-size: 0.8rem;
      color: #666;
    }
  }

  .remove-btn {
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.5rem;
    cursor: pointer;
    font-size: 0.8rem;
    
    &:hover {
      background: #c82333;
    }
  }
`

const UploadProgress = styled.div`
  margin-top: 1rem;
  
  .progress-bar {
    width: 100%;
    height: 4px;
    background: #e1e5e9;
    border-radius: 2px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: #667eea;
      transition: width 0.3s ease;
    }
  }
  
  .progress-text {
    text-align: center;
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.5rem;
  }
`

interface UploadedFile {
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
}

interface FileUploadProps {
  onFileUploaded: (file: UploadedFile) => void;
  currentFile?: UploadedFile | null;
  onFileRemoved: () => void;
}

export default function FileUpload({ onFileUploaded, currentFile, onFileRemoved }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/upload-file', {
        method: 'POST',
        body: formDataUpload
      })

      if (response.ok) {
        const data = await response.json()
        const uploadedFile: UploadedFile = {
          url: data.url,
          fileName: data.fileName,
          originalName: data.originalName,
          fileSize: data.fileSize,
          fileType: data.fileType
        }
        onFileUploaded(uploadedFile)
        setUploadProgress(100)
      } else {
        const errorData = await response.json()
        
        // 더 상세한 에러 메시지 표시
        let errorMessage = errorData.error || '파일 업로드에 실패했습니다.'
        if (errorData.details) {
          errorMessage += `\n\n상세 정보: ${errorData.details}`
        }
        if (errorData.code) {
          errorMessage += `\n오류 코드: ${errorData.code}`
        }
        
        alert(errorMessage)
        console.error('Upload error details:', errorData)
      }
    } catch (error) {
      console.error('파일 업로드 오류:', error)
      alert(`파일 업로드 중 네트워크 오류가 발생했습니다.\n\n${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const file = files[0]
    
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string, fileName: string) => {
    const name = fileName.toLowerCase()
    
    // 이미지 파일
    if (fileType.startsWith('image/')) return '🖼️'
    
    // Microsoft Office 파일
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.xlsm')) return '📊'
    if (name.endsWith('.docx') || name.endsWith('.doc') || name.endsWith('.docm')) return '📝'
    if (name.endsWith('.pptx') || name.endsWith('.ppt') || name.endsWith('.pptm')) return '📽️'
    
    // 실행파일
    if (name.endsWith('.exe') || name.endsWith('.msi') || name.endsWith('.dmg')) return '⚙️'
    
    // 압축파일
    if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z') || 
        name.endsWith('.tar') || name.endsWith('.gz')) return '🗜️'
    
    // 문서 파일
    if (name.endsWith('.pdf')) return '📄'
    if (name.endsWith('.txt') || name.endsWith('.rtf')) return '📝'
    if (name.endsWith('.csv')) return '📈'
    
    // 개발 파일
    if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.py') || 
        name.endsWith('.java') || name.endsWith('.c') || name.endsWith('.cpp')) return '💻'
    if (name.endsWith('.html') || name.endsWith('.css') || name.endsWith('.scss')) return '🌐'
    if (name.endsWith('.json') || name.endsWith('.xml') || name.endsWith('.yml') || name.endsWith('.yaml')) return '⚙️'
    
    // 기본값
    return '📦'
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="image/*,.exe,.msi,.dmg,.zip,.rar,.7z,.tar,.gz,.pdf,.txt,.csv,.json,.xlsx,.xls,.docx,.doc,.pptx,.ppt,.rtf,.odt,.ods,.odp,.html,.css,.js,.ts,.py,.java,.c,.cpp,.xml,.yml,.yaml,.md,.sql"
      />
      
      {!currentFile && !isUploading && (
        <FileUploadArea
          isDragging={isDragging}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleUploadAreaClick}
        >
          <span className="upload-icon">📁</span>
          <div className="upload-text">파일을 드래그하거나 클릭해서 업로드</div>
          <div className="upload-hint">엑셀, 워드, PPT, 실행파일, 압축파일, 이미지, 개발파일 등 (최대 50MB)</div>
        </FileUploadArea>
      )}
      
      {isUploading && (
        <UploadProgress>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
          <div className="progress-text">파일 업로드 중...</div>
        </UploadProgress>
      )}
      
      {currentFile && (
        <FilePreview>
          <div className="file-icon">
            {getFileIcon(currentFile.fileType, currentFile.originalName)}
          </div>
          <div className="file-info">
            <div className="filename">{currentFile.originalName}</div>
            <div className="filesize">{formatFileSize(currentFile.fileSize)}</div>
          </div>
          <button type="button" className="remove-btn" onClick={onFileRemoved}>
            삭제
          </button>
        </FilePreview>
      )}
    </div>
  )
}