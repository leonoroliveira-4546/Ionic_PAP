import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonButton, IonSelect, IonSelectOption } from '@ionic/react';
import { useAuth } from '../../../AuthContext';
import Navbar from '../../../components/MainLayout';
import '../../../pages/StylesPages.css';
import authApi from '../../../hooks/authApi';
import dojosApi from '../../../hooks/dojosApi';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [performance, setPerformance] = useState<any>(null);
  const [absences, setAbsences] = useState<number>(0);
  const [trainingSchedule, setTrainingSchedule] = useState<any[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<any[]>([]);

  const [dojoMembers, setDojoMembers] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);

  const [selectedMember, setSelectedMember] = useState<string>(''); // Membro selecionado
  const [newPerformance, setNewPerformance] = useState({
    rating: 0,
    improvements: '',
    needsImprovement: ''
  });
  const [newSchedule, setNewSchedule] = useState({
    day: '',
    time: '',
    location: ''
  });

  const { addPerformance, getPerformance, getAbsencesByMonth } = authApi(() => {});
  const { getDojoMembers, removeMember, addTrainingSchedule, createTournament, getDojoTournaments } = dojosApi();

  if (!user) return null;

  const fetchAthleteData = async (athleteId: string) => {
    try {
      const perfData = await getPerformance({ athleteId });
      setPerformance(perfData.performance || null);

      const month = new Date().toISOString().slice(0, 7);
      const absData = await getAbsencesByMonth(athleteId, month);
      setAbsences(absData.count || 0);

      if (user.dojoId) {
        const dojoMembers = await getDojoMembers(user.dojoId);
        setTrainingSchedule(dojoMembers.members?.find((m: any) => m._id === athleteId)?.trainingSchedule || []);

        const tournaments = await getDojoTournaments(user.dojoId);
        setUpcomingTournaments(tournaments.tournaments || []);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do atleta:', err);
    }
  };

  const fetchDojoData = async () => {
    if (!user.dojoId) return;

    try {
      const membersData = await getDojoMembers(user.dojoId);
      setDojoMembers(membersData.members || []);

      const tournamentsData = await getDojoTournaments(user.dojoId);
      setTournaments(tournamentsData.tournaments || []);
    } catch (err) {
      console.error("Erro ao buscar dados do dojo:", err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!user.dojoId) return;
    await removeMember(user.dojoId, userId);
    fetchDojoData();
  };

  const handleCreateTournament = async () => {
    if (!user.dojoId) return;

    const newTournament = {
      name: "Torneio Exemplo",
      date: new Date().toISOString().slice(0,10),
      location: "Dojo Central",
      userId: user._id
    };

    await createTournament(user.dojoId, newTournament);
    fetchDojoData();
  };

  const handleAddPerformance = async () => {
    if (!selectedMember) return;

    await addPerformance({
      athleteId: selectedMember,
      rating: newPerformance.rating,
      improvements: newPerformance.improvements.split(',').map(i => i.trim()),
      needsImprovement: newPerformance.needsImprovement.split(',').map(i => i.trim())
    });

    alert('Performance adicionada com sucesso!');
    setNewPerformance({ rating: 0, improvements: '', needsImprovement: '' });
  };

  const handleAddTrainingSchedule = async () => {
    if (!user.dojoId) return;

    await addTrainingSchedule(user.dojoId, newSchedule);
    alert('Horário adicionado com sucesso!');
    setNewSchedule({ day: '', time: '', location: '' });
    fetchDojoData();
  };

  useEffect(() => {
    if (user.type === "sensei") {
      fetchDojoData();
    }
  }, [user]);

  const renderAthleteDashboard = (athleteId: string) => {
    const athleteTraining = trainingSchedule.length ? trainingSchedule : [];
    const athletePerformance = performance || {
      rating: 0,
      feedback: { improvements: [], needsImprovement: [] }
    };

    return (
      <div className="page background">
        <h2>Dashboard do Atleta</h2>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Horário de Treinos</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {athleteTraining.map((schedule, index) => (
                <IonItem key={index}>
                  <IonLabel>{schedule.day} - {schedule.time}</IonLabel>
                  <IonLabel slot="end">{schedule.location}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Desempenho no Karate</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Avaliação:</strong> {athletePerformance.rating}/5</p>
            <h4>O que melhorou:</h4>
            <ul>
              {athletePerformance.feedback.improvements.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
            </ul>
            <h4>O que precisa melhorar:</h4>
            <ul>
              {athletePerformance.feedback.needsImprovement.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
            </ul>
            <h4>Faltas por Mês: {absences}</h4>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Próximos Torneios</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              {upcomingTournaments.map((tournament, index) => (
                <IonItem key={index}>
                  <IonLabel>
                    <h3>{tournament.name}</h3>
                    <p>{tournament.date} - {tournament.location}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>
      </div>
    );
  };

  const renderSenseiDashboard = () => (
    <div className="page background">
      <h2>Dashboard do Sensei</h2>

      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Membros do Dojo</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            {dojoMembers.map(member => (
              <IonItem key={member._id}>
                <IonLabel>{member.username}</IonLabel>
                <IonButton color="danger" onClick={() => handleRemoveMember(member._id)}>Remover</IonButton>
              </IonItem>
            ))}
          </IonList>
        </IonCardContent>
      </IonCard>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Adicionar Horário de Treino</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonLabel>Dia</IonLabel>
          <input type="text" value={newSchedule.day} onChange={e => setNewSchedule({...newSchedule, day: e.target.value})} />

          <IonLabel>Hora</IonLabel>
          <input type="text" value={newSchedule.time} onChange={e => setNewSchedule({...newSchedule, time: e.target.value})} />

          <IonLabel>Local</IonLabel>
          <input type="text" value={newSchedule.location} onChange={e => setNewSchedule({...newSchedule, location: e.target.value})} />

          <IonButton expand="block" onClick={handleAddTrainingSchedule}>Salvar Horário</IonButton>
        </IonCardContent>
      </IonCard>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Torneios</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            {tournaments.map(t => (
              <IonItem key={t._id}>
                <IonLabel>{t.name} - {t.date}</IonLabel>
              </IonItem>
            ))}
          </IonList>
          <IonButton expand="block" onClick={() => handleCreateTournament()}>Criar Torneio</IonButton>
        </IonCardContent>
      </IonCard>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Adicionar Performance</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonSelect placeholder="Escolha um membro" value={selectedMember} onIonChange={e => setSelectedMember(e.detail.value!)}>
            {dojoMembers.map(member => (
              <IonSelectOption key={member._id} value={member._id}>{member.username}</IonSelectOption>
            ))}
          </IonSelect>

          <IonLabel>Avaliação (1-5)</IonLabel>
          <input type="number" min={1} max={5} value={newPerformance.rating} onChange={e => setNewPerformance({...newPerformance, rating: Number(e.target.value)})} />

          <IonLabel>Melhorias (separadas por vírgula)</IonLabel>
          <input type="text" value={newPerformance.improvements} onChange={e => setNewPerformance({...newPerformance, improvements: e.target.value})} />

          <IonLabel>O que precisa melhorar (separadas por vírgula)</IonLabel>
          <input type="text" value={newPerformance.needsImprovement} onChange={e => setNewPerformance({...newPerformance, needsImprovement: e.target.value})} />

          <IonButton expand="block" onClick={handleAddPerformance}>Salvar Performance</IonButton>
        </IonCardContent>
      </IonCard>
    </div>
  );

  const renderResponsavelDashboard = () => {
    const children = user.childrens || [];
    if (children.length > 1 && !selectedChild) {
      return (
        <div className="page background">
          <h2>Selecionar Atleta</h2>
          <IonCard>
            <IonCardContent>
              <IonSelect placeholder="Escolha seu filho" value={selectedChild} onIonChange={(e) => setSelectedChild(e.detail.value!)}>
                {children.map((child, idx) => {
                  const childId = typeof child === 'string' ? child : child._id;
                  const childName = typeof child === 'string' ? child : child.username;
                  
                  return (
                    <IonSelectOption key={idx} value={childId}>
                      {childName}
                    </IonSelectOption>
                  );
                })}
              </IonSelect>
            </IonCardContent>
          </IonCard>
        </div>
      );
    }

    if (!children.length) {
      return <div className="page"><h2>Responsável</h2><p>Não há atletas associados.</p></div>;
    }

    const athleteId = selectedChild || children[0]._id || children[0].username;
    return renderAthleteDashboard(athleteId);
  };

  useEffect(() => {
    if (user.type === 'athlete') {
      fetchAthleteData(user._id);
    } else if (user.type === 'responsavel' && (selectedChild || (user.childrens && user.childrens.length === 1))) {
      const childId = selectedChild || user.childrens?.[0]?._id;
      if (childId) {
        fetchAthleteData(childId);
      }
    }
  }, [user, selectedChild]);

  let dashboard;
  switch (user.type) {
    case 'athlete':
      dashboard = renderAthleteDashboard(user._id);
      break;
    case 'sensei':
      dashboard = renderSenseiDashboard();
      break;
    case 'responsavel':
      dashboard = renderResponsavelDashboard();
      break;
    default:
      dashboard = <p>Tipo de usuário não reconhecido.</p>;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className='background'>
        {dashboard}
      </IonContent>
      <Navbar />
    </IonPage>
  );
};

export default Home;