import { useCallback, useEffect, useState } from 'react';
import api from '../components/AxiosInstance';

export interface TournamentParticipant {
  id: string;
  name: string;
  avatar: string;
  belt: string;
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'open' | 'closed' | 'finished';
  winner?: string;
  participants: TournamentParticipant[];
}

export interface Prediction {
  id: string;
  userId: string;
  tournamentId: string;
  predictedWinner: string;
  pointsEarned?: number;
  timestamp: string;
}

export const usePredictionsApi = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tournamentsRes, predictionsRes] = await Promise.all([
        api.get('/predictions/tournaments'),
        api.get('/predictions/my'),
      ]);
      setTournaments(tournamentsRes.data.data || []);
      setPredictions(predictionsRes.data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar predições');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitPrediction = useCallback(async (tournamentId: string, predictedWinner: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/predictions', { tournamentId, predictedWinner });
      if (data.success && data.prediction) {
        setPredictions((prev) => {
          const filtered = prev.filter((p) => p.tournamentId !== tournamentId);
          return [data.prediction, ...filtered];
        });
      }
      return data;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erro ao enviar predição';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { tournaments, predictions, loading, error, fetchData, submitPrediction };
};

export default usePredictionsApi;
