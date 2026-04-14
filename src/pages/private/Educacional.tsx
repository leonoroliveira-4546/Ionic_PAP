import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonChip, IonSpinner, IonSearchbar, IonSegment, IonSegmentButton
} from '@ionic/react';
import { bookOutline, playOutline } from 'ionicons/icons';
import Navbar from '../../components/MainLayout';
import VideoCard from '../../components/VideoCard';
import { mockVideos, Video } from '../../mockData/videos';

type Category = 'all' | 'historia' | 'filosofia' | 'tecnicas';

const Educacional: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  useEffect(() => {
    // Simulate API call
    const loadVideos = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter educational videos
      const educationalVideos = mockVideos.filter(video =>
        ['historia', 'filosofia', 'tecnicas'].includes(video.category)
      );

      setVideos(educationalVideos);
      setFilteredVideos(educationalVideos);
      setLoading(false);
    };

    loadVideos();
  }, []);

  useEffect(() => {
    let filtered = videos;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(video => video.category === activeCategory);
    }

    // Filter by search
    if (search.trim() !== '') {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(search.toLowerCase()) ||
        video.description.toLowerCase().includes(search.toLowerCase()) ||
        video.channelName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by published date (newest first)
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    setFilteredVideos(filtered);
  }, [search, activeCategory, videos]);

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'historia', label: 'História' },
    { value: 'filosofia', label: 'Filosofia' },
    { value: 'tecnicas', label: 'Técnicas' }
  ];

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Área Educativa</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
        <Navbar />
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>📚 Área Educativa</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background">
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <IonText style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
            Aprenda Karatê
          </IonText>
          <p style={{ margin: '8px 0', color: 'var(--ion-color-medium)' }}>
            Conteúdo educativo sobre a arte marcial do karatê
          </p>
        </div>

        {/* Search */}
        <IonSearchbar
          value={search}
          onIonInput={e => setSearch(e.detail.value ?? '')}
          placeholder="Buscar conteúdo..."
          style={{ marginBottom: 16 }}
        />

        {/* Category Filter */}
        <div style={{ marginBottom: 16 }}>
          <IonSegment
            value={activeCategory}
            onIonChange={e => setActiveCategory(e.detail.value as Category)}
            style={{ '--background': 'var(--ion-color-light)' }}
          >
            {categories.map(cat => (
              <IonSegmentButton key={cat.value} value={cat.value}>
                <IonText style={{ fontSize: 14 }}>{cat.label}</IonText>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </div>

        {/* Results count */}
        <IonText color="medium">
          <p style={{ margin: '0 0 12px', fontSize: 14 }}>
            {filteredVideos.length} conteúdo{filteredVideos.length !== 1 ? 's' : ''} encontrado{filteredVideos.length !== 1 ? 's' : ''}
          </p>
        </IonText>

        {/* Content Grid */}
        {filteredVideos.length > 0 ? (
          <div>
            {filteredVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => {
                  // Simulate opening video
                  console.log('Opening educational video:', video.url);
                  // In a real app, this would open the video
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <IonText color="medium">
              <p>Nenhum conteúdo encontrado para esta categoria.</p>
            </IonText>
          </div>
        )}

        {/* Educational Tips */}
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--ion-color-light)', borderRadius: 12, marginTop: 20 }}>
          <IonText style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
            💡 Dicas de Estudo
          </IonText>
          <div style={{ marginTop: 12, textAlign: 'left' }}>
            <IonText style={{ fontSize: 14, color: 'var(--ion-color-medium)' }}>
              <p style={{ margin: '8px 0' }}>
                • <strong>História:</strong> Conheça as raízes do karatê em Okinawa<br />
                • <strong>Filosofia:</strong> Entenda o "Dô" - o caminho do karateca<br />
                • <strong>Técnicas:</strong> Domine katas e movimentos fundamentais<br />
                • <strong>Prática:</strong> Treine regularmente para progredir
              </p>
            </IonText>
          </div>
        </div>
      </IonContent>

      <Navbar />
    </IonPage>
  );
};

export default Educacional;