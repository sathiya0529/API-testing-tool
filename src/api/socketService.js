import { io } from 'socket.io-client';
import { env } from '../config/env';
import { tokenStorage } from './tokenStorage';

// Events the backend Socket.IO server is expected to emit. Payload: { id?, message, createdAt?, ...data }
export const SOCKET_EVENTS = ['requestCompleted', 'testPassed', 'testFailed', 'collectionImported', 'environmentChanged', 'systemNotification'];

export async function createSocket() {
  if (env.useMockSocket) {
    const { createMockSocket } = await import('./mock/mockSocket');
    return createMockSocket();
  }
  const token = tokenStorage.get();
  return io(env.socketUrl, {
    auth: token ? { token } : undefined, // token mode: send JWT in the handshake
    withCredentials: env.authMode === 'cookie', // cookie mode: browser sends the session cookie
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });
}
