// Mock data for users
export interface User {
  _id: string;
  username: string;
  name: string;
  profilePic: string;
  email: string;
  type: 'atleta' | 'sensei' | 'responsavel' | 'admin';
  dojo: string;
  belt: 'Branca' | 'Amarela' | 'Laranja' | 'Verde' | 'Azul' | 'Vermelha' | 'Marrom' | 'Preta';
  points: number;
  ranking: number;
  children?: string[]; // for responsavel
}

export const mockUsers: User[] = [
  {
    _id: '1',
    username: 'joao_silva',
    name: 'João Silva',
    profilePic: 'https://ui-avatars.com/api/?name=João+Silva&background=random&size=100',
    email: 'joao@example.com',
    type: 'atleta',
    dojo: 'Dojo Central',
    belt: 'Azul',
    points: 1250,
    ranking: 1
  },
  {
    _id: '2',
    username: 'maria_santos',
    name: 'Maria Santos',
    profilePic: 'https://ui-avatars.com/api/?name=Maria+Santos&background=random&size=100',
    email: 'maria@example.com',
    type: 'sensei',
    dojo: 'Dojo Central',
    belt: 'Preta',
    points: 1100,
    ranking: 2
  },
  {
    _id: '3',
    username: 'pedro_oliveira',
    name: 'Pedro Oliveira',
    profilePic: 'https://ui-avatars.com/api/?name=Pedro+Oliveira&background=random&size=100',
    email: 'pedro@example.com',
    type: 'responsavel',
    dojo: 'Dojo Central',
    belt: 'Verde',
    points: 950,
    ranking: 3,
    children: ['1', '4']
  },
  {
    _id: '4',
    username: 'ana_costa',
    name: 'Ana Costa',
    profilePic: 'https://ui-avatars.com/api/?name=Ana+Costa&background=random&size=100',
    email: 'ana@example.com',
    type: 'atleta',
    dojo: 'Dojo Central',
    belt: 'Roxa',
    points: 800,
    ranking: 4
  },
  {
    _id: '5',
    username: 'carlos_fernandes',
    name: 'Carlos Fernandes',
    profilePic: 'https://ui-avatars.com/api/?name=Carlos+Fernandes&background=random&size=100',
    email: 'carlos@example.com',
    type: 'atleta',
    dojo: 'Dojo Central',
    belt: 'Marrom',
    points: 750,
    ranking: 5
  },
  {
    _id: '6',
    username: 'lucas_souza',
    name: 'Lucas Souza',
    profilePic: 'https://ui-avatars.com/api/?name=Lucas+Souza&background=random&size=100',
    email: 'lucas@example.com',
    type: 'atleta',
    dojo: 'Dojo Central',
    belt: 'Amarela',
    points: 600,
    ranking: 6
  },
  {
    _id: '7',
    username: 'beatriz_lima',
    name: 'Beatriz Lima',
    profilePic: 'https://ui-avatars.com/api/?name=Beatriz+Lima&background=random&size=100',
    email: 'beatriz@example.com',
    type: 'atleta',
    dojo: 'Dojo Central',
    belt: 'Laranja',
    points: 550,
    ranking: 7
  },
  {
    _id: '8',
    username: 'marcos_almeida',
    name: 'Marcos Almeida',
    profilePic: 'https://ui-avatars.com/api/?name=Marcos+Almeida&background=random&size=100',
    email: 'marcos@example.com',
    type: 'atleta',
    dojo: 'Dojo Central',
    belt: 'Branca',
    points: 400,
    ranking: 8
  }
];