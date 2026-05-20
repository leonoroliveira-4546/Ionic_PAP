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

      <IonContent className="ion-padding background bg-slate-950/5 text-slate-900">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <IonText className="text-2xl font-bold">Painel Administrativo</IonText>
          <p className="mt-2 text-sm text-slate-600">
            Gerencie usuários, permissões e ranking.
          </p>
        </div>

        <IonButton expand="block" className="mb-5 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-sm" onClick={handleResetRanking}>
          Reiniciar Ranking
        </IonButton>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <IonCard key={user._id} className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
                <IonCardHeader className="pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <IonText className="text-base font-semibold">{user.name}</IonText>
                      <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                    </div>
                    <IonBadge color={user.isAdmin ? 'primary' : 'medium'} className="text-sm">
                      {user.isAdmin ? 'Admin' : user.type || 'Usuário'}
                    </IonBadge>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="none" className="rounded-3xl bg-slate-100 p-3">
                    <IonLabel>Tipo de usuário</IonLabel>
                    <IonSelect
                      value={user.type}
                      onIonChange={e => handleTypeChange(user._id, e.detail.value)}
                      disabled={savingId === user._id}
                      className="rounded-3xl bg-white"
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
          </div>
        )}
      </IonContent>
      <Navbar />
    </IonPage>
  );
};

export default Admin;
