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

      <IonContent className="ion-padding background bg-slate-950/5 text-slate-950">
        <div className="mx-4 mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 text-center">
          <IonText className="text-2xl font-bold text-slate-900">Predições de Torneios</IonText>
          <p className="mt-2 text-sm text-slate-600">Acerte o vencedor e ganhe pontos!</p>
        </div>

        <div className="mx-4 space-y-4 pb-24">
          {tournaments.map(tournament => {
          const userPrediction = predictions.find(p => p.tournamentId === tournament.id);
          const selectedWinner = selectedPredictions[tournament.id] || userPrediction?.predictedWinner;

          return (
            <IonCard key={tournament.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <IonCardHeader className="space-y-3 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <IonCardTitle className="text-lg font-semibold text-slate-900">{tournament.name}</IonCardTitle>
                  <IonBadge color={getStatusColor(tournament.status)} className="text-sm">
                    {getStatusText(tournament.status)}
                  </IonBadge>
                </div>
                <div className="grid gap-1 text-sm text-slate-600">
                  <span>📅 {formatDate(tournament.date)}</span>
                  <span>📍 {tournament.location}</span>
                </div>
              </IonCardHeader>

              <IonCardContent className="space-y-4 p-5">
                <div>
                  <IonText className="font-semibold text-slate-900">Participantes:</IonText>
                  <div className="mt-3 space-y-3">
                    {tournament.participants.map(participant => {
                      const isSelected = selectedWinner === participant.id;
                      const isWinner = tournament.winner === participant.id;

                      return (
                        <div
                          key={participant.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-3xl border p-3 transition ${isSelected ? 'border-primary/30 bg-primary/10' : 'border-slate-200 bg-slate-50'} ${tournament.status === 'open' && !userPrediction && !isAdmin ? 'hover:border-slate-300 hover:bg-slate-100' : ''}`}
                          onClick={() => tournament.status === 'open' && !userPrediction && !isAdmin && handlePrediction(tournament.id, participant.id)}
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {isSelected ? '✓' : ''}
                          </div>
                          <div className="flex-1">
                            <IonText className="font-semibold text-slate-900">{participant.name}</IonText>
                            <p className="mt-1 text-sm text-slate-600">Faixa {participant.belt}</p>
                          </div>
                          {isWinner && (
                            <IonIcon icon={trophyOutline} color="warning" className="text-xl" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {userPrediction && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <IonText className="font-semibold text-slate-900">✓ Sua predição foi enviada</IonText>
                    {userPrediction.pointsEarned !== undefined && (
                      <p className="mt-2 text-sm text-success">+{userPrediction.pointsEarned} pontos ganhos!</p>
                    )}
                  </div>
                )}

                {tournament.status === 'open' && !userPrediction && selectedWinner && !isAdmin && (
                  <IonButton expand="block" className="rounded-full bg-slate-900 text-white hover:bg-slate-800" onClick={() => submitPredictionForTournament(tournament.id)}>
                    <IonIcon icon={checkmarkCircle} slot="start" />
                    Enviar Predição
                  </IonButton>
                )}

                {isAdmin && tournament.status === 'open' && !userPrediction && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
                    Administradores não podem enviar predições.
                  </div>
                )}

                {tournament.status === 'closed' && !tournament.winner && (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
                    <IonIcon icon={timeOutline} size="large" />
                    <p className="mt-2">Torneio em andamento</p>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          );
        })}

        {tournaments.length === 0 && (
          <div className="mx-4 rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200/70">
            <IonText color="medium">Nenhum torneio disponível no momento.</IonText>
          </div>
        )}
      </div>

        <div className="mx-4 rounded-3xl bg-slate-100 p-6 shadow-sm ring-1 ring-slate-200/70 mt-6">
          <IonText className="text-base font-semibold text-slate-900">❓ Como Funciona</IonText>
          <div className="mt-3 text-sm leading-7 text-slate-600">
            <p className="mb-2"><strong>Prediga:</strong> Escolha o vencedor antes do torneio</p>
            <p className="mb-2"><strong>Ganhe pontos:</strong> Acertos valem 25-50 pontos</p>
            <p className="mb-2"><strong>Suba no ranking:</strong> Mais pontos = melhor posição</p>
            <p className="mb-0"><strong>Prêmios:</strong> Top jogadores ganham recompensas</p>
          </div>
        </div>
      </IonContent>

      <Navbar />
    </IonPage>
  );
};

export default Predicoes;