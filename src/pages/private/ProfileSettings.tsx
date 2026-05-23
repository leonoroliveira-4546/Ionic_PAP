import React, { useState, useEffect } from 'react'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonAvatar, IonButton, IonIcon, IonList, IonItem, IonLabel,
  IonInput, IonAlert, IonText, IonChip, IonModal, IonSelect, IonSelectOption
} from '@ionic/react'
import {
  personOutline, mailOutline, lockClosedOutline,
  logOutOutline, chevronForwardOutline,
  createOutline, checkmarkOutline,
  ribbonOutline, trophyOutline
} from 'ionicons/icons'
import { useAuth } from '../../AuthContext'
import { useHistory } from 'react-router-dom'
import Navbar from '../../components/MainLayout'
import userApi from '../../hooks/userApi'
import authApi from '../../hooks/authApi'

const ProfileSettings: React.FC = () => {
  const { user, logout, Login } = useAuth()
  const history = useHistory()
  const { getProfile, updateProfile, changePassword } = userApi()
  const { logout: apiLogout } = authApi(Login)

  const [showEditModal, setShowEditModal] = useState(false)
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)

  const [editUsername, setEditUsername] = useState('')
  const [editBelt, setEditBelt] = useState('Branca')
  const [selectedChildId, setSelectedChildId] = useState('')
  const [isProfileLoaded, setIsProfileLoaded] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  type ResponsavelChild = {
    _id?: string
    username?: string
    name?: string
    profilePic?: string
    belt?: string
    points?: number
    ranking?: number
  } | string

  const getChildId = (child: ResponsavelChild) => typeof child === 'string' ? child : String(child._id || child.username || '')
  const getChildLabel = (child: ResponsavelChild) => typeof child === 'string' ? child : child.name || child.username || String(child._id || 'Filho')

  const isAthlete = (type: string) => type?.toLowerCase() === 'athlete' || type?.toLowerCase() === 'atleta'
  const isResponsavel = (type: string) => type?.toLowerCase() === 'responsavel'
  const isSensei = (type: string) => type?.toLowerCase() === 'sensei'
  const isPraticinador = (type: string) => type?.toLowerCase() === 'praticinador'

  useEffect(() => {
    if (!user) return
    setEditUsername(user.username)
    setEditBelt(user.belt || 'Branca')
  }, [user])

  const responsavelChildren = (user ? (user.childrenStats?.length ? user.childrenStats : user.childrens || []) : []) as ResponsavelChild[]

  useEffect(() => {
    if (!user?.authUid || isProfileLoaded) return

    const refreshProfile = async () => {
      try {
        const response = await getProfile()
        if (response.success) {
          Login(response.user)
          setIsProfileLoaded(true)
        }
      } catch (err) {

      }
    }

    refreshProfile()
  }, [user?.authUid, getProfile, Login, isProfileLoaded])

  useEffect(() => {
    if (!selectedChildId && responsavelChildren?.length > 0) {
      setSelectedChildId(getChildId(responsavelChildren[0]))
    }
  }, [selectedChildId, responsavelChildren])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaveMessage(null)

    try {
      const formData = new FormData()
      formData.append('username', editUsername.trim())
      formData.append('belt', editBelt)
      if (profileFile) {
        formData.append('file', profileFile, profileFile.name)
      }

      const response = await updateProfile(formData)
      if (response.success) {
        Login(response.user)
        setShowEditModal(false)
        setProfileFile(null)
        setSaveMessage('Perfil atualizado com sucesso.')
      } else {
        setSaveMessage('Falha ao atualizar perfil.')
      }
    } catch (err) {

      setSaveMessage('Erro ao atualizar perfil.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await apiLogout()
    await logout()
    history.replace('/')
    window.location.reload()
  }

  const typeLabel: Record<string, string> = {
    atleta: 'Atleta',
    athlete: 'Atleta',
    responsavel: 'Responsável',
    sensei: 'Sensei',
    admin: 'Admin',
    praticinador: 'Praticinador'
  }

  if (!user) return null

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background bg-slate-950/5 text-slate-950">
        <div className="mx-4 mt-4 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70 text-center">
          <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-slate-100">
            {user.profilePic ? (
              <img src={user.profilePic} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random&size=90`} alt="avatar" className="h-full w-full object-cover" />
            )}
          </div>

          <h2 className="text-xl font-semibold text-slate-900">{user.name || user.username}</h2>
          <p className="mt-2 text-sm text-slate-600">{user.email}</p>
          <div className="mt-3 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            {typeLabel[user.type] ?? user.type}
          </div>

          <div className="mt-5 flex justify-center">
            <IonButton
              onClick={() => setShowEditModal(true)}
              color="primary"
              disabled={saving}
              className="rounded-full px-8"
            >
              <IonIcon icon={createOutline} slot="start" />
              {saving ? 'Guardando...' : 'Editar Perfil'}
            </IonButton>
          </div>

          {saveMessage && (
            <div className="mt-4 text-sm text-slate-700">
              <IonText color={saveMessage.includes('sucesso') ? 'success' : 'danger'}>
                {saveMessage}
              </IonText>
            </div>
          )}
        </div>

        <div className="mx-4 mt-5 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <IonText color="medium" className="text-xs uppercase tracking-[0.18em]">Dados Pessoais</IonText>
          <IonList lines="none" className="mt-3 space-y-3">
            <IonItem className="rounded-3xl">
              <IonIcon icon={personOutline} slot="start" color="primary" />
              <IonLabel>
                <IonInput
                  label="Nome de usuário"
                  labelPlacement="stacked"
                  value={user.username}
                  readonly
                />
              </IonLabel>
            </IonItem>

            <IonItem className="rounded-3xl">
              <IonIcon icon={ribbonOutline} slot="start" color="primary" />
              <IonLabel>
                <IonInput
                  label="Faixa"
                  labelPlacement="stacked"
                  value={user.belt || 'Branca'}
                  readonly
                />
              </IonLabel>
            </IonItem>

            <IonItem className="rounded-3xl">
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

            <IonItem button detail detailIcon={chevronForwardOutline} onClick={() => setShowPasswordModal(true)} className="rounded-3xl">
              <IonIcon icon={lockClosedOutline} slot="start" color="primary" />
              <IonLabel>Alterar Senha</IonLabel>
            </IonItem>
          </IonList>
        </div>

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
      ) : isPraticinador(user.type) ? (
        <IonList inset lines="inset">
          <IonItem>
            <IonIcon icon={trophyOutline} slot="start" color="medium" />
            <IonLabel>
              <h3>Perfil de Praticinador</h3>
              <p>Esta página existe para o praticinador, mas não mostra estatísticas aqui.</p>
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
                          <IonSelectOption key={getChildId(child)} value={getChildId(child)}>
                            {getChildLabel(child)}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonLabel>
                  </IonItem>
                )}

                {(() => {
                  const selectedChild = responsavelChildren.find(child => getChildId(child) === selectedChildId) || responsavelChildren[0]
                  const displayName = typeof selectedChild === 'string'
                    ? selectedChild
                    : selectedChild.name || selectedChild.username || 'Filho'
                  return (
                    <IonList inset lines="inset">
                      <IonItem style={{ marginBottom: 4 }}>
                        <IonLabel>
                          <h3>{displayName}</h3>
                          <p>Pontos: {(typeof selectedChild === 'string' ? 0 : selectedChild.points) ?? 0} • Ranking: #{(typeof selectedChild === 'string' ? 'N/A' : selectedChild.ranking) ?? 'N/A'}</p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  )
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
      )}

        {/* Logout */}
        <div className="mx-4 mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <IonButton
            expand="block"
            color="danger"
            fill="outline"
            className="rounded-full"
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

      <IonModal
          isOpen={showEditModal}
          className="profile-settings-modal"
          onDidDismiss={() => {
            setShowEditModal(false)
            setPasswordMessage(null)
            setSaveMessage(null)
          }}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Editar Perfil</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowEditModal(false)}>
                Fechar
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding background bg-slate-950/5 text-slate-950">
            <div className="mx-4 space-y-4">
              <IonItem className="rounded-3xl">
                <IonLabel position="stacked">Nome de usuário</IonLabel>
                <IonInput
                  value={editUsername}
                  onIonInput={e => setEditUsername(e.detail.value || '')}
                />
              </IonItem>

              <IonItem className="rounded-3xl">
                <IonLabel position="stacked">Faixa</IonLabel>
                <IonInput
                  value={editBelt}
                  onIonInput={e => setEditBelt(e.detail.value || 'Branca')}
                />
              </IonItem>

              <IonItem className="rounded-3xl">
                <IonLabel position="stacked">Foto de perfil</IonLabel>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setProfileFile(e.target.files?.[0] || null)}
                />
              </IonItem>

              {saveMessage && (
                <IonText color={saveMessage.includes('sucesso') ? 'success' : 'danger'}>
                  {saveMessage}
                </IonText>
              )}

              <IonButton
                expand="block"
                color="success"
                disabled={saving}
                className="rounded-full"
                onClick={handleSave}
              >
                {saving ? 'Guardando...' : 'Guardar Alterações'}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

      <IonModal
        isOpen={showPasswordModal}
        className="profile-settings-modal"
        onDidDismiss={() => {
          setShowPasswordModal(false)
          setNewPassword('')
          setConfirmPassword('')
          setPasswordMessage(null)
        }}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Alterar Senha</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setShowPasswordModal(false)}>
              Fechar
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding background bg-slate-950/5 text-slate-950">
          <div className="mx-4 space-y-4">
            <IonItem className="rounded-3xl">
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

            <IonItem className="rounded-3xl">
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
              className="rounded-full"
              onClick={async () => {
                setPasswordMessage(null)

                if (!newPassword || newPassword.length < 6) {
                  setPasswordMessage('A senha deve ter pelo menos 6 caracteres.')
                  return
                }
                if (newPassword !== confirmPassword) {
                  setPasswordMessage('As senhas não coincidem.')
                  return
                }

                setPasswordLoading(true)
                try {
                  const response = await changePassword(newPassword)
                  if (response.success) {
                    setPasswordMessage('Senha alterada com sucesso.')
                    setNewPassword('')
                    setConfirmPassword('')
                  } else {
                    setPasswordMessage(response.message || 'Falha ao alterar senha.')
                  }
                } catch (err) {

                  setPasswordMessage('Erro ao alterar senha.')
                } finally {
                  setPasswordLoading(false)
                }
              }}
            >
              {passwordLoading ? 'Atualizando...' : 'Atualizar Senha'}
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      <Navbar />
    </IonPage>
  )
}

export default ProfileSettings
