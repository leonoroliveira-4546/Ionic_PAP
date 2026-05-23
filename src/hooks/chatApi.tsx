import api from "../components/AxiosInstance"
import Cookies from 'js-cookie';

export const chatApi = () => {
  const fetchConversations = async () => {
    const { data } = await api.get('/conversations');
    return data
  };

  
  return { fetchConversations };
};

export default chatApi;