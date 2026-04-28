import React, { useState, useEffect, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonAvatar, IonInput, IonIcon } from '@ionic/react';
import { send, arrowBackCircleOutline } from 'ionicons/icons';
import { useAuth } from '../../../AuthContext';
import Navbar from '../../../components/MainLayout';
import chatApi from '../../../hooks/chatApi';
import { io, Socket } from 'socket.io-client';
import '../../../pages/StylesPages.css';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { fetchConversations, fetchMessages: getMessages } = chatApi();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user) {
      socketRef.current = io('http://localhost:8001', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      socketRef.current.emit('join', user._id);

      socketRef.current.on('receive_message', (data: any) => {
        if (data.conversationId === selectedConversation) {
          setMessages((prev) => [...prev, data.message]);
        }
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === data.conversationId
              ? { ...conv, lastMessage: data.message.content, timestamp: data.message.timestamp }
              : conv
          )
        );
      });

      socketRef.current.on('error', (data: any) => {
        console.error('Socket error:', data);
      });

      loadConversations();

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const data = await getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    const conv = conversations.find(c => c._id === selectedConversation);
    if (!conv) return;

    if (socketRef.current) {
      socketRef.current.emit('send_message', {
        conversationId: selectedConversation,
        recipientId: conv.otherUser._id,
        content: newMessage
      });
      setNewMessage('');
    }
  };

  const renderConversationList = () => (
    <div className="page chat-page background">
        <IonList className="chat-list">
            {conversations.map(conv => (
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
                        <h3 className="chat-name">{conv.title}</h3>
                        <p className="chat-last">{conv.lastMessage}</p>
                    </IonLabel>
                </IonItem>
            ))}
        </IonList>
    </div>
  );

  const renderChatView = () => {
    if (!selectedConversation) return null;
    const conv = conversations.find(c => c._id === selectedConversation);
    if (!conv) return null;

    return (
        <div className="chat-container">
      <div className="chat-messages">
        {messages.map(msg => {
            const isMe = msg.senderId._id === user._id;
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

        <div className="send-btn" onClick={() => handleSendMessage()}>
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
                    <h3>{conversations.find(c => c._id === selectedConversation)?.title}</h3>
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