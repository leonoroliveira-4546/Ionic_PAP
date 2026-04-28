import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonText, IonModal, IonInput, IonTextarea, IonButton } from '@ionic/react';
import Navbar from '../../../components/MainLayout';
import FeedPost from '../../../components/FeedPost';
import YouTubeFeed from '../../../components/YouTubeFeed';
import '../../../pages/StylesPages.css';
import comunidadeApi from '../../../hooks/comunidadeApi';

const Comunidade: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'dojo'>('geral');
  const [news, setNews] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostMessage, setNewPostMessage] = useState('');
  const [newPostFile, setNewPostFile] = useState<File | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [pendingComment, setPendingComment] = useState('');
  const [pendingPostId, setPendingPostId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { getNews, getPosts: fetchPosts, likePost, createPost, addComment } = comunidadeApi();

  const transformPost = (post: any) => ({
    id: post._id,
    author: {
      id: post.author._id,
      name: post.author.username,
      avatar: post.author.profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author.username) + '&background=random&size=100',
      belt: 'Preta' // Default, or fetch from user model
    },
    content: post.message,
    image: post.imagens[0] || undefined,
    timestamp: post.createdAt,
    likes: post.likes.length,
    comments: post.comments.map((c: any) => ({
      id: c._id,
      author: {
        id: c.author._id,
        name: c.author.username,
        avatar: c.author.profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(c.author.username) + '&background=random&size=100'
      },
      content: c.message,
      timestamp: c.createdAt
    })),
    type: 'geral' as const
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const newsData = await getNews();
        setNews(newsData.data || []);
      } catch (error) {
        console.error('Error loading news:', error);
      }
    };
    loadData();
  }, [getNews]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const postsData = await fetchPosts(activeTab);
        setPosts(postsData.data || []);
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };
    loadPosts();
  }, [activeTab, fetchPosts]);

  const refreshPosts = async () => {
    const postsData = await fetchPosts(activeTab);
    setPosts(postsData.data || []);
  };

  const handleCreatePost = async () => {
    if (!newPostMessage.trim()) {
      alert('A mensagem da publicação é obrigatória.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', newPostTitle || 'Publicação');
      formData.append('message', newPostMessage);
      if (newPostFile) {
        formData.append('file', newPostFile);
      }

      const response = await createPost(formData, activeTab);
      if (response.success) {
        setShowCreatePostModal(false);
        setNewPostTitle('');
        setNewPostMessage('');
        setNewPostFile(null);
        await refreshPosts();
      } else {
        alert(response.message || 'Erro ao criar publicação.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Erro ao criar publicação.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCommentModal = (postId: string, comment: string) => {
    if (!comment.trim()) return;
    setPendingPostId(postId);
    setPendingComment(comment);
    setShowCommentModal(true);
  };

  const handleSubmitComment = async () => {
    if (!pendingComment.trim() || !pendingPostId) return;

    setSubmitting(true);
    try {
      const response = await addComment(pendingPostId, pendingComment);
      if (response.success) {
        setShowCommentModal(false);
        setPendingComment('');
        setPendingPostId('');
        await refreshPosts();
      } else {
        alert(response.message || 'Erro ao comentar publicação.');
      }
    } catch (error) {
      console.error('Error commenting post:', error);
      alert('Erro ao comentar publicação.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderGeralTab = () => (
    <div className="page background">
      <h2>🌍 Comunidade Geral</h2>

      {/* News Section */}
      <IonText color="medium" style={{ paddingLeft: 16, marginBottom: 8, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
        Notícias
      </IonText>
      <IonList className='background'>
        {news.map(item => (
          <IonCard key={item._id} style={{ margin: '8px 0' }}>
            <IonCardHeader>
              <IonCardTitle style={{ fontSize: 16 }}>{item.title}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p style={{ margin: '8px 0', lineHeight: 1.4 }}>{item.content}</p>
              <small style={{ color: 'var(--ion-color-medium)' }}>{new Date(item.createdAt).toLocaleDateString()}</small>
            </IonCardContent>
          </IonCard>
        ))}
      </IonList>

      {/* Lives Section */}
      <IonText color="medium" style={{ paddingLeft: 16, margin: '24px 0 8px', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
        Ao Vivo Agora
      </IonText>
      <YouTubeFeed category="lives" limit={3} />

      {/* Videos Section */}
      <IonText color="medium" style={{ paddingLeft: 16, margin: '24px 0 8px', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
        Vídeos
      </IonText>
      <YouTubeFeed category="videos" limit={5} />
    </div>
  );

  const renderDojoTab = () => (
    <div className="page background">
      <h2>🥋 Comunidade do Dojo</h2>

      {/* Create Post Button */}
      <div style={{ padding: '16px 0' }}>
        <button
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: 'var(--ion-color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
          onClick={() => setShowCreatePostModal(true)}
        >
          ✏️ Criar Publicação
        </button>
      </div>

      {/* Posts Feed */}
      {posts.map(post => (
        <FeedPost
          key={post._id}
          post={transformPost(post)}
          onLike={async (postId) => {
            try {
              await likePost(postId);
              await refreshPosts();
            } catch (error) {
              console.error('Error liking post:', error);
            }
          }}
          onComment={(postId, comment) => handleOpenCommentModal(postId, comment)}
        />
      ))}

      {posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <IonText color="medium">
            <p>Sem publicações no momento.</p>
          </IonText>
        </div>
      )}
    </div>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Comunidade</IonTitle>
        </IonToolbar>
        <div className="community-tabs">
          <button
            className={`community-tab-btn${activeTab === 'geral' ? ' active' : ''}`}
            onClick={() => setActiveTab('geral')}
          >
            Geral
          </button>
          <button
            className={`community-tab-btn${activeTab === 'dojo' ? ' active' : ''}`}
            onClick={() => setActiveTab('dojo')}
          >
            Dojo
          </button>
        </div>
      </IonHeader>
      <IonContent fullscreen>
        {activeTab === 'geral' && renderGeralTab()}
        {activeTab === 'dojo' && renderDojoTab()}
      </IonContent>
      <Navbar />

      <IonModal isOpen={showCreatePostModal} onDidDismiss={() => setShowCreatePostModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Nova Publicação</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonInput
            label="Título"
            labelPlacement="stacked"
            placeholder="Título da publicação"
            value={newPostTitle}
            onIonInput={(e) => setNewPostTitle(e.detail.value ?? '')}
          />
          <IonTextarea
            label="Mensagem"
            labelPlacement="stacked"
            placeholder="Escreve algo para o teu dojo..."
            value={newPostMessage}
            onIonInput={(e) => setNewPostMessage(e.detail.value ?? '')}
            rows={6}
            style={{ marginTop: 12 }}
          />
          <input
            type="file"
            accept="image/*"
            style={{ marginTop: 12 }}
            onChange={(e) => setNewPostFile(e.target.files?.[0] || null)}
          />

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <IonButton expand="block" fill="outline" onClick={() => setShowCreatePostModal(false)}>
              Cancelar
            </IonButton>
            <IonButton expand="block" onClick={handleCreatePost} disabled={submitting}>
              Publicar
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      <IonModal isOpen={showCommentModal} onDidDismiss={() => setShowCommentModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Confirmar Comentário</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText>
            <p style={{ marginTop: 0 }}>Queres publicar este comentário?</p>
            <p style={{ fontWeight: 600 }}>{pendingComment}</p>
          </IonText>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <IonButton expand="block" fill="outline" onClick={() => setShowCommentModal(false)}>
              Cancelar
            </IonButton>
            <IonButton expand="block" onClick={handleSubmitComment} disabled={submitting}>
              Enviar
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Comunidade;