import { useCallback } from 'react';
import api from '../components/AxiosInstance';

export const educationalApi = () => {
  const getEducationalContent = useCallback(async () => {
    const { data } = await api.get('/educational');
    return data;
  }, []);

  return { getEducationalContent };
};

export default educationalApi;
