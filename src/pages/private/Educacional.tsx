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
}

interface ChallengeReport {
  challengeId: string;
  title: string;
  date: string;
  responses: {
    athleteId: string;
    athleteName: string;
    response: string;
    timestamp?: string;
  }[];
}

type Category = 'all' | 'historia' | 'filosofia' | 'tecnicas';

const Educacional: React.FC = () => {
  const { user } = useAuth();
  const { getEducationalContent } = educationalApi();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  
  // Desafios do dia
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [newChallenge, setNewChallenge] = useState<Challenge>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    dojoOnly: true,
    type: 'text-short',
    options: []
  });
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedChallengeReport, setSelectedChallengeReport] = useState<ChallengeReport | null>(null);
  const isSensei = user?.type === 'sensei';

  // Carregar desafios do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`challenges_${user?.dojoId || 'default'}`);
    if (saved) {
      setDailyChallenges(JSON.parse(saved));
    }
  }, [user?.dojoId]);

  const saveChallenges = (challenges: Challenge[]) => {
    localStorage.setItem(`challenges_${user?.dojoId || 'default'}`, JSON.stringify(challenges));
    setDailyChallenges(challenges);
  };

  const handleAddChallenge = () => {
    if (!newChallenge.title.trim() || !newChallenge.description.trim()) {
      alert('Preencha o título e descrição do desafio');
      return;
    }

    // Só é permitido um desafio por dojo ao mesmo tempo
    if (!editingChallenge?._id && dailyChallenges.length > 0) {
      alert('Já existe um desafio ativo para o dojo. Só é permitido um único desafio.');
      return;
    }

    // Validar opções para múltipla escolha
    if ((newChallenge.type === 'multiple-choice' || newChallenge.type === 'single-choice') && 
        (!newChallenge.options || newChallenge.options.length < 2)) {
      alert('Adicione pelo menos 2 opções para este tipo de desafio');
      return;
    }

    if (editingChallenge && editingChallenge._id) {
      // Editar desafio existente
      const updated = dailyChallenges.map(c => 
        c._id === editingChallenge._id ? { ...newChallenge, _id: c._id } : c
      );
      saveChallenges(updated);
      alert('Desafio atualizado com sucesso!');
    } else {
      // Adicionar novo desafio
      const challenge = { ...newChallenge, _id: Date.now().toString() };
      saveChallenges([...dailyChallenges, challenge]);
      alert('Desafio adicionado com sucesso!');
    }
    
    setNewChallenge({ 
      title: '', 
      description: '', 
      date: new Date().toISOString().split('T')[0], 
      dojoOnly: true,
      type: 'text-short',
      options: []
    });
    setEditingChallenge(null);
    setShowChallengeModal(false);
  };

  const handleDeleteChallenge = (id: string | undefined) => {
    if (!id) return;
    const updated = dailyChallenges.filter(c => c._id !== id);
    saveChallenges(updated);
    alert('Desafio removido!');
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

      <IonContent className="ion-padding background">
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <IonText style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
            Aprenda Karatê
          </IonText>
          <p style={{ margin: '8px 0', color: 'var(--ion-color-medium)' }}>
            Conteúdo educativo sobre a arte marcial do karatê
          </p>
        </div>

        {/* Search */}
        <IonSearchbar
          value={search}
          onIonInput={e => setSearch(e.detail.value ?? '')}
          placeholder="Buscar conteúdo..."
          style={{ marginBottom: 16 }}
        />

        {/* Category Filter */}
        <div style={{ marginBottom: 16 }}>
          <IonSegment
            value={activeCategory}
            onIonChange={e => setActiveCategory(e.detail.value as Category)}
            style={{ '--background': 'var(--ion-color-light)' }}
          >
            {categories.map(cat => (
              <IonSegmentButton key={cat.value} value={cat.value}>
                <IonText style={{ fontSize: 14 }}>{cat.label}</IonText>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </div>

        {/* Results count */}
        <IonText color="medium">
          <p style={{ margin: '0 0 12px', fontSize: 14 }}>
            {filteredVideos.length} conteúdo{filteredVideos.length !== 1 ? 's' : ''} encontrado{filteredVideos.length !== 1 ? 's' : ''}
          </p>
        </IonText>

        {/* Content Grid */}
        {filteredVideos.length > 0 ? (
          <div>
            {filteredVideos.map(video => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => {
                  // Simulate opening video
                  console.log('Opening educational video:', video.url);
                  // In a real app, this would open the video
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <IonText color="medium">
              <p>Nenhum conteúdo encontrado para esta categoria.</p>
            </IonText>
          </div>
        )}

        {/* Desafios do Dia - Sensei Only */}
        {isSensei && (
          <IonCard style={{ marginTop: '20px' }}>
            <IonCardHeader>
              <IonCardTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🎯 Desafios do Dia</span>
                {dailyChallenges.length === 0 && (
                  <IonButton size="small" onClick={() => {
                    setEditingChallenge(null);
                    setNewChallenge({ 
                      title: '', 
                      description: '', 
                      date: new Date().toISOString().split('T')[0], 
                      dojoOnly: true,
                      type: 'text-short',
                      options: []
                    });
                    setShowChallengeModal(true);
                  }}>
                    <IonIcon slot="start" icon={add} />
                    Novo
                  </IonButton>
                )}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {dailyChallenges.length > 0 ? (
                <IonList>
                  {dailyChallenges.map(challenge => {
                    const typeLabel = {
                      'text-short': '📝 Resposta Curta',
                      'text-long': '📄 Resposta Longa',
                      'single-choice': '☑️ Escolha Simples',
                      'multiple-choice': '☑️ Múltipla Escolha'
                    }[challenge.type];
                    
                    return (
                      <div key={challenge._id} style={{marginBottom: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #007AFF'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                          <div style={{flex: 1}}>
                            <h3 style={{margin: '0 0 4px 0'}}>{challenge.title}</h3>
                            <p style={{margin: '0 0 8px 0', fontSize: '0.9em', color: '#666'}}>{challenge.description}</p>
                            <p style={{fontSize: '0.85em', color: '#999', margin: '4px 0'}}>
                              📅 {new Date(challenge.date).toLocaleDateString('pt-PT')} | {typeLabel} | 
                              {challenge.dojoOnly ? ' 🔒 Dojo' : ' 🌐 Público'}
                            </p>
                            {(challenge.options || []).length > 0 && (
                              <div style={{fontSize: '0.85em', marginTop: '4px', color: '#666'}}>
                                <strong>Opções:</strong> {(challenge.options || []).join(', ')}
                              </div>
                            )}
                          </div>
                          <div style={{display: 'flex', gap: '4px'}}>
                            <IonButton fill="clear" size="small" onClick={() => {
                              setSelectedChallengeReport({
                                challengeId: challenge._id || '',
                                title: challenge.title,
                                date: challenge.date,
                                responses: [] // Em produção, viria do backend
                              });
                              setShowReportModal(true);
                            }}>
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
                </IonList>
              ) : (
                <p>Nenhum desafio criado ainda.</p>
              )}
            </IonCardContent>
          </IonCard>
        )}

        {/* Modal de Desafios */}
        <IonModal isOpen={showChallengeModal} onDidDismiss={() => {
          setShowChallengeModal(false);
          setEditingChallenge(null);
          setNewChallenge({ 
            title: '', 
            description: '', 
            date: new Date().toISOString().split('T')[0], 
            dojoOnly: true,
            type: 'text-short',
            options: []
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
          <IonContent className="ion-padding">
            <IonCard>
              <IonCardContent>
                <IonItem>
                  <IonLabel position="stacked">Título</IonLabel>
                  <IonInput
                    value={newChallenge.title}
                    onIonChange={e => setNewChallenge({...newChallenge, title: e.detail.value || ''})}
                    placeholder="Ex: Kata do dia"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Descrição</IonLabel>
                  <IonInput
                    value={newChallenge.description}
                    onIonChange={e => setNewChallenge({...newChallenge, description: e.detail.value || ''})}
                    placeholder="Ex: Executar Kata Heian Shodan corretamente"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Data</IonLabel>
                  <IonInput
                    type="date"
                    value={newChallenge.date}
                    onIonChange={e => setNewChallenge({...newChallenge, date: e.detail.value || ''})}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Tipo de Desafio</IonLabel>
                  <select 
                    style={{width: '100%', padding: '8px', borderRadius: '4px'}}
                    value={newChallenge.type}
                    onChange={(e) => setNewChallenge({...newChallenge, type: e.target.value as any})}
                  >
                    <option value="text-short">Resposta Curta</option>
                    <option value="text-long">Resposta Longa</option>
                    <option value="single-choice">Escolha Simples</option>
                    <option value="multiple-choice">Múltipla Escolha</option>
                  </select>
                </IonItem>

                {/* Opções para múltipla escolha */}
                {(newChallenge.type === 'multiple-choice' || newChallenge.type === 'single-choice') && (
                  <div>
                    <IonLabel style={{display: 'block', marginTop: '16px', marginBottom: '8px'}}>
                      Opções:
                    </IonLabel>
                    {(newChallenge.options || []).map((option, index) => (
                      <IonItem key={index} style={{marginBottom: '8px'}}>
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
                    <IonButton expand="block" fill="outline" onClick={() => {
                      const updated = [...(newChallenge.options || []), ''];
                      setNewChallenge({...newChallenge, options: updated});
                    }}>
                      <IonIcon slot="start" icon={add} />
                      Adicionar Opção
                    </IonButton>
                  </div>
                )}


                <IonButton expand="block" color="success" onClick={handleAddChallenge} style={{ marginTop: '1rem' }}>
                  {editingChallenge ? 'Guardar Alterações' : 'Criar Desafio'}
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonContent>
        </IonModal>

        {/* Modal de Relatório */}
        <IonModal isOpen={showReportModal} onDidDismiss={() => setShowReportModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>📊 Relatório do Desafio</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowReportModal(false)}>
                <IonIcon slot="icon-only" icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedChallengeReport && (
              <div>
                <IonCard>
                  <IonCardContent>
                    <h3>{selectedChallengeReport.title}</h3>
                    <p>📅 {new Date(selectedChallengeReport.date).toLocaleDateString('pt-PT')}</p>
                    <hr />
                    <p><strong>Total de respostas:</strong> {selectedChallengeReport.responses.length}</p>
                    {selectedChallengeReport.responses.length === 0 && (
                      <p style={{color: '#999', fontStyle: 'italic'}}>Nenhuma resposta recebida ainda.</p>
                    )}
                  </IonCardContent>
                </IonCard>

                {selectedChallengeReport.responses.length > 0 && (
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Respostas dos Atletas</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        {selectedChallengeReport.responses.map((response, index) => (
                          <IonItem key={index} style={{marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #ddd'}}>
                            <IonLabel>
                              <h3>{response.athleteName}</h3>
                              <p>{response.response}</p>
                              {response.timestamp && (
                                <p style={{fontSize: '0.85em', color: '#999'}}>
                                  🕐 {new Date(response.timestamp).toLocaleString('pt-PT')}
                                </p>
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

        {/* Educational Tips */}
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--ion-color-light)', borderRadius: 12, marginTop: 20 }}>
          <IonText style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
            💡 Dicas de Estudo
          </IonText>
          <div style={{ marginTop: 12, textAlign: 'left' }}>
            <IonText style={{ fontSize: 14, color: 'var(--ion-color-medium)' }}>
              <p style={{ margin: '8px 0' }}>
                • <strong>História:</strong> Conheça as raízes do karatê em Okinawa<br />
                • <strong>Filosofia:</strong> Entenda o "Dô" - o caminho do karateca<br />
                • <strong>Técnicas:</strong> Domine katas e movimentos fundamentais<br />
                • <strong>Prática:</strong> Treine regularmente para progredir
              </p>
            </IonText>
          </div>
        </div>
      </IonContent>

      <Navbar />
    </IonPage>
  );
};

export default Educacional;