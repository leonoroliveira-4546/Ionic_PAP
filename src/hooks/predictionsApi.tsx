import { useCallback } from 'react';
import api from '../components/AxiosInstance';

export const predictionsApi = () => {
  const getTournaments = useCallback(async () => {
    const { data } = await api.get('/predictions/tournaments');
    return data;
  }, []);

  const getMyPredictions = useCallback(async () => {
    const { data } = await api.get('/predictions/my');
    return data;
  }, []);

  const submitPrediction = useCallback(async (tournamentId: string, predictedWinner: string) => {
    const { data } = await api.post('/predictions', { tournamentId, predictedWinner });
    return data;
  }, []);

  return { getTournaments, getMyPredictions, submitPrediction };
};

export default predictionsApi;
