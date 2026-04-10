import React, { useEffect, useState, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonButton, IonSelect, IonSelectOption, IonModal, IonInput, IonDatetime, IonIcon, IonGrid, IonRow, IonCol } from '@ionic/react';
import { close, add, chevronBack, create, trash, eye } from 'ionicons/icons';
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

  // Modais
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMemberDetailsModal, setShowMemberDetailsModal] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<any>(null);
  const [editingSchedules, setEditingSchedules] = useState<any[]>([]);
  const [editingTournaments, setEditingTournaments] = useState<any[]>([]);
  const [newTournamentData, setNewTournamentData] = useState({
    name: '',
    date: '',
    location: ''
  });

  const { addPerformance, getPerformance, getAbsencesByMonth } = authApi(() => {});
  const { getDojoMembers, removeMember, addTrainingSchedule, updateTrainingSchedules, createTournament, getDojoTournaments, updateTournament, deleteTournament } = dojosApi();

  if (!user) return null;

  const fetchAthleteData = async (athleteId: string, isChild: boolean = false) => {
    try {
      const perfParams = isChild ? { athleteId: user._id, childId: athleteId } : { athleteId };
      const perfData = await getPerformance(perfParams);
      if (!perfData.success) {
        alert(perfData.error);
        setPerformance(null);
      } else {
        setPerformance(perfData.performance || null);
      }

      const month = new Date().toISOString().slice(0, 7);
      if (isChild) {
        const child = user.childrens?.find((c: any) => c._id === athleteId);
        const abs = child?.absences?.find((a: any) => a.month === month)?.count || 0;
        setAbsences(abs);
      } else {
        const absData = await getAbsencesByMonth(athleteId, month);
        if (!absData.success) {
          alert(absData.error);
          setAbsences(0);
        } else {
          setAbsences(absData.count || 0);
        }
      }

      if (user.dojoId) {
        const dojoData = await getDojoMembers(user.dojoId);
        if (!dojoData.success) {
          alert(dojoData.error);
        } else {
          setTrainingSchedule(dojoData.dojo.trainingSchedule);
        }

        const tournaments = await getDojoTournaments(user.dojoId);
        if (!tournaments.success) {
          alert(tournaments.error);
        } else {
          setUpcomingTournaments(tournaments.tournaments || []);
        }
      }
    } catch (err) {
      alert('Erro ao buscar dados do atleta: ' + err);
    }
  };

  const fetchDojoData = async () => {
    if (!user.dojoId) return;

    try {
      const membersData = await getDojoMembers(user.dojoId);
      if (!membersData.success) {
        alert(membersData.error);
      } else {
        setDojoMembers(membersData.dojo.members);
        setTrainingSchedule(membersData.dojo.trainingSchedule);
      }

      const tournamentsData = await getDojoTournaments(user.dojoId);
      if (!tournamentsData.success) {
        alert(tournamentsData.error);
      } else {
        setTournaments(tournamentsData.tournaments || []);
      }
    } catch (err) {
      alert("Erro ao buscar dados do dojo: " + err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!user.dojoId) return;
    try {
      const data = await removeMember(user.dojoId, userId);
      if (!data.success) {
        alert(data.error);
      } else {
        alert('Membro removido com sucesso!');
        fetchDojoData();
      }
    } catch (err) {
      alert('Erro ao remover membro: ' + err);
    }
  };

  const handleAddTrainingSchedule = async () => {
    if (!user.dojoId) return;

    try {
      const data = await addTrainingSchedule(user.dojoId, newSchedule);
      if (!data.success) {
        alert(data.error);
      } else {
        alert('Horário adicionado com sucesso!');
        setNewSchedule({ day: '', time: '', location: '' });
        fetchDojoData();
      }
    } catch (err) {
      alert('Erro ao adicionar horário: ' + err);
    }
  };

  const handleSaveScheduleChanges = async () => {
    if (!user.dojoId) return;
    try {
      const data = await updateTrainingSchedules(user.dojoId, editingSchedules);
      if (!data.success) {
        alert(data.error);
      } else {
        alert('Alterações aos horários salvas com sucesso!');
        setShowScheduleModal(false);
        setTrainingSchedule(editingSchedules);
      }
    } catch (err) {
      alert('Erro ao salvar horários: ' + err);
    }
  };

  const handleAddScheduleInModal = () => {
    if (newSchedule.day && newSchedule.time && newSchedule.location) {
      setEditingSchedules([...editingSchedules, { ...newSchedule }]);
      setNewSchedule({ day: '', time: '', location: '' });
    }
  };

  const handleRemoveSchedule = (index: number) => {
    setEditingSchedules(editingSchedules.filter((_, i) => i !== index));
  };

  const handleViewMemberDetails = async (member: any) => {
    setSelectedMemberDetails(member);
    try {
      const perfData = await getPerformance({ athleteId: member._id });
      if (!perfData.success) {
        alert(perfData.error);
        setPerformance(null);
      } else {
        setPerformance(perfData.performance || null);
      }
    } catch (err) {
      alert('Erro ao buscar performance: ' + err);
    }
    setShowMemberDetailsModal(true);
  };

  const handleAddPerformanceToMember = async () => {
    if (!selectedMember || !selectedMemberDetails) return;

    try {
      const data = await addPerformance({
        athleteId: selectedMember,
        rating: newPerformance.rating,
        improvements: newPerformance.improvements.split(',').map(i => i.trim()),
        needsImprovement: newPerformance.needsImprovement.split(',').map(i => i.trim())
      });
      if (!data.success) {
        alert(data.error);
      } else {
        alert('Performance adicionada com sucesso!');
        setNewPerformance({ rating: 0, improvements: '', needsImprovement: '' });
        setShowMemberDetailsModal(false);
      }
    } catch (err) {
      alert('Erro ao adicionar performance: ' + err);
    }
  };

  const handleSaveTournamentChanges = async () => {
    if (!user.dojoId) {
      alert('Dojo ID não encontrado');
      return;
    }
    try {
      // Remove deleted tournaments
      for (let i = 0; i < tournaments.length; i++) {
        const existingTournament = editingTournaments.find((t: any) => t._id === tournaments[i]._id);
        if (!existingTournament) {
          await deleteTournament(tournaments[i]._id);
        }
      }

      // Update or create tournaments
      for (const tournament of editingTournaments) {
        if (tournament._id) {
          await updateTournament(tournament._id, { name: tournament.name, date: tournament.date, location: tournament.location });
        } else {
          const newTournamentData = {
            name: tournament.name,
            date: tournament.date,
            location: tournament.location,
            userId: user._id
          };
          await createTournament(user.dojoId, newTournamentData);
        }
      }

      alert('Alterações aos torneios salvas com sucesso!');
      setShowTournamentModal(false);
      fetchDojoData();
    } catch (err) {
      alert('Erro ao salvar torneios: ' + err);
    }
  };

  const handleAddTournamentInModal = () => {
    if (newTournamentData.name && newTournamentData.date && newTournamentData.location) {
      setEditingTournaments([...editingTournaments, { ...newTournamentData }]);
      setNewTournamentData({ name: '', date: '', location: '' });
    }
  };

  const handleRemoveTournament = (index: number) => {
    setEditingTournaments(editingTournaments.filter((_, i) => i !== index));
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

      {/* Horários */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Horários de Treino</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            {trainingSchedule.length > 0 ? (
              trainingSchedule.map((schedule, index) => (
                <IonItem key={index}>
                  <IonLabel>
                    <h3>{schedule.day}</h3>
                    <p>{schedule.time} - {schedule.location}</p>
                  </IonLabel>
                </IonItem>
              ))
            ) : (
              <p>Nenhum horário adicionado ainda.</p>
            )}
          </IonList>
          <IonButton expand="block" color="primary" onClick={() => {
            setEditingSchedules(trainingSchedule);
            setShowScheduleModal(true);
          }}>
            Editar Horários
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* Membros */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Membros do Dojo</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            {dojoMembers.filter(member => member.id).map(member => (
              <IonItem key={member.id._id}>
                <IonLabel>{member.id.username}</IonLabel>
                <IonButton fill="clear" onClick={() => handleViewMemberDetails(member.id)}>
                  <IonIcon slot="icon-only" icon={eye}></IonIcon>
                </IonButton>
                <IonButton fill="clear" color="danger" onClick={() => handleRemoveMember(member.id._id)}>
                  <IonIcon slot="icon-only" icon={trash}></IonIcon>
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        </IonCardContent>
      </IonCard>

      {/* Torneios */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Torneios</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {tournaments.length > 0 ? (
            <IonList>
              {tournaments.map(t => (
                <IonItem key={t._id}>
                  <IonLabel>
                    <h3>{t.name}</h3>
                    <p>{t.date} - {t.location}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          ) : (
            <p>Nenhum torneio criado ainda.</p>
          )}
          <IonButton expand="block" color="primary" onClick={() => {
            setEditingTournaments(tournaments);
            setShowTournamentModal(true);
          }}>
            Gerir Torneios
          </IonButton>
        </IonCardContent>
      </IonCard>

      {/* Modal Horários */}
      <IonModal isOpen={showScheduleModal} onDidDismiss={() => setShowScheduleModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Editar Horários de Treino</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setShowScheduleModal(false)}>
              <IonIcon slot="icon-only" icon={close}></IonIcon>
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Adicionar Novo Horário</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonSelect placeholder="Dia da Semana" value={newSchedule.day} onIonChange={e => setNewSchedule({...newSchedule, day: e.detail.value})}>
                <IonSelectOption value="Segunda">Segunda-feira</IonSelectOption>
                <IonSelectOption value="Terça">Terça-feira</IonSelectOption>
                <IonSelectOption value="Quarta">Quarta-feira</IonSelectOption>
                <IonSelectOption value="Quinta">Quinta-feira</IonSelectOption>
                <IonSelectOption value="Sexta">Sexta-feira</IonSelectOption>
                <IonSelectOption value="Sábado">Sábado</IonSelectOption>
                <IonSelectOption value="Domingo">Domingo</IonSelectOption>
              </IonSelect>

              <IonInput placeholder="Hora (ex: 18:00)" value={newSchedule.time} onIonChange={e => setNewSchedule({...newSchedule, time: e.detail.value || ''})}></IonInput>

              <IonInput placeholder="Local" value={newSchedule.location} onIonChange={e => setNewSchedule({...newSchedule, location: e.detail.value || ''})}></IonInput>

              <IonButton expand="block" onClick={handleAddScheduleInModal}>
                <IonIcon slot="start" icon={add}></IonIcon>
                Adicionar
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Horários Atuais</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {editingSchedules.map((schedule, index) => (
                  <IonItem key={index}>
                    <IonLabel>
                      <h3>{schedule.day}</h3>
                      <p>{schedule.time} - {schedule.location}</p>
                    </IonLabel>
                    <IonButton fill="clear" color="danger" onClick={() => handleRemoveSchedule(index)}>
                      <IonIcon slot="icon-only" icon={trash}></IonIcon>
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>

          <IonButton expand="block" color="success" onClick={handleSaveScheduleChanges}>
            Salvar Alterações
          </IonButton>
          <IonButton expand="block" color="medium" onClick={() => setShowScheduleModal(false)}>
            Cancelar
          </IonButton>
        </IonContent>
      </IonModal>

      {/* Modal Detalhes do Membro */}
      <IonModal isOpen={showMemberDetailsModal} onDidDismiss={() => setShowMemberDetailsModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Detalhes do Atleta</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setShowMemberDetailsModal(false)}>
              <IonIcon slot="icon-only" icon={close}></IonIcon>
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {selectedMemberDetails && (
            <>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>{selectedMemberDetails.username}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p><strong>Email:</strong> {selectedMemberDetails.email}</p>
                  {selectedMemberDetails.birthDate && <p><strong>Data de Nascimento:</strong> {new Date(selectedMemberDetails.birthDate).toLocaleDateString()}</p>}
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Informações de Desempenho</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p><strong>Faltas no Mês Atual:</strong> {performance?.absences || 0}</p>
                  {performance && (
                    <>
                      <p><strong>Avaliação:</strong> {performance.rating}/5</p>
                      <h4>Melhorias:</h4>
                      <ul>
                        {performance.feedback?.improvements?.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                      </ul>
                      <h4>Precisa Melhorar:</h4>
                      <ul>
                        {performance.feedback?.needsImprovement?.map((item: string, idx: number) => <li key={idx}>{item}</li>)}
                      </ul>
                    </>
                  )}
                </IonCardContent>
              </IonCard>

              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Adicionar Performance</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonInput placeholder="Avaliação (1-5)" type="number" min={1} max={5} value={newPerformance.rating} onIonChange={e => setNewPerformance({...newPerformance, rating: Number(e.detail.value)})}></IonInput>

                  <IonInput placeholder="Melhorias (separadas por vírgula)" value={newPerformance.improvements} onIonChange={e => setNewPerformance({...newPerformance, improvements: e.detail.value || ''})}></IonInput>

                  <IonInput placeholder="O que precisa melhorar (separadas por vírgula)" value={newPerformance.needsImprovement} onIonChange={e => setNewPerformance({...newPerformance, needsImprovement: e.detail.value || ''})}></IonInput>

                  <IonButton expand="block" color="success" onClick={() => {
                    setSelectedMember(selectedMemberDetails._id);
                    handleAddPerformanceToMember();
                  }}>
                    Adicionar Performance
                  </IonButton>
                </IonCardContent>
              </IonCard>

              <IonButton expand="block" color="danger" onClick={() => {
                handleRemoveMember(selectedMemberDetails._id);
                setShowMemberDetailsModal(false);
              }}>
                Remover Atleta
              </IonButton>

              <IonButton expand="block" onClick={() => setShowMemberDetailsModal(false)}>
                Okay
              </IonButton>
            </>
          )}
        </IonContent>
      </IonModal>

      {/* Modal Torneios */}
      <IonModal isOpen={showTournamentModal} onDidDismiss={() => setShowTournamentModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Gerir Torneios</IonTitle>
            <IonButton slot="end" fill="clear" onClick={() => setShowTournamentModal(false)}>
              <IonIcon slot="icon-only" icon={close}></IonIcon>
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Adicionar Novo Torneio</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonInput placeholder="Nome do Torneio" value={newTournamentData.name} onIonChange={e => setNewTournamentData({...newTournamentData, name: e.detail.value || ''})}></IonInput>

              <IonLabel>Data do Torneio</IonLabel>
              <IonDatetime value={newTournamentData.date} onIonChange={e => setNewTournamentData({...newTournamentData, date: e.detail.value as string})}></IonDatetime>

              <IonInput placeholder="Local" value={newTournamentData.location} onIonChange={e => setNewTournamentData({...newTournamentData, location: e.detail.value || ''})}></IonInput>

              <IonButton expand="block" onClick={handleAddTournamentInModal}>
                <IonIcon slot="start" icon={add}></IonIcon>
                Adicionar
              </IonButton>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Torneios Atuais</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {editingTournaments.map((tournament, index) => (
                  <IonItem key={index}>
                    <IonLabel>
                      <h3>{tournament.name}</h3>
                      <p>{tournament.date} - {tournament.location}</p>
                    </IonLabel>
                    <IonButton fill="clear" color="danger" onClick={() => handleRemoveTournament(index)}>
                      <IonIcon slot="icon-only" icon={trash}></IonIcon>
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>

          <IonButton expand="block" color="success" onClick={handleSaveTournamentChanges}>
            Salvar Alterações
          </IonButton>
          <IonButton expand="block" color="medium" onClick={() => setShowTournamentModal(false)}>
            Cancelar
          </IonButton>
        </IonContent>
      </IonModal>
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
    const currentChild = children.find((c: any) => c._id === athleteId);
    
    return (
      <>
        {children.length > 1 && (
          <IonButton fill="clear" onClick={() => setSelectedChild('')}>
            <IonIcon slot="start" icon={chevronBack}></IonIcon>
            Voltar
          </IonButton>
        )}
        <div>
          {currentChild && <p style={{fontSize: '0.9em', color: '#999'}}>{currentChild.username}</p>}
          {renderAthleteDashboard(athleteId)}
        </div>
      </>
    );
  };

  useEffect(() => {
    if (user.type === 'athlete') {
      fetchAthleteData(user._id);
    } else if (user.type === 'responsavel' && (selectedChild || (user.childrens && user.childrens.length === 1))) {
      const childId = selectedChild || user.childrens?.[0]?._id;
      if (childId) {
        fetchAthleteData(childId, true);
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