export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelName: string;
  channelAvatar: string;
  duration: string;
  views: number;
  publishedAt: string;
  category: 'historia' | 'filosofia' | 'tecnicas' | 'noticias' | 'lives';
  isLive?: boolean;
  url: string;
}

export const mockVideos: Video[] = [
  // Educational Videos
  {
    id: '1',
    title: 'A História do Karatê - Das Origens à Modernidade',
    description: 'Uma jornada completa pelas raízes do karatê, desde Okinawa até os dias atuais.',
    thumbnail: 'https://loremflickr.com/320/180/karate,history?lock=1',
    channelName: 'Karate Academy',
    channelAvatar: 'https://ui-avatars.com/api/?name=Karate+Academy&background=random&size=40',
    duration: '15:30',
    views: 12500,
    publishedAt: '2024-03-15T10:00:00Z',
    category: 'historia',
    url: 'https://youtube.com/watch?v=example1'
  },
  {
    id: '2',
    title: 'Filosofia do Karatê-Dô - O Caminho do Karateca',
    description: 'Explorando os princípios filosóficos que guiam a prática do karatê.',
    thumbnail: 'https://loremflickr.com/320/180/karate,philosophy?lock=2',
    channelName: 'Sensei Talks',
    channelAvatar: 'https://ui-avatars.com/api/?name=Sensei+Talks&background=random&size=40',
    duration: '22:45',
    views: 8900,
    publishedAt: '2024-03-20T14:30:00Z',
    category: 'filosofia',
    url: 'https://youtube.com/watch?v=example2'
  },
  {
    id: '3',
    title: 'Técnicas Fundamentais - Kihon no Kata',
    description: 'Aprenda os movimentos básicos do karatê com demonstrações passo a passo.',
    thumbnail: 'https://loremflickr.com/320/180/karate,techniques?lock=3',
    channelName: 'Karate Techniques',
    channelAvatar: 'https://ui-avatars.com/api/?name=Karate+Techniques&background=random&size=40',
    duration: '18:20',
    views: 15600,
    publishedAt: '2024-03-25T09:15:00Z',
    category: 'tecnicas',
    url: 'https://youtube.com/watch?v=example3'
  },
  // News Videos
  {
    id: '4',
    title: 'Torneio Nacional de Karatê 2024 - Destaques',
    description: 'Os melhores momentos do torneio nacional realizado este fim de semana.',
    thumbnail: 'https://loremflickr.com/320/180/karate,tournament?lock=4',
    channelName: 'Karate News',
    channelAvatar: 'https://ui-avatars.com/api/?name=Karate+News&background=random&size=40',
    duration: '12:15',
    views: 23400,
    publishedAt: '2024-04-01T16:00:00Z',
    category: 'noticias',
    url: 'https://youtube.com/watch?v=example4'
  },
  // Live Videos
  {
    id: '5',
    title: 'Aula ao Vivo - Kata Avançado com Sensei João',
    description: 'Junte-se a nós para uma aula especial de kata avançado.',
    thumbnail: 'https://loremflickr.com/320/180/karate,live?lock=5',
    channelName: 'Dojo Online',
    channelAvatar: 'https://ui-avatars.com/api/?name=Dojo+Online&background=random&size=40',
    duration: 'LIVE',
    views: 450,
    publishedAt: '2024-04-12T19:00:00Z',
    category: 'lives',
    isLive: true,
    url: 'https://youtube.com/watch?v=example5'
  },
  {
    id: '6',
    title: 'Técnicas de Defesa Pessoal - Workshop',
    description: 'Workshop prático sobre técnicas de defesa pessoal no karatê.',
    thumbnail: 'https://loremflickr.com/320/180/karate,selfdefense?lock=6',
    channelName: 'Karate Academy',
    channelAvatar: 'https://ui-avatars.com/api/?name=Karate+Academy&background=random&size=40',
    duration: '25:10',
    views: 18700,
    publishedAt: '2024-03-30T11:45:00Z',
    category: 'tecnicas',
    url: 'https://youtube.com/watch?v=example6'
  }
];