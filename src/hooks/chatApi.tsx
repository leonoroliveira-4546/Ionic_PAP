import api from "../components/AxiosInstance"
import Cookies from 'js-cookie';

export const chatApi = () => {
  const fetchConversations = async () => {
    const { data } = await api.get('/conversations');
    return data
  };

  

  const signup = async (user: User): Promise<any> => {
    const { data } = await api.post("/register", user);
    return data;
  };

  const logout = async () => {
    Login(null);
    Cookies.remove('auth')
    await api.post("/logout");
  };

  return { login, signup, logout, calculateAge, inviteResponsavel, confirmResponsavelInvite, addPerformance, getPerformance, addAbsence, getAbsencesByMonth };
};

export default authApi;