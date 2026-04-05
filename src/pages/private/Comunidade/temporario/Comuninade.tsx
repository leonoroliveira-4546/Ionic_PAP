import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonModal, IonPage, IonTitle, IonToolbar, IonImg, IonGrid, IonRow, IonCol } from '@ionic/react';
import { addCircleSharp, saveOutline } from 'ionicons/icons';
import { useRef, useState, useEffect } from 'react';
import comunidadeApi from '../../../../hooks/comunidadeApi';
import Navbar from '../../../../components/MainLayout';

const Comunidade: React.FC = () => {
    const insertModal = useRef<HTMLIonModalElement>(null);
    const { getPosts, createPost } = comunidadeApi();

    const [posts, setPosts] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const [publicacao, setPublicacao] = useState({
        title: "",
        message: "",
    });

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        const res = await getPosts();

        if (res.success === true) {
            setPosts(res.data);
        } else {
            alert(res.message || "Erro ao carregar posts");
            setPosts([]);
        }
    };

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setPublicacao(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: any) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append("title", publicacao.title);
            formData.append("message", publicacao.message);

            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            const res = await createPost(formData);

            if (!res.success) throw new Error(res.message || "Erro ao guardar e criar o post.");

            setPublicacao({ title: "", message: "" });
            setSelectedFile(null);

            insertModal.current?.dismiss();

            loadPosts();
        } catch (err) {
            console.log(err);
            alert("Erro ao criar post.");
        }
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Comunidade</IonTitle>

                    <IonButtons slot="end">
                        <IonButton id="insert-modal-comunidade">
                            <IonIcon icon={addCircleSharp} size="large" />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonModal ref={insertModal} trigger="insert-modal-comunidade">
                    <div style={{ padding: 20 }}>
                        <IonItem>
                            <IonInput
                                label="Título"
                                name="title"
                                value={publicacao.title}
                                onIonInput={handleChange}
                            />
                        </IonItem>
                        <IonItem>
                            <IonInput
                                label="Mensagem"
                                name="message"
                                value={publicacao.message}
                                onIonInput={handleChange}
                            />
                        </IonItem>

                        <input type="file" onChange={handleFileChange} />

                        <IonButton expand="block" onClick={handleSubmit}>
                            <IonIcon icon={saveOutline} slot="start" />
                                Criar Post
                        </IonButton>
                        <IonButton expand="block" color="medium" onClick={() => insertModal.current?.dismiss()}>
                            Fechar
                        </IonButton>
                    </div>
                </IonModal>
                <IonGrid>
                    <IonRow>
                        {posts?.map((post) => (
                            <IonCol size="12" sizeMd="4" key={post._id}>
                                <div className="card-container">
                                    {post.imagens?.length > 0 && (
                                        <IonImg
                                            src={post.imagens[0]}
                                            style={{ height: 200, objectFit: "cover" }}
                                        />
                                    )}

                                    <h2>{post.title}</h2>
                                    <p>{post.author?.username}</p>

                                    <IonButton routerLink={`comunidade/post/${post._id}`}>
                                        Ver mais
                                    </IonButton>
                                </div>
                            </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>
            </IonContent>
            <Navbar/>
        </IonPage>
    );
};

export default Comunidade;