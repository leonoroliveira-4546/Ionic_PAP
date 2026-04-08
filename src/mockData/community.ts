// Mock data for community
export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  date: string;
  type: 'news' | 'tournament';
}

export interface DojoPost {
  _id: string;
  author: string;
  content: string;
  date: string;
  type: 'internal' | 'athletes' | 'responsibles' | 'sensei';
}

export const mockNews: NewsItem[] = [
  {
    _id: '1',
    title: 'Novo Torneio Regional Anunciado',
    content: 'O torneio regional de karatê será realizado no próximo mês. Inscrições abertas!',
    date: '2024-04-01',
    type: 'tournament'
  },
  {
    _id: '2',
    title: 'Técnicas Avançadas de Kata',
    content: 'Workshop sobre técnicas avançadas de kata será ministrado pelo sensei principal.',
    date: '2024-04-05',
    type: 'news'
  }
];

export const mockDojoPosts: DojoPost[] = [
  {
    _id: '1',
    author: 'Sensei Maria',
    content: 'Lembrem-se da reunião de pais amanhã às 20h.',
    date: '2024-04-03',
    type: 'sensei'
  },
  {
    _id: '2',
    author: 'Admin Dojo',
    content: 'Lista atualizada de atletas: João, Ana, Pedro.',
    date: '2024-04-02',
    type: 'athletes'
  }
];