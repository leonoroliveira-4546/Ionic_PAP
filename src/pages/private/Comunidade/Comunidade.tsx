import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList } from '@ionic/react';
import Navbar from '../../../components/MainLayout';
import FeedPost from '../../../components/FeedPost';
import YouTubeFeed from '../../../components/YouTubeFeed';
import '../../../pages/StylesPages.css';
import comunidadeApi from '../../../hooks/comunidadeApi';

const Comunidade: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'dojo'>('geral');
  const [news, setNews] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const { getNews, getPosts: fetchPosts, likePost } = comunidadeApi();

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

  const renderGeralTab = () => (
    <div className="page background">
      <h2>🌍 Comunidade Geral</h2>

      {/* News Section */}
      <div className="news-section">
        <div className="news-label">📰 Notícias</div>
        <IonList className='background'>
          {news.length > 0 ? (
            news.map(item => (
              <IonCard key={item._id} className="news-card">
                <IonCardHeader>
                  <IonCardTitle>{item.title}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>{item.content}</p>
                  <small>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</small>
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            <div className="empty-state">
              <p>Sem notícias no momento</p>
            </div>
          )}
        </IonList>
      </div>

      {/* Lives Section */}
      <div className="news-section">
        <div className="news-label">🔴 Ao Vivo Agora</div>
        <YouTubeFeed category="lives" limit={3} />
      </div>

      {/* Videos Section */}
      <div className="news-section">
        <div className="news-label">🎥 Vídeos em Destaque</div>
        <YouTubeFeed category="videos" limit={5} />
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
      <Navbar />
    </IonPage>
  );
};

export default Comunidade;