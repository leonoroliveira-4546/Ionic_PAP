import api from "../components/AxiosInstance"

export interface Post {
    _id: string
    author: any,
    title: string,
    message: string,
    imagens: string[],
    comments: any[]
}

export const comunidadeApi = () => {
    const getPosts = async () => {
        const { data } = await api.get(`/comunidade`);
        return data;
    };

    const getPostDetails = async (id: string) => {
        const { data } = await api.get(`/posts/${id}`);
        return data;
    };

    const createPost = async (post: FormData) => {
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

    return { getPosts, getPostDetails, createPost, updatePost, deletePost, addComment, editComment, deleteComment }
}

export default comunidadeApi;