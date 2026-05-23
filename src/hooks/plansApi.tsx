import { useCallback } from 'react'
import api from '../components/AxiosInstance'

export const plansApi = () => {
  const getPlans = useCallback(async () => {
    const { data } = await api.get('/plans')
    return data
  }, [])

  const updatePlan = useCallback(async (id: string, payload: any) => {
    const { data } = await api.put(`/plans/${id}`, payload)
    return data
  }, [])

  const createPlan = useCallback(async (payload: any) => {
    const { data } = await api.post('/plans', payload)
    return data
  }, [])

  return { getPlans, updatePlan, createPlan }
}

export default plansApi