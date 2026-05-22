import React, { useState, useEffect, useCallback } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonModal, IonButton, IonInput, IonTextarea, IonIcon, IonLabel, IonAvatar } from '@ionic/react';
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
  replies?: CommunityComment[];
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
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [activeReplyComment, setActiveReplyComment] = useState<string | null>(null);
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
  const setCommentDraft = (contentId: string, value: string) => {
    setCommentDrafts(prev => ({ ...prev, [contentId]: value }));
  };

  const setReplyDraft = (commentId: string, value: string) => {
    setReplyDrafts(prev => ({ ...prev, [commentId]: value }));
  };

  const handleAddComment = async (id: string) => {
    const message = (commentDrafts[id] || '').trim();
    if (!message) return;
    await addComment(id, message);
    setCommentDrafts(prev => ({ ...prev, [id]: '' }));
    await loadContents();
  };

  const handleAddReply = async (contentId: string, parentCommentId: string) => {
    const message = (replyDrafts[parentCommentId] || '').trim();
    if (!message) return;
    await addComment(contentId, message, parentCommentId);
    setReplyDrafts(prev => ({ ...prev, [parentCommentId]: '' }));
    setActiveReplyComment(null);
    await loadContents();
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
    const message = (commentDrafts[id] || '').trim();
    if (!message) return;
    await addComment(id, message);
    setCommentDrafts(prev => ({ ...prev, [id]: '' }));
    await loadContents();
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
  <div>
    <section className="rounded-[32px] bg-gradient-to-r from-slate-950/5 via-slate-100/80 to-slate-950/5 p-8 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/80 mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Nossa Comunidade
        </h2>
      <p className="mt-3 text-base leading-7 text-slate-600">
        Conecta-te com a comunidade, partilha notícias e acompanha vídeos em destaque.
      </p>
    </section>

    {isAdmin && (
      <div className="mb-6">
        <button
          type="button"
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          onClick={() => setShowNewsModal(true)}
        >
          ✍️ Adicionar notícia
        </button>
      </div>
    )}

    <div className="mb-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">📰 Notícias</h3>
      </div>

      {news.map(item => (
        <IonCard
          key={item._id}
          className="w-full max-w-4xl mx-auto rounded-[32px] bg-white p-1 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/80 mb-8 overflow-hidden"
        >
            <IonCardHeader className="p-7 pb-0">
              <div className="flex items-center gap-2.5 mb-3">
                <IonAvatar className="w-10 h-10">
                  <img
                    src={item.author?.profilePic || 'https://ui-avatars.com/api/?name=Admin'}
                    alt={item.author?.username}
                  />
                </IonAvatar>

                <div className="flex-1">
                  <strong className="text-sm">{item.author?.username || 'Admin'}</strong>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}{' '}
                    {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <IonCardTitle className="text-2xl font-bold tracking-tight text-slate-900 mb-3">{item.title}</IonCardTitle>
            </IonCardHeader>

            <IonCardContent className="p-6 pt-0">
              {item.imagens?.[0] && (
                <img
                  src={item.imagens[0]}
                  alt={item.title}
                  className="w-full max-h-[420px] object-cover mb-5 rounded-2xl"
                />
              )}

              <p className="text-[15px] leading-7 text-slate-600 mb-4">{item.content || item.message}</p>

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 no-underline text-xs font-medium"
                >
                  🔗 Ver link
                </a>
              )}

              {/* LIKE + COMMENTS */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4 mt-4">
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(item._id)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${user?._id && item.likes?.includes(user._id) ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                  >
                    <IonIcon icon={chatbubbleOutline} />
                    {item.comments?.length || 0}
                  </button>
                </div>
              </div>

              {/* COMMENTS */}
              {selectedNewsForComments === item._id && (
                <div className="mt-6 pt-6 border-t border-slate-200/70">

                  <div className="mb-4 max-h-60 overflow-y-auto">
                    {(item.comments?.length ?? 0) > 0 ? (
                      (item.comments ?? []).map((comment: CommunityComment) => (
                        <div key={comment._id} className="mb-4 rounded-2xl bg-slate-50 p-4">
                          <div className="flex gap-2.5">
                            <IonAvatar className="w-7 h-7 min-w-7">
                              <img
                                src={
                                  comment.author?.profilePic ||
                                  'https://ui-avatars.com/api/?name=' + (comment.author?.username || 'User')
                                }
                                alt={comment.author?.username || 'User'}
                              />
                            </IonAvatar>

                            <div className="flex-1">
                              <strong className="text-xs block">
                                {comment.author?.username}
                              </strong>

                              <p className="m-1 text-xs text-gray-800 leading-relaxed">
                                {comment.message}
                              </p>

                              <div className="flex items-center gap-3 text-xs text-gray-400">
                                <small>{new Date(comment.createdAt).toLocaleDateString('pt-BR')}</small>
                                <button
                                  type="button"
                                  className="text-blue-500 hover:text-blue-700"
                                  onClick={() => setActiveReplyComment(comment._id)}
                                >
                                  Responder
                                </button>
                              </div>
                            </div>
                          </div>

                          {comment.replies?.length ? (
                            <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">
                              {comment.replies.map(reply => (
                                <div key={reply._id} className="rounded-2xl bg-white p-3">
                                  <div className="flex gap-2.5">
                                    <IonAvatar className="w-6 h-6 min-w-6">
                                      <img
                                        src={
                                          reply.author?.profilePic ||
                                          'https://ui-avatars.com/api/?name=' + (reply.author?.username || 'User')
                                        }
                                        alt={reply.author?.username || 'User'}
                                      />
                                    </IonAvatar>
                                    <div className="flex-1">
                                      <strong className="text-[11px] block">
                                        {reply.author?.username}
                                      </strong>
                                      <p className="text-[12px] text-slate-600 mt-1">{reply.message}</p>
                                      <small className="text-gray-400 text-[11px]">
                                        {new Date(reply.createdAt).toLocaleDateString('pt-BR')}
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {activeReplyComment === comment._id && (
                            <div className="mt-3 flex gap-2.5">
                              <IonInput
                                placeholder="Escrever resposta..."
                                value={replyDrafts[comment._id] || ''}
                                onIonChange={e => setReplyDraft(comment._id, e.detail.value || '')}
                                className="flex-1"
                              />
                              <IonButton fill="solid" size="small" onClick={() => handleAddReply(item._id, comment._id)}>
                                Responder
                              </IonButton>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">
                        Sem comentários ainda
                      </p>
                    )}
                  </div>

                  {/* ADD COMMENT */}
                  <div className="flex gap-2.5">
                    <IonInput
                      placeholder="Adicionar comentário..."
                      value={commentDrafts[item._id] || ''}
                      onIonChange={e => setCommentDraft(item._id, e.detail.value || '')}
                      className="flex-1"
                    />

                    <IonButton fill="solid" size="small" onClick={() => handleAddComment(item._id)}>
                      Enviar
                    </IonButton>
                  </div>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        ))}
      </div>

    <div className="mb-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">🔴 Ao Vivo Agora</h3>
      </div>
      <YouTubeFeed
        category="lives"
        limit={3}
        onLoaded={setLivesCount}
      />
    </div>

    <div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-2">🎥 Vídeos em Destaque</h3>
      </div>
      <YouTubeFeed
        category="videos"
        limit={5}
        onLoaded={setVideosCount}
      />
    </div>
  </div>
);

  const renderDojoTab = () => (
    <div>
      <section className="rounded-[32px] bg-gradient-to-r from-slate-950/5 via-slate-100/80 to-slate-950/5 p-8 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/80 mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Nossa Comunidade
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Conecta-te com a comunidade, partilha notícias e acompanha vídeos em destaque.
        </p>
      </section>

      {isSensei && (
        <div className="mb-6">
          <button
            type="button"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            onClick={() => setShowDojoModal(true)}
          >
            📝 Adicionar post do dojo
          </button>
        </div>
      )}

      <div>

        {dojoPosts.length === 0 && (
          <IonCard className="rounded-[32px] bg-white shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/80">
            <IonCardContent className="text-center p-8">
              <p className="text-sm text-gray-600 m-0">Ainda não existem publicações no dojo.</p>
            </IonCardContent>
          </IonCard>
        )}

      {dojoPosts.map(post => (
        <IonCard
          key={post._id}
          className="w-full max-w-4xl mx-auto rounded-[32px] bg-white p-1 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/80 mb-8 overflow-hidden"
        >
          <IonCardHeader className="p-7 pb-0">
            <div className="flex items-center gap-2.5 mb-3">
              <IonAvatar className="w-10 h-10">
                <img
                  src={post.author?.profilePic || 'https://ui-avatars.com/api/?name=Dojo'}
                  alt={post.author?.username}
                />
              </IonAvatar>

              <div className="flex-1">
                <strong className="text-sm">{post.author?.username || 'Dojo'}</strong>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(post.createdAt).toLocaleDateString('pt-BR')}{' '}
                  {new Date(post.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {user?._id === post.author?._id && (
                <div className="flex gap-1">
                  <IonButton fill="clear" size="small" onClick={() => handleOpenEdit(post)}>
                    <IonIcon slot="icon-only" icon={pencil}></IonIcon>
                  </IonButton>
                  <IonButton fill="clear" size="small" color="danger" onClick={() => handleDeletePost(post._id)}>
                    <IonIcon slot="icon-only" icon={trash}></IonIcon>
                  </IonButton>
                </div>
              )}
            </div>

            <IonCardTitle className="text-2xl font-bold tracking-tight text-slate-900 mb-3">{post.title}</IonCardTitle>
          </IonCardHeader>

          <IonCardContent className="p-6 pt-0">
            {post.imagens?.[0] && (
              <img
                src={post.imagens[0]}
                alt={post.title}
                className="w-full max-h-[420px] object-cover mb-5 rounded-2xl"
              />
            )}

            <p className="text-[15px] leading-7 text-slate-600 mb-4">{post.message || post.content}</p>

            {post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 no-underline text-xs font-medium block mb-3"
              >
                🔗 Ver link
              </a>
            )}

            {/* ATTACHMENTS */}
            {post.attachments?.map((att: CommunityAttachment, i: number) => (
              <div key={i} className="mb-4">
                {att.type === 'image' && <img src={att.url} alt="attachment" className="w-full max-h-70 object-cover rounded-xl" />}
                {att.type === 'video' && (
                  <div className="mb-3">
                    <iframe
                      width="100%"
                      height="280"
                      src={att.url.includes('youtube') ? att.url.replace('watch?v=', 'embed/') : att.url}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      title="Video player"
                      className="rounded-xl"
                    />
                  </div>
                )}
                {att.type === 'link' && (
                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 no-underline text-xs font-medium">
                    🔗 {att.title || att.url}
                  </a>
                )}
              </div>
            ))}

            {/* POLL */}
            {post.poll && (
              <div className="mt-3 p-4 bg-gray-50 rounded-xl mb-4">
                <strong className="block mb-3 text-sm">📊 {post.poll?.question}</strong>
                {post.poll?.options.map((o: CommunityPollOption, i: number) => {
                  const totalVotes = post.poll?.options.reduce((acc, opt) => acc + opt.votes.length, 0) || 0;
                  const percentage = totalVotes > 0 ? Math.round((o.votes.length / totalVotes) * 100) : 0;
                  
                  return (
                    <div key={i} className="mb-3">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name={`poll-${post._id}`}
                          onChange={() => handleVotePoll(post._id, i)}
                          className="cursor-pointer"
                        />
                        <span className="flex-1 text-xs">{o.text}</span>
                        <span className="text-xs text-gray-500 min-w-10">{percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded overflow-hidden ml-7 mt-1">
                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                      <div className="text-xs text-gray-400 ml-7 mt-1">{o.votes.length} voto{o.votes.length !== 1 ? 's' : ''}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LIKE + COMMENTS */}
            <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4 mt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLikeDojoPost(post._id)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${user?._id && post.likes?.includes(user._id) ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
                  className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  <IonIcon icon={chatbubbleOutline} />
                  {post.comments?.length || 0}
                </button>
              </div>
            </div>

            {/* COMMENTS */}
            {selectedDojoPostForComments === post._id && (
              <div className="mt-6 pt-6 border-t border-slate-200/70">
                <div className="mb-4 max-h-60 overflow-y-auto">
                  {(post.comments ?? []).map((c: CommunityComment) => (
                    <div key={c._id} className="mb-4 rounded-2xl bg-slate-50 p-4">
                      <div className="flex gap-2.5">
                        <IonAvatar className="w-7 h-7 min-w-7">
                          <img
                            src={
                              c.author?.profilePic ||
                              'https://ui-avatars.com/api/?name=' + (c.author?.username || 'User')
                            }
                            alt={c.author?.username || 'User'}
                          />
                        </IonAvatar>

                        <div className="flex-1">
                          <strong className="text-xs block">{c.author?.username}</strong>
                          <p className="m-1 text-xs text-gray-800 leading-relaxed">{c.message}</p>

                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <small>{new Date(c.createdAt).toLocaleDateString('pt-BR')}</small>
                            <button
                              type="button"
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => setActiveReplyComment(c._id)}
                            >
                              Responder
                            </button>
                          </div>
                        </div>
                      </div>

                      {c.replies?.length ? (
                        <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">
                          {c.replies.map(reply => (
                            <div key={reply._id} className="rounded-2xl bg-white p-3">
                              <div className="flex gap-2.5">
                                <IonAvatar className="w-6 h-6 min-w-6">
                                  <img
                                    src={
                                      reply.author?.profilePic ||
                                      'https://ui-avatars.com/api/?name=' + (reply.author?.username || 'User')
                                    }
                                    alt={reply.author?.username || 'User'}
                                  />
                                </IonAvatar>
                                <div className="flex-1">
                                  <strong className="text-[11px] block">
                                    {reply.author?.username}
                                  </strong>
                                  <p className="text-[12px] text-slate-600 mt-1">{reply.message}</p>
                                  <small className="text-gray-400 text-[11px]">
                                    {new Date(reply.createdAt).toLocaleDateString('pt-BR')}
                                  </small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {activeReplyComment === c._id && (
                        <div className="mt-3 flex gap-2.5">
                          <IonInput
                            placeholder="Escrever resposta..."
                            value={replyDrafts[c._id] || ''}
                            onIonChange={e => setReplyDraft(c._id, e.detail.value || '')}
                            className="flex-1"
                          />
                          <IonButton fill="solid" size="small" onClick={() => handleAddReply(post._id, c._id)}>
                            Responder
                          </IonButton>
                        </div>
                      )}

                      {user?._id === c.author?._id && (
                        <IonButton
                          fill="clear"
                          color="danger"
                          size="small"
                          onClick={() => handleDeleteDojoComment(c._id)}
                        >
                          <IonIcon icon={trash} />
                        </IonButton>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2.5">
                  <IonInput
                    placeholder="Adicionar comentário..."
                    value={commentDrafts[post._id] || ''}
                    onIonChange={e => setCommentDraft(post._id, e.detail.value || '')}
                    className="flex-1"
                  />

                  <IonButton fill="solid" size="small" onClick={() => handleAddDojoComment(post._id)}>
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
      <IonContent fullscreen className="content">
        <div className="space-y-8 text-slate-900 max-w-5xl mx-auto p-8">
          <div className="flex gap-4 mb-6">
            <button
              className={`px-4 py-2 font-semibold rounded-lg transition ${activeTab === 'geral' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}
              onClick={() => setActiveTab('geral')}
            >
              Geral
            </button>
            {!isAdmin && (
              <button
                className={`px-4 py-2 font-semibold rounded-lg transition ${activeTab === 'dojo' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}
                onClick={() => setActiveTab('dojo')}
              >
                Dojo
              </button>
            )}
          </div>

          {activeTab === 'geral' && renderGeralTab()}
          {activeTab === 'dojo' && !isAdmin && renderDojoTab()}
        </div>
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
        <IonContent className="bg-slate-950/5 text-slate-900">
          <div className="space-y-5 p-6">
            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Título *</IonLabel>
              <IonInput
                placeholder="Digite o título da notícia"
                value={newNewsTitle}
                onIonChange={e => setNewNewsTitle(e.detail.value || '')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
            </div>

            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Conteúdo *</IonLabel>
              <IonTextarea
                placeholder="Digite o conteúdo da notícia"
                value={newNewsContent}
                onIonChange={e => setNewNewsContent(e.detail.value || '')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                style={{ minHeight: 120 }}
              />
            </div>

            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Link Externo (opcional)</IonLabel>
              <IonInput
                placeholder="https://exemplo.com"
                value={newNewsLink}
                onIonChange={e => setNewNewsLink(e.detail.value || '')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
            </div>

            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Imagem (opcional)</IonLabel>
              <input
                type="file"
                accept="image/*"
                onChange={e => setNewNewsImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
              {newNewsImage && <p className="mt-2 text-xs text-gray-600">✓ {newNewsImage.name}</p>}
            </div>

            <div className="flex gap-2 pt-4">
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
        <IonContent className="bg-slate-950/5 text-slate-900">
          <div className="space-y-5 p-6">
            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Título *</IonLabel>
              <IonInput
                placeholder="Digite o título do post"
                value={newDojoTitle}
                onIonChange={e => setNewDojoTitle(e.detail.value || '')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
            </div>

            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Conteúdo *</IonLabel>
              <IonTextarea
                placeholder="Partilha uma atualização com o dojo"
                value={newDojoContent}
                onIonChange={e => setNewDojoContent(e.detail.value || '')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                style={{ minHeight: 120 }}
              />
            </div>

            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Link Externo (opcional)</IonLabel>
              <IonInput
                placeholder="https://exemplo.com"
                value={newDojoLink}
                onIonChange={e => setNewDojoLink(e.detail.value || '')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
            </div>

            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Vídeo - URL (opcional)</IonLabel>
              <IonInput
                placeholder="https://exemplo.com/video.mp4"
                value={newDojoVideo}
                onIonChange={e => setNewDojoVideo(e.detail.value || '')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <IonLabel className="block mb-3 font-medium text-sm">Criar Votação (opcional)</IonLabel>
              <IonInput
                placeholder="Pergunta da votação"
                value={newPollQuestion}
                onIonChange={e => setNewPollQuestion(e.detail.value || '')}
                className="border border-slate-200 rounded-lg px-3 py-2 mb-3"
              />

              {newPollOptions.map((option, i) => (
                <div key={i} className="flex gap-1 mb-3 items-center">
                  <IonInput
                    placeholder={`Opção ${i + 1}`}
                    value={option}
                    onIonChange={e => {
                      const newOptions = [...newPollOptions];
                      newOptions[i] = e.detail.value || '';
                      setNewPollOptions(newOptions);
                    }}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2"
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
                className="mb-3"
              >
                + Adicionar Opção
              </IonButton>
            </div>

            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Imagem (opcional)</IonLabel>
              <input
                type="file"
                accept="image/*"
                onChange={e => setNewDojoImage(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />
              {newDojoImage && <p className="mt-2 text-xs text-gray-600">✓ {newDojoImage.name}</p>}
            </div>

            <div className="flex gap-2 pt-4">
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
        <IonContent className="bg-slate-950/5 text-slate-900">
          <div className="space-y-5 p-6">
            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Título *</IonLabel>
              <IonInput
                placeholder="Digite o título do post"
                value={editTitle}
                onIonChange={e => setEditTitle(e.detail.value || '')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
            </div>

            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Conteúdo *</IonLabel>
              <IonTextarea
                placeholder="Partilha uma atualização com o dojo"
                value={editContent}
                onIonChange={e => setEditContent(e.detail.value || '')}
               className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                style={{ minHeight: 120 }}
              />
            </div>

            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Link Externo (opcional)</IonLabel>
              <IonInput
                placeholder="https://exemplo.com"
                value={editLink}
                onIonChange={e => setEditLink(e.detail.value || '')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
            </div>

            <div>
              <IonLabel className="block mb-2 font-medium text-sm">Vídeo - URL (opcional)</IonLabel>
              <IonInput
                placeholder="https://exemplo.com/video.mp4"
                value={editVideo}
                onIonChange={e => setEditVideo(e.detail.value || '')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <IonLabel className="block mb-3 font-medium text-sm">Criar Votação (opcional)</IonLabel>
              <IonInput
                placeholder="Pergunta da votação"
                value={editPollQuestion}
                onIonChange={e => setEditPollQuestion(e.detail.value || '')}
                className="border border-slate-200 rounded-lg px-3 py-2 mb-3"
              />
              
              {editPollOptions.map((option, i) => (
                <div key={i} className="flex gap-1 mb-3 items-center">
                  <IonInput
                    placeholder={`Opção ${i + 1}`}
                    value={option}
                    onIonChange={e => {
                      const newOptions = [...editPollOptions];
                      newOptions[i] = e.detail.value || '';
                      setEditPollOptions(newOptions);
                    }}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2"
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
                className="mb-3"
              >
                + Adicionar Opção
              </IonButton>
            </div>

            <div className="flex gap-2 pt-4">
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