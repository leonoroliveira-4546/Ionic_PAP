import React, { useState, useEffect, useRef } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonAvatar, IonInput, IonIcon, IonButton } from '@ionic/react';
import { send, arrowBackCircleOutline } from 'ionicons/icons';
import { useAuth } from '../../../AuthContext';
import Navbar from '../../../components/MainLayout';
import api from "../../../components/AxiosInstance"
import { io, Socket } from 'socket.io-client';
import '../../../pages/StylesPages.css';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversationSearch, setConversationSearch] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const selectedConversationRef = useRef<string | null>(null);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      socketRef.current = io('http://localhost:8001', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      // Emit join event with userId
      socketRef.current.emit('join', user._id);

      // Listen for incoming messages
      socketRef.current.on('receive_message', (data: any) => {
        console.log('Received message:', data);
        const incomingMessage = data.message;

        // If message is from current conversation, add to messages
        if (data.conversationId === selectedConversationRef.current) {
          setMessages((prev) => {
            const alreadyExists = prev.some((message) => message._id === incomingMessage._id);
            return alreadyExists ? prev : [...prev, incomingMessage];
          });
        }

        // Update last message in conversations
        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === data.conversationId
              ? { ...conv, lastMessage: incomingMessage.content, timestamp: incomingMessage.timestamp }
              : conv
          )
        );
      });

      socketRef.current.on('message_sent', (data: any) => {
        console.log('Message sent confirmation:', data);
      });

      socketRef.current.on('error', (data: any) => {
        console.error('Socket error:', data);
      });

      fetchConversations();

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation && socketRef.current) {
      socketRef.current.emit('join_room', selectedConversation);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations');
      const sortedConversations = (response.data || []).slice().sort((a: any, b: any) => {
        const aTime = new Date(a.timestamp || a.lastMessage?.timestamp || 0).getTime();
        const bTime = new Date(b.timestamp || b.lastMessage?.timestamp || 0).getTime();
        return bTime - aTime;
      });
      setConversations(sortedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getSenderId = (message: any) => {
    if (!message?.senderId) return null;
    return typeof message.senderId === 'string' ? message.senderId : message.senderId._id;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    const conv = conversations.find(c => c._id === selectedConversation);
    if (!conv) return;

    const messageContent = newMessage.trim();

    if (socketRef.current) {
      // Emit message via socket
      socketRef.current.emit('send_message', {
        conversationId: selectedConversation,
        recipientId: conv.otherUser._id,
        content: messageContent
      });

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === selectedConversation
            ? { ...conversation, lastMessage: messageContent, timestamp: new Date().toISOString() }
            : conversation
        )
      );

      setNewMessage('');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const title = conv.title || '';
    const otherUsername = conv.otherUser?.username || '';
    const text = `${title} ${otherUsername}`.toLowerCase();
    return text.includes(conversationSearch.toLowerCase());
  });

  const renderConversationList = () => (
    <>
      <div style={{ padding: '0.75rem' }}>
        <IonInput
          placeholder="Pesquisar conversa"
          value={conversationSearch}
          onIonChange={e => setConversationSearch(e.detail.value || '')}
        />
      </div>
      <IonList className="chat-list">
            {filteredConversations.map(conv => (
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
    </>
  );

  const renderChatView = () => {
    if (!selectedConversation) return null;
    const conv = conversations.find(c => c._id === selectedConversation);
    if (!conv) return null;

    return (
      <div className="chat-container">
        <div className="chat-header">
          <IonButton fill="clear" onClick={() => setSelectedConversation(null)}>
            <IonIcon icon={arrowBackCircleOutline} />
          </IonButton>
          <div className="chat-header-title">
            <h3>{conv.title}</h3>
            <p>{conv.lastMessage}</p>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map(msg => {
            const isMe = getSenderId(msg) === user._id;
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
          <IonTitle className=''>Chat</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {selectedConversation ? (
          <div
            className="page background"
            style={{
              width: '100%',
              minHeight: '100%',
              margin: 0,
              padding: 0,
              border: 'none',
              boxShadow: 'none'
            }}
          >
            {renderChatView()}
          </div>
        ) : (
          <div className="page chat-page background">
            {renderConversationList()}
          </div>
        )}
      </IonContent>
      <Navbar />
    </IonPage>
  );
};

export default Chat;