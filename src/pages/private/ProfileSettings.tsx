import React, { useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonAvatar, IonButton, IonIcon, IonList, IonItem, IonLabel,
  IonInput, IonToggle, IonSelect, IonSelectOption, IonAlert,
  IonText, IonChip
} from '@ionic/react';
import {
  personOutline, mailOutline, lockClosedOutline, notificationsOutline,
  moonOutline, languageOutline, shieldOutline, logOutOutline, chevronForwardOutline,
  cameraOutline, createOutline, checkmarkOutline, ribbonOutline, trophyOutline
} from 'ionicons/icons';
import { useAuth } from '../../AuthContext';
import { useHistory } from 'react-router-dom';
import Navbar from '../../components/MainLayout';
import authApi from '../../hooks/authApi';

const ProfileSettings: React.FC = () => {
  const { user, Login, logout } = useAuth();
  const { updateProfile } = authApi(Login);
  const history = useHistory();

  const [isEditing, setIsEditing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'stats'>('personal');

  // Editable fields
  const [editName, setEditName] = useState(user?.name || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editBelt, setEditBelt] = useState(user?.belt || 'Branca');

  const handleSave = async () => {
    try {
      const res = await updateProfile({ username: editUsername, belt: editBelt });
      if (res.success) {
        Login(res.user);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await logout();
    history.replace('/login');
  };

  const typeLabel: Record<string, string> = {
    atleta: 'Atleta',
    responsavel: 'Responsável',
    sensei: 'Sensei',
    admin: 'Admin',
  };

  const beltOptions = ['Branca', 'Amarela', 'Laranja', 'Verde', 'Azul', 'Vermelha', 'Marrom', 'Preta'];

  if (!user) return null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil & Configurações</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background">

        {/* Avatar + Info */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 16px' }}>
          <div style={{ position: 'relative' }}>
            <IonAvatar style={{ width: 90, height: 90 }}>
              {user.profilePic
                ? <img src={user.profilePic} alt="avatar" />
                : <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&size=90`} alt="avatar" />
              }
            </IonAvatar>
            <IonButton
              fill="clear"
              size="small"
              style={{ position: 'absolute', bottom: -8, right: -8, '--padding-start': '4px', '--padding-end': '4px' }}
            >
              <IonIcon icon={cameraOutline} />
            </IonButton>
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

        {/* Edit/Save Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <IonButton
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            color={isEditing ? 'success' : 'primary'}
          >
            <IonIcon icon={isEditing ? checkmarkOutline : createOutline} slot="start" />
            {isEditing ? 'Guardar' : 'Editar Perfil'}
          </IonButton>
        </div>

        {/* Personal Data Section */}
        <IonText color="medium">
          <p style={{ paddingLeft: 16, marginBottom: 4, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Dados Pessoais</p>
        </IonText>
        <IonList inset lines="inset">
          <IonItem>
            <IonIcon icon={personOutline} slot="start" color="primary" />
            <IonLabel>
              <IonInput
                label="Nome completo"
                labelPlacement="stacked"
                value={isEditing ? editName : (user.name || '')}
                onIonChange={e => setEditName(e.detail.value!)}
                readonly={!isEditing}
              />
            </IonLabel>
          </IonItem>

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

          <IonItem button detail detailIcon={chevronForwardOutline}>
            <IonIcon icon={lockClosedOutline} slot="start" color="primary" />
            <IonLabel>Alterar Senha</IonLabel>
          </IonItem>
        </IonList>

        {/* Stats Section */}
        <IonText color="medium">
          <p style={{ paddingLeft: 16, marginBottom: 4, marginTop: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Estatísticas</p>
        </IonText>
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
            <IonText color="medium" slot="end" style={{ fontWeight: 'bold' }}>3</IonText>
          </IonItem>

          <IonItem>
            <IonIcon icon={trophyOutline} slot="start" color="danger" />
            <IonLabel>
              <h3>Vitórias</h3>
              <p>Torneios vencidos</p>
            </IonLabel>
            <IonText color="danger" slot="end" style={{ fontWeight: 'bold' }}>1</IonText>
          </IonItem>
        </IonList>

        {/* Preferences Section */}
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

        {/* Security Section */}
        <IonText color="medium">
          <p style={{ paddingLeft: 16, marginBottom: 4, marginTop: 16, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Segurança</p>
        </IonText>
        <IonList inset lines="inset">
          <IonItem button detail detailIcon={chevronForwardOutline}>
            <IonIcon icon={shieldOutline} slot="start" color="primary" />
            <IonLabel>Autenticação em dois fatores</IonLabel>
          </IonItem>
        </IonList>

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
