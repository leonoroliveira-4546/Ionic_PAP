import { IonAlert, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonModal, IonPage, IonToolbar } from '@ionic/react';
import { trashBin, createSharp, createOutline, trashBinOutline, chatbubbleOutline, sendSharp, saveOutline, chevronExpandOutline } from 'ionicons/icons';
import { comunidadeApi, Post } from '../../../../hooks/comunidadeApi';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { useAuth } from '../../../../AuthContext';
import { useHistory } from 'react-router-dom';
import Navbar from '../../../../components/MainLayout';

interface DetailsProps extends RouteComponentProps<{ id: string }> {}

const DetalhesPost: React.FC<DetailsProps> = ({ match }) => {
    const history = useHistory();
    const { getPostDetails, updatePost, deletePost, addComment, editComment, deleteComment } = comunidadeApi();
    const { user } = useAuth();

    const [post, setPost] = useState<Post | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [editCommentId, setEditCommentId] = useState<string | null>(null);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);

    const fetchPost = async () => {
        try {
            const res = await getPostDetails(match.params.id);
            if (!res.success) alert(res.message);

            setPost(res.post);
        } catch (err) {
            alert('Erro no servidor.');
        }
    };
    
    useEffect(() => {
        fetchPost();
    }, []);

    const handleChange = (e: CustomEvent) => {
        const target = e.target as HTMLInputElement;
        const { name, value } = target;

        setPost((prev: Post | null) => prev ? { ...prev, [name]: value } : prev);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpdatePost = async () => {
        if (!post) return;

        let formData = new FormData();
        formData.append('title', post!.title);
        formData.append('message', post!.message);

        if (selectedFile) formData.append('imagens', selectedFile);

        const res = await updatePost(post!._id, formData);
        if (!res.success) alert(res.message);

        setShowEditModal(false);
        fetchPost();
    };

    const handleDeletePost = async () => {
        if (!post) return;

        const res = await deletePost(post._id);
        if(!res.success) alert(res.message);

        setShowDeleteAlert(false);
        history.goBack();
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !post) return;

        let res;
        if (editCommentId) {
           res = await editComment(editCommentId, newComment);
        } else {
           res = await addComment(post._id, newComment);
        }

        if(!res.success) alert(res.message);

        setNewComment('');
        setEditCommentId(null);
        setShowCommentInput(false);
        fetchPost();
    };

    const handleEditComment = (comment: any) => {
        setNewComment(comment.message);
        setEditCommentId(comment._id);
        setShowCommentInput(true);
    };

    const handleDeleteComment = async (commentId: string) => {
        const res = await deleteComment(commentId);
        if(!res.success) alert(res.message);

        fetchPost();
    };

    if (!post) return <IonPage><IonContent>Carregando...</IonContent></IonPage>;

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/comunidade" />
                    </IonButtons>
                    <IonButtons slot="end">
                        {user?._id === post.author?._id && (
                            <>
                                <IonButton onClick={() => setShowEditModal(true)}>
                                    <IonIcon icon={createSharp} />
                                </IonButton>
                                <IonButton onClick={() => setShowDeleteAlert(true)}>
                                    <IonIcon icon={trashBin} />
                                </IonButton>
                            </>
                        )}
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonCard>
                    <IonCardHeader>
                        <IonCardTitle>{post.title}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>{post.message}</IonCardContent>
                    {post.imagens?.length > 0 && (
                        <IonCardContent>
                            <IonImg src={post.imagens[0]} onClick={() => setShowImageModal(true)} />
                            <IonIcon icon={chevronExpandOutline} onClick={() => setShowImageModal(true)} />
                        </IonCardContent>
                    )}
                    <IonCardContent>
                        Autor: {post.author?.username}
                    </IonCardContent>
                    <IonCardContent>
                        <strong>Comentários:</strong>
                        {post.comments?.length ? (
                            post.comments.map((c: any) => (
                                <div key={c._id}>
                                    <strong>{c.author?.username}:</strong> {c.message}
                                    {user?._id === c.author?._id && (
                                        <>
                                            <IonButton fill="clear" onClick={() => handleEditComment(c)}>
                                                <IonIcon icon={createOutline} />
                                            </IonButton>
                                            <IonButton fill="clear" onClick={() => handleDeleteComment(c._id)}>
                                                <IonIcon icon={trashBinOutline} />
                                            </IonButton>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>Sem comentários</p>
                        )}
                        {user && (
                            <>
                                {!showCommentInput ? (
                                    <IonButton expand="block" fill="outline" onClick={() => setShowCommentInput(true)}>
                                        <IonIcon icon={chatbubbleOutline} slot="start" /> Adicionar Comentário
                                    </IonButton>
                                ) : (
                                    <IonItem>
                                        <IonInput value={newComment} placeholder="Comentário..." onIonInput={e => setNewComment(e.detail.value!)} />
                                        <IonButton onClick={handleSubmitComment}><IonIcon icon={sendSharp} /></IonButton>
                                    </IonItem>
                                )}
                            </>
                        )}
                    </IonCardContent>
                </IonCard>

                <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
                    <IonContent>
                        <IonItem>
                            <IonInput name="title" value={post.title} placeholder="Título" onIonInput={handleChange} />
                        </IonItem>
                        <IonItem>
                            <IonInput name="message" value={post.message} placeholder="Mensagem" onIonInput={handleChange} />
                        </IonItem>
                        <IonItem>
                            <input type="file" onChange={handleFileChange} />
                        </IonItem>

                        <IonButton expand="block" onClick={handleUpdatePost}>
                            <IonIcon icon={saveOutline} /> Guardar
                        </IonButton>
                        <IonButton expand="block" color="medium" onClick={() => insertModal.current?.dismiss()}>
                            Fechar
                        </IonButton>
                    </IonContent>
                </IonModal>
                <IonModal isOpen={showImageModal} onDidDismiss={() => setShowImageModal(false)}>
                    <IonContent>
                        <IonImg src={post.imagens[0]} />
                    </IonContent>
                </IonModal>

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header="Excluir post."
                    message="Tem certeza que deseja excluir?"
                    buttons={[
                        { text: 'Cancelar', role: 'cancel' },
                        { text: 'Sim', handler: handleDeletePost }
                    ]}
                />
            </IonContent>
            <Navbar/>
        </IonPage>
    );
};

export default DetalhesPost;