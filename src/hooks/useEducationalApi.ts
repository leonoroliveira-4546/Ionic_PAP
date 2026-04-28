import { useCallback, useEffect, useState } from 'react';
import api from '../components/AxiosInstance';

export interface EducationalVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelName: string;
  channelAvatar: string;
  duration: string;
  views: number;
  publishedAt: string;
  category: 'historia' | 'filosofia' | 'tecnicas' | 'noticias' | 'lives';
  isLive?: boolean;
  url: string;
}

export const useEducationalApi = () => {
  const [videos, setVideos] = useState<EducationalVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/educational/videos');
      setVideos(data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar conteúdos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return { videos, loading, error, fetchVideos };
};

export default useEducationalApi;
