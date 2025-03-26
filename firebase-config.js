// File: src/utils/firebase-config.js
/**
 * Configurazione e utility per Firebase Cloud Messaging
 * Questo file gestisce l'integrazione con Firebase per le notifiche push
 */

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Da sostituire con chiavi reali in produzione
  authDomain: "cleanai-app.firebaseapp.com",
  projectId: "cleanai-app",
  storageBucket: "cleanai-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl",
  measurementId: "G-ABCDEF1234"
};

// Inizializzazione Firebase
export const initializeFirebase = () => {
  // In un'implementazione reale, utilizzeremmo la libreria ufficiale di Firebase
  // Per ora, creiamo un client simulato per dimostrare la funzionalità
  
  console.log('Inizializzazione Firebase con configurazione:', firebaseConfig);
  
  const firebaseClient = {
    // Metodo per richiedere il permesso per le notifiche
    requestPermission: async () => {
      try {
        console.log('Richiesta permesso per notifiche push...');
        
        // Simula la richiesta di permesso
        const permission = await new Promise(resolve => {
          // In un'implementazione reale, qui ci sarebbe una vera richiesta di permesso
          console.log('Permesso concesso (simulato)');
          resolve('granted');
        });
        
        if (permission === 'granted') {
          // Simula la generazione di un token
          const token = 'fcm-token-' + Math.random().toString(36).substring(2, 15);
          console.log('Token FCM generato:', token);
          
          // Salva il token nel localStorage
          localStorage.setItem('fcmToken', token);
          
          return token;
        } else {
          console.error('Permesso per notifiche negato');
          return null;
        }
      } catch (error) {
        console.error('Errore nella richiesta di permesso:', error);
        throw error;
      }
    },
    
    // Metodo per ottenere il token FCM
    getToken: async () => {
      try {
        // Controlla se il token è già salvato
        let token = localStorage.getItem('fcmToken');
        
        if (!token) {
          // Se non c'è un token, richiedi il permesso
          token = await firebaseClient.requestPermission();
        }
        
        return token;
      } catch (error) {
        console.error('Errore nel recupero del token:', error);
        throw error;
      }
    },
    
    // Metodo per registrare un handler per i messaggi in arrivo
    onMessage: (callback) => {
      console.log('Registrazione handler per messaggi in arrivo');
      
      // Salva il callback per simulare la ricezione di messaggi
      firebaseClient._messageCallback = callback;
      
      // Restituisci una funzione per rimuovere il listener
      return () => {
        firebaseClient._messageCallback = null;
      };
    },
    
    // Metodo per simulare la ricezione di un messaggio
    _simulateIncomingMessage: (message) => {
      if (firebaseClient._messageCallback) {
        firebaseClient._messageCallback(message);
      }
    }
  };
  
  return firebaseClient;
};

// Classe per la gestione delle notifiche
export class NotificationManager {
  constructor(firebaseClient) {
    this.client = firebaseClient;
    this.token = null;
    this.initialized = false;
  }
  
  // Inizializza il manager
  async initialize() {
    try {
      if (this.initialized) return true;
      
      // Ottieni il token FCM
      this.token = await this.client.getToken();
      
      if (!this.token) {
        console.error('Impossibile ottenere il token FCM');
        return false;
      }
      
      // Registra l'handler per i messaggi in arrivo
      this.unsubscribe = this.client.onMessage(this._handleIncomingMessage.bind(this));
      
      this.initialized = true;
      console.log('NotificationManager inizializzato con successo');
      
      return true;
    } catch (error) {
      console.error('Errore nell\'inizializzazione del NotificationManager:', error);
      return false;
    }
  }
  
  // Gestisce i messaggi in arrivo
  _handleIncomingMessage(message) {
    console.log('Messaggio ricevuto:', message);
    
    // Mostra una notifica
    this._showNotification(message);
    
    // Emetti un evento personalizzato
    const event = new CustomEvent('fcm-message', { detail: message });
    window.dispatchEvent(event);
  }
  
  // Mostra una notifica
  _showNotification(message) {
    try {
      // Controlla se le notifiche sono supportate
      if (!('Notification' in window)) {
        console.log('Questo browser non supporta le notifiche desktop');
        return;
      }
      
      // Controlla se abbiamo il permesso
      if (Notification.permission === 'granted') {
        // Crea la notifica
        const notification = new Notification(message.notification.title, {
          body: message.notification.body,
          icon: message.notification.icon || '/logo192.png'
        });
        
        // Gestisci il click sulla notifica
        notification.onclick = () => {
          // Apri l'URL specificato nel messaggio, se presente
          if (message.data && message.data.url) {
            window.open(message.data.url, '_blank');
          }
          
          // Chiudi la notifica
          notification.close();
        };
      } else {
        console.log('Non abbiamo il permesso per mostrare notifiche');
      }
    } catch (error) {
      console.error('Errore nella visualizzazione della notifica:', error);
    }
  }
  
  // Sottoscrive a un topic
  async subscribeToTopic(topic) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      if (!this.token) {
        console.error('Token FCM non disponibile');
        return false;
      }
      
      console.log(`Sottoscrizione al topic "${topic}" (simulata)`);
      
      // In un'implementazione reale, qui ci sarebbe una chiamata API
      // Per ora, simuliamo una sottoscrizione
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error(`Errore nella sottoscrizione al topic "${topic}":`, error);
      return false;
    }
  }
  
  // Annulla la sottoscrizione a un topic
  async unsubscribeFromTopic(topic) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      if (!this.token) {
        console.error('Token FCM non disponibile');
        return false;
      }
      
      console.log(`Annullamento sottoscrizione al topic "${topic}" (simulata)`);
      
      // In un'implementazione reale, qui ci sarebbe una chiamata API
      // Per ora, simuliamo una cancellazione della sottoscrizione
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error(`Errore nell'annullamento della sottoscrizione al topic "${topic}":`, error);
      return false;
    }
  }
  
  // Invia una notifica a un dispositivo specifico
  async sendNotificationToDevice(deviceToken, title, body, data = {}) {
    try {
      console.log(`Invio notifica al dispositivo ${deviceToken} (simulata)`);
      
      // In un'implementazione reale, qui ci sarebbe una chiamata API
      // Per ora, simuliamo l'invio di una notifica
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Notifica inviata con successo');
      
      return true;
    } catch (error) {
      console.error('Errore nell\'invio della notifica:', error);
      return false;
    }
  }
  
  // Invia una notifica a un topic
  async sendNotificationToTopic(topic, title, body, data = {}) {
    try {
      console.log(`Invio notifica al topic "${topic}" (simulata)`);
      
      // In un'implementazione reale, qui ci sarebbe una chiamata API
      // Per ora, simuliamo l'invio di una notifica
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Notifica inviata con successo');
      
      return true;
    } catch (error) {
      console.error('Errore nell\'invio della notifica:', error);
      return false;
    }
  }
  
  // Pulisce le risorse
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    this.initialized = false;
    console.log('NotificationManager pulito');
  }
}

// Esporta un'istanza predefinita del manager
export const createNotificationManager = () => {
  const firebaseClient = initializeFirebase();
  return new NotificationManager(firebaseClient);
};

export default {
  initializeFirebase,
  NotificationManager,
  createNotificationManager
};
