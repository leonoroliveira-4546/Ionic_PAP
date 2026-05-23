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
    const { data } = await api.post("/join_dojo", { dojoId, userId });
    return data;
  };

  const getDojoMembers = async (dojoId: string) => {
    const { data } = await api.get(`/dojo/members/${dojoId}`);
    return data;
  };

  const removeMember = async (dojoId: string, userId: string) => {
    const { data } = await api.post("/dojo/remove-member", { dojoId, userId });
    return data;
  };

  const addTrainingSchedule = async ( dojoId: string, FormData: { day: string; time: string; location: string } ) => {
    const { data } = await api.post(`/dojos/${dojoId}/schedule`, FormData);
    return data;
  };

  const updateTrainingSchedules = async ( dojoId: string, schedules: any[] ) => {
    const { data } = await api.put(`/dojos/${dojoId}/schedule`, { schedules });
    return data;
  };

  const createTournament = async ( dojoId: string, FormData: { name: string; date: string; location: string; userId: string; participants?: string[] } ) => {
    const { data } = await api.post(`/dojos/${dojoId}/tournaments`, FormData);
    return data;
  };

  const getDojoTournaments = async (dojoId: string) => {
    const { data } = await api.get(`/dojos/${dojoId}/tournaments`);
    return data;
  };

  const updateTournament = async ( tournamentId: string, FormData: { name: string; date: string; location: string; participants?: string[] } ) => {
    const { data } = await api.put(`/dojos/tournaments/${tournamentId}`, FormData);
    return data;
  };

  const deleteTournament = async ( tournamentId: string ) => {
    const { data } = await api.delete(`/dojos/tournaments/${tournamentId}`);
    return data;
  };

  const removeChildFromResponsible = async (responsibleId: string, childId: string) => {
    const { data } = await api.post("/dojo/remove-child", { responsibleId, childId });
    return data;
  };

  const inviteMemberByEmail = async ( dojoId: string, email: string ) => {
    const { data } = await api.post(`/dojos/${dojoId}/invite`, { email });
    return data;
  };

  const submitJoinRequest = async ( dojoId: string ) => {
    const { data } = await api.post(`/dojos/${dojoId}/request`);
    return data;
  };

  const acceptJoinRequest = async ( dojoId: string, userId: string ) => {
    const { data } = await api.post(`/dojos/${dojoId}/requests/${userId}/accept`);
    return data;
  };

  const rejectJoinRequest = async ( dojoId: string, userId: string ) => {
    const { data } = await api.post(`/dojos/${dojoId}/requests/${userId}/reject`);
    return data;
  };

  const getAthletesWithoutDojo = async () => {
    const { data } = await api.get(`/dojo/athletes-without-dojo`);
    return data;
  };

  return { getDojos, createDojo, joinDojo, getDojoMembers, removeMember, removeChildFromResponsible, addTrainingSchedule, updateTrainingSchedules, createTournament, getDojoTournaments, updateTournament, deleteTournament, inviteMemberByEmail, submitJoinRequest, acceptJoinRequest, rejectJoinRequest, getAthletesWithoutDojo };
};

export default dojosApi;