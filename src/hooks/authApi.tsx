import axios from "axios";
import Cookies from 'js-cookie';

export interface User{
  username: string;
  password: string;
  email: string;
  type: string;
  birthDate: string;
  dojoId: string;
  responsavelId: string;
}

const url = "http://localhost:8000";

export const authApi = (Login: (userData: any) => void) => {

  const login = async (idToken: string): Promise<any> => {
    try {
      const response = await axios.post(`${url}/login`, { idToken }, { withCredentials: true });
      
      Login(response.data.user);
      return {success: true, data: response.data};
    } catch (error: any) {
      const msg = error.response?.data || error.message || "Erro desconhecido";
      return { success: false, error: msg };
    }
  };

  const signup = async (user: User): Promise<any> => {
    try {
      const response = await axios.post(`${url}/register`, user);
      return {success: true, data: response.data};
    } catch (error: any) {
      const msg = error.response?.data || error.message || 'Erro desconhecido';
      return { success: false, error: msg};
    }
  };

  const logout = async () => {
    Login(null);
    Cookies.remove('auth')
    await axios.post(`${url}/logout`, {}, { withCredentials: true });
  }

  return { login, signup, logout};
};

export default authApi;