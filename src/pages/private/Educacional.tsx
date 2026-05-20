import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonChip, IonSpinner, IonSearchbar, IonSegment, IonSegmentButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonModal,
  IonInput, IonLabel, IonItem, IonList, IonIcon
} from '@ionic/react';
import { bookOutline, playOutline, add, trash, create, close } from 'ionicons/icons';
import Navbar from '../../components/MainLayout';
import VideoCard from '../../components/VideoCard';
import { educationalApi } from '../../hooks/educationalApi';

interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  channelName: string;
  publishedAt: string;
}

interface Challenge {
  _id?: string;
  title: string;
  description: string;
  date: string;
  dojoOnly: boolean;
  type: 'text-short' | 'text-long' | 'multiple-choice' | 'single-choice';
  options?: string[]; // Para múltipla escolha e escolha simples
  correctAnswer?: string;
  points?: number;
}

interface ChallengeReport {
  challengeId: string;
  title: string;
  date: string;
  responses: {
    athleteId: string;
    athleteName: string;
    response: string;
    correct?: boolean;
    pointsEarned?: number;
    timestamp?: string;
    createdAt?: string;
  }[];
}

type Category = 'all' | 'historia' | 'filosofia' | 'tecnicas';

const Educacional: React.FC = () => {
  const { user, Login } = useAuth();
  const {
    getEducationalContent,
    createChallenge,
    getCurrentChallenge,
    getChallengesByDojo,
    getChallengeResponses,
    getUserChallengeResponse,
    submitChallengeResponse,
    updateChallenge,
    deleteChallenge
  } = educationalApi();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  
  // Desafios do dia
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<Challenge | null>(null);
  const [challengeAnswer, setChallengeAnswer] = useState<string>('');
  const [userChallengeResponse, setUserChallengeResponse] = useState<any | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState<Challenge>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    dojoOnly: true,
    type: 'text-short',
    options: [],
    correctAnswer: '',
    points: 20
  });
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedChallengeReport, setSelectedChallengeReport] = useState<ChallengeReport | null>(null);
  const isSensei = user?.type === 'sensei';

  const loadChallenges = async () => {
    if (!user?.dojoId) {
      setDailyChallenges([]);
      setDailyChallenge(null);
      setUserChallengeResponse(null);
      return;
    }

    try {
      if (isSensei) {
        const data = await getChallengesByDojo(user.dojoId);
        setDailyChallenges(data.challenges || []);
        setDailyChallenge(null);
        setUserChallengeResponse(null);
      } else {
        const data = await getCurrentChallenge(user.dojoId);
        const challenge = data.challenge || null;
        if (!challenge) {
          setDailyChallenge(null);
          setUserChallengeResponse(null);
          return;
        }

        const responseData = await getUserChallengeResponse(challenge._id);
        if (responseData.answered) {
          setDailyChallenge(null);
          setUserChallengeResponse(responseData.response || null);
        } else {
          setDailyChallenge(challenge);
          setUserChallengeResponse(null);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar desafios', error);
      setDailyChallenges([]);
      setDailyChallenge(null);
      setUserChallengeResponse(null);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [user?.dojoId, isSensei]);

  const loadChallengeResponses = async (challengeId: string | undefined, title: string, date: string) => {
    if (!challengeId) return;
    try {
      const data = await getChallengeResponses(challengeId);
      setSelectedChallengeReport({
        challengeId,
        title,
        date,
        responses: data.responses || []
      });
      setShowReportModal(true);
    } catch (error) {
      console.error('Erro ao carregar respostas do desafio', error);
      alert('Erro ao carregar respostas do desafio.');
    }
  };

  const saveChallengeResponse = async () => {
    if (!user?.dojoId || !dailyChallenge?._id) return;
    if (!challengeAnswer.trim()) {
      alert('Digite sua resposta antes de enviar.');
      return;
    }

    try {
      const data = await submitChallengeResponse(dailyChallenge._id, challengeAnswer);
      if (!data.success) {
        alert(data.message || 'Erro ao enviar resposta.');
        return;
      }

      setUserChallengeResponse(data.resp);
      setDailyChallenge(null);
      window.dispatchEvent(new CustomEvent('challengeResponseSaved', { detail: { dojoId: user.dojoId, challengeId: dailyChallenge._id, athleteId: user._id } }));

      if (data.correct && user) {
        const updatedUser = { ...user, points: (user.points || 0) + (data.pointsEarned || 0) };
        Login(updatedUser);
      }

      alert(data.correct ? `Parabéns! Você ganhou ${data.pointsEarned} pontos.` : 'Resposta incorreta. Tente o próximo desafio.');
      setChallengeAnswer('');
    } catch (error) {
      console.error('Erro ao enviar resposta', error);
      alert('Erro ao enviar resposta.');
    }
  };

  const handleAddChallenge = async () => {
    if (!newChallenge.title.trim() || !newChallenge.description.trim()) {
      alert('Preencha o título e descrição do desafio');
      return;
    }

    if (!newChallenge.correctAnswer?.trim()) {
      alert('Defina a resposta correta do desafio.');
      return;
    }

    if (!editingChallenge?._id && dailyChallenges.length > 0) {
      alert('Já existe um desafio ativo para o dojo. Só é permitido um único desafio.');
      return;
    }

    if ((newChallenge.type === 'multiple-choice' || newChallenge.type === 'single-choice') && 
        (!newChallenge.options || newChallenge.options.length < 2)) {
      alert('Adicione pelo menos 2 opções para este tipo de desafio');
      return;
    }

    if ((newChallenge.type === 'multiple-choice' || newChallenge.type === 'single-choice') &&
        newChallenge.options && !newChallenge.options.includes(newChallenge.correctAnswer || '')) {
      alert('A resposta correta deve ser uma das opções existentes.');
      return;
    }

    if (newChallenge.points === undefined || newChallenge.points < 0) {
      alert('Defina um valor de pontos válido para o desafio.');
      return;
    }

    try {
      if (editingChallenge && editingChallenge._id) {
        const data = await updateChallenge(editingChallenge._id, {
          ...newChallenge,
          dojoId: user?.dojoId
        });
        if (!data.success) {
          alert(data.message || 'Erro ao atualizar desafio.');
          return;
        }
        alert('Desafio atualizado com sucesso!');
      } else {
        const data = await createChallenge({
          ...newChallenge,
          dojoId: user?.dojoId
        });
        if (!data.success) {
          alert(data.message || 'Erro ao criar desafio.');
          return;
        }
        alert('Desafio adicionado com sucesso!');
      }

      setNewChallenge({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        dojoOnly: true,
        type: 'text-short',
        options: [],
        correctAnswer: '',
        points: 20
      });
      setEditingChallenge(null);
      setShowChallengeModal(false);
      loadChallenges();
    } catch (error) {
      console.error('Erro ao salvar desafio', error);
      alert('Erro ao salvar desafio.');
    }
  };

  const handleDeleteChallenge = async (id: string | undefined) => {
    if (!id) return;
    try {
      const data = await deleteChallenge(id);
      if (!data.success) {
        alert(data.message || 'Erro ao remover desafio.');
        return;
      }
      alert('Desafio removido!');
      loadChallenges();
    } catch (error) {
      console.error('Erro ao remover desafio', error);
      alert('Erro ao remover desafio.');
    }
  };

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setNewChallenge(challenge);
    setShowChallengeModal(true);
  };

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      try {
        const data = await getEducationalContent();
        const educationalVideos = (data.contents || data).filter((video: Video) =>
          ['historia', 'filosofia', 'tecnicas'].includes(video.category)
        );
        setVideos(educationalVideos);
        setFilteredVideos(educationalVideos);
      } catch (error) {
        console.error('Falha ao carregar conteúdo educacional', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [getEducationalContent]);

  useEffect(() => {
    let filtered = videos;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(video => video.category === activeCategory);
    }

    // Filter by search
    if (search.trim() !== '') {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(search.toLowerCase()) ||
        video.description.toLowerCase().includes(search.toLowerCase()) ||
        video.channelName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by published date (newest first)
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    setFilteredVideos(filtered);
  }, [search, activeCategory, videos]);

  const categories = [
    { value: 'all', label: 'Todos' },
    { value: 'historia', label: 'História' },
    { value: 'filosofia', label: 'Filosofia' },
    { value: 'tecnicas', label: 'Técnicas' }
  ];

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Área Educativa</IonTitle>
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
          <IonTitle>📚 Área Educativa</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background bg-slate-950/5 text-slate-950">
        <div className="mx-4 mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 text-center">
          <IonText className="text-2xl font-bold text-slate-900">Aprenda Karatê</IonText>
          <p className="mt-2 text-sm text-slate-600">Conteúdo educativo sobre a arte marcial do karatê</p>
        </div>

        <div className="mx-4 grid gap-4">
          <IonSearchbar
            value={search}
            onIonInput={e => setSearch(e.detail.value ?? '')}
            placeholder="Buscar conteúdo..."
            className="rounded-3xl bg-slate-100 border border-slate-200"
          />

          <IonSegment
            value={activeCategory}
            onIonChange={e => setActiveCategory(e.detail.value as Category)}
            className="rounded-3xl bg-slate-100 p-1"
          >
            {categories.map(cat => (
              <IonSegmentButton key={cat.value} value={cat.value} className="text-sm">
                <IonText>{cat.label}</IonText>
              </IonSegmentButton>
            ))}
          </IonSegment>

          <IonText color="medium" className="text-sm">
            {filteredVideos.length} conteúdo{filteredVideos.length !== 1 ? 's' : ''} encontrado{filteredVideos.length !== 1 ? 's' : ''}
          </IonText>
        </div>

        {filteredVideos.length > 0 ? (
          <div className="mx-4 grid gap-4">
            {filteredVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => {
                  console.log('Opening educational video:', video.url);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mx-4 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200/70">
            <IonText color="medium">Nenhum conteúdo encontrado para esta categoria.</IonText>
          </div>
        )}

        {isSensei && (
          <IonCard className="mx-4 mt-5 rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
            <IonCardHeader className="flex flex-wrap items-center justify-between gap-3 p-5 pt-6">
              <div>
                <IonText className="text-base font-semibold">🎯 Desafios do Dia</IonText>
                <p className="mt-1 text-sm text-slate-600">Crie desafios rápidos para seu dojo.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {dailyChallenges.length === 0 && (
                  <IonButton size="small" className="rounded-full bg-primary text-white" onClick={() => {
                    setEditingChallenge(null);
                    setNewChallenge({
                      title: '',
                      description: '',
                      date: new Date().toISOString().split('T')[0],
                      dojoOnly: true,
                      type: 'text-short',
                      options: [],
                      correctAnswer: '',
                      points: 20
                    });
                    setShowChallengeModal(true);
                  }}>
                    <IonIcon slot="start" icon={add} />
                    Novo
                  </IonButton>
                )}
              </div>
            </IonCardHeader>
            <IonCardContent className="space-y-4 p-5">
              {dailyChallenges.length > 0 ? (
                <div className="space-y-3">
                  {dailyChallenges.map(challenge => {
                    const typeLabel = {
                      'text-short': '📝 Resposta Curta',
                      'text-long': '📄 Resposta Longa',
                      'single-choice': '☑️ Escolha Simples',
                      'multiple-choice': '☑️ Múltipla Escolha'
                    }[challenge.type];

                    return (
                      <div key={challenge._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold">{challenge.title}</h3>
                            <p className="mt-2 text-sm text-slate-600">{challenge.description}</p>
                            <p className="mt-3 text-xs text-slate-500">
                              📅 {new Date(challenge.date).toLocaleDateString('pt-PT')} · {typeLabel} · {challenge.dojoOnly ? '🔒 Dojo' : '🌐 Público'}
                            </p>
                            {(challenge.options || []).length > 0 && (
                              <p className="mt-2 text-xs text-slate-500">Opções: {(challenge.options || []).join(', ')}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <IonButton fill="clear" size="small" onClick={() => loadChallengeResponses(challenge._id, challenge.title, challenge.date)}>
                              📊
                            </IonButton>
                            <IonButton fill="clear" size="small" onClick={() => handleEditChallenge(challenge)}>
                              <IonIcon slot="icon-only" icon={create} />
                            </IonButton>
                            <IonButton fill="clear" size="small" color="danger" onClick={() => handleDeleteChallenge(challenge._id)}>
                              <IonIcon slot="icon-only" icon={trash} />
                            </IonButton>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-600">Nenhum desafio criado ainda.</p>
              )}
            </IonCardContent>
          </IonCard>
        )}

        <IonModal isOpen={showChallengeModal} onDidDismiss={() => {
          setShowChallengeModal(false);
          setEditingChallenge(null);
          setNewChallenge({
            title: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            dojoOnly: true,
            type: 'text-short',
            options: [],
            correctAnswer: '',
            points: 20
          });
        }}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editingChallenge ? 'Editar Desafio' : 'Novo Desafio'}</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowChallengeModal(false)}>
                <IonIcon slot="icon-only" icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding bg-slate-950/5">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
              <IonItem className="rounded-3xl">
                <IonLabel position="stacked">Título</IonLabel>
                <IonInput
                  value={newChallenge.title}
                  onIonChange={e => setNewChallenge({...newChallenge, title: e.detail.value || ''})}
                  placeholder="Ex: Kata do dia"
                />
              </IonItem>
              <IonItem className="rounded-3xl mt-3">
                <IonLabel position="stacked">Descrição</IonLabel>
                <IonInput
                  value={newChallenge.description}
                  onIonChange={e => setNewChallenge({...newChallenge, description: e.detail.value || ''})}
                  placeholder="Ex: Executar Kata Heian Shodan corretamente"
                />
              </IonItem>
              <IonItem className="rounded-3xl mt-3">
                <IonLabel position="stacked">Data</IonLabel>
                <IonInput
                  type="date"
                  value={newChallenge.date}
                  onIonChange={e => setNewChallenge({...newChallenge, date: e.detail.value || ''})}
                />
              </IonItem>
              <IonItem className="rounded-3xl mt-3">
                <IonLabel position="stacked">Tipo de Desafio</IonLabel>
                <select
                  className="w-full rounded-2xl border border-slate-200 p-3"
                  value={newChallenge.type}
                  onChange={(e) => setNewChallenge({...newChallenge, type: e.target.value as any})}
                >
                  <option value="text-short">Resposta Curta</option>
                  <option value="text-long">Resposta Longa</option>
                  <option value="single-choice">Escolha Simples</option>
                  <option value="multiple-choice">Múltipla Escolha</option>
                </select>
              </IonItem>
              <IonItem className="rounded-3xl mt-3">
                <IonLabel position="stacked">Resposta Correta</IonLabel>
                <IonInput
                  value={newChallenge.correctAnswer}
                  onIonChange={e => setNewChallenge({...newChallenge, correctAnswer: e.detail.value || ''})}
                  placeholder="Digite a resposta correta"
                />
              </IonItem>
              <IonItem className="rounded-3xl mt-3">
                <IonLabel position="stacked">Pontos ao acertar</IonLabel>
                <IonInput
                  type="number"
                  value={newChallenge.points?.toString() || '20'}
                  onIonChange={e => setNewChallenge({...newChallenge, points: Number(e.detail.value)})}
                  placeholder="20"
                />
              </IonItem>
              {(newChallenge.type === 'multiple-choice' || newChallenge.type === 'single-choice') && (
                <div className="space-y-3 mt-4">
                  <IonText className="text-sm font-semibold">Opções:</IonText>
                  {(newChallenge.options || []).map((option, index) => (
                    <IonItem key={index} className="rounded-3xl">
                      <IonInput
                        value={option}
                        placeholder={`Opção ${index + 1}`}
                        onIonChange={(e) => {
                          const updated = [...(newChallenge.options || [])];
                          updated[index] = e.detail.value || '';
                          setNewChallenge({...newChallenge, options: updated});
                        }}
                      />
                      <IonButton fill="clear" color="danger" onClick={() => {
                        const updated = newChallenge.options?.filter((_, i) => i !== index) || [];
                        setNewChallenge({...newChallenge, options: updated});
                      }}>
                        <IonIcon slot="icon-only" icon={trash} />
                      </IonButton>
                    </IonItem>
                  ))}
                  <IonItem className="rounded-3xl mt-3">
                    <IonLabel position="stacked">Resposta Correta</IonLabel>
                    <IonInput
                      value={newChallenge.correctAnswer}
                      onIonChange={e => setNewChallenge({...newChallenge, correctAnswer: e.detail.value || ''})}
                      placeholder="Digite a resposta correta"
                    />
                  </IonItem>
                  <IonItem className="rounded-3xl mt-3">
                    <IonLabel position="stacked">Pontos ao acertar</IonLabel>
                    <IonInput
                      type="number"
                      value={newChallenge.points?.toString() || '20'}
                      onIonChange={e => setNewChallenge({...newChallenge, points: Number(e.detail.value)})}
                      placeholder="20"
                    />
                  </IonItem>
                  <IonButton expand="block" fill="outline" onClick={() => {
                    const updated = [...(newChallenge.options || []), ''];
                    setNewChallenge({...newChallenge, options: updated});
                  }}>
                    <IonIcon slot="start" icon={add} />
                    Adicionar Opção
                  </IonButton>
                </div>
              )}
              <IonButton expand="block" color="success" className="mt-5" onClick={handleAddChallenge}>
                {editingChallenge ? 'Guardar Alterações' : 'Criar Desafio'}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonModal isOpen={showReportModal} onDidDismiss={() => setShowReportModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>📊 Relatório do Desafio</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowReportModal(false)}>
                <IonIcon slot="icon-only" icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding bg-slate-950/5">
            {selectedChallengeReport && (
              <div className="space-y-4">
                <IonCard className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
                  <IonCardContent>
                    <h3 className="text-lg font-semibold">{selectedChallengeReport.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">📅 {new Date(selectedChallengeReport.date).toLocaleDateString('pt-PT')}</p>
                    <hr className="my-4" />
                    <p><strong>Total de respostas:</strong> {selectedChallengeReport.responses.length}</p>
                    {selectedChallengeReport.responses.length === 0 && (
                      <p className="mt-2 text-sm text-slate-500">Nenhuma resposta recebida ainda.</p>
                    )}
                  </IonCardContent>
                </IonCard>

                {selectedChallengeReport.responses.length > 0 && (
                  <IonCard className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
                    <IonCardHeader>
                      <IonCardTitle>Respostas dos Atletas</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        {selectedChallengeReport.responses.map((response, index) => (
                          <IonItem key={index} className="rounded-3xl mb-3">
                            <IonLabel>
                              <h3 className="text-sm font-semibold">{response.athleteName}</h3>
                              <p className="text-sm text-slate-600">{response.response}</p>
                              {(response.timestamp || response.createdAt) && (
                                <p className="mt-1 text-xs text-slate-500">🕐 {new Date(response.timestamp || response.createdAt || '').toLocaleString('pt-PT')}</p>
                              )}
                            </IonLabel>
                          </IonItem>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                )}
              </div>
            )}
          </IonContent>
        </IonModal>

        {!isSensei && dailyChallenge && (
          <IonCard className="mx-4 mt-6 rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70">
            <IonCardHeader className="flex flex-wrap items-start justify-between gap-3 p-5 pt-6">
              <div>
                <IonText className="text-base font-semibold">🎯 Desafio do Dia</IonText>
                <p className="mt-1 text-sm text-slate-600">Complete o desafio e ganhe pontos para o seu progresso.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                +{dailyChallenge.points || 20} pontos
              </span>
            </IonCardHeader>
            <IonCardContent className="space-y-4 p-5">
              <h3 className="text-lg font-semibold text-slate-900">{dailyChallenge.title}</h3>
              <p className="text-sm text-slate-600">{dailyChallenge.description}</p>
              {dailyChallenge.date && (
                <p className="text-xs font-medium text-slate-500">Data do desafio: {new Date(dailyChallenge.date).toLocaleDateString('pt-PT')}</p>
              )}

              {userChallengeResponse ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="font-semibold text-emerald-900">Desafio respondido</p>
                  <p className="mt-2 text-sm text-slate-600">Você já enviou sua resposta para este desafio.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(dailyChallenge.type === 'multiple-choice' || dailyChallenge.type === 'single-choice') ? (
                    <div className="grid gap-3">
                      {(dailyChallenge.options || []).map(option => (
                        <IonButton
                          key={option}
                          fill={challengeAnswer === option ? 'solid' : 'outline'}
                          className="text-left"
                          onClick={() => setChallengeAnswer(option)}
                        >
                          {option}
                        </IonButton>
                      ))}
                    </div>
                  ) : (
                    <IonItem className="rounded-3xl">
                      <IonLabel position="stacked">Sua resposta</IonLabel>
                      <IonInput
                        value={challengeAnswer}
                        onIonChange={e => setChallengeAnswer(e.detail.value || '')}
                        placeholder="Digite sua resposta"
                      />
                    </IonItem>
                  )}
                  <IonButton
                    expand="block"
                    color="primary"
                    onClick={saveChallengeResponse}
                  >
                    Enviar Resposta
                  </IonButton>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        )}

        <div className="rounded-3xl bg-slate-100 p-5 mt-6 text-slate-700 shadow-sm ring-1 ring-slate-200/70">
          <IonText className="text-base font-semibold text-slate-900">💡 Dicas de Estudo</IonText>
          <div className="mt-3 text-sm leading-6 text-slate-600">
            <p className="mb-2"><strong>História:</strong> Conheça as raízes do karatê em Okinawa</p>
            <p className="mb-2"><strong>Filosofia:</strong> Entenda o "Dô" - o caminho do karateca</p>
            <p className="mb-2"><strong>Técnicas:</strong> Domine katas e movimentos fundamentais</p>
            <p className="mb-0"><strong>Prática:</strong> Treine regularmente para progredir</p>
          </div>
        </div>
      </IonContent>

      <Navbar />
    </IonPage>
  );
};

export default Educacional;