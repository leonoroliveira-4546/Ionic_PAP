import React, { useState, useEffect } from 'react';
import { IonText, IonSpinner } from '@ionic/react';
import VideoCard from './VideoCardMobile';
import comunidadeApi from '../hooks/comunidadeApi';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration?: string;
}

interface YouTubeFeedProps {
  category?: 'lives' | 'videos';
  limit?: number;
  onLoaded?: (count: number) => void;
}

const YouTubeFeed: React.FC<YouTubeFeedProps> = ({ category = 'videos', limit = 10, onLoaded }) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const { getYoutubeVideos, getLives } = comunidadeApi();

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        let data: any = [];

        if (category === 'lives') {
          data = await getLives(limit);
        } else {
          data = await getYoutubeVideos(limit);
        }

        // Handle both array and {data: array} response formats
        const videoArray = Array.isArray(data) ? data : (data?.data || []);

        // Transform API response to VideoCard format
        const transformedVideos = videoArray.map((video: YouTubeVideo) => ({
          id: video.videoId,
          videoId: video.videoId,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          publishedAt: video.publishedAt,
          duration: video.duration || 'PT0S',
          isLive: category === 'lives'
        }));

        setVideos(transformedVideos);
        onLoaded?.(transformedVideos.length);
      } catch (error) {
        console.error(`Error loading ${category}:`, error);
        setVideos([]);
        onLoaded?.(0);
      } finally {
        setLoading(false);
      }
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
          key={video.videoId}
          video={video}
          isSelected={selectedVideoId === video.videoId}
          onClick={() => setSelectedVideoId(prev => (prev === video.videoId ? null : video.videoId))}
        />
      ))}
    </div>
  );
};

export default YouTubeFeed;