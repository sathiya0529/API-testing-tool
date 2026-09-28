// Tiny event bus. The mock API publishes server-style events here; the mock socket relays them to the UI.
const listeners = new Map();
export const mockBus = {
  on(event, fn) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(fn); },
  off(event, fn) { listeners.get(event)?.delete(fn); },
  emit(event, payload) { listeners.get(event)?.forEach((fn) => fn(payload)); },
};
