import React from 'react';
import { IonCard, IonCardContent, IonText, IonIcon } from '@ionic/react';
import { play, timeOutline } from 'ionicons/icons';

interface VideoCardProps {
  video: any;
  onClick?: () => void;
  isSelected?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, isSelected = false }) => {
  const formatDuration = (duration: string) => {
    if (!duration) return '00:00';
    const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!matches) return duration;
    const hours = Number(matches[1] || 0);
    const minutes = Number(matches[2] || 0);
    const seconds = Number(matches[3] || 0);
    const parts = [];
    if (hours > 0) parts.push(hours.toString());
    parts.push(hours > 0 ? minutes.toString().padStart(2, '0') : minutes.toString());
    parts.push(seconds.toString().padStart(2, '0'));
    return parts.join(':');
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

  const durationText = formatDuration(video.duration || 'PT0S');

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault?.();
    if (!isSelected) {
      onClick?.();
    }
  };

  const handleCloseButton = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault?.();
    e.stopPropagation();
    onClick?.();
  };

  return (
    <IonCard
      style={{
        margin: '8px 0',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: !isSelected ? 'pointer' : 'default',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        touchAction: 'manipulation',
        WebkitTouchCallout: 'none'
      }}
      button={!isSelected}
      onClick={!isSelected ? onClick : undefined}
      onTouchEnd={handleTouchEnd}
    >
      {/* Thumbnail container - Hidden when selected */}
      {!isSelected && (
        <div style={{ position: 'relative' }}>
          <img
            src={video.thumbnail}
            alt={video.title}
            style={{
              width: '100%',
              height: 180,
              objectFit: 'cover',
              display: 'block'
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
              animation: video.isLive ? 'pulse 2s infinite' : 'none',
              pointerEvents: 'none'
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
                {durationText}
              </>
            )}
          </div>

          {/* Play Overlay */}
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
              transition: 'all 0.3s ease',
              pointerEvents: 'none'
            }}
          >
            <IonIcon icon={play} style={{ color: 'white', fontSize: 20 }} />
          </div>
        </div>
      )}

      {/* Video Player Container - Shown when selected */}
      {isSelected && (
        <div style={{ position: 'relative', width: '100%' }}>
          <iframe
            width="100%"
            height="auto"
            src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1&controls=1&fs=1&autoplay=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={video.title}
            style={{
              width: '100%',
              aspectRatio: '16 / 9',
              minHeight: '200px',
              borderRadius: 12,
              border: 'none',
              display: 'block',
              pointerEvents: 'auto'
            }}
          />

          {/* Close Button */}
          <button
            onClick={handleCloseButton}
            onTouchEnd={handleCloseButton}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(0,0,0,0.85)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              fontSize: '22px',
              transition: 'background-color 0.2s ease',
              WebkitTapHighlightColor: 'transparent',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              touchAction: 'manipulation',
              WebkitTouchCallout: 'none'
            }}
            title="Fechar vídeo"
          >
            ✕
          </button>
        </div>
      )}

      {/* Content */}
      {!isSelected && (
        <IonCardContent style={{ padding: '12px 16px' }}>
          <IonText style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 8, display: 'block', color: '#000' }}>
            {video.title}
          </IonText>

        <IonText color="medium" style={{ fontSize: 12 }}>
          {formatDate(video.publishedAt)}
        </IonText>
      </IonCardContent>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        button:active {
          transform: scale(0.95);
        }
      `}</style>
    </IonCard>
  );
};

export default VideoCard;