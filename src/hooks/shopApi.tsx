import { useCallback } from 'react'
import api from '../components/AxiosInstance'

export const shopApi = () => {
  // Products
  const getProducts = useCallback(async () => {
    const { data } = await api.get('/shop/products')
    return data
  }, [])

  const getAdminProducts = useCallback(async () => {
    const { data } = await api.get('/shop/admin/products')
    return data
  }, [])

  const getMyProducts = useCallback(async () => {
    const { data } = await api.get('/shop/my/products')
    return data
  }, [])

  const createProduct = useCallback(async (payload: any) => {
    const { data } = await api.post('/shop/products', payload)
    return data
  }, [])

  const updateProduct = useCallback(async (id: string, payload: any) => {
    const { data } = await api.put(`/shop/products/${id}`, payload)
    return data
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    const { data } = await api.delete(`/shop/products/${id}`)
    return data
  }, [])

  // Orders
  const createOrder = useCallback(async (payload: any) => {
    const { data } = await api.post('/shop/orders', payload)
    return data
  }, [])

  const createCheckoutSession = useCallback(async (payload: any) => {
    const { data } = await api.post('/shop/checkout', payload)
    return data
  }, [])

  const getAdminOrders = useCallback(async () => {
    const { data } = await api.get('/shop/admin/orders')
    return data
  }, [])

  const getUserOrders = useCallback(async () => {
    const { data } = await api.get('/shop/orders')
    return data
  }, [])

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    const { data } = await api.put(`/shop/orders/${id}/status`, { status })
    return data
  }, [])

  return { 
    getProducts, 
    getAdminProducts, 
    getMyProducts,
    createProduct,
    updateProduct, 
    deleteProduct,
    createOrder,
    createCheckoutSession,
    getAdminOrders,
    getUserOrders,
    updateOrderStatus
  }
}

export default shopApi
