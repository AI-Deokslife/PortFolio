'use client'
import styled from 'styled-components'

const Card = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  }
`

const ProjectType = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: #dc3545;
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
`

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`

const AppImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`

const PlaceholderImage = styled.div`
  color: #adb5bd;
  font-size: 3rem;
`

const CardContent = styled.div`
  padding: 1.5rem;
`

const Title = styled.h3`
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.3;
`

const Description = styled.p`
  color: #6c757d;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 0.9rem;
`

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid #f8f9fa;
  padding-top: 1rem;
  margin-top: 1rem;
`

const ActionButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  font-size: 0.8rem;
  background: #ffffff;
  color: #6c757d;

  &:hover {
    background: #f8f9fa;
    border-color: #dee2e6;
  }

  &.danger {
    color: #dc3545;
    border-color: #f8d7da;
    
    &:hover {
      background: #f8d7da;
      border-color: #f1aeb5;
    }
  }
`

interface App {
  id: number;
  title: string;
  description: string;
  url?: string;
  github_url?: string;
  image_url?: string;
  tech_stack?: string;
}

interface AppCardProps {
  app: App;
  onEdit: (app: App) => void;
  onDelete: (id: number) => void;
}

export default function AppCard({ app, onEdit, onDelete }: AppCardProps) {
  const handleEdit = () => onEdit(app)
  const handleDelete = () => onDelete(app.id)

  return (
    <Card>
      <ProjectType>웹 프로젝트</ProjectType>
      <ImageContainer>
        {app.image_url ? (
          <AppImage 
            src={app.image_url}
            alt={app.title} 
          />
        ) : (
          <PlaceholderImage>💻</PlaceholderImage>
        )}
      </ImageContainer>
      
      <CardContent>
        <Title>{app.title}</Title>
        <Description>{app.description}</Description>
        
        <Actions>
          <ActionButton onClick={handleEdit}>
            편집
          </ActionButton>
          <ActionButton className="danger" onClick={handleDelete}>
            삭제
          </ActionButton>
        </Actions>
      </CardContent>
    </Card>
  )
}