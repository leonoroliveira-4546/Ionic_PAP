import { useCallback } from 'react';
import api from "../components/AxiosInstance"

export interface Post {
    _id: string
    author: any,
    type: 'post' | 'news' | 'tournament',
    title: string,
    message?: string,
    content?: string,
    link?: string,
    imagens: string[],
    likes: any[],
    comments: any[]
}

export const comunidadeApi = () => {
    const getContents = useCallback(async (type?: string, community: string = 'geral') => {
        const { data } = await api.get(`/contents?type=${type || ''}&community=${community}`);
        return data;
    }, []);

    const getContentDetails = useCallback(async (id: string) => {
        const { data } = await api.get(`/contents/${id}`);
        return data;
    }, []);

    const createContent = useCallback(async (formData: FormData, type: string = 'post', community: string = 'geral') => {
        formData.append('type', type);
        formData.append('community', community);

const { data } = await api.post("/contents", formData);
    return data;
  }, []);

  const updateContent = useCallback(async (id: string, formData: FormData) => {
    const { data } = await api.put(`/contents/${id}`, formData);
        return data;
    }, []);

    const deleteContent = useCallback(async (id: string) => {
        const { data } = await api.delete(`/contents/${id}`);
        return data;
    }, []);

    const likeContent = useCallback(async (id: string) => {
        const { data } = await api.post(`/contents/${id}/like`);
        return data;
    }, []);

    const votePoll = useCallback(async (contentId: string, optionIndex: number) => {
        const { data } = await api.post(`/contents/${contentId}/poll/${optionIndex}/vote`);
        return data;
    }, []);

    const addComment = useCallback(async (contentId: string, message: string) => {
        const { data } = await api.post(`/contents/${contentId}/comments`, { message });
        return data;
    }, []);

    const editComment = useCallback(async (commentId: string, message: string) => {
        const { data } = await api.put(`/comments/${commentId}`, { message });
        return data;
    }, []);

    const deleteComment = useCallback(async (commentId: string) => {
        const { data } = await api.delete(`/comments/${commentId}`);
        return data;
    }, []);

    const getYoutubeVideos = useCallback(async (limit: number = 10) => {
        const { data } = await api.get(`/youtube/fnk/videos?maxResults=${limit}`);
        return data;
    }, []);

    const getLives = useCallback(async (limit: number = 5) => {
        const { data } = await api.get(`/youtube/fnk/lives?maxResults=${limit}`);
        return data;
    }, []);

    return { getContents, getContentDetails, createContent, updateContent, deleteContent, likeContent, votePoll, addComment, editComment, deleteComment, getYoutubeVideos, getLives };
}

export default comunidadeApi;