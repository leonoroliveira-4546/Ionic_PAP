export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    belt: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  type: 'aviso' | 'treino' | 'educativo' | 'geral';
}

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
}

export const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      id: '2',
      name: 'Maria Santos',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=random&size=100',
      belt: 'Preta'
    },
    content: 'Lembrem-se da reunião de pais amanhã às 20h no dojo. Vamos discutir o próximo torneio regional.',
    timestamp: '2024-04-10T14:30:00Z',
    likes: 12,
    comments: [
      {
        id: '1',
        author: {
          id: '3',
          name: 'Pedro Oliveira',
          avatar: 'https://ui-avatars.com/api/?name=Pedro+Oliveira&background=random&size=100'
        },
        content: 'Estaremos lá!',
        timestamp: '2024-04-10T15:00:00Z'
      }
    ],
    type: 'aviso'
  },
  {
    id: '2',
    author: {
      id: '1',
      name: 'João Silva',
      avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=random&size=100',
      belt: 'Azul'
    },
    content: 'Treino de kata hoje foi intenso! Aprendi muito sobre o Bassai Dai. Quem mais participou?',
    image: 'https://loremflickr.com/400/300/karate,training?lock=1',
    timestamp: '2024-04-09T18:45:00Z',
    likes: 8,
    comments: [
      {
        id: '2',
        author: {
          id: '4',
          name: 'Ana Costa',
          avatar: 'https://ui-avatars.com/api/?name=Ana+Costa&background=random&size=100'
        },
        content: 'Foi ótimo! Também gostei muito.',
        timestamp: '2024-04-09T19:15:00Z'
      }
    ],
    type: 'treino'
  },
  {
    id: '3',
    author: {
      id: '2',
      name: 'Maria Santos',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=random&size=100',
      belt: 'Preta'
    },
    content: 'Vídeo educativo sobre a história do karatê. Importante conhecer nossas raízes!',
    image: 'https://loremflickr.com/400/300/karate,history?lock=2',
    timestamp: '2024-04-08T10:00:00Z',
    likes: 15,
    comments: [],
    type: 'educativo'
  }
];