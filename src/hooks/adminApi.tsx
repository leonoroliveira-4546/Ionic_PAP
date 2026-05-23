import { useCallback } from 'react'
import api from '../components/AxiosInstance'

export const adminApi = () => {
  const getUsers = useCallback(async () => {
    const { data } = await api.get('/admin/users')
    return data
  }, [])

  const updateUser = useCallback(async (id: string, payload: any) => {
    const { data } = await api.put(`/admin/users/${id}`, payload)
    return data
  }, [])

  const deleteUser = useCallback(async (id: string) => {
    const { data } = await api.delete(`/admin/users/${id}`)
    return data
  }, [])

  const resetRanking = useCallback(async () => {
    const { data } = await api.post('/admin/reset-ranking')
    return data
  }, [])

  return { getUsers, updateUser, deleteUser, resetRanking }
}

export default adminApi
