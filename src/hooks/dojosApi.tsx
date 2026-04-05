import api from "../components/AxiosInstance";

export interface Dojo {
  _id?: string;
  name: string;
  city: string;
  profilePic?: string;
  sensei: string;
  members?: string[];
}

export const dojosApi = () => {
  const getDojos = async () => {
    const { data } = await api.get("/get_dojos");
    return data;
  };

  const createDojo = async (dojo: { name: string; city: string; userId: string }) => {
    const { data } = await api.post("/create_dojo", dojo);
    return data;
  };

  const joinDojo = async (dojoId: string, userId: string) => {
    const { data } = await api.post("/join_dojo", { dojoId });
    return data;
  };

  return { getDojos, createDojo, joinDojo};
};

export default dojosApi;