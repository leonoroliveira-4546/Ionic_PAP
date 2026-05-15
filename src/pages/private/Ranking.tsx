import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonSpinner, IonSearchbar, IonButton
} from '@ionic/react';
import { trophyOutline } from 'ionicons/icons';
import Navbar from '../../components/MainLayout';
import RankingItem from '../../components/RankingItem';
import userApi from '../../hooks/userApi';
import { User } from '../../mockData/users';

type RankingUser = User;

const Ranking: React.FC = () => {
  const [generalUsers, setGeneralUsers] = useState<RankingUser[]>([]);
  const [dojoUsers, setDojoUsers] = useState<RankingUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<RankingUser[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'dojo'>('general');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { getRanking } = userApi();

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const response = await getRanking();
        const mapUsers = (list: any[]) => list.map((u: any) => ({
          _id: u._id,
          username: u.username,
          name: u.name || u.username,
          profilePic: u.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=random&size=100`,
          email: u.email || `${u.username}@example.com`,
          type: u.type || 'atleta',
          dojo: u.dojo || 'Dojo',
          belt: u.belt || 'Branca',
          points: u.points || 0,
          ranking: u.ranking || 0
        }));

        const general = response.success ? mapUsers(response.general || []) : [];
        const dojo = response.success ? mapUsers(response.dojo || []) : [];

        setGeneralUsers(general);
        setDojoUsers(dojo);
        setFilteredUsers(activeTab === 'dojo' ? dojo : general);
      } catch (err) {
        console.error(err);
        setGeneralUsers([]);
        setDojoUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [getRanking]);

  useEffect(() => {
    const source = activeTab === 'dojo' ? dojoUsers : generalUsers;

    if (search.trim() === '') {
      setFilteredUsers(source);
      return;
    }

    const filtered = source.filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [search, generalUsers, dojoUsers, activeTab]);

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Ranking</IonTitle>
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
          <IonTitle>🏆 Ranking</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background">
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <IonText style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
            Ranking de Karatecas
          </IonText>
          <p style={{ margin: '8px 0', color: 'var(--ion-color-medium)' }}>
            Compita e ganhe pontos através de torneios e atividades
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 }}>
          <IonButton
            fill={activeTab === 'general' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('general')}
          >
            Geral
          </IonButton>
          <IonButton
            fill={activeTab === 'dojo' ? 'solid' : 'outline'}
            onClick={() => setActiveTab('dojo')}
          >
            Dojô
          </IonButton>
        </div>

        {/* Search */}
        <IonSearchbar
          value={search}
          onIonInput={e => setSearch(e.detail.value ?? '')}
          placeholder="Buscar karateca..."
          style={{ marginBottom: 16 }}
        />

        {/* Results count */}
        <IonText color="medium">
          <p style={{ margin: '0 0 12px', fontSize: 14 }}>
            {filteredUsers.length} karateca{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
          </p>
        </IonText>

        {/* Ranking List */}
        {filteredUsers.length > 0 ? (
          <div style={{ paddingBottom: 20 }}>
            {filteredUsers.map((user, index) => (
              <RankingItem
                key={user._id}
                user={user}
                position={user.ranking}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <IonText color="medium">
              <p>Nenhum karateca encontrado.</p>
            </IonText>
          </div>
        )}

        {/* Footer info */}
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--ion-color-light)', borderRadius: 12, marginTop: 20 }}>
          <IonText style={{ fontSize: 14, color: 'var(--ion-color-medium)' }}>
            <p style={{ margin: 0 }}>
              <strong>Como ganhar pontos?</strong><br />
              • Participar em torneios (+50-200 pontos)<br />
              • Treinos regulares (+10 pontos/dia)<br />
              • Compartilhar conteúdo (+5-20 pontos)<br />
              • Acertar predições (+25 pontos)
            </p>
          </IonText>
        </div>
      </IonContent>

      <Navbar />
    </IonPage>
  );
};

export default Ranking;