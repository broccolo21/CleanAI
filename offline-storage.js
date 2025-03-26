// File: frontend/src/utils/offline-storage.js
/**
 * Utility per la gestione dello storage offline e la sincronizzazione
 * Questo modulo gestisce il salvataggio dei dati in locale quando l'app è offline
 * e la sincronizzazione con il server quando la connessione viene ripristinata
 */

import { openDB } from 'idb';

// Nome del database IndexedDB
const DB_NAME = 'cleanai-offline-db';
const DB_VERSION = 1;

// Nomi degli store
const TASKS_STORE = 'tasks';
const QUALITY_SCORES_STORE = 'quality-scores';
const PENDING_REQUESTS_STORE = 'pending-requests';

// Inizializza il database
const initDB = async () => {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Crea gli object store se non esistono
        if (!db.objectStoreNames.contains(TASKS_STORE)) {
          const taskStore = db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
          taskStore.createIndex('status', 'status');
          taskStore.createIndex('assigned_to', 'assigned_to');
        }
        
        if (!db.objectStoreNames.contains(QUALITY_SCORES_STORE)) {
          const scoresStore = db.createObjectStore(QUALITY_SCORES_STORE, { keyPath: 'id' });
          scoresStore.createIndex('task_id', 'task_id');
        }
        
        if (!db.objectStoreNames.contains(PENDING_REQUESTS_STORE)) {
          const pendingStore = db.createObjectStore(PENDING_REQUESTS_STORE, { 
            keyPath: 'id',
            autoIncrement: true 
          });
          pendingStore.createIndex('timestamp', 'timestamp');
        }
      }
    });
    
    console.log('Database IndexedDB inizializzato con successo');
    return db;
  } catch (error) {
    console.error('Errore nell\'inizializzazione del database IndexedDB:', error);
    throw error;
  }
};

// Singleton del database
let dbPromise;

// Ottiene l'istanza del database
const getDB = () => {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
};

/**
 * Classe per la gestione dello storage offline
 */
class OfflineStorage {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    // Registra i listener per gli eventi online/offline
    window.addEventListener('online', this._handleOnline.bind(this));
    window.addEventListener('offline', this._handleOffline.bind(this));
  }
  
  /**
   * Gestisce l'evento online
   */
  _handleOnline = () => {
    console.log('Connessione ripristinata');
    this.isOnline = true;
    
    // Avvia la sincronizzazione
    this.syncPendingRequests();
  };
  
  /**
   * Gestisce l'evento offline
   */
  _handleOffline = () => {
    console.log('Connessione persa');
    this.isOnline = false;
  };
  
  /**
   * Salva un'attività in locale
   */
  async saveTask(task) {
    try {
      const db = await getDB();
      await db.put(TASKS_STORE, task);
      console.log(`Attività ${task.id} salvata in locale`);
      return true;
    } catch (error) {
      console.error('Errore nel salvataggio dell\'attività in locale:', error);
      return false;
    }
  }
  
  /**
   * Ottiene un'attività dal database locale
   */
  async getTask(taskId) {
    try {
      const db = await getDB();
      const task = await db.get(TASKS_STORE, taskId);
      return task;
    } catch (error) {
      console.error(`Errore nel recupero dell'attività ${taskId} dal database locale:`, error);
      return null;
    }
  }
  
  /**
   * Ottiene tutte le attività dal database locale
   */
  async getAllTasks() {
    try {
      const db = await getDB();
      const tasks = await db.getAll(TASKS_STORE);
      return tasks;
    } catch (error) {
      console.error('Errore nel recupero delle attività dal database locale:', error);
      return [];
    }
  }
  
  /**
   * Salva un punteggio di qualità in locale
   */
  async saveQualityScore(score) {
    try {
      const db = await getDB();
      await db.put(QUALITY_SCORES_STORE, score);
      console.log(`Punteggio di qualità ${score.id} salvato in locale`);
      return true;
    } catch (error) {
      console.error('Errore nel salvataggio del punteggio di qualità in locale:', error);
      return false;
    }
  }
  
  /**
   * Ottiene tutti i punteggi di qualità dal database locale
   */
  async getAllQualityScores() {
    try {
      const db = await getDB();
      const scores = await db.getAll(QUALITY_SCORES_STORE);
      return scores;
    } catch (error) {
      console.error('Errore nel recupero dei punteggi di qualità dal database locale:', error);
      return [];
    }
  }
  
  /**
   * Aggiunge una richiesta alla coda delle richieste in sospeso
   */
  async addPendingRequest(request) {
    try {
      const db = await getDB();
      
      // Aggiungi timestamp alla richiesta
      const pendingRequest = {
        ...request,
        timestamp: new Date().toISOString()
      };
      
      await db.add(PENDING_REQUESTS_STORE, pendingRequest);
      console.log('Richiesta aggiunta alla coda delle richieste in sospeso');
      return true;
    } catch (error) {
      console.error('Errore nell\'aggiunta della richiesta alla coda:', error);
      return false;
    }
  }
  
  /**
   * Ottiene tutte le richieste in sospeso
   */
  async getPendingRequests() {
    try {
      const db = await getDB();
      const requests = await db.getAll(PENDING_REQUESTS_STORE);
      return requests;
    } catch (error) {
      console.error('Errore nel recupero delle richieste in sospeso:', error);
      return [];
    }
  }
  
  /**
   * Rimuove una richiesta dalla coda delle richieste in sospeso
   */
  async removePendingRequest(requestId) {
    try {
      const db = await getDB();
      await db.delete(PENDING_REQUESTS_STORE, requestId);
      console.log(`Richiesta ${requestId} rimossa dalla coda`);
      return true;
    } catch (error) {
      console.error(`Errore nella rimozione della richiesta ${requestId} dalla coda:`, error);
      return false;
    }
  }
  
  /**
   * Sincronizza le richieste in sospeso con il server
   */
  async syncPendingRequests() {
    if (!this.isOnline || this.syncInProgress) {
      return false;
    }
    
    try {
      this.syncInProgress = true;
      console.log('Avvio sincronizzazione delle richieste in sospeso...');
      
      // Ottieni tutte le richieste in sospeso
      const pendingRequests = await this.getPendingRequests();
      
      if (pendingRequests.length === 0) {
        console.log('Nessuna richiesta in sospeso da sincronizzare');
        this.syncInProgress = false;
        return true;
      }
      
      console.log(`Trovate ${pendingRequests.length} richieste in sospeso`);
      
      // Ordina le richieste per timestamp
      pendingRequests.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      // Processa le richieste in ordine
      for (const request of pendingRequests) {
        try {
          console.log(`Elaborazione richiesta ${request.id}: ${request.method} ${request.url}`);
          
          // Esegui la richiesta
          const response = await fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body ? JSON.stringify(request.body) : undefined
          });
          
          if (response.ok) {
            console.log(`Richiesta ${request.id} sincronizzata con successo`);
            await this.removePendingRequest(request.id);
          } else {
            console.error(`Errore nella sincronizzazione della richiesta ${request.id}:`, await response.text());
          }
        } catch (requestError) {
          console.error(`Errore nell'elaborazione della richiesta ${request.id}:`, requestError);
          
          // Se c'è un errore di rete, interrompi la sincronizzazione
          if (requestError.name === 'TypeError' && requestError.message.includes('Failed to fetch')) {
            console.log('Connessione persa durante la sincronizzazione, interruzione');
            this.isOnline = false;
            break;
          }
        }
      }
      
      console.log('Sincronizzazione completata');
      this.syncInProgress = false;
      return true;
    } catch (error) {
      console.error('Errore durante la sincronizzazione:', error);
      this.syncInProgress = false;
      return false;
    }
  }
  
  /**
   * Esegue una richiesta API con supporto offline
   */
  async fetchWithOfflineSupport(url, options = {}) {
    // Se siamo online, prova a eseguire la richiesta normalmente
    if (this.isOnline) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error) {
        // Se c'è un errore di rete, passa alla modalità offline
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          console.log('Errore di rete, passaggio alla modalità offline');
          this.isOnline = false;
        } else {
          throw error;
        }
      }
    }
    
    // Se siamo offline, aggiungi la richiesta alla coda
    if (!this.isOnline) {
      // Estrai il metodo e il corpo dalla richiesta
      const { method = 'GET', headers = {}, body } = options;
      
      // Crea l'oggetto richiesta
      const request = {
        url,
        method,
        headers,
        body: body ? JSON.parse(body) : undefined
      };
      
      // Aggiungi la richiesta alla coda
      await this.addPendingRequest(request);
      
      // Restituisci una risposta simulata
      return new Response(JSON.stringify({ 
        success: true, 
        offline: true, 
        message: 'Richiesta salvata per la sincronizzazione' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  /**
   * Pulisce il database
   */
  async clearDatabase() {
    try {
      const db = await getDB();
      await db.clear(TASKS_STORE);
      await db.clear(QUALITY_SCORES_STORE);
      await db.clear(PENDING_REQUESTS_STORE);
      console.log('Database pulito con successo');
      return true;
    } catch (error) {
      console.error('Errore nella pulizia del database:', error);
      return false;
    }
  }
}

// Istanza singleton
let instance;

/**
 * Ottiene l'istanza del servizio di storage offline
 */
export const getOfflineStorage = () => {
  if (!instance) {
    instance = new OfflineStorage();
  }
  return instance;
};

export default {
  getOfflineStorage
};
