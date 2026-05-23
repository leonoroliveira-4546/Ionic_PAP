import { useCallback } from 'react'
import api from '../components/AxiosInstance'

export interface UserProfilePayload {
  username?: string
  name?: string
  belt?: string
  file?: File
}

export const userApi = () => {
  const getProfile = useCallback(async () => {
    const { data } = await api.get('/profile')
    return data
  }, [])

  const updateProfile = useCallback(async (formData: FormData) => {
    const { data } = await api.put('/profile', formData)
    return data
  }, [])

  const changePassword = useCallback(async (newPassword: string) => {
    const { data } = await api.put('/profile/password', { newPassword })
    return data
  }, [])

  const getRanking = useCallback(async () => {
    const { data } = await api.get('/ranking')
    return data
  }, [])

  return { getProfile, updateProfile, changePassword, getRanking }
}

export default userApi
