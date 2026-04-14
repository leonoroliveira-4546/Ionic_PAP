import React, { useState, useEffect } from 'react';
import { IonText, IonSpinner } from '@ionic/react';
import VideoCard from './VideoCard';
import { Video, mockVideos } from '../mockData/videos';

interface YouTubeFeedProps {
  category?: 'noticias' | 'lives' | 'videos';
  limit?: number;
}

const YouTubeFeed: React.FC<YouTubeFeedProps> = ({ category, limit = 10 }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadVideos = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredVideos = mockVideos;

      if (category) {
        if (category === 'lives') {
          filteredVideos = mockVideos.filter(v => v.isLive);
        } else if (category === 'noticias') {
          filteredVideos = mockVideos.filter(v => v.category === 'noticias');
        } else {
          filteredVideos = mockVideos.filter(v => v.category !== 'historia' && v.category !== 'filosofia' && v.category !== 'tecnicas');
        }
      }

      // Sort by published date (newest first)
      filteredVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      setVideos(filteredVideos.slice(0, limit));
      setLoading(false);
    };

    loadVideos();
  }, [category, limit]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <IonSpinner name="crescent" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <IonText color="medium">
          <p>Sem vídeos disponíveis no momento.</p>
        </IonText>
      </div>
    );
  }

  return (
    <div>
      {videos.map(video => (
        <VideoCard
          key={video.id}
          video={video}
          onClick={() => {
            // Simulate opening video
            console.log('Opening video:', video.url);
            // In a real app, this would open the video URL
          }}
        />
      ))}
    </div>
  );
};

export default YouTubeFeed;