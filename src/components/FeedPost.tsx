import React, { useState } from 'react';
import {
  IonCard, IonCardContent, IonAvatar, IonText, IonIcon,
  IonButton, IonImg, IonList, IonItem, IonInput, IonLabel
} from '@ionic/react';
import { heartOutline, heart, chatbubbleOutline, sendOutline } from 'ionicons/icons';
import { Post } from '../mockData/posts';

interface FeedPostProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, comment: string) => void;
}

const FeedPost: React.FC<FeedPostProps> = ({ post, onLike, onComment }) => {
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleLike = () => {
    setLiked(!liked);
    onLike?.(post.id);
  };

  const handleComment = () => {
    if (newComment.trim()) {
      onComment?.(post.id, newComment);
      setNewComment('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <IonCard style={{ margin: '12px 0', borderRadius: 12 }}>
      {/* Header */}
      <IonCardContent style={{ padding: '12px 16px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <IonAvatar style={{ width: 40, height: 40 }}>
            <img src={post.author.avatar} alt={post.author.name} />
          </IonAvatar>
          <div style={{ flex: 1 }}>
            <IonText style={{ fontWeight: 600, fontSize: 14 }}>
              {post.author.name}
            </IonText>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <IonText color="medium" style={{ fontSize: 12 }}>
                {formatDate(post.timestamp)}
              </IonText>
              <span
                style={{
                  backgroundColor: getBeltColor(post.author.belt),
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: 8,
                  fontSize: 10,
                  fontWeight: 500
                }}
              >
                {post.author.belt}
              </span>
            </div>
          </div>
        </div>
      </IonCardContent>

      {/* Content */}
      <IonCardContent style={{ padding: '0 16px 12px' }}>
        <IonText style={{ lineHeight: 1.4 }}>
          {post.content}
        </IonText>
      </IonCardContent>

      {/* Image */}
      {post.image && (
        <div style={{ padding: '0 16px' }}>
          <IonImg
            src={post.image}
            style={{
              width: '100%',
              height: 200,
              objectFit: 'cover',
              borderRadius: 8
            }}
          />
        </div>
      )}

      {/* Actions */}
      <IonCardContent style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <IonButton
            fill="clear"
            size="small"
            onClick={handleLike}
            style={{ '--padding-start': 0, '--padding-end': 0 }}
          >
            <IonIcon
              icon={liked ? heart : heartOutline}
              color={liked ? 'danger' : 'medium'}
              slot="icon-only"
            />
            <IonText color="medium" style={{ fontSize: 12, marginLeft: 4 }}>
              {post.likes + (liked ? 1 : 0)}
            </IonText>
          </IonButton>

          <IonButton
            fill="clear"
            size="small"
            onClick={() => setShowComments(!showComments)}
            style={{ '--padding-start': 0, '--padding-end': 0 }}
          >
            <IonIcon icon={chatbubbleOutline} color="medium" slot="icon-only" />
            <IonText color="medium" style={{ fontSize: 12, marginLeft: 4 }}>
              {post.comments.length}
            </IonText>
          </IonButton>
        </div>
      </IonCardContent>

      {/* Comments */}
      {showComments && (
        <IonCardContent style={{ padding: '0 16px 12px' }}>
          <IonList style={{ background: 'transparent' }}>
            {post.comments.map(comment => (
              <IonItem key={comment.id} lines="none" style={{ '--padding-start': 0, '--padding-end': 0 }}>
                <IonAvatar slot="start" style={{ width: 32, height: 32 }}>
                  <img src={comment.author.avatar} alt={comment.author.name} />
                </IonAvatar>
                <IonLabel>
                  <IonText style={{ fontWeight: 600, fontSize: 13 }}>
                    {comment.author.name}
                  </IonText>
                  <p style={{ margin: '4px 0 0', fontSize: 14 }}>{comment.content}</p>
                  <IonText color="medium" style={{ fontSize: 11 }}>
                    {formatDate(comment.timestamp)}
                  </IonText>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>

          {/* Add comment */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <IonInput
              value={newComment}
              placeholder="Escreva um comentário..."
              onIonChange={e => setNewComment(e.detail.value!)}
              style={{ flex: 1, '--border-radius': '20px' }}
            />
            <IonButton
              fill="clear"
              onClick={handleComment}
              disabled={!newComment.trim()}
            >
              <IonIcon icon={sendOutline} />
            </IonButton>
          </div>
        </IonCardContent>
      )}
    </IonCard>
  );
};

const getBeltColor = (belt: string) => {
  const colors: Record<string, string> = {
    'Branca': '#ffffff',
    'Amarela': '#ffd700',
    'Laranja': '#ff8c00',
    'Verde': '#008000',
    'Azul': '#0000ff',
    'Roxa': '#800080',
    'Marrom': '#8b4513',
    'Preta': '#000000'
  };
  return colors[belt] || '#666666';
};

export default FeedPost;