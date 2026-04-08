import React, { useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonAvatar, IonCard, IonCardContent, IonInput, IonButton, IonIcon } from '@ionic/react';
import { send, arrowBackCircleOutline, key } from 'ionicons/icons';
import { useAuth } from '../../../AuthContext';
import Navbar from '../../../components/MainLayout';
import { mockConversations } from '../../../mockData/chat';
import '../../../pages/StylesPages.css';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  if (!user) return null;

  // Use type-based mock conversations for the current user
  const getConversationTitle = (conv: any) => {
    return conv.title;
  };

  const userConversations = mockConversations.filter(conv => {
    if (user.type === 'athlete' || user.type === 'atleta') return conv.type === 'atleta';
    if (user.type === 'sensei') return conv.type === 'atleta' || conv.type === 'responsavel';
    if (user.type === 'responsavel' || user.type === 'responsible') return conv.type === 'responsavel';
    return false;
  });

  const selectedConv = selectedConversation ? mockConversations.find(c => c._id === selectedConversation) : null;

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConv) return;
    // In a real app, this would send to backend
    // For now, just clear the input
    setNewMessage('');
  };

  const renderConversationList = () => (
    <div className="page chat-page background">
        <IonList className="chat-list">
            {userConversations.map(conv => (
                <IonItem
                    key={conv._id}
                    className="chat-item"
                    button
                    onClick={() => setSelectedConversation(conv._id)}
                >
                    <IonAvatar slot="start" className="chat-avatar">
                        <div className="avatar-circle">
                            {conv.title.charAt(0)}
                        </div>
                    </IonAvatar>

                    <IonLabel>
                        <h3 className="chat-name">{getConversationTitle(conv)}</h3>
                        <p className="chat-last">{conv.lastMessage}</p>
                    </IonLabel>
                </IonItem>
            ))}
        </IonList>
    </div>
  );

  const renderChatView = () => {
    if (!selectedConv) return null;

    return (
        <div className="chat-container">
      <div className="chat-messages">
        {selectedConv.messages.map(msg => {
            const isMe =
              msg.senderId === user._id || msg.senderId === '1'; // fallback mock
            return (
              <div
                key={msg._id}
                className={`message-row ${isMe ? 'me' : 'other'}`}
              >
                <div className="message-bubble">
                  <p>{msg.content}</p>
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            );
        })}
      </div>

      {/* INPUT FIXO EM BAIXO */}
      <div className="chat-input">
        <IonInput
          value={newMessage}
          placeholder="Mensagem..."
          onIonChange={(e) => setNewMessage(e.detail.value!)}
        />

        <div className="send-btn" onClick={handleSendMessage}>
          <IonIcon icon={send} />
        </div>
      </div>
    </div>
  );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
            {selectedConversation ? 
                <div className="chat-top">
                    <IonIcon
                        icon={arrowBackCircleOutline}
                        className="back-icon"
                        onClick={() => setSelectedConversation(null)}
                    />
                    <h3>{selectedConv?.title}</h3>
                </div>
            : <IonTitle className=''>Chat</IonTitle>}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {selectedConversation ? renderChatView() : renderConversationList()}
      </IonContent>
        {selectedConversation ? null : <Navbar />}
    </IonPage>
  );
};

export default Chat;