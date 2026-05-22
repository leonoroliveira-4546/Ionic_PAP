import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonCard, IonCardContent, IonCardHeader, IonButton,
  IonList, IonItem, IonLabel, IonBadge, IonSpinner, IonSelect,
  IonSelectOption, IonModal, IonInput
} from '@ionic/react';
import Navbar from '../../components/MainLayout';
import { adminApi } from '../../hooks/adminApi';

interface AdminUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  type: string;
  status?: string;
  isAdmin?: boolean;
  verified?: boolean;
}

const Admin: React.FC = () => {
  const { getUsers, updateUser, deleteUser, resetRanking } = adminApi();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const pageSize = 20;
  const [manageModalOpen, setManageModalOpen] = useState(false);

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

  const pagedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));

  const handleTypeChange = async (userId: string, newType: string) => {
    setSavingId(userId);
    try {
      const updated = await updateUser(userId, { type: newType });
      const userData = updated.user || updated;
      setUsers(prev => prev.map(user => user._id === userId ? { ...user, type: userData.type || newType } : user));
    } catch (error) {
      console.error('Failed to update user type', error);
    } finally {
      setSavingId(null);
    }
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditUser(user);
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditUser(null);
  };

  const handleEditField = (field: keyof AdminUser, value: any) => {
    setEditUser(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSaveUser = async () => {
    if (!editUser) return;
    setSavingId(editUser._id);
    try {
      const payload = {
        name: editUser.name,
        username: editUser.username,
        email: editUser.email,
        type: editUser.type,
        status: editUser.status
      };
      const updated = await updateUser(editUser._id, payload);
      const userData = updated.user || updated;
      setUsers(prev => prev.map(user => user._id === editUser._id ? { ...user, ...userData } : user));
      handleCloseEdit();
    } catch (error) {
      console.error('Failed to save user', error);
      alert('Erro ao salvar usuário.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Remover este usuário? Esta ação não pode ser desfeita.')) return;
    setDeletingId(userId);
    try {
      await deleteUser(userId);
      const updatedUsers = users.filter(user => user._id !== userId);
      setUsers(updatedUsers);
      if ((currentPage - 1) * pageSize >= updatedUsers.length && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('Failed to delete user', error);
      alert('Erro ao remover usuário.');
    } finally {
      setDeletingId(null);
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

        <IonButton expand="block" className="mb-5 rounded-full bg-sky-600 text-white hover:bg-sky-700 shadow-sm" onClick={() => setManageModalOpen(true)}>
          Gerir Users
        </IonButton>

        <IonModal isOpen={manageModalOpen} className="rounded-3xl">
          <div className="bg-white p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <IonText className="text-xl font-semibold">Gerir Usuários</IonText>
              <div>
                <IonButton fill="clear" onClick={() => setManageModalOpen(false)}>Fechar</IonButton>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <IonSpinner name="crescent" />
              </div>
            ) : (
              <div className="space-y-4">
                <IonCard className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 overflow-x-auto">
                  <IonCardHeader className="pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <IonText className="text-base font-semibold">Usuários cadastrados</IonText>
                      <IonText className="text-sm text-slate-500">Página {currentPage} de {totalPages}</IonText>
                    </div>
                  </IonCardHeader>
                  <IonCardContent className="p-0">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3">Nome</th>
                          <th className="px-4 py-3">Usuário</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Tipo</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {pagedUsers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-slate-500">Nenhum usuário encontrado.</td>
                          </tr>
                        ) : pagedUsers.map(user => (
                          <tr key={user._id}>
                            <td className="px-4 py-4">{user.name || user.username}</td>
                            <td className="px-4 py-4">{user.username}</td>
                            <td className="px-4 py-4">{user.email}</td>
                            <td className="px-4 py-4">{user.type}</td>
                            <td className="px-4 py-4">{user.status || 'ativo'}</td>
                            <td className="px-4 py-4 space-x-2">
                              <IonButton fill="outline" size="small" onClick={() => handleOpenEdit(user)}>
                                Editar
                              </IonButton>
                              <IonButton
                                color="danger"
                                fill="outline"
                                size="small"
                                onClick={() => handleDeleteUser(user._id)}
                                disabled={deletingId === user._id}
                              >
                                {deletingId === user._id ? 'Removendo...' : 'Remover'}
                              </IonButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </IonCardContent>
                </IonCard>

                <div className="flex items-center justify-between gap-3">
                  <IonButton
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  >
                    Anterior
                  </IonButton>
                  <IonButton
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  >
                    Próxima
                  </IonButton>
                </div>
              </div>
            )}
          </div>
        </IonModal>

        <IonModal isOpen={editModalOpen} className="rounded-3xl">
          <div className="bg-white p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <IonText className="text-xl font-semibold">Editar Usuário</IonText>
              <IonButton fill="clear" onClick={handleCloseEdit}>Fechar</IonButton>
            </div>
            {editUser ? (
              <div className="space-y-4">
                <IonItem>
                  <IonLabel position="stacked">Nome</IonLabel>
                  <IonInput
                    value={editUser.name}
                    onIonChange={e => handleEditField('name', e.detail.value)}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Usuário</IonLabel>
                  <IonInput
                    value={editUser.username}
                    onIonChange={e => handleEditField('username', e.detail.value)}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={editUser.email}
                    onIonChange={e => handleEditField('email', e.detail.value)}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Tipo</IonLabel>
                  <IonSelect
                    value={editUser.type}
                    onIonChange={e => handleEditField('type', e.detail.value)}
                  >
                    <IonSelectOption value="athlete">athlete</IonSelectOption>
                    <IonSelectOption value="responsavel">responsavel</IonSelectOption>
                    <IonSelectOption value="sensei">sensei</IonSelectOption>
                    <IonSelectOption value="admin">admin</IonSelectOption>
                    <IonSelectOption value="praticinador">praticinador</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Status</IonLabel>
                  <IonSelect
                    value={editUser.status || 'active'}
                    onIonChange={e => handleEditField('status', e.detail.value)}
                  >
                    <IonSelectOption value="active">active</IonSelectOption>
                    <IonSelectOption value="pending">pending</IonSelectOption>
                    <IonSelectOption value="blocked">blocked</IonSelectOption>
                  </IonSelect>
                </IonItem>
                <div className="flex justify-end gap-3 pt-4">
                  <IonButton fill="outline" onClick={handleCloseEdit}>Cancelar</IonButton>
                  <IonButton
                    onClick={handleSaveUser}
                    disabled={savingId === editUser._id}
                  >
                    {savingId === editUser._id ? 'Salvando...' : 'Salvar'}
                  </IonButton>
                </div>
              </div>
            ) : null}
          </div>
        </IonModal>
      </IonContent>
      <Navbar />
    </IonPage>
  );
};

export default Admin;
