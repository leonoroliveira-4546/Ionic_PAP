import { useCallback } from 'react'
import api from '../components/AxiosInstance'

export const educationalApi = () => {
  const getEducationalContent = useCallback(async () => {
    const { data } = await api.get('/educational')
    return data
  }, [])

  const createChallenge = useCallback(async (payload: any) => {
    const { data } = await api.post('/educational/challenges', payload)
    return data
  }, [])

  const getCurrentChallenge = useCallback(async (dojoId: string) => {
    const { data } = await api.get(`/educational/challenges/${dojoId}/current`)
    return data
  }, [])

  const getChallengesByDojo = useCallback(async (dojoId: string) => {
    const { data } = await api.get(`/educational/challenges/${dojoId}/all`)
    return data
  }, [])

  const getChallengeResponses = useCallback(async (challengeId: string) => {
    const { data } = await api.get(`/educational/challenges/${challengeId}/responses`)
    return data
  }, [])

  const getUserChallengeResponse = useCallback(async (challengeId: string) => {
    const { data } = await api.get(`/educational/challenges/${challengeId}/user-response`)
    return data
  }, [])

  const submitChallengeResponse = useCallback(async (challengeId: string, response: string) => {
    const { data } = await api.post(`/educational/challenges/${challengeId}/response`, { response })
    return data
  }, [])

  const updateChallenge = useCallback(async (challengeId: string, payload: any) => {
    const { data } = await api.put(`/educational/challenges/${challengeId}`, payload)
    return data
  }, [])

  const deleteChallenge = useCallback(async (challengeId: string) => {
    const { data } = await api.delete(`/educational/challenges/${challengeId}`)
    return data
  }, [])

  const createEducationalContent = useCallback(async (payload: any) => {
    const { data } = await api.post('/educational', payload)
    return data
  }, [])

  const updateEducationalContent = useCallback(async (contentId: string, payload: any) => {
    const { data } = await api.put(`/educational/${contentId}`, payload)
    return data
  }, [])

  const submitEducationalGameResponse = useCallback(async (contentId: string, answer: string) => {
    const { data } = await api.post(`/educational/${contentId}/submit`, { answer })
    return data
  }, [])

  const deleteEducationalContent = useCallback(async (contentId: string) => {
    const { data } = await api.delete(`/educational/${contentId}`)
    return data
  }, [])

  return {
    getEducationalContent,
    createChallenge,
    getCurrentChallenge,
    getChallengesByDojo,
    getChallengeResponses,
    getUserChallengeResponse,
    submitChallengeResponse,
    updateChallenge,
    deleteChallenge,
    createEducationalContent,
    updateEducationalContent,
    deleteEducationalContent,
    submitEducationalGameResponse
  }
}

export default educationalApi
