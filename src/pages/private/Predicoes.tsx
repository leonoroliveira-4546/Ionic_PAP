import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonText, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  IonButton, IonIcon, IonBadge, IonSpinner, IonList, IonItem, IonLabel
} from '@ionic/react';
import { checkmarkCircle, closeCircle, timeOutline, trophyOutline } from 'ionicons/icons';
import Navbar from '../../components/MainLayout';
import { useAuth } from '../../AuthContext';
import { predictionsApi } from '../../hooks/predictionsApi';

interface Tournament {
  id: string;
  name: string;
  date: string;
  location: string;
  status: string;
  participants: { id: string; name: string; belt: string }[];
  winner?: string;
}

interface Prediction {
  tournamentId: string;
  predictedWinner: string;
  userId: string;
  pointsEarned?: number;
}

const Predicoes: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const { getTournaments, getMyPredictions, submitPrediction } = predictionsApi();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPredictions, setSelectedPredictions] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const tournamentsData = await getTournaments();
        const predictionsData = await getMyPredictions();

        setTournaments(tournamentsData.tournaments || tournamentsData);
        setPredictions(predictionsData.predictions || predictionsData);
      } catch (error) {
        console.error('Falha ao carregar predições', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getTournaments, getMyPredictions]);

  const handlePrediction = (tournamentId: string, participantId: string) => {
    setSelectedPredictions(prev => ({
      ...prev,
      [tournamentId]: participantId
    }));
  };

  const submitPredictionForTournament = async (tournamentId: string) => {
    const predictedWinner = selectedPredictions[tournamentId];
    if (!predictedWinner) return;

    try {
      await submitPrediction(tournamentId, predictedWinner);
      alert('Predição enviada com sucesso!');
      setPredictions(prev => [...prev, { userId: user?._id || '', tournamentId, predictedWinner }]);
    } catch (error) {
      console.error('Falha ao enviar predição', error);
      alert('Erro ao enviar predição. Tente novamente.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'success';
      case 'closed': return 'warning';
      case 'finished': return 'medium';
      default: return 'primary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'closed': return 'Fechado';
      case 'finished': return 'Finalizado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Predições</IonTitle>
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
          <IonTitle>🔮 Predições</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding background">
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <IonText style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
            Predições de Torneios
          </IonText>
          <p style={{ margin: '8px 0', color: 'var(--ion-color-medium)' }}>
            Acerte o vencedor e ganhe pontos!
          </p>
        </div>

        {/* Tournaments List */}
        {tournaments.map(tournament => {
          const userPrediction = predictions.find(p => p.tournamentId === tournament.id);
          const selectedWinner = selectedPredictions[tournament.id] || userPrediction?.predictedWinner;

          return (
            <IonCard key={tournament.id} style={{ margin: '16px 0', borderRadius: 12 }}>
              <IonCardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <IonCardTitle style={{ fontSize: 18 }}>{tournament.name}</IonCardTitle>
                  <IonBadge color={getStatusColor(tournament.status)}>
                    {getStatusText(tournament.status)}
                  </IonBadge>
                </div>
                <IonText color="medium" style={{ fontSize: 14 }}>
                  📅 {formatDate(tournament.date)}
                </IonText>
                <br />
                <IonText color="medium" style={{ fontSize: 14 }}>
                  📍 {tournament.location}
                </IonText>
              </IonCardHeader>

              <IonCardContent>
                {/* Participants */}
                <IonText style={{ fontWeight: 600, marginBottom: 12, display: 'block' }}>
                  Participantes:
                </IonText>
                <IonList style={{ background: 'transparent' }}>
                  {tournament.participants.map(participant => {
                    const isSelected = selectedWinner === participant.id;
                    const isWinner = tournament.winner === participant.id;

                    return (
                      <IonItem
                        key={participant.id}
                        style={{
                          '--border-radius': '8px',
                          marginBottom: 8,
                          backgroundColor: isSelected ? 'rgba(56, 128, 255, 0.1)' : 'transparent'
                        }}
                        button={tournament.status === 'open' && !userPrediction && !isAdmin}
                        onClick={() => tournament.status === 'open' && !userPrediction && !isAdmin && handlePrediction(tournament.id, participant.id)}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: isSelected ? 'var(--ion-color-primary)' : '#ccc',
                            marginRight: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'white' }} />}
                        </div>

                        <IonLabel>
                          <IonText style={{ fontWeight: 600 }}>{participant.name}</IonText>
                          <p style={{ margin: '4px 0', color: 'var(--ion-color-medium)' }}>
                            Faixa {participant.belt}
                          </p>
                        </IonLabel>

                        {isWinner && (
                          <IonIcon icon={trophyOutline} color="warning" style={{ marginLeft: 8 }} />
                        )}
                      </IonItem>
                    );
                  })}
                </IonList>

                {/* Prediction Status */}
                {userPrediction && (
                  <div style={{ marginTop: 16, padding: 12, backgroundColor: 'var(--ion-color-light)', borderRadius: 8 }}>
                    <IonText style={{ fontWeight: 600, color: 'var(--ion-color-primary)' }}>
                      ✓ Sua predição foi enviada
                    </IonText>
                    {userPrediction.pointsEarned !== undefined && (
                      <p style={{ margin: '4px 0', color: 'var(--ion-color-success)' }}>
                        +{userPrediction.pointsEarned} pontos ganhos!
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                {tournament.status === 'open' && !userPrediction && selectedWinner && !isAdmin && (
                  <IonButton
                    expand="block"
                    style={{ marginTop: 16 }}
                    onClick={() => submitPredictionForTournament(tournament.id)}
                  >
                    <IonIcon icon={checkmarkCircle} slot="start" />
                    Enviar Predição
                  </IonButton>
                )}
                {isAdmin && tournament.status === 'open' && !userPrediction && (
                  <div style={{ marginTop: 16, padding: 12, backgroundColor: 'var(--ion-color-light)', borderRadius: 8 }}>
                    <IonText color="medium">Administradores não podem enviar predições.</IonText>
                  </div>
                )}

                {/* Closed Status */}
                {tournament.status === 'closed' && !tournament.winner && (
                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <IonIcon icon={timeOutline} size="large" color="medium" />
                    <IonText color="medium" style={{ display: 'block', marginTop: 8 }}>
                      Torneio em andamento
                    </IonText>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          );
        })}

        {tournaments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <IonText color="medium">
              <p>Sem torneios disponíveis no momento.</p>
            </IonText>
          </div>
        )}

        {/* How it works */}
        <div style={{ textAlign: 'center', padding: '20px', backgroundColor: 'var(--ion-color-light)', borderRadius: 12, marginTop: 20 }}>
          <IonText style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
            ❓ Como Funciona
          </IonText>
          <div style={{ marginTop: 12, textAlign: 'left' }}>
            <IonText style={{ fontSize: 14, color: 'var(--ion-color-medium)' }}>
              <p style={{ margin: '8px 0' }}>
                • <strong>Prediga:</strong> Escolha o vencedor antes do torneio<br />
                • <strong>Ganhe pontos:</strong> Acertos valem 25-50 pontos<br />
                • <strong>Suba no ranking:</strong> Mais pontos = melhor posição<br />
                • <strong>Prêmios:</strong> Top jogadores ganham recompensas
              </p>
            </IonText>
          </div>
        </div>
      </IonContent>

      <Navbar />
    </IonPage>
  );
};

export default Predicoes;