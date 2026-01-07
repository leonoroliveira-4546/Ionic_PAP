import axios from "axios";
import Cookies from 'js-cookie';

export interface User {
  email: string;
  password: string;
}

export interface UserDatabase {
  _id: string;
  username: string;
  profilePic: string;
  password: string;
  email: string;
  type: string;
}

const url = "http://localhost:8000";

export const authApi = (user: UserDatabase | null, Login: (userData: any) => void) => {

  const login = async (user: User): Promise<any> => {
    try {
      const response = await axios.post(`${url}/login`, user, { withCredentials: true });
      Login(response.data);

      return {success: true, data: response.data};
    } catch (error: any) {
      const msg = error.response?.data || error.message || "Erro desconhecido";
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    Login(null);
    localStorage.removeItem("user");
    await axios.post(`${url}/logout`, user, { withCredentials: true });
    Cookies.remove('auth')
  }

  return { login, logout};
};

export default authApi;