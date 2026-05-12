import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonModal, IonButton, IonInput, IonTextarea, IonIcon, IonItem, IonLabel, IonAvatar } from '@ionic/react';
import { heart, heartOutline, chatbubbleOutline } from 'ionicons/icons';
import Navbar from '../../../components/MainLayout';
import FeedPost from '../../../components/FeedPost';
import YouTubeFeed from '../../../components/YouTubeFeed';
import '../../../pages/StylesPages.css';
import comunidadeApi from '../../../hooks/comunidadeApi';
import { useAuth } from '../../../AuthContext';

const Comunidade: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'dojo'>('geral');
  const [news, setNews] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsLink, setNewNewsLink] = useState('');
  const [newNewsImage, setNewNewsImage] = useState<File | null>(null);
  const [selectedNewsForComments, setSelectedNewsForComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [livesCount, setLivesCount] = useState<number | null>(null);
  const [videosCount, setVideosCount] = useState<number | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const { getNews, addNews, likeNews, addCommentToNews, removeCommentFromNews, getPosts: fetchPosts, likePost } = comunidadeApi();

  const transformPost = (post: any) => ({
    id: post._id,
    author: {
      id: post.author._id,
      name: post.author.username,
      avatar: post.author.profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author.username) + '&background=random&size=100',
      belt: 'Preta'
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

  const handleCreateNews = async () => {
    if (!newNewsTitle.trim() || !newNewsContent.trim()) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', newNewsTitle.trim());
      formData.append('content', newNewsContent.trim());
      if (newNewsLink.trim()) {
        formData.append('link', newNewsLink.trim());
      }
      if (newNewsImage) {
        formData.append('file', newNewsImage);
      }

      await addNews(formData);
      const refreshedNews = await getNews();
      setNews(refreshedNews.data || []);
      setShowNewsModal(false);
      setNewNewsTitle('');
      setNewNewsContent('');
      setNewNewsLink('');
      setNewNewsImage(null);
    } catch (error) {
      console.error('Error creating news:', error);
    }
  };

  const handleLikeNews = async (newsId: string) => {
    try {
      await likeNews(newsId);
      const refreshedNews = await getNews();
      setNews(refreshedNews.data || []);
    } catch (error) {
      console.error('Error liking news:', error);
    }
  };

  const handleAddCommentToNews = async (newsId: string) => {
    if (!newComment.trim()) return;

    try {
      await addCommentToNews(newsId, newComment.trim());
      const refreshedNews = await getNews();
      setNews(refreshedNews.data || []);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const renderGeralTab = () => (
    <div className="page background">
      <h2>🌍 Comunidade Geral</h2>

      {isAdmin && (
        <div style={{ marginBottom: 16 }}>
          <IonButton expand="block" onClick={() => setShowNewsModal(true)}>
            ✍️ Adicionar notícia
          </IonButton>
        </div>
      )}

      {news.length > 0 && (
        <div className="news-section">
          <div className="news-label">📰 Notícias</div>
          <IonList className='background'>
            {news.map(item => (
              <IonCard key={item._id} className="news-card" style={{ marginBottom: 16 }}>
                <IonCardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <IonAvatar style={{ width: 32, height: 32 }}>
                      <img src={item.author?.profilePic || 'https://ui-avatars.com/api/?name=Admin'} alt={item.author?.username} />
                    </IonAvatar>
                    <div style={{ flex: 1 }}>
                      <strong>{item.author?.username || 'Admin'}</strong>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {new Date(item.createdAt).toLocaleDateString('pt-BR')} {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <IonCardTitle>{item.title}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {item.imagens && item.imagens.length > 0 && (
                    <img src={item.imagens[0]} alt={item.title} style={{ width: '100%', maxHeight: 300, objectFit: 'cover', marginBottom: 12, borderRadius: 8 }} />
                  )}
                  <p>{item.content}</p>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none', fontSize: 12 }}>
                      🔗 {item.link}
                    </a>
                  )}

                  {/* Likes and Comments Section */}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => handleLikeNews(item._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 14,
                        color: item.likes.includes(user?._id) ? '#e74c3c' : '#999'
                      }}
                    >
                      <IonIcon icon={item.likes.includes(user?._id) ? heart : heartOutline} />
                      {item.likes.length}
                    </button>
                    <button
                      onClick={() => setSelectedNewsForComments(selectedNewsForComments === item._id ? null : item._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 14,
                        color: '#999'
                      }}
                    >
                      <IonIcon icon={chatbubbleOutline} />
                      {item.comments.length}
                    </button>
                  </div>

                  {/* Comments Section */}
                  {selectedNewsForComments === item._id && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ddd' }}>
                      <div style={{ marginBottom: 12, maxHeight: 200, overflowY: 'auto' }}>
                        {item.comments.length > 0 ? (
                          item.comments.map((comment: any) => (
                            <div key={comment._id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <IonAvatar style={{ width: 24, height: 24 }}>
                                  <img src={comment.author?.profilePic || 'https://ui-avatars.com/api/?name=' + comment.author?.username} alt={comment.author?.username} />
                                </IonAvatar>
                                <div style={{ flex: 1 }}>
                                  <strong style={{ fontSize: 12 }}>{comment.author?.username}</strong>
                                  <p style={{ margin: '4px 0', fontSize: 13 }}>{comment.message}</p>
                                  <small style={{ color: '#999' }}>{new Date(comment.createdAt).toLocaleDateString('pt-BR')}</small>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={{ fontSize: 12, color: '#999' }}>Sem comentários ainda</p>
                        )}
                      </div>

                      {/* Add Comment */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <IonInput
                          placeholder="Adicionar comentário..."
                          value={newComment}
                          onIonChange={e => setNewComment(e.detail.value || '')}
                          style={{ flex: 1 }}
                        />
                        <IonButton fill="clear" onClick={() => handleAddCommentToNews(item._id)}>
                          Enviar
                        </IonButton>
                      </div>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        </div>
      )}

      <div style={{ display: videosCount === 0 ? 'none' : 'block' }}>
        <div className="news-section">
          <div className="news-label">🔴 Ao Vivo Agora</div>
          <YouTubeFeed category="lives" limit={3} onLoaded={count => setLivesCount(count)} />
        </div>
      </div>

      <div style={{ display: videosCount === 0 ? 'none' : 'block' }}>
        <div className="news-section">
          <div className="news-label">🎥 Vídeos em Destaque</div>
          <YouTubeFeed category="videos" limit={5} onLoaded={count => setVideosCount(count)} />
        </div>
      </div>
    </div>
  );

  const renderDojoTab = () => (
    <div className="page background">
      <h2>🥋 Comunidade do Dojo</h2>

      {/* Create Post Button */}
      <button
        className="create-post-btn"
        onClick={() => {
          // Simulate creating post
          console.log('Create new post');
        }}
      >
        ✏️ Criar Publicação
      </button>

      {/* Posts Feed */}
      {posts.length > 0 ? (
        posts.map(post => (
          <FeedPost
            key={post._id}
            post={transformPost(post)}
            onLike={async (postId) => {
              try {
                await likePost(postId);
                // Refresh posts
                const postsData = await fetchPosts(activeTab);
                setPosts(postsData.data || []);
              } catch (error) {
                console.error('Error liking post:', error);
              }
            }}
            onComment={(postId, comment) => console.log('Commented on post:', postId, comment)}
          />
        ))
      ) : (
        <div className="empty-state">
          <p>Sem publicações no momento. Seja o primeiro a publicar! 🎉</p>
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

      {/* News Creation Modal */}
      <IonModal isOpen={showNewsModal} onDidDismiss={() => setShowNewsModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Adicionar Notícia</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setShowNewsModal(false)}>
              Fechar
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <IonLabel>Título *</IonLabel>
              <IonInput
                placeholder="Digite o título da notícia"
                value={newNewsTitle}
                onIonChange={e => setNewNewsTitle(e.detail.value || '')}
              />
            </div>

            <div>
              <IonLabel>Conteúdo *</IonLabel>
              <IonTextarea
                placeholder="Digite o conteúdo da notícia"
                value={newNewsContent}
                onIonChange={e => setNewNewsContent(e.detail.value || '')}
                style={{ minHeight: 120 }}
              />
            </div>

            <div>
              <IonLabel>Link Externo (opcional)</IonLabel>
              <IonInput
                placeholder="https://exemplo.com"
                value={newNewsLink}
                onIonChange={e => setNewNewsLink(e.detail.value || '')}
              />
            </div>

            <div>
              <IonLabel>Imagem (opcional)</IonLabel>
              <input
                type="file"
                accept="image/*"
                onChange={e => setNewNewsImage(e.target.files?.[0] || null)}
                style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4, width: '100%' }}
              />
              {newNewsImage && <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>✓ {newNewsImage.name}</p>}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <IonButton expand="block" fill="solid" onClick={handleCreateNews}>
                Publicar Notícia
              </IonButton>
              <IonButton expand="block" fill="clear" onClick={() => setShowNewsModal(false)}>
                Cancelar
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      <Navbar />
    </IonPage>
  );
};

export default Comunidade;