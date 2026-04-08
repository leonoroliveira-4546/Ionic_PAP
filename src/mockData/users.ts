// Mock data for users
export interface User {
  _id: string;
  username: string;
  profilePic: string;
  email: string;
  type: 'atleta' | 'sensei' | 'responsavel';
  dojo: string;
  children?: string[]; // for responsavel
}

export const mockUsers: User[] = [
  {
    _id: '1',
    username: 'Joel Coelho',
    profilePic: 'https://via.placeholder.com/100',
    email: 'joel@example.com',
    type: 'atleta',
    dojo: 'Dojo Central'
  },
  {
    _id: '2',
    username: 'Maria Santos',
    profilePic: 'https://via.placeholder.com/100',
    email: 'maria@example.com',
    type: 'sensei',
    dojo: 'Dojo Central'
  },
  {
    _id: '3',
    username: 'Pedro Oliveira',
    profilePic: 'https://via.placeholder.com/100',
    email: 'pedro@example.com',
    type: 'responsavel',
    dojo: 'Dojo Central',
    children: ['1', '4'] // IDs dos filhos
  },
  {
    _id: '4',
    username: 'Ana Costa',
    profilePic: 'https://via.placeholder.com/100',
    email: 'ana@example.com',
    type: 'atleta',
    dojo: 'Dojo Central'
  }
];