// Mock data for athletes
export interface Athlete {
  _id: string;
  userId: string;
  absences: { month: string; count: number }[];
  trainingSchedule: { day: string; time: string; location: string }[];
  upcomingTournaments: { name: string; date: string; location: string }[];
  performance: {
    rating: number; // 0-5
    feedback: {
      improvements: string[];
      needsImprovement: string[];
    };
  };
}

export const mockAthletes: Athlete[] = [
  {
    _id: '1',
    userId: '1', // João
    absences: [
      { month: '2024-03', count: 2 },
      { month: '2024-04', count: 1 }
    ],
    trainingSchedule: [
      { day: 'Segunda', time: '19:00', location: 'Dojo Central' },
      { day: 'Quarta', time: '19:00', location: 'Dojo Central' },
      { day: 'Sexta', time: '19:00', location: 'Dojo Central' }
    ],
    upcomingTournaments: [
      { name: 'Torneio Regional', date: '2024-05-15', location: 'Ginásio Municipal' },
      { name: 'Campeonato Nacional', date: '2024-06-20', location: 'Centro de Convenções' }
    ],
    performance: {
      rating: 4,
      feedback: {
        improvements: ['Técnica de chute melhorou', 'Concentração aumentou'],
        needsImprovement: ['Defesa precisa trabalho', 'Velocidade em kata']
      }
    }
  },
  {
    _id: '2',
    userId: '4', // Ana
    absences: [
      { month: '2024-03', count: 0 },
      { month: '2024-04', count: 1 }
    ],
    trainingSchedule: [
      { day: 'Terça', time: '18:00', location: 'Dojo Central' },
      { day: 'Quinta', time: '18:00', location: 'Dojo Central' },
      { day: 'Sábado', time: '10:00', location: 'Dojo Central' }
    ],
    upcomingTournaments: [
      { name: 'Torneio Local', date: '2024-05-10', location: 'Escola Municipal' }
    ],
    performance: {
      rating: 5,
      feedback: {
        improvements: ['Excelente progresso', 'Disciplina exemplar'],
        needsImprovement: ['Pode trabalhar mais força']
      }
    }
  }
];