import React, { useState, useEffect } from 'react'
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonSpinner, IonSearchbar, IonButton
} from '@ionic/react'
import { trophyOutline } from 'ionicons/icons'
import Navbar from '../../components/MainLayout'
import RankingItem from '../../components/RankingItem'
import userApi from '../../hooks/userApi'
import { User } from '../../mockData/users'
import { useAuth } from '../../AuthContext'

type RankingUser = User

const Ranking: React.FC = () => {
  const { user } = useAuth()
  const isAdmin = user?.type === 'admin'
  const [generalUsers, setGeneralUsers] = useState<RankingUser[]>([])
  const [dojoUsers, setDojoUsers] = useState<RankingUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<RankingUser[]>([])
  const [activeTab, setActiveTab] = useState<'general' | 'dojo'>('general')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { getRanking } = userApi()

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      try {
        const response = await getRanking()
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
        }))

        const general = response.success ? mapUsers(response.general || []) : []
        const dojo = response.success ? mapUsers(response.dojo || []) : []

        setGeneralUsers(general)
        setDojoUsers(dojo)
        setFilteredUsers(activeTab === 'dojo' ? dojo : general)
      } catch (err) {

        setGeneralUsers([])
        setDojoUsers([])
        setFilteredUsers([])
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [getRanking])

  useEffect(() => {
    const source = activeTab === 'dojo' ? dojoUsers : generalUsers

    if (search.trim() === '') {
      setFilteredUsers(source)
      return
    }

    const filtered = source.filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [search, generalUsers, dojoUsers, activeTab])

  if (!user) { return null; }

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
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>🏆 Ranking</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background bg-slate-950/5 text-slate-950">
        <div className="mx-4 mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 text-center">
          <IonText className="text-2xl font-bold text-slate-900">Ranking de Karatecas</IonText>
          <IonText className="mt-2 text-sm text-slate-600">Compita e ganhe pontos através de torneios e atividades</IonText>
        </div>

        <div className="flex flex-wrap justify-center gap-3 px-4 mb-4">
          <IonButton
            fill={activeTab === 'general' ? 'solid' : 'outline'}
            className="rounded-full"
            onClick={() => setActiveTab('general')}
          >
            Geral
          </IonButton>

          {!isAdmin && (
            <IonButton
              fill={activeTab === 'dojo' ? 'solid' : 'outline'}
              className="rounded-full"
              onClick={() => setActiveTab('dojo')}
            >
              Dojô
            </IonButton>
          )}
        </div>

        <IonSearchbar
          value={search}
          onIonInput={e => setSearch(e.detail.value ?? '')}
          placeholder="Buscar karateca..."
          className="mx-4 mb-4 rounded-3xl bg-slate-100 border border-slate-200"
        />

        <IonText color="medium" className="mx-4 mb-4 text-sm">
          {filteredUsers.length} karateca{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
        </IonText>

        {/* Ranking List */}
        {filteredUsers.length > 0 ? (
          <div className="mx-4 space-y-3 pb-20">
            {filteredUsers.map((user, index) => (
              <div key={user._id} className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70">
                <RankingItem
                  user={user}
                  position={user.ranking}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-4 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/70">
            <IonText color="medium">
              <p>Nenhum karateca encontrado.</p>
            </IonText>
          </div>
        )}

        {/* Footer info */}
        <div className="mx-4 rounded-3xl bg-slate-100 p-5 shadow-sm ring-1 ring-slate-200/70 mt-6 text-left">
          <IonText className="text-sm font-semibold text-slate-900">Como ganhar pontos?</IonText>
          <div className="mt-3 text-sm leading-7 text-slate-600">
            <p className="mb-2">• Participar em torneios (+50-200 pontos)</p>
            <p className="mb-2">• Treinos regulares (+10 pontos/dia)</p>
            <p className="mb-2">• Compartilhar conteúdo (+5-20 pontos)</p>
            <p className="mb-0">• Acertar predições (+25 pontos)</p>
          </div>
        </div>
      </IonContent>

      <Navbar />
    </IonPage>
  )
}

export default Ranking