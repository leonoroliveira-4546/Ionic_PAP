export interface Tournament {
  id: string;
  name: string;
  date: string;
  location: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
    belt: string;
  }[];
  status: 'open' | 'closed' | 'finished';
  winner?: string; // participant id
}

export interface Prediction {
  id: string;
  userId: string;
  tournamentId: string;
  predictedWinner: string; // participant id
  pointsEarned?: number;
  timestamp: string;
}

export const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Torneio Regional Norte 2024',
    date: '2024-05-15T10:00:00Z',
    location: 'Ginásio Municipal Norte',
    participants: [
      {
        id: 'p1',
        name: 'João Silva',
        avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=random&size=100',
        belt: 'Azul'
      },
      {
        id: 'p2',
        name: 'Carlos Fernandes',
        avatar: 'https://ui-avatars.com/api/?name=Carlos+Fernandes&background=random&size=100',
        belt: 'Marrom'
      },
      {
        id: 'p3',
        name: 'Ana Costa',
        avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=random&size=100',
        belt: 'Vermelha'
      },
      {
        id: 'p4',
        name: 'Lucas Souza',
        avatar: 'https://ui-avatars.com/api/?name=Lucas+Souza&background=random&size=100',
        belt: 'Amarela'
      }
    ],
    status: 'open'
  },
  {
    id: '2',
    name: 'Campeonato Estadual 2024',
    date: '2024-06-20T14:00:00Z',
    location: 'Centro de Convenções',
    participants: [
      {
        id: 'p5',
        name: 'Maria Santos',
        avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=random&size=100',
        belt: 'Preta'
      },
      {
        id: 'p6',
        name: 'Pedro Oliveira',
        avatar: 'https://ui-avatars.com/api/?name=Pedro+Oliveira&background=random&size=100',
        belt: 'Verde'
      },
      {
        id: 'p7',
        name: 'Beatriz Lima',
        avatar: 'https://ui-avatars.com/api/?name=Beatriz+Lima&background=random&size=100',
        belt: 'Laranja'
      }
    ],
    status: 'closed',
    winner: 'p5'
  },
  {
    id: '3',
    name: 'Torneio Iniciante Primavera',
    date: '2024-04-25T09:00:00Z',
    location: 'Dojo Central',
    participants: [
      {
        id: 'p8',
        name: 'Marcos Almeida',
        avatar: 'https://ui-avatars.com/api/?name=Marcos+Almeida&background=random&size=100',
        belt: 'Branca'
      },
      {
        id: 'p9',
        name: 'Sofia Pereira',
        avatar: 'https://ui-avatars.com/api/?name=Sofia+Pereira&background=random&size=100',
        belt: 'Amarela'
      }
    ],
    status: 'finished',
    winner: 'p9'
  }
];

export const mockPredictions: Prediction[] = [
  {
    id: 'pred1',
    userId: '1', // João Silva
    tournamentId: '1',
    predictedWinner: 'p1',
    timestamp: '2024-04-10T12:00:00Z'
  },
  {
    id: 'pred2',
    userId: '1',
    tournamentId: '2',
    predictedWinner: 'p5',
    pointsEarned: 50,
    timestamp: '2024-04-05T15:30:00Z'
  },
  {
    id: 'pred3',
    userId: '4', // Ana Costa
    tournamentId: '1',
    predictedWinner: 'p3',
    timestamp: '2024-04-11T10:15:00Z'
  }
];