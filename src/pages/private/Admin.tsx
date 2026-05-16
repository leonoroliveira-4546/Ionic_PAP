import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonCard, IonCardContent, IonCardHeader, IonButton,
  IonList, IonItem, IonLabel, IonBadge, IonSpinner, IonSelect,
  IonSelectOption
} from '@ionic/react';
import Navbar from '../../components/MainLayout';
import { adminApi } from '../../hooks/adminApi';

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  type: string;
  isAdmin?: boolean;
  verified?: boolean;
}

const Admin: React.FC = () => {
  const { getUsers, updateUser, resetRanking } = adminApi();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await getUsers();
        setUsers(data.users || data);
      } catch (error) {
        console.error('Failed to load users', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [getUsers]);

  const handleTypeChange = async (userId: string, newType: string) => {
    setSavingId(userId);
    try {
      const updated = await updateUser(userId, { type: newType });
      setUsers(prev => prev.map(user => user._id === userId ? { ...user, type: updated.type || newType } : user));
    } catch (error) {
      console.error('Failed to update user type', error);
    } finally {
      setSavingId(null);
    }
  };

  const handleResetRanking = async () => {
    try {
      await resetRanking();
      alert('Ranking reiniciado com sucesso.');
    } catch (error) {
      console.error('Failed to reset ranking', error);
      alert('Erro ao reiniciar ranking.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Administração</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background">
        <div style={{ marginBottom: 16 }}>
          <IonText style={{ fontSize: 22, fontWeight: 'bold' }}>Painel Administrativo</IonText>
          <p style={{ color: 'var(--ion-color-medium)', marginTop: 6 }}>
            Gerencie usuários, permissões e ranking.
          </p>
        </div>

        <IonButton expand="block" color="danger" onClick={handleResetRanking} style={{ marginBottom: 20 }}>
          Reiniciar Ranking
        </IonButton>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <IonList>
            {users.map(user => (
              <IonCard key={user._id} style={{ marginBottom: 16 }}>
                <IonCardHeader>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <IonText style={{ fontSize: 16, fontWeight: 700 }}>{user.name}</IonText>
                      <p style={{ margin: 2, color: 'var(--ion-color-medium)', fontSize: 14 }}>{user.email}</p>
                    </div>
                    <IonBadge color={user.isAdmin ? 'primary' : 'medium'}>
                      {user.isAdmin ? 'Admin' : user.type || 'Usuário'}
                    </IonBadge>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="none">
                    <IonLabel>Tipo de usuário</IonLabel>
                    <IonSelect
                      value={user.type}
                      onIonChange={e => handleTypeChange(user._id, e.detail.value)}
                      disabled={savingId === user._id}
                    >
                      <IonSelectOption value="user">user</IonSelectOption>
                      <IonSelectOption value="treinador">treinador</IonSelectOption>
                      <IonSelectOption value="praticinador">praticinador</IonSelectOption>
                      <IonSelectOption value="admin">admin</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}
      </IonContent>
      <Navbar />
    </IonPage>
  );
};

export default Admin;
