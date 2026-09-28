import { mockBus } from './mockBus';
import { getDb, saveDb } from './mockDb';
import { uid } from '../../utils/uid';

export const EVENTS = ['requestCompleted', 'testPassed', 'testFailed', 'collectionImported', 'environmentChanged', 'systemNotification'];

// Mimics the small part of the socket.io-client API the app uses (on / off / disconnect / io.on).
export function createMockSocket() {
  const handlers = new Map();
  const relays = [];
  const emitLocal = (ev, payload) => handlers.get(ev)?.forEach((fn) => fn(payload));
  const timers = [];

  const socket = {
    connected: false,
    on(ev, fn) { if (!handlers.has(ev)) handlers.set(ev, new Set()); handlers.get(ev).add(fn); return socket; },
    off(ev, fn) { handlers.get(ev)?.delete(fn); return socket; },
    io: { on() {}, off() {} },
    disconnect() { timers.forEach(clearTimeout); relays.forEach(([e, f]) => mockBus.off(e, f)); socket.connected = false; emitLocal('disconnect', 'io client disconnect'); },
  };

  EVENTS.forEach((ev) => { const fn = (p) => emitLocal(ev, p); mockBus.on(ev, fn); relays.push([ev, fn]); });
  timers.push(setTimeout(() => { socket.connected = true; emitLocal('connect'); }, 400));
  timers.push(setTimeout(() => {
    const db = getDb();
    const n = { id: uid('n'), type: 'systemNotification', message: 'Mock notification mode is on. Events from the backend will appear here once Socket.IO is connected.', createdAt: new Date().toISOString(), read: false };
    db.notifications.unshift(n); saveDb(); emitLocal('systemNotification', n);
  }, 6000));
  return socket;
}
