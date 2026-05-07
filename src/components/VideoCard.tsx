import React from 'react';
import { IonCard, IonCardContent, IonText, IonAvatar, IonIcon } from '@ionic/react';
import { play, timeOutline } from 'ionicons/icons';

interface VideoCardProps {
  video: any;
  onClick?: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'há 1 dia';
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
    return date.toLocaleDateString('pt-BR');
  };

  // Provide default values for optional properties
  const channelName = video.channelName || video.channel || 'FNK Portugal';
  const channelAvatar = video.channelAvatar || 'https://yt3.googleusercontent.com/ytc/AIdro_moYaXO4Ot0i8F-khP_WYiXqFZ6g4Yvmq0h0OE=s88-c-k-c0x00ffffff-no-rj';
  const views = video.views || 0;
  const duration = video.duration || '00:00';

  return (
    <IonCard
      style={{
        margin: '8px 0',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
      button={!!onClick}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative' }}>
        <img
          src={video.thumbnail}
          alt={video.title}
          style={{
            width: '100%',
            height: 180,
            objectFit: 'cover'
          }}
        />

        {/* Duration/Live Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: video.isLive ? '#ff0000' : 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            animation: video.isLive ? 'pulse 2s infinite' : 'none'
          }}
        >
          {video.isLive ? (
            <>
              <div
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s infinite'
                }}
              />
              LIVE
            </>
          ) : (
            <>
              <IonIcon icon={timeOutline} style={{ fontSize: 10 }} />
              {duration}
            </>
          )}
        </div>

        {/* Play Button Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
        >
          <IonIcon icon={play} style={{ color: 'white', fontSize: 20 }} />
        </div>
      </div>

      {/* Content */}
      <IonCardContent style={{ padding: '12px 16px' }}>
        <IonText style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 8, display: 'block' }}>
          {video.title}
        </IonText>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <IonAvatar style={{ width: 24, height: 24 }}>
            <img src={channelAvatar} alt={channelName} />
          </IonAvatar>
          <IonText color="medium" style={{ fontSize: 13 }}>
            {channelName}
          </IonText>
        </div>

        <IonText color="medium" style={{ fontSize: 12 }}>
          {formatViews(views)} visualizações • {formatDate(video.publishedAt)}
        </IonText>
      </IonCardContent>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </IonCard>
  );
};

export default VideoCard;