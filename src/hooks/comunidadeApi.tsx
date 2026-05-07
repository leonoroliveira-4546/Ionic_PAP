import { useCallback } from 'react';
import api from "../components/AxiosInstance"

export interface Post {
    _id: string
    author: any,
    title: string,
    message: string,
    imagens: string[],
    likes: any[],
    comments: any[]
}

export const comunidadeApi = () => {
    const getNews = useCallback(async () => {
        const { data } = await api.get('/news');
        return data;
    }, []);

    const getPosts = useCallback(async (community: string = 'geral') => {
        const { data } = await api.get(`/comunidade?community=${community}`);
        return data;
    }, []);

    const getPostDetails = useCallback(async (id: string) => {
        const { data } = await api.get(`/posts/${id}`);
        return data;
    }, []);

    const createPost = useCallback(async (post: FormData, community: string = 'geral') => {
        post.append('community', community);
        const { data } = await api.post("/posts", post);
        return data;
    }, []);

    const updatePost = useCallback(async (id: string, formData: FormData) => {
        const { data } = await api.put(`/posts/${id}`, formData);
        return data;
    }, []);

    const deletePost = useCallback(async (id: string) => {
        const { data } = await api.delete(`/posts/${id}`);
        return data;
    }, []);

    const addComment = useCallback(async (postId: string, message: string) => {
        const { data } = await api.post(`/posts/${postId}/comments`, { message });
        return data;
    }, []);

    const editComment = useCallback(async (commentId: string, message: string) => {
        const { data } = await api.put(`/comments/${commentId}`, { message });
        return data;
    }, []);

    const deleteComment = useCallback(async (commentId: string): Promise<any> => {
        const { data } = await api.delete(`/comments/${commentId}`);
        return data;
    }, []);

    const likePost = useCallback(async (postId: string) => {
        const { data } = await api.post(`/posts/${postId}/like`);
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

    return { getNews, getPosts, getPostDetails, createPost, updatePost, deletePost, addComment, editComment, deleteComment, likePost, getYoutubeVideos, getLives }
}

export default comunidadeApi;