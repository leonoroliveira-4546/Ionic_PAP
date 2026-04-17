import React, { useState, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonText } from '@ionic/react';
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
          onClick={() => {
            // Simulate creating post
            console.log('Create new post');
          }}
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
              // Refresh posts
              const postsData = await fetchPosts(activeTab);
              setPosts(postsData.data || []);
            } catch (error) {
              console.error('Error liking post:', error);
            }
          }}
          onComment={(postId, comment) => console.log('Commented on post:', postId, comment)}
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
    </IonPage>
  );
};

export default Comunidade;