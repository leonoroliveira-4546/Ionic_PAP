import api from "../components/AxiosInstance"

export const chatApi = () => {
  const fetchConversations = async () => {
    const { data } = await api.get('/conversations');
    return data;
  };

  const fetchMessages = async (conversationId: string) => {
    const { data } = await api.get(`/conversations/${conversationId}/messages`);
    return data;
  };

  return { fetchConversations, fetchMessages };
};

export default chatApi;