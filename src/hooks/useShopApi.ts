import { useCallback, useEffect, useState } from 'react';
import api from '../components/AxiosInstance';

export interface ShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Kimono' | 'Equipamento' | 'Faixa' | 'Acessório';
  image: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badge?: 'Novo' | 'Mais Vendido' | 'Promoção';
  originalPrice?: number;
}

export const useShopApi = () => {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/shop/products');
      setProducts(data.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, fetchProducts };
};

export default useShopApi;
