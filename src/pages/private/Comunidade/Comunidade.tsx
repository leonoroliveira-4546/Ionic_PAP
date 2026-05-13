// import React, { useState, useEffect } from 'react';
// import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonModal, IonButton, IonInput, IonTextarea, IonIcon, IonItem, IonLabel, IonAvatar } from '@ionic/react';
// import { heart, heartOutline, chatbubbleOutline, trash } from 'ionicons/icons';
// import Navbar from '../../../components/MainLayout';
// import FeedPost from '../../../components/FeedPost';
// import YouTubeFeed from '../../../components/YouTubeFeed';
// import '../../../pages/StylesPages.css';
// import './DojoPostModal.css';
// import comunidadeApi from '../../../hooks/comunidadeApi';
// import { useAuth } from '../../../AuthContext';

// const Comunidade: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'geral' | 'dojo'>('geral');
//   const [contents, setContents] = useState<any[]>([]);
//   const [showNewsModal, setShowNewsModal] = useState(false);
//   const [newNewsTitle, setNewNewsTitle] = useState('');
//   const [newNewsContent, setNewNewsContent] = useState('');
//   const [newNewsLink, setNewNewsLink] = useState('');
//   const [newNewsImage, setNewNewsImage] = useState<File | null>(null);
//   const [selectedNewsForComments, setSelectedNewsForComments] = useState<string | null>(null);
//   const [selectedDojoPostForComments, setSelectedDojoPostForComments] = useState<string | null>(null);
//   const [newComment, setNewComment] = useState('');
//   const [livesCount, setLivesCount] = useState<number | null>(null);
//   const [videosCount, setVideosCount] = useState<number | null>(null);
//   const { user } = useAuth();
//   const {
//     getContents,
//     createContent,
//     likeContent,
//     addComment,
//     deleteComment
//   } = comunidadeApi();
//   const transformPost = (post: any) => ({
//     id: post._id,
//     author: {
//       id: post.author._id,
//       name: post.author.username,
//       avatar: post.author.profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author.username) + '&background=random&size=100',
//       belt: 'Preta'
//     },
//     content: post.message,
//     image: post.imagens[0] || undefined,
//     timestamp: post.createdAt,
//     likes: post.likes.length,
//     comments: post.comments.map((c: any) => ({
//       id: c._id,
//       author: {
//         id: c.author._id,
//         name: c.author.username,
//         avatar: c.author.profilePic || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(c.author.username) + '&background=random&size=100'
//       },
//       content: c.message,
//       timestamp: c.createdAt
//     })),
//     type: 'geral' as const
//   });

//   // Handle Vote Poll
//   const handleVotePoll = async (pollId: string, optionIndex: number) => {
//     console.log('Vote on poll:', pollId, optionIndex);
//     // Implement vote functionality
//   };

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const data = await getContents(undefined, activeTab);
//         setContents(data.data || []);
//       } catch (err) {
//         console.error(err);
//       }
//     };

//     load();
//   }, [activeTab, getContents]);

//   //  const handleCreate = async () => {
//   //   if (!title.trim()) return;
//   //   try {
//   //     const form = new FormData();
//   //     form.append('title', title);
//   //     form.append('message', message);
//   //     if (link) form.append('link', link);
//   //     if (file) form.append('file', file);

//   //     await createContent(form, 'news', activeTab);

//   //     const refreshed = await getContents(undefined, activeTab);
//   //     setContents(refreshed.data || []);

//   //     setShowModal(false);
//   //     setTitle('');
//   //     setMessage('');
//   //     setLink('');
//   //     setFile(null);

//   //   } catch (err) {
//   //     console.error(err);
//   //   }
//   // };

//   const renderGeralTab = () => (
//     <div className="page background">
//       <h2>🌍 Comunidade Geral</h2>

//         <div style={{ marginBottom: 16 }}>
//           <IonButton expand="block" onClick={() => setShowNewsModal(true)}>
//             ✍️ Adicionar notícia
//           </IonButton>
//         </div>

//         <div className="news-section">
//           <div className="news-label">📰 Notícias</div>
//           <IonList className='background'>
//             {news.map(item => (
//               <IonCard key={item._id} className="news-card" style={{ marginBottom: 16 }}>
//                 <IonCardHeader>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
//                     <IonAvatar style={{ width: 32, height: 32 }}>
//                       <img src={item.author?.profilePic || 'https://ui-avatars.com/api/?name=Admin'} alt={item.author?.username} />
//                     </IonAvatar>
//                     <div style={{ flex: 1 }}>
//                       <strong>{item.author?.username || 'Admin'}</strong>
//                       <div style={{ fontSize: 12, color: '#999' }}>
//                         {new Date(item.createdAt).toLocaleDateString('pt-BR')} {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
//                       </div>
//                     </div>
//                   </div>
//                   <IonCardTitle>{item.title}</IonCardTitle>
//                 </IonCardHeader>
//                 <IonCardContent>
//                   {item.imagens && item.imagens.length > 0 && (
//                     <img src={item.imagens[0]} alt={item.title} style={{ width: '100%', maxHeight: 300, objectFit: 'cover', marginBottom: 12, borderRadius: 8 }} />
//                   )}
//                   <p>{item.content}</p>
//                   {item.link && (
//                     <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none', fontSize: 12 }}>
//                       🔗 {item.link}
//                     </a>
//                   )}

//                   {/* Likes and Comments Section */}
//                   <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <button
//                       onClick={() => handleLikeNews(item._id)}
//                       style={{
//                         background: 'none',
//                         border: 'none',
//                         cursor: 'pointer',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: 4,
//                         fontSize: 14,
//                         color: item.likes.includes(user?._id) ? '#e74c3c' : '#999'
//                       }}
//                     >
//                       <IonIcon icon={item.likes.includes(user?._id) ? heart : heartOutline} />
//                       {item.likes.length}
//                     </button>
//                     <button
//                       onClick={() => setSelectedNewsForComments(selectedNewsForComments === item._id ? null : item._id)}
//                       style={{
//                         background: 'none',
//                         border: 'none',
//                         cursor: 'pointer',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: 4,
//                         fontSize: 14,
//                         color: '#999'
//                       }}
//                     >
//                       <IonIcon icon={chatbubbleOutline} />
//                       {item.comments.length}
//                     </button>
//                   </div>

//                   {/* Comments Section */}
//                   {selectedNewsForComments === item._id && (
//                     <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ddd' }}>
//                       <div style={{ marginBottom: 12, maxHeight: 200, overflowY: 'auto' }}>
//                         {item.comments.length > 0 ? (
//                           item.comments.map((comment: any) => (
//                             <div key={comment._id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
//                               <div style={{ display: 'flex', gap: 8 }}>
//                                 <IonAvatar style={{ width: 24, height: 24 }}>
//                                   <img src={comment.author?.profilePic || 'https://ui-avatars.com/api/?name=' + comment.author?.username} alt={comment.author?.username} />
//                                 </IonAvatar>
//                                 <div style={{ flex: 1 }}>
//                                   <strong style={{ fontSize: 12 }}>{comment.author?.username}</strong>
//                                   <p style={{ margin: '4px 0', fontSize: 13 }}>{comment.message}</p>
//                                   <small style={{ color: '#999' }}>{new Date(comment.createdAt).toLocaleDateString('pt-BR')}</small>
//                                 </div>
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <p style={{ fontSize: 12, color: '#999' }}>Sem comentários ainda</p>
//                         )}
//                       </div>

//                       {/* Add Comment */}
//                       <div style={{ display: 'flex', gap: 8 }}>
//                         <IonInput
//                           placeholder="Adicionar comentário..."
//                           value={newComment}
//                           onIonChange={e => setNewComment(e.detail.value || '')}
//                           style={{ flex: 1 }}
//                         />
//                         <IonButton fill="clear" onClick={() => handleAddCommentToNews(item._id)}>
//                           Enviar
//                         </IonButton>
//                       </div>
//                     </div>
//                   )}
//                 </IonCardContent>
//               </IonCard>
//             ))}
//           </IonList>
//         </div>

//       <div style={{ display: videosCount === 0 ? 'none' : 'block' }}>
//         <div className="news-section">
//           <div className="news-label">🔴 Ao Vivo Agora</div>
//           <YouTubeFeed category="lives" limit={3} onLoaded={count => setLivesCount(count)} />
//         </div>
//       </div>

//       <div style={{ display: videosCount === 0 ? 'none' : 'block' }}>
//         <div className="news-section">
//           <div className="news-label">🎥 Vídeos em Destaque</div>
//           <YouTubeFeed category="videos" limit={5} onLoaded={count => setVideosCount(count)} />
//         </div>
//       </div>
//     </div>
//   );

//   const renderDojoTab = () => {
//     // Get user's dojo from local storage or context
//     const userDojoStr = localStorage.getItem('userDojo');
//     const dojoId = userDojoStr ? JSON.parse(userDojoStr) : null;
    
//     // Check if user is sensei by comparing with user's sensei status
//     // This assumes the user object has a field indicating dojos where they're sensei
//     const isSensei = user?.type === 'sensei' || (Array.isArray(user?.dojos) && user?.dojos?.some((d: any) => d._id === dojoId || d === dojoId));

//     if (!dojoId) {
//       return (
//         <div className="page background">
//           <h2>🥋 Comunidade do Dojo</h2>
//           <div style={{ padding: 20, textAlign: 'center' }}>
//             <p>Você não está vinculado a um dojo. Junte-se a um dojo para começar!</p>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="page background">
//         <h2>🥋 Comunidade do Dojo</h2>

//         {/* Create Post Button - Only for Sensei */}
//         {isSensei && (
//           <button
//             className="create-post-btn"
//             onClick={() => setShowDojoPostModal(true)}
//             style={{ marginBottom: 16 }}
//           >
//             ✏️ Criar Publicação
//           </button>
//         )}

//         {/* Dojo Posts Feed */}
//         {dojoPosts.length > 0 ? (
//           dojoPosts.map(post => (
//             <IonCard key={post._id} style={{ marginBottom: 16 }}>
//               <IonCardHeader>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
//                   <IonAvatar style={{ width: 32, height: 32 }}>
//                     <img src={post.author?.profilePic || 'https://ui-avatars.com/api/?name=Sensei'} alt={post.author?.username} />
//                   </IonAvatar>
//                   <div style={{ flex: 1 }}>
//                     <strong>{post.author?.username || 'Sensei'}</strong>
//                     <div style={{ fontSize: 12, color: '#999' }}>
//                       {new Date(post.createdAt).toLocaleDateString('pt-BR')} {new Date(post.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
//                     </div>
//                   </div>
//                   {post.isImportant && (
//                     <div style={{ background: '#ff9800', color: 'white', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 'bold' }}>
//                       ⭐ Importante
//                     </div>
//                   )}
//                   {isSensei && post.author._id === user?._id && (
//                     <IonButton fill="clear" color="danger" size="small" onClick={() => handleDeleteDojoPost(post._id)}>
//                       <IonIcon icon={trash} />
//                     </IonButton>
//                   )}
//                 </div>
//                 <IonCardTitle>{post.title}</IonCardTitle>
//               </IonCardHeader>
//               <IonCardContent>
//                 <p>{post.content}</p>

//                 {/* Attachments */}
//                 {post.attachments && post.attachments.length > 0 && (
//                   <div style={{ marginTop: 12, marginBottom: 12 }}>
//                     {post.attachments.map((att: any, index: number) => (
//                       <div key={index} style={{ marginBottom: 10 }}>
//                         {att.type === 'image' && (
//                           <img src={att.url} alt={att.title} style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }} />
//                         )}
//                         {att.type === 'video' && (
//                           <video controls style={{ width: '100%', maxHeight: 300, borderRadius: 8 }}>
//                             <source src={att.url} />
//                           </video>
//                         )}
//                         {att.type === 'link' && (
//                           <a href={att.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none', display: 'block', padding: 10, background: '#f0f0f0', borderRadius: 6 }}>
//                             🔗 {att.title}
//                           </a>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {/* Poll */}
//                 {post.poll && (
//                   <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 12, borderLeft: '4px solid #007bff' }}>
//                     <strong>{post.poll.question}</strong>
//                     <div style={{ marginTop: 10 }}>
//                       {post.poll.options.map((option: any, index: number) => (
//                         <div key={index} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
//                           <input type="radio" name={`poll-${post._id}`} onChange={() => handleVotePoll(post.poll._id, index)} />
//                           <label style={{ flex: 1, cursor: 'pointer', marginBottom: 0 }}>{option.text} ({option.votes.length})</label>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Likes and Comments Section */}
//                 <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <button
//                     onClick={() => handleLikeDojoPost(post._id)}
//                     style={{
//                       background: 'none',
//                       border: 'none',
//                       cursor: 'pointer',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: 4,
//                       fontSize: 14,
//                       color: post.likes.includes(user?._id) ? '#e74c3c' : '#999'
//                     }}
//                   >
//                     <IonIcon icon={post.likes.includes(user?._id) ? heart : heartOutline} />
//                     {post.likes.length}
//                   </button>
//                   <button
//                     onClick={() => setSelectedDojoPostForComments(selectedDojoPostForComments === post._id ? null : post._id)}
//                     style={{
//                       background: 'none',
//                       border: 'none',
//                       cursor: 'pointer',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: 4,
//                       fontSize: 14,
//                       color: '#999'
//                     }}
//                   >
//                     <IonIcon icon={chatbubbleOutline} />
//                     {post.comments.length}
//                   </button>
//                 </div>

//                 {/* Comments Section */}
//                 {selectedDojoPostForComments === post._id && (
//                   <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #ddd' }}>
//                     <div style={{ marginBottom: 12, maxHeight: 200, overflowY: 'auto' }}>
//                       {post.comments.length > 0 ? (
//                         post.comments.map((comment: any) => (
//                           <div key={comment._id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #eee', display: 'flex', gap: 8 }}>
//                             <IonAvatar style={{ width: 24, height: 24 }}>
//                               <img src={comment.author?.profilePic || 'https://ui-avatars.com/api/?name=' + comment.author?.username} alt={comment.author?.username} />
//                             </IonAvatar>
//                             <div style={{ flex: 1 }}>
//                               <strong style={{ fontSize: 12 }}>{comment.author?.username}</strong>
//                               <p style={{ margin: '4px 0', fontSize: 13 }}>{comment.message}</p>
//                               <small style={{ color: '#999' }}>{new Date(comment.createdAt).toLocaleDateString('pt-BR')}</small>
//                             </div>
//                             {(comment.author._id === user?._id || isSensei) && (
//                               <IonButton fill="clear" color="danger" size="small" onClick={() => handleDeleteDojoComment(comment._id, post._id)}>
//                                 <IonIcon icon={trash} />
//                               </IonButton>
//                             )}
//                           </div>
//                         ))
//                       ) : (
//                         <p style={{ fontSize: 12, color: '#999' }}>Sem comentários ainda</p>
//                       )}
//                     </div>

//                     {/* Add Comment */}
//                     <div style={{ display: 'flex', gap: 8 }}>
//                       <IonInput
//                         placeholder="Adicionar comentário..."
//                         value={newComment}
//                         onIonChange={e => setNewComment(e.detail.value || '')}
//                         style={{ flex: 1 }}
//                       />
//                       <IonButton fill="clear" onClick={() => handleAddDojoComment(post._id)}>
//                         Enviar
//                       </IonButton>
//                     </div>
//                   </div>
//                 )}
//               </IonCardContent>
//             </IonCard>
//           ))
//         ) : (
//           <div className="empty-state">
//             <p>{isSensei ? 'Nenhum post ainda. Seja o primeiro a publicar! 🎉' : 'Sem publicações no momento.'}</p>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <IonPage>
//       <IonHeader>
//         <IonToolbar>
//           <IonTitle>Comunidade</IonTitle>
//         </IonToolbar>
//         <div className="community-tabs">
//           <button
//             className={`community-tab-btn${activeTab === 'geral' ? ' active' : ''}`}
//             onClick={() => setActiveTab('geral')}
//           >
//             Geral
//           </button>
//           <button
//             className={`community-tab-btn${activeTab === 'dojo' ? ' active' : ''}`}
//             onClick={() => setActiveTab('dojo')}
//           >
//             Dojo
//           </button>
//         </div>
//       </IonHeader>
//       <IonContent fullscreen>
//         {activeTab === 'geral' && renderGeralTab()}
//         {activeTab === 'dojo' && renderDojoTab()}
//       </IonContent>

//       {/* News Creation Modal */}
//       <IonModal isOpen={showNewsModal} onDidDismiss={() => setShowNewsModal(false)}>
//         <IonHeader>
//           <IonToolbar>
//             <IonTitle>Adicionar Notícia</IonTitle>
//             <IonButton slot="end" fill="clear" onClick={() => setShowNewsModal(false)}>
//               Fechar
//             </IonButton>
//           </IonToolbar>
//         </IonHeader>
//         <IonContent>
//           <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
//             <div>
//               <IonLabel>Título *</IonLabel>
//               <IonInput
//                 placeholder="Digite o título da notícia"
//                 value={newNewsTitle}
//                 onIonChange={e => setNewNewsTitle(e.detail.value || '')}
//               />
//             </div>

//             <div>
//               <IonLabel>Conteúdo *</IonLabel>
//               <IonTextarea
//                 placeholder="Digite o conteúdo da notícia"
//                 value={newNewsContent}
//                 onIonChange={e => setNewNewsContent(e.detail.value || '')}
//                 style={{ minHeight: 120 }}
//               />
//             </div>

//             <div>
//               <IonLabel>Link Externo (opcional)</IonLabel>
//               <IonInput
//                 placeholder="https://exemplo.com"
//                 value={newNewsLink}
//                 onIonChange={e => setNewNewsLink(e.detail.value || '')}
//               />
//             </div>

//             <div>
//               <IonLabel>Imagem (opcional)</IonLabel>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={e => setNewNewsImage(e.target.files?.[0] || null)}
//                 style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4, width: '100%' }}
//               />
//               {newNewsImage && <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>✓ {newNewsImage.name}</p>}
//             </div>

//             <div style={{ display: 'flex', gap: 8 }}>
//               <IonButton expand="block" fill="solid" onClick={handleCreateNews}>
//                 Publicar Notícia
//               </IonButton>
//               <IonButton expand="block" fill="clear" onClick={() => setShowNewsModal(false)}>
//                 Cancelar
//               </IonButton>
//             </div>
//           </div>
//         </IonContent>
//       </IonModal>
//       <Navbar />
//     </IonPage>
//   );
// };

// export default Comunidade;