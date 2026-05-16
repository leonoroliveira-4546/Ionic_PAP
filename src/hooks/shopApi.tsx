import { useCallback } from 'react';
import api from '../components/AxiosInstance';

export const shopApi = () => {
  const getProducts = useCallback(async () => {
    const { data } = await api.get('/shop/products');
    return data;
  }, []);

  const getAdminProducts = useCallback(async () => {
    const { data } = await api.get('/shop/admin/products');
    return data;
  }, []);

  const updateProduct = useCallback(async (id: string, payload: any) => {
    const { data } = await api.put(`/shop/products/${id}`, payload);
    return data;
  }, []);

  return { getProducts, getAdminProducts, updateProduct };
};

export default shopApi;
