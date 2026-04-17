import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
  baseURL: "http://localhost:8001"
});

api.interceptors.request.use(async (config) => {
  const user = getAuth().currentUser;

  if (user) {
    const token = await user.getIdToken(true);
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;