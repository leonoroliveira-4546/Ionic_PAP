import React, { useState, useEffect, useCallback } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonModal, IonButton, IonInput, IonTextarea, IonIcon, IonItem, IonLabel, IonAvatar } from '@ionic/react';
import '../../../pages/StylesPages.css';
import { heart, heartOutline, chatbubbleOutline, trash } from 'ionicons/icons';
import Navbar from '../../../components/MainLayout';
import YouTubeFeed from '../../../components/YouTubeFeed';
import comunidadeApi from '../../../hooks/comunidadeApi';
import { useAuth } from '../../../AuthContext';

const Comunidade: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'dojo'>('geral');
  const [contents, setContents] = useState<any[]>([]);
  const [selectedNewsForComments, setSelectedNewsForComments] = useState<string | null>(null);
  const [selectedDojoPostForComments, setSelectedDojoPostForComments] = useState<string | null>(null);

  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsLink, setNewNewsLink] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newNewsImage, setNewNewsImage] = useState<File | null>(null);

  const [livesCount, setLivesCount] = useState<number>(0);
  const [videosCount, setVideosCount] = useState<number>(0);

  const { user } = useAuth();

  const {
    getContents,
    createContent,
    likeContent,
    addComment,
    deleteComment
  } = comunidadeApi();

  // ---------------- LOAD ----------------
  const loadContents = useCallback(async () => {
    try {
      const res = await getContents(
        activeTab === 'geral' ? 'news' : 'posts',
        activeTab
      );
      setContents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [activeTab, getContents]);

  useEffect(() => {
    loadContents();
  }, [loadContents]);

  // ---------------- FILTERS ----------------
  const news = contents.filter(c => c.type === 'news');
  const dojoPosts = contents.filter(c => c.community === 'dojo');

  // ---------------- NEWS ----------------
  const handleCreateNews = async () => {
    try {
      const form = new FormData();
      form.append('title', newNewsTitle);
      form.append('message', newNewsContent);
      if (newNewsLink) form.append('link', newNewsLink);

      await createContent(form, 'news', 'geral');

      setShowNewsModal(false);
      setNewNewsTitle('');
      setNewNewsContent('');
      setNewNewsLink('');

      loadContents();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- LIKE ----------------
  const handleLike = async (id: string) => {
    await likeContent(id);
    loadContents();
  };

  // ---------------- COMMENTS ----------------
  const handleAddComment = async (id: string) => {
    await addComment(id, newComment);
    setNewComment('');
    loadContents();
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    loadContents();
  };

  // ---------------- DOJO ACTIONS ----------------
  const handleLikeDojoPost = async (id: string) => {
    await likeContent(id);
    loadContents();
  };

  const handleAddDojoComment = async (id: string) => {
    await addComment(id, newComment);
    setNewComment('');
    loadContents();
  };

  const handleDeleteDojoComment = async (commentId: string) => {
    await deleteComment(commentId);
    loadContents();
  };

  const handleDeleteDojoPost = async (id: string) => {
    await deleteComment(id); // (ou deleteContent se tiveres endpoint)
    loadContents();
  };

  const handleVotePoll = async (pollId: string, index: number) => {
    console.log('vote poll:', pollId, index);
    // backend hook se tiveres endpoint
  };

  const renderGeralTab = () => (
  <div className="page background">
    <h2>🌍 Comunidade Geral</h2>

    <div style={{ marginBottom: 16 }}>
      <IonButton expand="block" onClick={() => setShowNewsModal(true)}>
        ✍️ Adicionar notícia
      </IonButton>
    </div>

    <div className="news-section">
      <div className="news-label">📰 Notícias</div>

      <IonList className='background'>
        {news.map(item => (
          <IonCard key={item._id} className="news-card" style={{ marginBottom: 16 }}>
            <IonCardHeader>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <IonAvatar style={{ width: 32, height: 32 }}>
                  <img
                    src={item.author?.profilePic || 'https://ui-avatars.com/api/?name=Admin'}
                    alt={item.author?.username}
                  />
                </IonAvatar>

                <div style={{ flex: 1 }}>
                  <strong>{item.author?.username || 'Admin'}</strong>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}{' '}
                    {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <IonCardTitle>{item.title}</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              {item.imagens?.length > 0 && (
                <img
                  src={item.imagens[0]}
                  alt={item.title}
                  style={{ width: '100%', maxHeight: 300, objectFit: 'cover', marginBottom: 12, borderRadius: 8 }}
                />
              )}

              <p>{item.content}</p>

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#007bff', textDecoration: 'none', fontSize: 12 }}
                >
                  🔗 {item.link}
                </a>
              )}

              {/* LIKE + COMMENTS */}
              <div style={{
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <button
                  onClick={() => handleLike(item._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 14,
                    color: item.likes?.includes(user?._id) ? '#e74c3c' : '#999'
                  }}
                >
                  <IonIcon icon={item.likes?.includes(user?._id) ? heart : heartOutline} />
                  {item.likes?.length || 0}
                </button>

                <button
                  onClick={() =>
                    setSelectedNewsForComments(
                      selectedNewsForComments === item._id ? null : item._id
                    )
                  }
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
                  {item.comments?.length || 0}
                </button>
              </div>

              {/* COMMENTS */}
              {selectedNewsForComments === item._id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ddd' }}>

                  <div style={{ marginBottom: 12, maxHeight: 200, overflowY: 'auto' }}>
                    {item.comments?.length > 0 ? (
                      item.comments.map((comment: any) => (
                        <div key={comment._id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <IonAvatar style={{ width: 24, height: 24 }}>
                              <img
                                src={
                                  comment.author?.profilePic ||
                                  'https://ui-avatars.com/api/?name=' + comment.author?.username
                                }
                                alt={comment.author?.username}
                              />
                            </IonAvatar>

                            <div style={{ flex: 1 }}>
                              <strong style={{ fontSize: 12 }}>
                                {comment.author?.username}
                              </strong>

                              <p style={{ margin: '4px 0', fontSize: 13 }}>
                                {comment.message}
                              </p>

                              <small style={{ color: '#999' }}>
                                {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: 12, color: '#999' }}>
                        Sem comentários ainda
                      </p>
                    )}
                  </div>

                  {/* ADD COMMENT */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <IonInput
                      placeholder="Adicionar comentário..."
                      value={newComment}
                      onIonChange={e => setNewComment(e.detail.value || '')}
                      style={{ flex: 1 }}
                    />

                    <IonButton fill="clear" onClick={() => handleAddComment(item._id)}>
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

    <div className="news-section">
      <div className="news-label">🔴 Ao Vivo Agora</div>
      <YouTubeFeed
        category="lives"
        limit={3}
        onLoaded={setLivesCount}
      />
    </div>

    <div className="news-section">
      <div className="news-label">🎥 Vídeos em Destaque</div>
      <YouTubeFeed
        category="videos"
        limit={5}
        onLoaded={setVideosCount}
      />
    </div>
  </div>
);

  const renderDojoTab = () => (
    <div className="page">
      <h2>🥋 Dojo</h2>

      {dojoPosts.map(post => (
        <IonCard key={post._id}>
          <IonCardHeader>
            <IonCardTitle>{post.title}</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <p>{post.message}</p>

            {/* ATTACHMENTS */}
            {post.attachments?.map((att: any, i: number) => (
              <div key={i}>
                {att.type === 'image' && <img src={att.url} style={{ width: '100%' }} />}
                {att.type === 'video' && <video src={att.url} controls />}
                {att.type === 'link' && <a href={att.url}>{att.title}</a>}
              </div>
            ))}

            {/* POLL */}
            {post.poll && (
              <div>
                <strong>{post.poll.question}</strong>
                {post.poll.options.map((o: any, i: number) => (
                  <div key={i}>
                    <input
                      type="radio"
                      onChange={() => handleVotePoll(post.poll._id, i)}
                    />
                    {o.text} ({o.votes.length})
                  </div>
                ))}
              </div>
            )}

            {/* LIKE + COMMENTS */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => handleLikeDojoPost(post._id)}>
                <IonIcon icon={post.likes?.includes(user?._id) ? heart : heartOutline} />
                {post.likes?.length || 0}
              </button>

              <button onClick={() =>
                setSelectedDojoPostForComments(
                  selectedDojoPostForComments === post._id ? null : post._id
                )
              }>
                <IonIcon icon={chatbubbleOutline} />
                {post.comments?.length || 0}
              </button>
            </div>

            {/* COMMENTS */}
            {selectedDojoPostForComments === post._id && (
              <div>
                {post.comments?.map((c: any) => (
                  <div key={c._id}>
                    <strong>{c.author?.username}</strong>
                    <p>{c.message}</p>

                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={() => handleDeleteDojoComment(c._id)}
                    >
                      <IonIcon icon={trash} />
                    </IonButton>
                  </div>
                ))}

                <IonInput
                  value={newComment}
                  onIonChange={e => setNewComment(e.detail.value!)}
                />

                <IonButton onClick={() => handleAddDojoComment(post._id)}>
                  Enviar
                </IonButton>
              </div>
            )}
          </IonCardContent>
        </IonCard>
      ))}
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