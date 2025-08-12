'use client'
import styled from 'styled-components'
import { useEffect } from 'react'

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: pointer;
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
  
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`

const ModalImage = styled.img`
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  transform: scale(0.9);
  animation: zoomIn 0.3s ease-out forwards;
  cursor: default;
  
  @keyframes zoomIn {
    to {
      transform: scale(1);
    }
  }
  
  @media (max-width: 768px) {
    max-width: 95vw;
    max-height: 85vh;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #333;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    top: 1rem;
    right: 1rem;
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
`

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageModal({ src, alt, onClose }: ImageModalProps) {
  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // 스크롤 방지
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [onClose])

  const handleOverlayClick = (event: React.MouseEvent) => {
    // 이미지를 클릭했을 때는 모달이 닫히지 않도록
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <CloseButton onClick={onClose}>×</CloseButton>
      <ModalImage 
        src={src} 
        alt={alt}
        onClick={(e) => e.stopPropagation()}
      />
    </ModalOverlay>
  )
}