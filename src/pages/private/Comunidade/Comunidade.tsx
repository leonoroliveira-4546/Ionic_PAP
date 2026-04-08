import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem } from '@ionic/react';
import Navbar from '../../../components/MainLayout';
import { mockNews, mockDojoPosts } from '../../../mockData/community';
import '../../../pages/StylesPages.css';

const Comunidade: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'geral' | 'dojo'>('geral');

  const renderGeralTab = () => (
    <div className="page background">
      <h2>Notícias e Torneios</h2>
      <IonList className='background'>
        {mockNews.map(item => (
          <IonCard key={item._id}>
            <IonCardHeader>
              <IonCardTitle>{item.title}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>{item.content}</p>
              <small>{item.date}</small>
            </IonCardContent>
          </IonCard>
        ))}
      </IonList>
    </div>
  );

  const renderDojoTab = () => (
    <div className="page background">
      <h2>Informações do Dojo</h2>
      <IonList className='background'>
        {mockDojoPosts.map(post => (
          <IonCard key={post._id}>
            <IonCardHeader>
              <IonCardTitle>{post.author}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>{post.content}</p>
              <small>{post.date}</small>
            </IonCardContent>
          </IonCard>
        ))}
      </IonList>
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