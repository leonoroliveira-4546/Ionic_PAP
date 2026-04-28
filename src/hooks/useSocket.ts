import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const useSocket = (userId: string | undefined) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Create socket connection
    socketRef.current = io('http://localhost:8001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Emit join event
    socketRef.current.emit('join', userId);

    console.log('Socket connected with userId:', userId);

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  return socketRef.current;
};

export default useSocket;