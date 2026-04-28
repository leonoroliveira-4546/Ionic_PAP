import { useCallback, useEffect, useState } from 'react';
import api from '../components/AxiosInstance';

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export const usePlansApi = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/plans');
      setPlans(data.data || []);
      setCurrentPlan(data.currentPlan || 'free');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar planos');
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribePlan = useCallback(async (planId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/plans/subscribe', { planId });
      if (data.success) {
        setCurrentPlan(data.currentPlan);
      }
      return data;
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erro ao atualizar plano';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, currentPlan, loading, error, fetchPlans, subscribePlan };
};

export default usePlansApi;
