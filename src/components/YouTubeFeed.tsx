import React, { useState, useEffect } from 'react';
import { IonText, IonSpinner } from '@ionic/react';
import VideoCard from './VideoCard';
import comunidadeApi from '../hooks/comunidadeApi';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

interface YouTubeFeedProps {
  category?: 'lives' | 'videos';
  limit?: number;
}

const YouTubeFeed: React.FC<YouTubeFeedProps> = ({ category = 'videos', limit = 10 }) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
          url: `https://www.youtube.com/watch?v=${video.videoId}`,
          isLive: category === 'lives',
          channel: 'FNK Portugal',
          views: 0
        }));

        setVideos(transformedVideos);
      } catch (error) {
        console.error(`Error loading ${category}:`, error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [category, limit, getYoutubeVideos, getLives]);

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
          onClick={() => {
            // Open video URL in new window
            window.open(video.url, '_blank');
          }}
        />
      ))}
    </div>
  );
};

export default YouTubeFeed;