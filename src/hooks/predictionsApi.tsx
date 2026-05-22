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

  const createTournament = useCallback(async (payload: any) => {
    const { data } = await api.post('/predictions/tournaments', payload);
    return data;
  }, []);

  const updateTournament = useCallback(async (tournamentId: string, payload: any) => {
    const { data } = await api.put(`/predictions/tournaments/${tournamentId}`, payload);
    return data;
  }, []);

  const deleteTournament = useCallback(async (tournamentId: string) => {
    const { data } = await api.delete(`/predictions/tournaments/${tournamentId}`);
    return data;
  }, []);

  return { getTournaments, getMyPredictions, submitPrediction, createTournament, updateTournament, deleteTournament };
};

export default predictionsApi;
