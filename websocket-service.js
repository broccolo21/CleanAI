// File: src/utils/websocket-service.js
/**
 * Servizio WebSocket per aggiornamenti in tempo reale
 * Questo file gestisce la connessione WebSocket per gli aggiornamenti live
 */

// Classe per la gestione della connessione WebSocket
export class WebSocketService {
  constructor(url) {
    this.url = url || 'wss://api.cleanai.app/ws';
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 1000; // 1 secondo
    this.listeners = new Map();
    this.connected = false;
    this.connecting = false;
    this.userId = null;
    this.authToken = null;
  }

  // Inizializza la connessione WebSocket
  async connect(userId, authToken) {
    if (this.connected || this.connecting) return;

    this.connecting = true;
    this.userId = userId;
    this.authToken = authToken;

    try {
      // In un'implementazione reale, ci connetteremmo a un vero server WebSocket
      // Per ora, simuliamo una connessione
      console.log(`Connessione a ${this.url} (simulata)`);
      
      // Simula un ritardo di connessione
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Crea un oggetto WebSocket simulato
      this.socket = this._createMockWebSocket();
      
      console.log('Connessione WebSocket stabilita (simulata)');
      this.connected = true;
      this.connecting = false;
      this.reconnectAttempts = 0;
      
      // Notifica i listener della connessione
      this._notifyListeners('connect', { userId: this.userId });
      
      return true;
    } catch (error) {
      console.error('Errore nella connessione WebSocket:', error);
      this.connecting = false;
      
      // Tenta di riconnettersi
      this._scheduleReconnect();
      
      return false;
    }
  }

  // Crea un WebSocket simulato per demo
  _createMockWebSocket() {
    const mockSocket = {
      readyState: 1, // WebSocket.OPEN
      send: (data) => {
        console.log('WebSocket.send (simulato):', data);
        
        // Simula una risposta dopo un breve ritardo
        setTimeout(() => {
          if (mockSocket.onmessage) {
            const response = {
              type: 'ack',
              data: { received: true, timestamp: new Date().toISOString() }
            };
            mockSocket.onmessage({ data: JSON.stringify(response) });
          }
        }, 100);
      },
      close: () => {
        console.log('WebSocket.close (simulato)');
        mockSocket.readyState = 3; // WebSocket.CLOSED
        
        if (mockSocket.onclose) {
          mockSocket.onclose({ code: 1000, reason: 'Normal closure' });
        }
      }
    };
    
    // Simula messaggi periodici
    this._startMockMessages(mockSocket);
    
    return mockSocket;
  }

  // Simula messaggi periodici per demo
  _startMockMessages(mockSocket) {
    const messageTypes = [
      'task_update',
      'quality_score',
      'sensor_alert',
      'staff_notification',
      'schedule_change'
    ];
    
    // Invia un messaggio simulato ogni 10-20 secondi
    const interval = setInterval(() => {
      if (mockSocket.readyState !== 1) {
        clearInterval(interval);
        return;
      }
      
      // Scegli un tipo di messaggio casuale
      const type = messageTypes[Math.floor(Math.random() * messageTypes.length)];
      
      // Crea un messaggio simulato
      let message;
      switch (type) {
        case 'task_update':
          message = {
            type: 'task_update',
            data: {
              taskId: Math.floor(Math.random() * 1000) + 1,
              status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
              updatedAt: new Date().toISOString()
            }
          };
          break;
        case 'quality_score':
          message = {
            type: 'quality_score',
            data: {
              taskId: Math.floor(Math.random() * 1000) + 1,
              score: (Math.random() * 0.3 + 0.7).toFixed(2), // 0.7-1.0
              location: `Area ${Math.floor(Math.random() * 10) + 1}`,
              timestamp: new Date().toISOString()
            }
          };
          break;
        case 'sensor_alert':
          message = {
            type: 'sensor_alert',
            data: {
              sensorId: `sensor-${Math.floor(Math.random() * 100) + 1}`,
              sensorType: ['humidity', 'temperature', 'motion', 'air_quality', 'dirt_level'][Math.floor(Math.random() * 5)],
              value: Math.floor(Math.random() * 100),
              threshold: 50,
              location: `Area ${Math.floor(Math.random() * 10) + 1}`,
              timestamp: new Date().toISOString()
            }
          };
          break;
        case 'staff_notification':
          message = {
            type: 'staff_notification',
            data: {
              title: 'Notifica personale',
              message: 'Nuova attività assegnata',
              priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
              timestamp: new Date().toISOString()
            }
          };
          break;
        case 'schedule_change':
          message = {
            type: 'schedule_change',
            data: {
              taskId: Math.floor(Math.random() * 1000) + 1,
              oldTime: new Date(Date.now() - 3600000).toISOString(),
              newTime: new Date(Date.now() + 3600000).toISOString(),
              reason: 'Ottimizzazione pianificazione',
              timestamp: new Date().toISOString()
            }
          };
          break;
      }
      
      // Invia il messaggio simulato
      if (mockSocket.onmessage) {
        mockSocket.onmessage({ data: JSON.stringify(message) });
      }
    }, Math.random() * 10000 + 10000); // 10-20 secondi
    
    // Salva l'intervallo per poterlo cancellare
    this._mockInterval = interval;
  }

  // Pianifica un tentativo di riconnessione
  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Numero massimo di tentativi di riconnessione raggiunto');
      return;
    }
    
    const delay = this.reconnectTimeout * Math.pow(2, this.reconnectAttempts);
    console.log(`Tentativo di riconnessione tra ${delay}ms...`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(this.userId, this.authToken);
    }, delay);
  }

  // Disconnette il WebSocket
  disconnect() {
    if (!this.socket) return;
    
    try {
      this.socket.close();
      this.socket = null;
      this.connected = false;
      
      // Cancella l'intervallo dei messaggi simulati
      if (this._mockInterval) {
        clearInterval(this._mockInterval);
        this._mockInterval = null;
      }
      
      console.log('Disconnessione WebSocket completata');
      
      // Notifica i listener della disconnessione
      this._notifyListeners('disconnect', { reason: 'User disconnected' });
    } catch (error) {
      console.error('Errore nella disconnessione WebSocket:', error);
    }
  }

  // Invia un messaggio tramite WebSocket
  send(type, data) {
    if (!this.socket || this.socket.readyState !== 1) {
      console.error('WebSocket non connesso');
      return false;
    }
    
    try {
      const message = JSON.stringify({
        type,
        data,
        userId: this.userId,
        timestamp: new Date().toISOString()
      });
      
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('Errore nell\'invio del messaggio WebSocket:', error);
      return false;
    }
  }

  // Aggiunge un listener per un tipo di evento
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    
    this.listeners.get(type).push(callback);
    
    // Restituisci una funzione per rimuovere il listener
    return () => {
      this.off(type, callback);
    };
  }

  // Rimuove un listener per un tipo di evento
  off(type, callback) {
    if (!this.listeners.has(type)) return;
    
    const callbacks = this.listeners.get(type);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
    
    if (callbacks.length === 0) {
      this.listeners.delete(type);
    }
  }

  // Notifica tutti i listener di un evento
  _notifyListeners(type, data) {
    if (!this.listeners.has(type)) return;
    
    const callbacks = this.listeners.get(type);
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Errore nell'esecuzione del callback per l'evento "${type}":`, error);
      }
    });
  }

  // Gestisce i messaggi in arrivo
  _handleIncomingMessage(event) {
    try {
      const message = JSON.parse(event.data);
      
      console.log('Messaggio WebSocket ricevuto:', message);
      
      // Notifica i listener del tipo specifico di messaggio
      this._notifyListeners(message.type, message.data);
      
      // Notifica anche i listener generici di 'message'
      this._notifyListeners('message', message);
    } catch (error) {
      console.error('Errore nella gestione del messaggio WebSocket:', error);
    }
  }

  // Verifica se il WebSocket è connesso
  isConnected() {
    return this.connected;
  }
}

// Istanza singleton del servizio WebSocket
let instance = null;

// Funzione per ottenere l'istanza del servizio
export const getWebSocketService = (url) => {
  if (!instance) {
    instance = new WebSocketService(url);
  }
  return instance;
};

export default {
  WebSocketService,
  getWebSocketService
};
