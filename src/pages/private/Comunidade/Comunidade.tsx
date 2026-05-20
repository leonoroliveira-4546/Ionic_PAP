import React, { useState, useEffect, useCallback } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonModal, IonButton, IonInput, IonTextarea, IonIcon, IonLabel, IonAvatar } from '@ionic/react';
import '../../../pages/StylesPages.css';
import { heart, heartOutline, chatbubbleOutline, trash, pencil, close } from 'ionicons/icons';
import Navbar from '../../../components/MainLayout';
import YouTubeFeed from '../../../components/YouTubeFeed';
import comunidadeApi from '../../../hooks/comunidadeApi';
import { useAuth } from '../../../AuthContext';

type CommunityAuthor = {
  _id?: string;
  username?: string;
  profilePic?: string;
};

type CommunityComment = {
  _id: string;
  author?: CommunityAuthor;
  message: string;
  createdAt: string;
};

type CommunityAttachment = {
  type: 'image' | 'video' | 'link';
  url: string;
  title?: string;
};

type CommunityPollOption = {
  text: string;
  votes: string[];
};

type CommunityPoll = {
  _id: string;
  question: string;
  options: CommunityPollOption[];
};

type CommunityContent = {
  _id: string;
  author?: CommunityAuthor;
  community?: 'geral' | 'dojo';
  type?: 'news' | 'post' | 'tournament';
  title: string;
  message?: string;
  content?: string;
  link?: string;
  createdAt: string;
  imagens?: string[];
  likes?: string[];
  comments?: CommunityComment[];
  attachments?: CommunityAttachment[];
  poll?: CommunityPoll | null;
};

const Comunidade: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'dojo'>('geral');
  const [contents, setContents] = useState<CommunityContent[]>([]);
  const [selectedNewsForComments, setSelectedNewsForComments] = useState<string | null>(null);
  const [selectedDojoPostForComments, setSelectedDojoPostForComments] = useState<string | null>(null);

  const [showNewsModal, setShowNewsModal] = useState(false);
  const [showDojoModal, setShowDojoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsLink, setNewNewsLink] = useState('');
  const [newDojoTitle, setNewDojoTitle] = useState('');
  const [newDojoContent, setNewDojoContent] = useState('');
  const [newDojoLink, setNewDojoLink] = useState('');
  const [newDojoVideo, setNewDojoVideo] = useState('');
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newNewsImage, setNewNewsImage] = useState<File | null>(null);
  const [newDojoImage, setNewDojoImage] = useState<File | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editLink, setEditLink] = useState('');
  const [editVideo, setEditVideo] = useState('');
  const [editPollQuestion, setEditPollQuestion] = useState('');
  const [editPollOptions, setEditPollOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [, setLivesCount] = useState<number>(0);
  const [, setVideosCount] = useState<number>(0);

  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const isSensei = user?.type === 'sensei';

  const {
    getContents,
    createContent,
    updateContent,
    deleteContent,
    likeContent,
    votePoll,
    addComment,
    deleteComment
  } = comunidadeApi();

  // ---------------- LOAD ----------------
  const loadContents = useCallback(async () => {
    try {
      const res = await getContents(
        activeTab === 'geral' ? 'news' : 'post',
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

  useEffect(() => {
    if (isAdmin && activeTab === 'dojo') {
      setActiveTab('geral');
    }
  }, [activeTab, isAdmin]);

  // ---------------- FILTERS ----------------
  const news = contents.filter(c => c.type === 'news');
  const dojoPosts = contents.filter(c => c.community === 'dojo');

  const resetNewsForm = () => {
    setNewNewsTitle('');
    setNewNewsContent('');
    setNewNewsLink('');
    setNewNewsImage(null);
  };

  const resetDojoForm = () => {
    setNewDojoTitle('');
    setNewDojoContent('');
    setNewDojoLink('');
    setNewDojoVideo('');
    setNewPollQuestion('');
    setNewPollOptions([]);
    setNewDojoImage(null);
  };

  // ---------------- NEWS ----------------
  const handleCreateNews = async () => {
    if (!newNewsTitle.trim() || !newNewsContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const form = new FormData();
      form.append('title', newNewsTitle.trim());
      form.append('content', newNewsContent.trim());
      form.append('message', newNewsContent.trim());
      if (newNewsLink.trim()) form.append('link', newNewsLink.trim());
      if (newNewsImage) form.append('file', newNewsImage, newNewsImage.name);

      await createContent(form, 'news', 'geral');

      setShowNewsModal(false);
      resetNewsForm();
      await loadContents();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateDojoPost = async () => {
    if (!newDojoTitle.trim() || !newDojoContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const form = new FormData();
      form.append('title', newDojoTitle.trim());
      form.append('message', newDojoContent.trim());
      form.append('content', newDojoContent.trim());
      if (newDojoLink.trim()) form.append('link', newDojoLink.trim());
      if (newDojoVideo.trim()) {
        // Adicionar vídeo como attachment
        form.append('attachments', JSON.stringify([{ type: 'video', url: newDojoVideo.trim() }]));
      }
      if (newPollQuestion.trim() && newPollOptions.filter(o => o.trim()).length > 0) {
        const pollData = {
          question: newPollQuestion.trim(),
          options: newPollOptions.filter(option => option.trim()).map(option => ({ text: option.trim(), votes: [] }))
        };
        form.append('poll', JSON.stringify(pollData));
      }
      if (newDojoImage) form.append('file', newDojoImage, newDojoImage.name);

      await createContent(form, 'post', 'dojo');

      setShowDojoModal(false);
      resetDojoForm();
      await loadContents();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- LIKE ----------------
  const handleLike = async (id: string) => {
    try {
      await likeContent(id);
      await loadContents();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- COMMENTS ----------------
  const handleAddComment = async (id: string) => {
    await addComment(id, newComment);
    setNewComment('');
    loadContents();
  };

  // ---------------- DOJO ACTIONS ----------------
  const handleLikeDojoPost = async (id: string) => {
    try {
      await likeContent(id);
      await loadContents();
    } catch (err) {
      console.error(err);
    }
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

  const handleVotePoll = async (contentId: string, index: number) => {
    try {
      await votePoll(contentId, index);
      await loadContents();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------- EDIT POST ----------
  const handleOpenEdit = (post: CommunityContent) => {
    setEditingPostId(post._id);
    setEditTitle(post.title);
    setEditContent(post.content || post.message || '');
    setEditLink(post.link || '');
    setEditVideo(post.attachments?.find(a => a.type === 'video')?.url || '');
    setEditPollQuestion(post.poll?.question || '');
    setEditPollOptions(post.poll?.options.map(o => o.text) || []);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPostId || !editTitle.trim() || !editContent.trim()) return;
    try {
      setIsSubmitting(true);
      const form = new FormData();
      form.append('title', editTitle.trim());
      form.append('message', editContent.trim());
      form.append('content', editContent.trim());
      if (editLink.trim()) form.append('link', editLink.trim());
      if (editVideo.trim()) {
        form.append('attachments', JSON.stringify([{ type: 'video', url: editVideo.trim() }]));
      }
      if (editPollQuestion.trim() && editPollOptions.filter(o => o.trim()).length > 0) {
        const pollData = {
          question: editPollQuestion.trim(),
          options: editPollOptions.filter(o => o.trim()).map(o => ({ text: o.trim(), votes: [] }))
        };
        form.append('poll', JSON.stringify(pollData));
      }
      
      await updateContent(editingPostId, form);
      alert('Post editado com sucesso!');
      setShowEditModal(false);
      setEditingPostId(null);
      setEditTitle('');
      setEditContent('');
      setEditLink('');
      setEditVideo('');
      setEditPollQuestion('');
      setEditPollOptions([]);
      await loadContents();
    } catch (err) {
      console.error(err);
      alert('Erro ao editar post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Tem certeza que quer remover este post?')) return;
    try {
      setIsSubmitting(true);
      await deleteContent(postId);
      alert('Post removido com sucesso!');
      await loadContents();
    } catch (err) {
      console.error(err);
      alert('Erro ao remover post');
    } finally {
      setIsSubmitting(false);
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

    <div className="news-section">
      <div className="news-label">📰 Notícias</div>

      <IonList className='background'>
        {news.map(item => (
          <IonCard key={item._id} className="news-card rounded-3xl bg-white shadow-lg ring-1 ring-slate-200/70" style={{ marginBottom: 16 }}>
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
              {item.imagens?.[0] && (
                <img
                  src={item.imagens[0]}
                  alt={item.title}
                  style={{ width: '100%', maxHeight: 300, objectFit: 'cover', marginBottom: 12, borderRadius: 8 }}
                />
              )}

              <p>{item.content || item.message}</p>

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
              <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 mt-3">
                <div className="flex items-center gap-2">
                  {user?._id === item.author?._id && (
                    <>
                      <IonButton fill="clear" size="small" onClick={() => handleOpenEdit(item)}>
                        <IonIcon slot="icon-only" icon={pencil}></IonIcon>
                      </IonButton>
                      <IonButton fill="clear" size="small" color="danger" onClick={() => handleDeletePost(item._id)}>
                        <IonIcon slot="icon-only" icon={trash}></IonIcon>
                      </IonButton>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleLike(item._id)}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${user?._id && item.likes?.includes(user._id) ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  <IonIcon icon={user?._id && item.likes?.includes(user._id) ? heart : heartOutline} />
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
                    {(item.comments?.length ?? 0) > 0 ? (
                      (item.comments ?? []).map((comment: CommunityComment) => (
                        <div key={comment._id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <IonAvatar style={{ width: 24, height: 24 }}>
                              <img
                                src={
                                  comment.author?.profilePic ||
                                  'https://ui-avatars.com/api/?name=' + (comment.author?.username || 'User')
                                }
                                alt={comment.author?.username || 'User'}
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
    <div className="page background">
      <h2>🥋 Dojo</h2>

      {isSensei && (
        <div style={{ marginBottom: 16 }}>
          <IonButton expand="block" onClick={() => setShowDojoModal(true)}>
            📝 Adicionar post do dojo
          </IonButton>
        </div>
      )}

      <div className="news-section">
        <div className="news-label">🥋 Feed do Dojo</div>

        {dojoPosts.length === 0 && (
          <IonCard className="news-card community-empty-card">
            <IonCardContent>
              <p>Ainda não existem publicações no dojo.</p>
            </IonCardContent>
          </IonCard>
        )}

      {dojoPosts.map(post => (
        <IonCard key={post._id} className="news-card rounded-3xl bg-white shadow-lg ring-1 ring-slate-200/70" style={{ marginBottom: 16 }}>
          <IonCardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <IonAvatar style={{ width: 32, height: 32 }}>
                <img
                  src={post.author?.profilePic || 'https://ui-avatars.com/api/?name=Dojo'}
                  alt={post.author?.username}
                />
              </IonAvatar>

              <div style={{ flex: 1 }}>
                <strong>{post.author?.username || 'Dojo'}</strong>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {new Date(post.createdAt).toLocaleDateString('pt-BR')}{' '}
                  {new Date(post.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {user?._id === post.author?._id && (
                <div style={{ display: 'flex', gap: 4 }}>
                  <IonButton fill="clear" size="small" onClick={() => handleOpenEdit(post)}>
                    <IonIcon slot="icon-only" icon={pencil}></IonIcon>
                  </IonButton>
                  <IonButton fill="clear" size="small" color="danger" onClick={() => handleDeletePost(post._id)}>
                    <IonIcon slot="icon-only" icon={trash}></IonIcon>
                  </IonButton>
                </div>
              )}
            </div>

            <IonCardTitle>{post.title}</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            {post.imagens?.[0] && (
              <img
                src={post.imagens[0]}
                alt={post.title}
                className="community-attachment"
              />
            )}

            <p>{post.message || post.content}</p>

            {post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#007bff', textDecoration: 'none', fontSize: 12 }}
              >
                🔗 {post.link}
              </a>
            )}

            {/* ATTACHMENTS */}
            {post.attachments?.map((att: CommunityAttachment, i: number) => (
              <div key={i} style={{ marginBottom: 12 }}>
                {att.type === 'image' && <img src={att.url} className="community-attachment" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }} />}
                {att.type === 'video' && (
                  <video 
                    src={att.url} 
                    controls 
                    style={{ width: '100%', maxHeight: 300, borderRadius: 8, backgroundColor: '#000' }}
                  />
                )}
                {att.type === 'link' && (
                  <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none', fontSize: 12 }}>
                    🔗 {att.title || att.url}
                  </a>
                )}
              </div>
            ))}

            {/* POLL */}
            {post.poll && (
              <div style={{ marginTop: 12, padding: '12px 8px', backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                <strong style={{ display: 'block', marginBottom: 8 }}>📊 {post.poll?.question}</strong>
                {post.poll?.options.map((o: CommunityPollOption, i: number) => {
                  const totalVotes = post.poll?.options.reduce((acc, opt) => acc + opt.votes.length, 0) || 0;
                  const percentage = totalVotes > 0 ? Math.round((o.votes.length / totalVotes) * 100) : 0;
                  
                  return (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="radio"
                          name={`poll-${post._id}`}
                          onChange={() => handleVotePoll(post._id, i)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ flex: 1 }}>{o.text}</span>
                        <span style={{ fontSize: 12, color: '#666', minWidth: 40 }}>{percentage}%</span>
                      </div>
                      <div style={{ height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, marginLeft: 28, overflow: 'hidden' }}>
                        <div style={{ height: '100%', backgroundColor: '#007bff', width: `${percentage}%`, transition: 'width 0.3s' }} />
                      </div>
                      <div style={{ fontSize: 11, color: '#999', marginLeft: 28, marginTop: 2 }}>{o.votes.length} voto{o.votes.length !== 1 ? 's' : ''}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LIKE + COMMENTS */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3 mt-3">
              <button
                onClick={() => handleLikeDojoPost(post._id)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition ${user?._id && post.likes?.includes(user._id) ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <IonIcon icon={user?._id && post.likes?.includes(user._id) ? heart : heartOutline} />
                {post.likes?.length || 0}
              </button>

              <button
                onClick={() =>
                  setSelectedDojoPostForComments(
                    selectedDojoPostForComments === post._id ? null : post._id
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
                {post.comments?.length || 0}
              </button>
            </div>

            {/* COMMENTS */}
            {selectedDojoPostForComments === post._id && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ddd' }}>
                {(post.comments ?? []).map((c: CommunityComment) => (
                  <div key={c._id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <IonAvatar style={{ width: 24, height: 24 }}>
                        <img
                          src={
                            c.author?.profilePic ||
                            'https://ui-avatars.com/api/?name=' + (c.author?.username || 'User')
                          }
                          alt={c.author?.username || 'User'}
                        />
                      </IonAvatar>

                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: 12 }}>{c.author?.username}</strong>
                        <p style={{ margin: '4px 0', fontSize: 13 }}>{c.message}</p>

                        <small style={{ color: '#999' }}>
                          {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                        </small>
                      </div>
                    </div>

                    {user?._id === c.author?._id && (
                      <IonButton
                        fill="clear"
                        color="danger"
                        onClick={() => handleDeleteDojoComment(c._id)}
                      >
                        <IonIcon icon={trash} />
                      </IonButton>
                    )}
                  </div>
                ))}

                <div style={{ display: 'flex', gap: 8 }}>
                  <IonInput
                    placeholder="Adicionar comentário..."
                    value={newComment}
                    onIonChange={e => setNewComment(e.detail.value || '')}
                    style={{ flex: 1 }}
                  />

                  <IonButton fill="clear" onClick={() => handleAddDojoComment(post._id)}>
                    Enviar
                  </IonButton>
                </div>
              </div>
            )}
          </IonCardContent>
        </IonCard>
      ))}
      </div>
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
          {!isAdmin && (
            <button
              className={`community-tab-btn${activeTab === 'dojo' ? ' active' : ''}`}
              onClick={() => setActiveTab('dojo')}
            >
              Dojo
            </button>
          )}
        </div>
      </IonHeader>
      <IonContent fullscreen>
        {activeTab === 'geral' && renderGeralTab()}
        {activeTab === 'dojo' && !isAdmin && renderDojoTab()}
      </IonContent>

      {/* News Creation Modal */}
      <IonModal isOpen={showNewsModal} onDidDismiss={() => {
        setShowNewsModal(false);
        resetNewsForm();
      }}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Adicionar Notícia</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setShowNewsModal(false)}>
              Fechar
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="community-modal-content">
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
                className="community-file-input"
              />
              {newNewsImage && <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>✓ {newNewsImage.name}</p>}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <IonButton expand="block" fill="solid" onClick={handleCreateNews} disabled={isSubmitting}>
                Publicar Notícia
              </IonButton>
              <IonButton expand="block" fill="clear" onClick={() => {
                setShowNewsModal(false);
                resetNewsForm();
              }}>
                Cancelar
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      <IonModal isOpen={showDojoModal} onDidDismiss={() => {
        setShowDojoModal(false);
        resetDojoForm();
      }}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Adicionar Post do Dojo</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => {
              setShowDojoModal(false);
              resetDojoForm();
            }}>
              Fechar
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="community-modal-content">
            <div>
              <IonLabel>Título *</IonLabel>
              <IonInput
                placeholder="Digite o título do post"
                value={newDojoTitle}
                onIonChange={e => setNewDojoTitle(e.detail.value || '')}
              />
            </div>

            <div>
              <IonLabel>Conteúdo *</IonLabel>
              <IonTextarea
                placeholder="Partilha uma atualização com o dojo"
                value={newDojoContent}
                onIonChange={e => setNewDojoContent(e.detail.value || '')}
                style={{ minHeight: 120 }}
              />
            </div>

            <div>
              <IonLabel>Link Externo (opcional)</IonLabel>
              <IonInput
                placeholder="https://exemplo.com"
                value={newDojoLink}
                onIonChange={e => setNewDojoLink(e.detail.value || '')}
              />
            </div>

            <div>
              <IonLabel>Vídeo - URL (opcional)</IonLabel>
              <IonInput
                placeholder="https://exemplo.com/video.mp4"
                value={newDojoVideo}
                onIonChange={e => setNewDojoVideo(e.detail.value || '')}
              />
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ddd' }}>
              <IonLabel style={{ display: 'block', marginBottom: 8 }}>Criar Votação (opcional)</IonLabel>
              <IonInput
                placeholder="Pergunta da votação"
                value={newPollQuestion}
                onIonChange={e => setNewPollQuestion(e.detail.value || '')}
                style={{ marginBottom: 8 }}
              />

              {newPollOptions.map((option, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 8, alignItems: 'center' }}>
                  <IonInput
                    placeholder={`Opção ${i + 1}`}
                    value={option}
                    onIonChange={e => {
                      const newOptions = [...newPollOptions];
                      newOptions[i] = e.detail.value || '';
                      setNewPollOptions(newOptions);
                    }}
                    style={{ flex: 1 }}
                  />
                  <IonButton
                    size="small"
                    fill="clear"
                    onClick={() => setNewPollOptions(newPollOptions.filter((_, idx) => idx !== i))}
                  >
                    <IonIcon icon={close} />
                  </IonButton>
                </div>
              ))}

              <IonButton
                size="small"
                fill="outline"
                onClick={() => setNewPollOptions([...newPollOptions, ''])}
                style={{ marginBottom: 8 }}
              >
                + Adicionar Opção
              </IonButton>
            </div>

            <div>
              <IonLabel>Imagem (opcional)</IonLabel>
              <input
                type="file"
                accept="image/*"
                onChange={e => setNewDojoImage(e.target.files?.[0] || null)}
                className="community-file-input"
              />
              {newDojoImage && <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>✓ {newDojoImage.name}</p>}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <IonButton expand="block" fill="solid" onClick={handleCreateDojoPost} disabled={isSubmitting}>
                Publicar Post
              </IonButton>
              <IonButton expand="block" fill="clear" onClick={() => {
                setShowDojoModal(false);
                resetDojoForm();
              }}>
                Cancelar
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Modal Editar Post */}
      <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Editar Post</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setShowEditModal(false)}>
              <IonIcon slot="icon-only" icon={close}></IonIcon>
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="community-modal-content">
            <div>
              <IonLabel>Título *</IonLabel>
              <IonInput
                placeholder="Digite o título do post"
                value={editTitle}
                onIonChange={e => setEditTitle(e.detail.value || '')}
              />
            </div>

            <div>
              <IonLabel>Conteúdo *</IonLabel>
              <IonTextarea
                placeholder="Partilha uma atualização com o dojo"
                value={editContent}
                onIonChange={e => setEditContent(e.detail.value || '')}
                style={{ minHeight: 120 }}
              />
            </div>

            <div>
              <IonLabel>Link Externo (opcional)</IonLabel>
              <IonInput
                placeholder="https://exemplo.com"
                value={editLink}
                onIonChange={e => setEditLink(e.detail.value || '')}
              />
            </div>

            <div>
              <IonLabel>Vídeo - URL (opcional)</IonLabel>
              <IonInput
                placeholder="https://exemplo.com/video.mp4"
                value={editVideo}
                onIonChange={e => setEditVideo(e.detail.value || '')}
              />
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ddd' }}>
              <IonLabel style={{ display: 'block', marginBottom: 8 }}>Criar Votação (opcional)</IonLabel>
              <IonInput
                placeholder="Pergunta da votação"
                value={editPollQuestion}
                onIonChange={e => setEditPollQuestion(e.detail.value || '')}
                style={{ marginBottom: 8 }}
              />
              
              {editPollOptions.map((option, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 8, alignItems: 'center' }}>
                  <IonInput
                    placeholder={`Opção ${i + 1}`}
                    value={option}
                    onIonChange={e => {
                      const newOptions = [...editPollOptions];
                      newOptions[i] = e.detail.value || '';
                      setEditPollOptions(newOptions);
                    }}
                    style={{ flex: 1 }}
                  />
                  <IonButton 
                    size="small" 
                    fill="clear"
                    onClick={() => setEditPollOptions(editPollOptions.filter((_, idx) => idx !== i))}
                  >
                    <IonIcon icon={close} />
                  </IonButton>
                </div>
              ))}
              
              <IonButton
                size="small"
                fill="outline"
                onClick={() => setEditPollOptions([...editPollOptions, ''])}
                style={{ marginBottom: 8 }}
              >
                + Adicionar Opção
              </IonButton>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <IonButton expand="block" fill="solid" onClick={handleSaveEdit} disabled={isSubmitting}>
                Guardar Alterações
              </IonButton>
              <IonButton expand="block" fill="clear" onClick={() => setShowEditModal(false)}>
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