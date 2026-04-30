import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonSpinner, IonSearchbar } from '@ionic/react';
import Navbar from '../../../components/MainLayout';
import RankingItem from '../../../components/RankingItem';
import { useAuth } from '../../../AuthContext';
import authApi from '../../../hooks/authApi';

const Ranking: React.FC = () => {
  const { Login } = useAuth();
  const { getRanking } = authApi(Login);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const res = await getRanking();
        if (res.success) {
          setUsers(res.data);
          setFilteredUsers(res.data);
        }
      } catch (error) {
        alert('Erro ao carregar ranking: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [search, users]);

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