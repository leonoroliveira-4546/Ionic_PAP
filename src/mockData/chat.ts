// Mock data for chat
export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  _id: string;
  participants: string[]; // user IDs or types
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  type: 'atleta' | 'athlete' | 'sensei' | 'responsavel' | 'responsible';
  title: string;
}

export const mockConversations: Conversation[] = [
  {
    _id: '1',
    participants: ['1', '2'], // João (atleta) e Maria (sensei)
    type: 'atleta',
    title: 'Sensei Maria',
    messages: [
      {
        _id: '1',
        senderId: '2',
        receiverId: '1',
        content: 'Olá João, como está o treino indo?',
        timestamp: '2024-04-01T10:00:00Z',
        read: true
      },
      {
        _id: '2',
        senderId: '1',
        receiverId: '2',
        content: 'Oi sensei, está indo bem. Tenho dúvidas sobre o kata.',
        timestamp: '2024-04-01T10:05:00Z',
        read: true
      }
    ],
    lastMessage: 'Oi sensei, tenho dúvidas sobre o kata.',
    lastMessageTime: '2024-04-01T10:05:00Z'
  },
  {
    _id: '2',
    participants: ['3', '2'], // Pedro (responsavel) e Maria (sensei)
    type: 'responsavel',
    title: 'Sensei Maria',
    messages: [
      {
        _id: '3',
        senderId: '3',
        receiverId: '2',
        content: 'Sensei, meu filho João faltou ontem. Está tudo bem?',
        timestamp: '2024-04-02T14:00:00Z',
        read: false
      }
    ],
    lastMessage: 'Sensei, meu filho João faltou ontem. Está tudo bem?',
    lastMessageTime: '2024-04-02T14:00:00Z'
  }
];