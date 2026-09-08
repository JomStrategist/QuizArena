import { EventEmitter } from 'events';

class LiveSessionEventEmitter extends EventEmitter {}

// Global event bus for real-time live session updates
const globalEventEmitterSymbol = Symbol.for('quizarena.liveSessionEventEmitter');

let eventEmitter: LiveSessionEventEmitter;

if ((global as any)[globalEventEmitterSymbol]) {
  eventEmitter = (global as any)[globalEventEmitterSymbol];
} else {
  eventEmitter = new LiveSessionEventEmitter();
  eventEmitter.setMaxListeners(500); // Support ~200+ concurrent listeners per node
  (global as any)[globalEventEmitterSymbol] = eventEmitter;
}

export const liveGameEmitter = eventEmitter;

export function emitSessionEvent(quizCode: string, eventType: string, data: any) {
  liveGameEmitter.emit(`session:${quizCode}`, {
    type: eventType,
    data,
    timestamp: Date.now(),
  });
}
