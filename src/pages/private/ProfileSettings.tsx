import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonAvatar, IonButton, IonIcon, IonList, IonItem, IonLabel,
  IonInput, IonAlert, IonText, IonChip, IonModal, IonSelect, IonSelectOption
} from '@ionic/react';
import {
  personOutline, mailOutline, lockClosedOutline,
  logOutOutline, chevronForwardOutline,
  createOutline, checkmarkOutline,
  ribbonOutline, trophyOutline
} from 'ionicons/icons';
import { useAuth } from '../../AuthContext';
import { useHistory } from 'react-router-dom';
import Navbar from '../../components/MainLayout';
import userApi from '../../hooks/userApi';
import authApi from '../../hooks/authApi';

const ProfileSettings: React.FC = () => {
  const { user, logout, Login } = useAuth();
  const history = useHistory();
  const { getProfile, updateProfile, changePassword } = userApi();
  const { logout: apiLogout } = authApi(Login);

  const [isEditing, setIsEditing] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const [editUsername, setEditUsername] = useState('');
  const [editBelt, setEditBelt] = useState('Branca');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  type ResponsavelChild = {
    _id: string;
    username: string;
    name?: string;
    profilePic?: string;
    belt?: string;
    points?: number;
    ranking?: number;
  };

  const isAthlete = (type: string) => type === 'athlete' || type === 'atleta';
  const isResponsavel = (type: string) => type === 'responsavel';
  const isSensei = (type: string) => type === 'sensei';

  useEffect(() => {
    if (!user) return;
    setEditUsername(user.username);
    setEditBelt(user.belt || 'Branca');
  }, [user]);

  const responsavelChildren = (user ? (user.childrenStats?.length ? user.childrenStats : user.childrens || []) : []) as ResponsavelChild[];

  useEffect(() => {
    if (!user?.authUid || isProfileLoaded) return;

    const refreshProfile = async () => {
      try {
        const response = await getProfile();
        if (response.success) {
          Login(response.user);
          setIsProfileLoaded(true);
        }
      } catch (err) {
        console.error('Erro ao atualizar perfil:', err);
      }
    };

    refreshProfile();
  }, [user?.authUid, getProfile, Login, isProfileLoaded]);

  useEffect(() => {
    if (!selectedChildId && responsavelChildren?.length > 0) {
      setSelectedChildId(String(responsavelChildren[0]._id));
    }
  }, [selectedChildId, responsavelChildren]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      const formData = new FormData();
      formData.append('username', editUsername.trim());
      formData.append('belt', editBelt);
      if (profileFile) {
        formData.append('file', profileFile, profileFile.name);
      }

      const response = await updateProfile(formData);
      if (response.success) {
        Login(response.user);
        setIsEditing(false);
        setProfileFile(null);
        setSaveMessage('Perfil atualizado com sucesso.');
      } else {
        setSaveMessage('Falha ao atualizar perfil.');
      }
    } catch (err) {
      console.error(err);
      setSaveMessage('Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await apiLogout();
    await logout();
    history.replace('/');
    window.location.reload();
  };

  const typeLabel: Record<string, string> = {
    atleta: 'Atleta',
    athlete: 'Atleta',
    responsavel: 'Responsável',
    sensei: 'Sensei',
    admin: 'Admin',
    praticinador: 'Praticinador'
  };

  if (!user) return null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 16px' }}>
          <IonAvatar style={{ width: 90, height: 90 }}>
            {user.profilePic
              ? <img src={user.profilePic} alt="avatar" />
              : <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&size=90`} alt="avatar" />
            }
          </IonAvatar>

          <div style={{ marginTop: 12, width: '100%', textAlign: 'center' }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#666' }}>
              {isEditing ? 'Escolher nova foto de perfil' : 'Foto de perfil'}
            </label>
            <input
              type="file"
              accept="image/*"
              disabled={!isEditing}
              onChange={e => setProfileFile(e.target.files?.[0] || null)}
              style={{ display: isEditing ? 'inline-block' : 'none' }}
            />
            {profileFile && <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>✓ {profileFile.name}</p>}
          </div>

          <IonText style={{ marginTop: 12 }}>
            <h2 style={{ margin: 0, fontWeight: 700 }}>{user.name || user.username}</h2>
          </IonText>
          <IonText color="medium">
            <p style={{ margin: '4px 0 8px' }}>{user.email}</p>
          </IonText>
          <IonChip color="primary" outline>
            <IonLabel>{typeLabel[user.type] ?? user.type}</IonLabel>
          </IonChip>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <IonButton
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            color={isEditing ? 'success' : 'primary'}
            disabled={saving}
          >
            <IonIcon icon={isEditing ? checkmarkOutline : createOutline} slot="start" />
            {saving ? 'Guardando...' : isEditing ? 'Guardar' : 'Editar Perfil'}
          </IonButton>
        </div>

        {saveMessage && (
          <div style={{ padding: '0 16px 16px' }}>
            <IonText color={saveMessage.includes('sucesso') ? 'success' : 'danger'}>
              {saveMessage}
            </IonText>
          </div>
        )}

        <IonText color="medium">
          <p style={{ paddingLeft: 16, marginBottom: 4, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Dados Pessoais</p>
        </IonText>
        <IonList inset lines="inset">
          <IonItem>
            <IonIcon icon={personOutline} slot="start" color="primary" />
            <IonLabel>
              <IonInput
                label="Nome de usuário"
                labelPlacement="stacked"
                value={isEditing ? editUsername : user.username}
                onIonChange={e => setEditUsername(e.detail.value!)}
                readonly={!isEditing}
              />
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon icon={ribbonOutline} slot="start" color="primary" />
            <IonLabel>
              <IonInput
                label="Faixa"
                labelPlacement="stacked"
                value={isEditing ? editBelt : (user.belt || 'Branca')}
                onIonChange={e => setEditBelt(e.detail.value!)}
                readonly={!isEditing}
              />
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon icon={mailOutline} slot="start" color="primary" />
            <IonLabel>
              <IonInput
                label="Email"
                labelPlacement="stacked"
                value={user.email}
                readonly
              />
            </IonLabel>
          </IonItem>

          <IonItem button detail detailIcon={chevronForwardOutline} onClick={() => setShowPasswordModal(true)}>
            <IonIcon icon={lockClosedOutline} slot="start" color="primary" />
            <IonLabel>Alterar Senha</IonLabel>
          </IonItem>
        </IonList>

        <IonModal isOpen={showPasswordModal} onDidDismiss={() => {
          setShowPasswordModal(false);
          setNewPassword('');
          setConfirmPassword('');
          setPasswordMessage(null);
        }}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Alterar Senha</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowPasswordModal(false)}>
                Fechar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding background">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <IonItem>
                <IonLabel position="stacked">Nova senha</IonLabel>
                <IonInput
                  type="password"
                  value={newPassword}
                  autocomplete="new-password"
                  autocorrect="off"
                  autocapitalize="off"
                  spellCheck={false}
                  onIonInput={e => setNewPassword(e.detail.value || '')}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Confirmar nova senha</IonLabel>
                <IonInput
                  type="password"
                  value={confirmPassword}
                  autocomplete="new-password"
                  autocorrect="off"
                  autocapitalize="off"
                  spellCheck={false}
                  onIonInput={e => setConfirmPassword(e.detail.value || '')}
                />
              </IonItem>

              {passwordMessage && (
                <IonText color="danger">{passwordMessage}</IonText>
              )}

              <IonButton
                expand="block"
                disabled={passwordLoading}
                onClick={async () => {
                  setPasswordMessage(null);

                  if (!newPassword || newPassword.length < 6) {
                    setPasswordMessage('A senha deve ter pelo menos 6 caracteres.');
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setPasswordMessage('As senhas não coincidem.');
                    return;
                  }

                  setPasswordLoading(true);
                  try {
                    const response = await changePassword(newPassword);
                    if (response.success) {
                      setPasswordMessage('Senha alterada com sucesso.');
                      setNewPassword('');
                      setConfirmPassword('');
                    } else {
                      setPasswordMessage(response.message || 'Falha ao alterar senha.');
                    }
                  } catch (err) {
                    console.error(err);
                    setPasswordMessage('Erro ao alterar senha.');
                  } finally {
                    setPasswordLoading(false);
                  }
                }}
              >
                {passwordLoading ? 'Atualizando...' : 'Atualizar Senha'}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonText color="medium">
          <p style={{ paddingLeft: 16, marginBottom: 4, marginTop: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Estatísticas</p>
        </IonText>

        {isSensei(user.type) ? (
          <IonList inset lines="inset">
            <IonItem>
              <IonIcon icon={trophyOutline} slot="start" color="medium" />
              <IonLabel>
                <h3>Sem ranking reservado</h3>
                <p>Senseis não têm estatísticas de ranking exibidas aqui.</p>
              </IonLabel>
            </IonItem>
          </IonList>
        ) : isResponsavel(user.type) ? (
          <>
            <IonList inset lines="inset">
              <IonItem>
                <IonIcon icon={personOutline} slot="start" color="primary" />
                <IonLabel>
                  <h3>Responsável</h3>
                  <p>{responsavelChildren?.length ?? 0} filho(s) associado(s).</p>
                </IonLabel>
              </IonItem>
            </IonList>

            <div style={{ padding: '0 16px 16px' }}>
              <IonText color="medium">
                <p style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Filhos
                </p>
              </IonText>

              {responsavelChildren?.length ? (
                <>
                  {responsavelChildren.length > 1 && (
                    <IonItem>
                      <IonLabel>
                        <IonSelect
                          value={selectedChildId}
                          placeholder="Selecione um filho"
                          onIonChange={e => setSelectedChildId(String(e.detail.value || ''))}
                        >
                          {responsavelChildren.map(child => (
                            <IonSelectOption key={String(child._id)} value={String(child._id)}>
                              {child.name || child.username}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonLabel>
                    </IonItem>
                  )}

                  {(() => {
                    const selectedChild = responsavelChildren.find(child => String(child._id) === selectedChildId) || responsavelChildren[0];
                    return (
                      <IonList inset lines="inset">
                        <IonItem style={{ marginBottom: 4 }}>
                          <IonLabel>
                            <h3>{selectedChild.name || selectedChild.username}</h3>
                            <p>Pontos: {selectedChild.points ?? 0} • Ranking: #{selectedChild.ranking ?? 'N/A'}</p>
                          </IonLabel>
                        </IonItem>
                      </IonList>
                    );
                  })()}
                </>
              ) : (
                <IonText color="medium">
                  <p>Nenhum filho com dados de ranking encontrado.</p>
                </IonText>
              )}
            </div>
          </>
        ) : (
          <>
            <IonList inset lines="inset">
              <IonItem>
                <IonIcon icon={trophyOutline} slot="start" color="warning" />
                <IonLabel>
                  <h3>Pontos Totais</h3>
                  <p>Estatísticas de gamificação</p>
                </IonLabel>
                <IonText color="primary" slot="end" style={{ fontWeight: 'bold' }}>{user.points || 0}</IonText>
              </IonItem>

              <IonItem>
                <IonIcon icon={ribbonOutline} slot="start" color="secondary" />
                <IonLabel>
                  <h3>Ranking Atual</h3>
                  <p>Posição no ranking geral</p>
                </IonLabel>
                <IonText color="success" slot="end" style={{ fontWeight: 'bold' }}>#{user.ranking || 'N/A'}</IonText>
              </IonItem>

              <IonItem>
                <IonIcon icon={trophyOutline} slot="start" color="tertiary" />
                <IonLabel>
                  <h3>Torneios Participados</h3>
                  <p>Total de competições</p>
                </IonLabel>
                <IonText color="medium" slot="end" style={{ fontWeight: 'bold' }}>{user.tournamentParticipations ?? 0}</IonText>
              </IonItem>

              <IonItem>
                <IonIcon icon={trophyOutline} slot="start" color="danger" />
                <IonLabel>
                  <h3>Vitórias</h3>
                  <p>Torneios vencidos</p>
                </IonLabel>
                <IonText color="danger" slot="end" style={{ fontWeight: 'bold' }}>{user.tournamentVictories ?? 0}</IonText>
              </IonItem>
            </IonList>
          </>
        )}

        {/* Preferences Section
        <IonText color="medium">
          <p style={{ paddingLeft: 16, marginBottom: 4, marginTop: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Preferências</p>
        </IonText>
        <IonList inset lines="inset">
          <IonItem>
            <IonIcon icon={moonOutline} slot="start" color="primary" />
            <IonLabel>Modo Escuro</IonLabel>
            <IonToggle
              slot="end"
              checked={darkMode}
              onIonChange={e => setDarkMode(e.detail.checked)}
            />
          </IonItem>

          <IonItem>
            <IonIcon icon={notificationsOutline} slot="start" color="primary" />
            <IonLabel>Notificações</IonLabel>
            <IonToggle
              slot="end"
              checked={notifications}
              onIonChange={e => setNotifications(e.detail.checked)}
            />
          </IonItem>

          <IonItem>
            <IonIcon icon={languageOutline} slot="start" color="primary" />
            <IonLabel>Idioma</IonLabel>
            <IonSelect value="pt" interface="popover" slot="end">
              <IonSelectOption value="pt">Português</IonSelectOption>
              <IonSelectOption value="en">English</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>

        <IonText color="medium">
          <p style={{ paddingLeft: 16, marginBottom: 4, marginTop: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Segurança</p>
        </IonText>
        <IonList inset lines="inset">
          <IonItem button detail detailIcon={chevronForwardOutline}>
            <IonIcon icon={shieldOutline} slot="start" color="primary" />
            <IonLabel>Autenticação em dois fatores</IonLabel>
          </IonItem>
        </IonList> */}

        {/* Logout */}
        <div style={{ padding: '24px 16px' }}>
          <IonButton
            expand="block"
            color="danger"
            fill="outline"
            onClick={() => setShowLogoutAlert(true)}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Sair da conta
          </IonButton>
        </div>

        <IonAlert
          isOpen={showLogoutAlert}
          header="Sair"
          message="Tem certeza que deseja sair?"
          buttons={[
            { text: 'Cancelar', role: 'cancel', handler: () => setShowLogoutAlert(false) },
            { text: 'Sair', role: 'destructive', handler: handleLogout }
          ]}
          onDidDismiss={() => setShowLogoutAlert(false)}
        />
      </IonContent>

      <Navbar />
    </IonPage>
  );
};

export default ProfileSettings;
