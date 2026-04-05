import api from "../components/AxiosInstance"
import Cookies from 'js-cookie';

export interface User{
  username: string;
  password: string;
  email: string;
  type: string;
  birthDate: string;
  dojoId: string;
  responsavelId: string;
  childrens?: {
    username: string;
    birthDate: string;
  }[];
}

export const authApi = (Login: (userData: any) => void) => {
  const login = async (idToken: string): Promise<any> => {
    const { data } = await api.post("/login", { idToken });
    Login(data.user);

    return data;
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

  const calculateAge = async (birthDate: string) => {
    const { data } = await api.post("/calculate_age", { birthDate });
    return { data };
  };

  const inviteResponsavel = async (email: string, athleteName: string) => {
    return api.post("/invite-responsavel", {
      email,
      athleteName,
    });
  };

  const confirmResponsavelInvite = async (token: string) => {
    return api.post("/confirm-responsavel", { token });
  };

  return { login, signup, logout, calculateAge, inviteResponsavel, confirmResponsavelInvite};
};

export default authApi;