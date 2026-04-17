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
    const getNews = async () => {
        const { data } = await api.get('/news');
        return data;
    };

    const getPosts = async (community: string = 'geral') => {
        const { data } = await api.get(`/comunidade?community=${community}`);
        return data;
    };

    const getPostDetails = async (id: string) => {
        const { data } = await api.get(`/posts/${id}`);
        return data;
    };

    const createPost = async (post: FormData, community: string = 'geral') => {
        post.append('community', community);
        const { data } = await api.post("/posts", post);
        return data;
    };

    const updatePost = async (id: string, formData: FormData) => {
        const { data } = await api.put(`/posts/${id}`, formData);
        return data;
    };

    const deletePost = async (id: string) => {
        const { data } = await api.delete(`/posts/${id}`);
        return data;
    };

    const addComment = async (postId: string, message: string) => {
        const { data } = await api.post(`/posts/${postId}/comments`, { message });
        return data;
    };

    const editComment = async (commentId: string, message: string) => {
        const { data } = await api.put(`/comments/${commentId}`, { message });
        return data;
    };

    const deleteComment = async (commentId: string): Promise<any> => {
        const { data } = await api.delete(`/comments/${commentId}`);
        return data;
    };

    const likePost = async (postId: string) => {
        const { data } = await api.post(`/posts/${postId}/like`);
        return data;
    };

    return { getNews, getPosts, getPostDetails, createPost, updatePost, deletePost, addComment, editComment, deleteComment, likePost }
}

export default comunidadeApi;