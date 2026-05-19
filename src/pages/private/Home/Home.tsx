import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonList, IonItem, IonLabel, IonButton, IonSelect, IonSelectOption, IonModal, IonInput, IonDatetime, IonIcon } from '@ionic/react';
import { close, add, chevronBack, create, trash, eye } from 'ionicons/icons';
import { useAuth } from '../../../AuthContext';
import Navbar from '../../../components/MainLayout';
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
  const [athletesWithoutDojo, setAthletesWithoutDojo] = useState<any[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');
  const [athleteSearchQuery, setAthleteSearchQuery] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteTab, setInviteTab] = useState<'invite' | 'requests'>('invite');
  const [attendanceToday, setAttendanceToday] = useState<string[]>([]);
  const [absencesMarkedToday, setAbsencesMarkedToday] = useState<string[]>([]);
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
  const [attendanceStatus, setAttendanceStatus] = useState<'present' | 'absent' | null>(null);
  const [absenceReason, setAbsenceReason] = useState<'disease' | 'other' | null>(null);
  const [absenceReasons, setAbsenceReasons] = useState<Record<string, 'disease' | 'other'>>({});
  const [memberAbsences, setMemberAbsences] = useState<number>(0);
  const [performanceAction, setPerformanceAction] = useState<'add' | 'edit' | null>(null);

  // Modais
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMemberDetailsModal, setShowMemberDetailsModal] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [participantsOpenIndex, setParticipantsOpenIndex] = useState<number | null>(null);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<any>(null);
  const [editingSchedules, setEditingSchedules] = useState<any[]>([]);
  const [editingTournaments, setEditingTournaments] = useState<any[]>([]);
  const [newTournamentData, setNewTournamentData] = useState({
    name: '',
    date: '',
    location: ''
  });

  const { addPerformance, getPerformance, getAbsencesByMonth, addAbsence } = authApi(() => {});
  const { getDojoMembers, removeMember, removeChildFromResponsible, addTrainingSchedule, updateTrainingSchedules, createTournament, getDojoTournaments, updateTournament, deleteTournament, inviteMemberByEmail, submitJoinRequest, acceptJoinRequest, rejectJoinRequest, getAthletesWithoutDojo } = dojosApi();

  const isAthlete = (type: string) => type === 'athlete' || type === 'atleta';
  const isResponsavel = (type: string) => type === 'responsavel';
  const isSensei = (type: string) => type === 'sensei';
  const isUserSensei = user ? isSensei(user.type) : false;

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
        setDojoMembers(membersData.members);
        setTrainingSchedule(membersData.dojo.trainingSchedule);
        setPendingRequests(membersData.dojo.joinRequests || []);
      }

      const tournamentsData = await getDojoTournaments(user.dojoId);
      console.log('fetchDojoData - tournamentsData:', tournamentsData);
      if (!tournamentsData.success) {
        alert(tournamentsData.error);
      } else {
        setTournaments(tournamentsData.tournaments || []);
      }

      // Fetch athletes without dojo
      const athletesData = await getAthletesWithoutDojo();
      if (athletesData.success) {
        setAthletesWithoutDojo(athletesData.athletes || []);
      }
    } catch (err) {
      alert("Erro ao buscar dados do dojo: " + err);
    }
  };

  const handleRemoveMember = async (member: any) => {
    if (!user.dojoId) return;
    try {
      if (member.parentId) {
        // Se for um filho, remover da lista de filhos do responsável
        const result = await removeChildFromResponsible(member.parentId, member._id);
        if (!result.success) {
          alert(result.error);
          return;
        }
        alert('Filho removido com sucesso!');
      } else {
        // Se for um usuário direto, remover do dojo
        const data = await removeMember(user.dojoId, member._id);
        if (!data.success) {
          alert(data.error);
        } else {
          alert('Membro removido com sucesso!');
        }
      }
      fetchDojoData();
    } catch (err) {
      alert('Erro ao remover membro: ' + err);
    }
  };

  const handleMarkAttendance = (memberId: string) => {
    if (!attendanceToday.includes(memberId)) {
      setAttendanceToday([...attendanceToday, memberId]);
    }
  };

  const handleMarkAbsence = async (member: any) => {
    if (!user) return;

    try {
      const date = new Date().toISOString();
      const payload: any = { userId: user._id, date };

      if (member.parentId) {
        payload.userId = member.parentId;
        payload.childId = member._id;
      } else {
        payload.userId = member._id;
      }

      const result = await addAbsence(payload);
      if (!result.success) {
        alert(result.error);
        return;
      }

      if (!absencesMarkedToday.includes(member._id)) {
        setAbsencesMarkedToday([...absencesMarkedToday, member._id]);
      }
      alert('Falta registrada com sucesso!');
    } catch (err) {
      alert('Erro ao registrar falta: ' + err);
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
    // Reset attendance status - será definido baseado nos dados atuais
    setAttendanceStatus(null);
    setAbsenceReason(null);

    try {
      if (member.parentId) {
        // Se for um filho, buscar performance com childId
        const perfData = await getPerformance({ athleteId: member.parentId, childId: member._id });
        if (!perfData.success) {
          alert(perfData.error);
          setPerformance(null);
        } else {
          setPerformance(perfData.performance || null);
        }

        // Buscar faltas do filho
        const month = new Date().toISOString().slice(0, 7);
        const child = user.childrens?.find((c: any) => c._id === member._id);
        const abs = child?.absences?.find((a: any) => a.month === month)?.count || 0;
        setMemberAbsences(abs);
      } else {
        // Se for um usuário direto, buscar performance normal
        const perfData = await getPerformance({ athleteId: member._id });
        if (!perfData.success) {
          alert(perfData.error);
          setPerformance(null);
        } else {
          setPerformance(perfData.performance || null);
        }

        // Buscar faltas do usuário
        const month = new Date().toISOString().slice(0, 7);
        const absData = await getAbsencesByMonth(member._id, month);
        if (!absData.success) {
          alert(absData.error);
          setMemberAbsences(0);
        } else {
          setMemberAbsences(absData.count || 0);
        }
      }

      // Verificar se já houve marcação de presença hoje
      const today = new Date().toDateString();
      if (attendanceToday.includes(member._id)) {
        setAttendanceStatus('present');
      } else if (absencesMarkedToday.includes(member._id)) {
        setAttendanceStatus('absent');
        setAbsenceReason(absenceReasons[member._id] || null);
      }

    } catch (err) {
      alert('Erro ao buscar dados: ' + err);
    }
    setShowMemberDetailsModal(true);
  };

  const handleAddPerformanceToMember = async () => {
    if (!selectedMemberDetails) return;

    try {
      // Filtrar e validar os arrays de feedback
      const improvements = newPerformance.improvements
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const needsImprovement = newPerformance.needsImprovement
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);

      // Validar se pelo menos um campo de feedback foi preenchido
      if (improvements.length === 0 && needsImprovement.length === 0) {
        alert('Por favor, preencha pelo menos um campo de feedback (melhorias ou pontos a melhorar).');
        return;
      }

      // Dedupe arrays
      const uniqueImprovements = Array.from(new Set(improvements));
      const uniqueNeeds = Array.from(new Set(needsImprovement));

      let performanceData: any = {
        rating: newPerformance.rating,
        improvements: uniqueImprovements,
        needsImprovement: uniqueNeeds
      };

      console.log('Enviando performance data:', performanceData); // Debug log

      if (selectedMemberDetails.parentId) {
        // Se for um filho, adicionar performance com childId
        performanceData.athleteId = selectedMemberDetails.parentId;
        performanceData.childId = selectedMemberDetails._id;
      } else {
        // Se for um usuário direto
        performanceData.athleteId = selectedMemberDetails._id;
      }

      // Se já existe performance, o backend vai atualizar a do mês atual
      // Se não existe, vai criar uma nova
      const data = await addPerformance(performanceData);
      console.log('Resposta da API:', data); // Debug log

      if (!data.success) {
        alert(data.error);
      } else {
        alert(performance ? 'Performance atualizada com sucesso!' : 'Performance adicionada com sucesso!');
        setNewPerformance({ rating: 0, improvements: '', needsImprovement: '' });
        // Recarregar dados do membro para atualizar a performance exibida
        if (selectedMemberDetails.parentId) {
          const perfData = await getPerformance({ athleteId: selectedMemberDetails.parentId, childId: selectedMemberDetails._id });
          if (perfData.success) {
            setPerformance(perfData.performance || null);
          }
        } else {
          const perfData = await getPerformance({ athleteId: selectedMemberDetails._id });
          if (perfData.success) {
            setPerformance(perfData.performance || null);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao adicionar performance:', err); // Debug log
      alert('Erro ao adicionar/atualizar performance: ' + err);
    }
  };

  const handleMarkAttendanceInDetails = async (member: any) => {
    if (!user || !attendanceStatus) return;

    try {
      if (attendanceStatus === 'absent') {
        // Marcar como falta
        const date = new Date().toISOString();
        const payload: any = { userId: user._id, date };

        if (member.parentId) {
          payload.userId = member.parentId;
          payload.childId = member._id;
        } else {
          payload.userId = member._id;
        }

        // Incluir o motivo da falta se foi selecionado
        if (absenceReason) {
          payload.reason = absenceReason;
        }

        const result = await addAbsence(payload);
        if (!result.success) {
          alert(result.error);
          return;
        }

        // Adicionar à lista de faltas do dia
        if (!absencesMarkedToday.includes(member._id)) {
          setAbsencesMarkedToday([...absencesMarkedToday, member._id]);
        }
        // Armazenar motivo para mostrar ao reabrir
        if (absenceReason) {
          setAbsenceReasons({ ...absenceReasons, [member._id]: absenceReason });
        }
        // Remover da lista de presenças se estava lá
        if (attendanceToday.includes(member._id)) {
          setAttendanceToday(attendanceToday.filter(id => id !== member._id));
        }

      } else if (attendanceStatus === 'present') {
        // Marcar como presente
        if (!attendanceToday.includes(member._id)) {
          setAttendanceToday([...attendanceToday, member._id]);
        }
        // Remover da lista de faltas se estava lá
        if (absencesMarkedToday.includes(member._id)) {
          setAbsencesMarkedToday(absencesMarkedToday.filter(id => id !== member._id));
        }
        if (absenceReasons[member._id]) {
          const updated = { ...absenceReasons };
          delete updated[member._id];
          setAbsenceReasons(updated);
        }
      }
    } catch (err) {
      alert('Erro ao registrar presença: ' + err);
    }
  };

  const handleSaveMemberDetailsChanges = async () => {
    if (!selectedMemberDetails) return;

    try {
      // Salvar presença se foi selecionada
      if (attendanceStatus) {
        await handleMarkAttendanceInDetails(selectedMemberDetails);
      }

      alert('Alterações salvas com sucesso!');
      setShowMemberDetailsModal(false);
      setAttendanceStatus(null);
      setAbsenceReason(null);

      // Recarregar dados do dojo para atualizar faltas e presenças
      fetchDojoData();

      // Se foi marcada uma falta, recarregar também os dados de performance/absences do membro
      if (attendanceStatus === 'absent' && selectedMemberDetails) {
        const month = new Date().toISOString().slice(0, 7);
        if (selectedMemberDetails.parentId) {
          // Para filhos, buscar do parent
          const child = user.childrens?.find((c: any) => c._id === selectedMemberDetails._id);
          if (child) {
            const abs = child.absences?.find((a: any) => a.month === month)?.count || 0;
            setAbsences(abs);
          }
        } else {
          // Para usuários diretos
          const absData = await getAbsencesByMonth(selectedMemberDetails._id, month);
          if (absData.success) {
            setAbsences(absData.count || 0);
          }
        }
      }

    } catch (err) {
      alert('Erro ao salvar alterações: ' + err);
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
          await updateTournament(tournament._id, {
            name: tournament.name,
            date: tournament.date,
            location: tournament.location,
            participants: tournament.participants || []
          });
        } else {
          const newTournamentData = {
            name: tournament.name,
            date: tournament.date,
            location: tournament.location,
            userId: user._id,
            participants: tournament.participants || []
          };
          const created = await createTournament(user.dojoId, newTournamentData);
          console.log('createTournament response for', newTournamentData, created);
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
      // Validar que a data não é anterior ao dia atual
      const selectedDate = new Date(newTournamentData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      if (isNaN(selectedDate.getTime())) {
        alert('Data inválida para o torneio.');
        return;
      }
      if (selectedDate < today) {
        alert('A data do torneio não pode ser anterior à data de hoje.');
        return;
      }

      setEditingTournaments([...editingTournaments, { ...newTournamentData }]);
      setNewTournamentData({ name: '', date: '', location: '' });
    }
  };

  const handleRemoveTournament = (index: number) => {
    setEditingTournaments(editingTournaments.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (isSensei(user.type)) {
      fetchDojoData();
    }
  }, [user]);

  // Limpar estados de presença/falta quando muda de dia
  useEffect(() => {
    const today = new Date().toDateString();
    const lastCheckedDate = localStorage.getItem('lastAttendanceDate');

    if (lastCheckedDate !== today) {
      // É um novo dia, limpar os estados de presença/falta
      setAttendanceToday([]);
      setAbsencesMarkedToday([]);
      localStorage.setItem('lastAttendanceDate', today);
    }
  }, []);

  const renderAthleteDashboard = (athleteId: string) => {
    const athleteTraining = trainingSchedule.length ? trainingSchedule : [];
    const athletePerformance = performance || {
      rating: 0,
      feedback: { improvements: [], needsImprovement: [] }
    };

    return (
      <div className="dashboard-content">
        <section className="card-panel">
          <div className="section-header">
            <div>
              <p className="section-title">Dashboard do Atleta</p>
              <p className="section-subtitle">Visão moderna do seu progresso, treinos e próximos desafios.</p>
            </div>
            <span className="badge-pill badge-primary">Atleta</span>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-card__label">Treinos agendados</p>
              <p className="stat-card__value">{athleteTraining.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Última avaliação</p>
              <p className="stat-card__value">{athletePerformance.rating}/5</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Torneios</p>
              <p className="stat-card__value">{upcomingTournaments.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Faltas no mês</p>
              <p className="stat-card__value">{absences}</p>
            </div>
          </div>
        </section>

        <section className="section-panel">
          <div className="section-header">
            <div>
              <p className="section-title">Horário de Treino</p>
              <p className="section-subtitle">Organize seu calendário de treino de forma clara.</p>
            </div>
          </div>
          {athleteTraining.length > 0 ? (
            <div className="visual-list">
              {athleteTraining.map((schedule, index) => (
                <div key={index} className="visual-item">
                  <div>
                    <strong>{schedule.day}</strong>
                    <p>{schedule.location}</p>
                  </div>
                  <div className="badge-pill badge-focus">{schedule.time}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tile-card">
              <p className="tile-title">Nenhum treino agendado</p>
              <p className="tile-meta">Adicione horários de treino e mantenha seu dojo em ritmo.</p>
            </div>
          )}
        </section>

        <section className="section-panel">
          <div className="section-header">
            <div>
              <p className="section-title">Performance & Feedback</p>
              <p className="section-subtitle">Análises claras para evolução de técnica e disciplina.</p>
            </div>
          </div>

          <div className="tile-grid">
            <div className="tile-card">
              <p className="tile-title">Avaliação atual</p>
              <p className="tile-meta">{athletePerformance.rating}/5</p>
            </div>
            <div className="tile-card">
              <p className="tile-title">Melhorias</p>
              <p className="tile-meta">{athletePerformance.feedback.improvements.length || 0} itens</p>
            </div>
            <div className="tile-card">
              <p className="tile-title">Aprimorar</p>
              <p className="tile-meta">{athletePerformance.feedback.needsImprovement.length || 0} itens</p>
            </div>
          </div>

          <div className="section-actions" style={{ marginTop: 20 }}>
            <button className="button-pill primary" onClick={() => {
              if (performance) {
                setNewPerformance({
                  rating: performance.rating || 0,
                  improvements: performance.feedback?.improvements?.join(', ') || '',
                  needsImprovement: performance.feedback?.needsImprovement?.join(', ') || ''
                });
              } else {
                setNewPerformance({ rating: 0, improvements: '', needsImprovement: '' });
              }
              setShowPerformanceModal(true);
            }}>
              {performance ? 'Editar Performance' : 'Adicionar Performance'}
            </button>
          </div>
        </section>

        <section className="section-panel">
          <div className="section-header">
            <div>
              <p className="section-title">Desafios e Torneios</p>
              <p className="section-subtitle">Foque nos eventos que estão por vir.</p>
            </div>
          </div>

          {upcomingTournaments.length > 0 ? (
            <div className="visual-list">
              {upcomingTournaments.map((tournament, index) => (
                <div key={index} className="visual-item">
                  <div>
                    <strong>{tournament.name}</strong>
                    <p>{new Date(tournament.date).toLocaleDateString()} • {tournament.location}</p>
                  </div>
                  <span className="badge-pill badge-primary">Agendado</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="tile-card">
              <p className="tile-title">Sem torneios agendados</p>
              <p className="tile-meta">Acompanhe os eventos do dojo e prepare-se para o próximo desafio.</p>
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderSenseiDashboard = () => {
    // Separar torneios por data para melhor visualização
    const sortedTournaments = [...tournaments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const upcomingTournaments = sortedTournaments.filter((t: any) => {
      const tourDate = new Date(t.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      tourDate.setHours(0, 0, 0, 0);
      return tourDate >= today;
    });

    const pastTournaments = sortedTournaments.filter((t: any) => {
      const tourDate = new Date(t.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      tourDate.setHours(0, 0, 0, 0);
      return tourDate < today;
    });

    return (
      <div className="dashboard-content">
        <section className="card-panel">
          <div className="section-header">
            <div>
              <p className="section-title">Painel do Sensei</p>
              <p className="section-subtitle">Controle do dojo com clareza, ações rápidas e foco no progresso.</p>
            </div>
            <div className="section-actions">
              <button className="button-pill primary" onClick={() => { setInviteTab('invite'); setShowInviteModal(true); }}>
                Convidar / Pedidos
              </button>
              <button className="button-pill outline" onClick={() => {
                setEditingSchedules(trainingSchedule);
                setShowScheduleModal(true);
              }}>
                Editar Horários
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-card__label">Membros</p>
              <p className="stat-card__value">{dojoMembers.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Horários</p>
              <p className="stat-card__value">{trainingSchedule.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Torneios</p>
              <p className="stat-card__value">{upcomingTournaments.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-card__label">Pedidos</p>
              <p className="stat-card__value">{pendingRequests.length}</p>
            </div>
          </div>
        </section>

        <section className="section-panel">
          <div className="section-header">
            <div>
              <p className="section-title">Horários de Treino</p>
              <p className="section-subtitle">Rotina semanal pronta para o dojo.</p>
            </div>
          </div>

          {trainingSchedule.length > 0 ? (
            <div className="visual-list">
              {trainingSchedule.map((schedule, index) => (
                <div key={index} className="visual-item">
                  <div>
                    <strong>{schedule.day}</strong>
                    <p>{schedule.location}</p>
                  </div>
                  <span className="badge-pill badge-focus">{schedule.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="tile-card">
              <p className="tile-title">Nenhum horário configurado</p>
              <p className="tile-meta">Defina um plano semanal para manter seu dojo alinhado.</p>
            </div>
          )}
        </section>

        <section className="section-panel">
          <div className="section-header">
            <div>
              <p className="section-title">Membros do Dojo</p>
              <p className="section-subtitle">Resumo rápido dos atletas e ações de gestão.</p>
            </div>
            <button className="button-pill secondary" onClick={() => { setInviteTab('invite'); setShowInviteModal(true); }}>
              Abrir convites
            </button>
          </div>

          <IonInput
            placeholder="Pesquisar atleta"
            value={memberSearchQuery}
            onIonChange={e => setMemberSearchQuery(e.detail.value || '')}
            style={{ marginBottom: 16 }}
          />

          {dojoMembers.filter(m => m.username.toLowerCase().includes(memberSearchQuery.toLowerCase() || '')).length > 0 ? (
            <div className="visual-list">
              {dojoMembers.filter(m => m.username.toLowerCase().includes(memberSearchQuery.toLowerCase() || '')).map(member => (
                <div key={member._id} className="visual-item">
                  <div>
                    <strong>{member.username}</strong>
                    <p>{member.email || 'Email não informado'}</p>
                  </div>
                  <div className="section-actions">
                    <button className="button-pill outline" onClick={() => handleViewMemberDetails(member)}>
                      Detalhes
                    </button>
                    <button className="button-pill danger" onClick={() => handleRemoveMember(member)}>
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tile-card">
              <p className="tile-title">Nenhum membro encontrado</p>
            </div>
          )}
        </section>

        <section className="section-panel">
          <div className="section-header">
            <div>
              <p className="section-title">Torneios</p>
              <p className="section-subtitle">Eventos programados e próximos passos.</p>
            </div>
          </div>

          {upcomingTournaments.length > 0 ? (
            <div className="visual-list">
              {upcomingTournaments.map((tournament, index) => (
                <div key={index} className="visual-item">
                  <div>
                    <strong>{tournament.name}</strong>
                    <p>{new Date(tournament.date).toLocaleDateString()} • {tournament.location}</p>
                  </div>
                  <span className="badge-pill badge-primary">Próximo</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="tile-card">
              <p className="tile-title">Nenhum torneio agendado</p>
              <p className="tile-meta">Planeje o próximo evento e envolva seus atletas.</p>
            </div>
          )}

          <div className="section-actions" style={{ marginTop: 20 }}>
            <button className="button-pill primary" onClick={() => {
              setEditingTournaments(tournaments.map((t: any) => ({ ...t, participants: (t.participants || []).map((p: any) => p._id?.toString() || p.userId?.toString() || p) })));
              setShowTournamentModal(true);
            }}>
              Gerir Torneios
            </button>
          </div>
        </section>

        {/* Modal Convidar/Pedidos */}
        <IonModal isOpen={showInviteModal} onDidDismiss={() => setShowInviteModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Gerir Convites e Pedidos</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowInviteModal(false)}>
                <IonIcon slot="icon-only" icon={close}></IonIcon>
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {/* Abas */}
            <div style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
              <IonButton 
                color={inviteTab === 'invite' ? 'primary' : 'medium'} 
                onClick={() => setInviteTab('invite')}
              >
                Convidar Atleta
              </IonButton>
              <IonButton 
                color={inviteTab === 'requests' ? 'primary' : 'medium'} 
                onClick={() => setInviteTab('requests')}
              >
                Pedidos ({pendingRequests.length})
              </IonButton>
            </div>

            {/* Aba Convidar */}
            {inviteTab === 'invite' && (
              <div style={{ padding: '1rem' }}>
                <h3>Atletas Disponíveis</h3>
                <IonInput 
                  placeholder="Pesquisar por username" 
                  value={athleteSearchQuery} 
                  onIonChange={e => setAthleteSearchQuery(e.detail.value || '')}
                  style={{ marginBottom: '1rem' }}
                ></IonInput>

                <IonList>
                  {athletesWithoutDojo.filter(a => a.username.toLowerCase().includes(athleteSearchQuery.toLowerCase()))
                    .map(athlete => (
                    <IonItem key={athlete._id}>
                      <IonLabel>{athlete.username} ({athlete.email})</IonLabel>
                      <IonButton onClick={async () => {
                        if (!user.dojoId) { alert('Dojo ID não encontrado'); return; }
                        const res = await inviteMemberByEmail(user.dojoId, athlete.email);
                        if (!res.success) alert(res.error || 'Erro ao enviar convite');
                        else { 
                          alert('Convite enviado com sucesso!'); 
                          fetchDojoData(); 
                        }
                      }}>
                        Convidar
                      </IonButton>
                    </IonItem>
                  ))}
                </IonList>

                {athletesWithoutDojo.filter(a => a.username.toLowerCase().includes(athleteSearchQuery.toLowerCase())).length === 0 && (
                  <p>Nenhum atleta disponível.</p>
                )}
              </div>
            )}

            {/* Aba Pedidos */}
            {inviteTab === 'requests' && (
              <div style={{ padding: '1rem' }}>
                <h3>Pedidos Pendentes</h3>
                {pendingRequests.length > 0 ? (
                  <IonList>
                    {pendingRequests.map((r: any) => (
                      <IonItem key={r.user._id}>
                        <IonLabel>
                          <h4>{r.user.username}</h4>
                          <p>{r.user.email}</p>
                        </IonLabel>
                        <IonButton onClick={async () => {
                          if (!user.dojoId) { alert('Dojo ID não encontrado'); return; }
                          const res = await acceptJoinRequest(user.dojoId, r.user._id);
                          if (!res.success) alert(res.error || 'Erro');
                          else { 
                            alert('Pedido aceite!'); 
                            fetchDojoData(); 
                          }
                        }}>
                          Aceitar
                        </IonButton>
                        <IonButton color="danger" onClick={async () => {
                          if (!user.dojoId) { alert('Dojo ID não encontrado'); return; }
                          const res = await rejectJoinRequest(user.dojoId, r.user._id);
                          if (!res.success) alert(res.error || 'Erro');
                          else { 
                            alert('Pedido rejeitado'); 
                            fetchDojoData(); 
                          }
                        }}>
                          Rejeitar
                        </IonButton>
                      </IonItem>
                    ))}
                  </IonList>
                ) : (
                  <p>Nenhum pedido pendente.</p>
                )}
              </div>
            )}
          </IonContent>
        </IonModal>

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
                    <IonCardTitle>Marcação de Presença Hoje</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonSelect placeholder="Selecione o status" value={attendanceStatus} onIonChange={e => {
                      setAttendanceStatus(e.detail.value);
                      if (e.detail.value === 'present') {
                        setAbsenceReason(null);
                      }
                    }}>
                      <IonSelectOption value="present">Presente</IonSelectOption>
                      <IonSelectOption value="absent">Faltou</IonSelectOption>
                    </IonSelect>

                    {attendanceStatus === 'absent' && (
                      <div style={{ marginTop: '1rem' }}>
                        <IonSelect placeholder="Selecione o motivo" value={absenceReason} onIonChange={e => setAbsenceReason(e.detail.value)}>
                          <IonSelectOption value="disease">Doença</IonSelectOption>
                          <IonSelectOption value="other">Sem Motivo</IonSelectOption>
                        </IonSelect>
                      </div>
                    )}

                    {attendanceStatus && (
                      <div style={{ marginTop: '1rem' }}>
                        <p><strong>Status atual:</strong> {attendanceStatus === 'present' ? 'Presente' : 'Faltou'}</p>
                        {attendanceStatus === 'absent' && absenceReason && (
                          <p><strong>Motivo:</strong> {absenceReason === 'disease' ? 'Doença' : 'Sem Motivo'}</p>
                        )}
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Informações de Desempenho</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p><strong>Faltas no Mês Atual:</strong> {memberAbsences}</p>
                    {performance && (
                      <>
                        <p><strong>Avaliação:</strong> {performance.rating}/5</p>
                        <h4>Melhorias:</h4>
                        <ul>
                          {(performance.feedback?.improvements || []).length > 0 ? (
                            performance.feedback.improvements.map((item: string, idx: number) => <li key={idx}>{item}</li>)
                          ) : (
                            <li>Nenhuma melhoria cadastrada</li>
                          )}
                        </ul>
                        <h4>Precisa Melhorar:</h4>
                        <ul>
                          {(performance.feedback?.needsImprovement || []).length > 0 ? (
                            performance.feedback.needsImprovement.map((item: string, idx: number) => <li key={idx}>{item}</li>)
                          ) : (
                            <li>Nenhum ponto a melhorar cadastrado</li>
                          )}
                        </ul>
                      </>
                    )}
                    <IonButton expand="block" color="primary" onClick={() => {
                      // Preencher o formulário com dados existentes se houver
                      if (performance) {
                        setNewPerformance({
                          rating: performance.rating || 0,
                          improvements: performance.feedback?.improvements?.join(', ') || '',
                          needsImprovement: performance.feedback?.needsImprovement?.join(', ') || ''
                        });
                      } else {
                        setNewPerformance({ rating: 0, improvements: '', needsImprovement: '' });
                      }
                      setShowPerformanceModal(true);
                    }}>
                      {performance ? 'Editar Performance' : 'Adicionar Performance'}
                    </IonButton>
                  </IonCardContent>
                </IonCard>

                <IonButton expand="block" color="danger" onClick={() => {
                  handleRemoveMember(selectedMemberDetails);
                  setShowMemberDetailsModal(false);
                }}>
                  Remover Atleta
                </IonButton>

                <IonButton expand="block" color="success" onClick={() => {
                  // Guardar presença e performance
                  handleSaveMemberDetailsChanges();
                }}>
                  Guardar Alterações
                </IonButton>

                <IonButton expand="block" onClick={() => setShowMemberDetailsModal(false)}>
                  Cancelar
                </IonButton>
              </>
            )}
          </IonContent>
        </IonModal>

        {/* Modal Performance */}
        <IonModal isOpen={showPerformanceModal} onDidDismiss={() => setShowPerformanceModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{performance ? 'Editar Performance' : 'Adicionar Performance'}</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowPerformanceModal(false)}>
                <IonIcon slot="icon-only" icon={close}></IonIcon>
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonCard>
              <IonCardContent>
                <IonInput placeholder="Avaliação (1-5)" type="number" min={1} max={5} value={newPerformance.rating} onIonChange={e => setNewPerformance({...newPerformance, rating: Number(e.detail.value)})}></IonInput>

                <IonInput placeholder="Melhorias (separadas por vírgula)" value={newPerformance.improvements} onIonChange={e => setNewPerformance({...newPerformance, improvements: e.detail.value || ''})}></IonInput>

                <IonInput placeholder="O que precisa melhorar (separadas por vírgula)" value={newPerformance.needsImprovement} onIonChange={e => setNewPerformance({...newPerformance, needsImprovement: e.detail.value || ''})}></IonInput>

                <IonButton expand="block" color="success" onClick={() => {
                  handleAddPerformanceToMember();
                  setShowPerformanceModal(false);
                }}>
                  Guardar Alterações
                </IonButton>

                <IonButton expand="block" color="medium" onClick={() => setShowPerformanceModal(false)}>
                  Cancelar
                </IonButton>
              </IonCardContent>
            </IonCard>
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

            {/* Próximos Torneios */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Próximos Torneios</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {editingTournaments.filter(t => {
                  const tourDate = new Date(t.date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  tourDate.setHours(0, 0, 0, 0);
                  return tourDate >= today;
                }).length > 0 ? (
                  <IonList>
                    {editingTournaments.map((tournament, index) => {
                      const tourDate = new Date(tournament.date);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      tourDate.setHours(0, 0, 0, 0);
                      if (tourDate < today) return null;
                      
                      return (
                        <IonItem key={index}>
                          <IonLabel>
                            <h3>{tournament.name}</h3>
                            <p>{tournament.date} - {tournament.location}</p>
                          </IonLabel>
                          <IonButton fill="clear" color="danger" onClick={() => handleRemoveTournament(index)}>
                            <IonIcon slot="icon-only" icon={trash}></IonIcon>
                          </IonButton>
                        </IonItem>
                      );
                    })}
                  </IonList>
                ) : (
                  <p>Nenhum torneio próximo.</p>
                )}
              </IonCardContent>
            </IonCard>

            {/* Torneios Antigos (para editar) */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Torneios Antigos (para editar)</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {editingTournaments.filter(t => {
                  const tourDate = new Date(t.date);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  tourDate.setHours(0, 0, 0, 0);
                  return tourDate < today;
                }).length > 0 ? (
                  <IonList>
                    {editingTournaments.map((tournament, index) => {
                      const tourDate = new Date(tournament.date);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      tourDate.setHours(0, 0, 0, 0);
                      if (tourDate >= today) return null;
                      
                      return (
                        <div key={index} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #ddd' }}>
                          <IonItem>
                            <IonLabel>
                              <h3>{tournament.name}</h3>
                              <p>{tournament.date} - {tournament.location}</p>
                            </IonLabel>
                            <IonButton fill="clear" color="danger" onClick={() => handleRemoveTournament(index)}>
                              <IonIcon slot="icon-only" icon={trash}></IonIcon>
                            </IonButton>
                          </IonItem>
                          <IonButton expand="block" size="small" onClick={() => setParticipantsOpenIndex(participantsOpenIndex === index ? null : index)}>
                            {participantsOpenIndex === index ? 'Fechar Participantes' : 'Gerir Participantes'}
                          </IonButton>
                          {participantsOpenIndex === index && (
                            <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', marginTop: '0.5rem', borderRadius: '4px' }}>
                              <h4>Escolher participantes</h4>
                              <IonList>
                                {dojoMembers.map(m => (
                                  <IonItem key={m._id}>
                                    <IonLabel>{m.username}</IonLabel>
                                    <input type="checkbox" checked={(editingTournaments[index].participants || []).includes(m._id)} onChange={(e) => {
                                      const updated = [...(editingTournaments[index].participants || [])];
                                      if (e.target.checked) {
                                        if (!updated.includes(m._id)) updated.push(m._id);
                                      } else {
                                        const i = updated.indexOf(m._id);
                                        if (i > -1) updated.splice(i, 1);
                                      }
                                      const copy = [...editingTournaments];
                                      copy[index].participants = updated;
                                      setEditingTournaments(copy);
                                    }} />
                                  </IonItem>
                                ))}
                              </IonList>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </IonList>
                ) : (
                  <p>Nenhum torneio antigo.</p>
                )}
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
  };

  const renderResponsavelDashboard = () => {
    const children = user.childrens || [];
    if (children.length > 1 && !selectedChild) {
      return (
        <div className="page background">
          <h2>Selecionar Atleta</h2>
          <IonCard>
            <IonCardContent>
              <IonSelect
                placeholder="Escolha seu filho"
                value={selectedChild}
                onIonChange={(e) => setSelectedChild(String(e.detail.value || ''))}
              >
                {children.map((child, idx) => {
                  const childId = typeof child === 'string' ? child : String(child._id);
                  const childName = typeof child === 'string' ? child : child.username;

                  return (
                    <IonSelectOption key={childId} value={childId}>
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

    const athleteId = selectedChild || String(children[0]._id || children[0].username);
    const currentChild = children.find((c: any) => String(c._id) === athleteId);
    
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
    if (isAthlete(user.type)) {
      fetchAthleteData(user._id);
    } else if (isResponsavel(user.type) && (selectedChild || (user.childrens && user.childrens.length === 1))) {
      const childId = selectedChild || user.childrens?.[0]?._id;
      if (childId) {
        fetchAthleteData(childId, true);
      }
    }
  }, [user, selectedChild]);

  let dashboard;
  if (isAthlete(user.type)) {
    dashboard = renderAthleteDashboard(user._id);
  } else if (isSensei(user.type)) {
    dashboard = renderSenseiDashboard();
  } else if (isResponsavel(user.type)) {
    dashboard = renderResponsavelDashboard();
  } else {
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