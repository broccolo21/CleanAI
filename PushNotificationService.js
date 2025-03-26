// File: mobile/src/utils/PushNotificationService.js
import React, { useEffect, useState } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Servizio per la gestione delle notifiche push nell'app mobile CleanAI
 */
class PushNotificationService {
  constructor() {
    this.initialized = false;
    this.token = null;
    this.onNotificationOpenedApp = null;
    this.onMessageReceived = null;
  }

  /**
   * Inizializza il servizio di notifiche push
   */
  async initialize() {
    if (this.initialized) return true;

    try {
      // Configura le notifiche locali
      this._configureLocalNotifications();

      // Richiedi il permesso per le notifiche
      const authStatus = await this._requestUserPermission();
      
      if (!authStatus) {
        console.log('Permesso per le notifiche negato');
        return false;
      }

      // Ottieni il token FCM
      this.token = await this._getFCMToken();
      
      if (!this.token) {
        console.log('Impossibile ottenere il token FCM');
        return false;
      }

      // Configura i gestori di eventi
      this._setupEventListeners();

      this.initialized = true;
      console.log('Servizio notifiche push inizializzato con successo');
      
      return true;
    } catch (error) {
      console.error('Errore nell\'inizializzazione del servizio notifiche push:', error);
      return false;
    }
  }

  /**
   * Configura le notifiche locali
   */
  _configureLocalNotifications() {
    PushNotification.configure({
      // Gestisce la notifica quando l'app è in background
      onNotification: (notification) => {
        console.log('NOTIFICA RICEVUTA:', notification);
        
        // Gestisci l'apertura della notifica
        if (notification.userInteraction) {
          this._handleNotificationOpened(notification);
        }
        
        // Richiesto su iOS
        notification.finish(PushNotification.FetchResult.NoData);
      },
      
      // Permessi (solo iOS)
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      
      // Dovrebbe la notifica apparire mentre l'app è in foreground
      popInitialNotification: true,
      
      // Richiesto per le notifiche iOS
      requestPermissions: Platform.OS === 'ios',
    });
    
    // Crea il canale di notifica per Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'cleanai-notifications',
          channelName: 'CleanAI Notifications',
          channelDescription: 'Canale per le notifiche dell\'app CleanAI',
          playSound: true,
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Canale di notifica ${created ? 'creato' : 'già esistente'}`)
      );
    }
  }

  /**
   * Richiede il permesso per le notifiche
   */
  async _requestUserPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      if (!enabled) {
        // Mostra un messaggio all'utente
        Alert.alert(
          'Notifiche disabilitate',
          'Per ricevere notifiche importanti, abilita le notifiche nelle impostazioni.',
          [
            { text: 'Non ora', style: 'cancel' },
            { 
              text: 'Impostazioni', 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
      }
      
      return enabled;
    } catch (error) {
      console.error('Errore nella richiesta di permesso per le notifiche:', error);
      return false;
    }
  }

  /**
   * Ottiene il token FCM
   */
  async _getFCMToken() {
    try {
      // Controlla se abbiamo già un token salvato
      let fcmToken = await AsyncStorage.getItem('fcmToken');
      
      if (!fcmToken) {
        // Ottieni un nuovo token
        fcmToken = await messaging().getToken();
        
        if (fcmToken) {
          // Salva il token
          await AsyncStorage.setItem('fcmToken', fcmToken);
        }
      }
      
      console.log('Token FCM:', fcmToken);
      return fcmToken;
    } catch (error) {
      console.error('Errore nel recupero del token FCM:', error);
      return null;
    }
  }

  /**
   * Configura i gestori di eventi per le notifiche
   */
  _setupEventListeners() {
    // Gestisce le notifiche quando l'app è in foreground
    this.onMessageReceived = messaging().onMessage(async (remoteMessage) => {
      console.log('Notifica ricevuta in foreground:', remoteMessage);
      
      // Mostra una notifica locale
      this._showLocalNotification(remoteMessage);
    });
    
    // Gestisce il click su una notifica quando l'app è in background
    this.onNotificationOpenedApp = messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notifica aperta da background:', remoteMessage);
      
      // Gestisci l'apertura della notifica
      this._handleNotificationOpened(remoteMessage);
    });
    
    // Controlla se l'app è stata aperta da una notifica quando era chiusa
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notifica aperta da app chiusa:', remoteMessage);
          
          // Gestisci l'apertura della notifica
          this._handleNotificationOpened(remoteMessage);
        }
      });
  }

  /**
   * Mostra una notifica locale
   */
  _showLocalNotification(remoteMessage) {
    const { notification, data } = remoteMessage;
    
    PushNotification.localNotification({
      channelId: 'cleanai-notifications',
      title: notification?.title || 'Nuova notifica',
      message: notification?.body || 'Hai ricevuto una nuova notifica',
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      userInfo: data,
    });
  }

  /**
   * Gestisce l'apertura di una notifica
   */
  _handleNotificationOpened(notification) {
    // Estrai i dati dalla notifica
    const data = Platform.OS === 'ios'
      ? notification.data
      : notification.userInfo;
    
    // Emetti un evento personalizzato
    if (this.onNotificationOpened) {
      this.onNotificationOpened(data);
    }
  }

  /**
   * Registra un callback per l'apertura delle notifiche
   */
  registerNotificationOpenedHandler(callback) {
    this.onNotificationOpened = callback;
  }

  /**
   * Sottoscrive a un topic
   */
  async subscribeToTopic(topic) {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Sottoscritto al topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`Errore nella sottoscrizione al topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Annulla la sottoscrizione a un topic
   */
  async unsubscribeFromTopic(topic) {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Sottoscrizione annullata dal topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`Errore nell'annullamento della sottoscrizione dal topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Pulisce le risorse
   */
  cleanup() {
    if (this.onMessageReceived) {
      this.onMessageReceived();
      this.onMessageReceived = null;
    }
    
    if (this.onNotificationOpenedApp) {
      this.onNotificationOpenedApp();
      this.onNotificationOpenedApp = null;
    }
    
    this.initialized = false;
    console.log('Servizio notifiche push pulito');
  }
}

// Istanza singleton del servizio
let instance = null;

/**
 * Ottiene l'istanza del servizio di notifiche push
 */
export const getPushNotificationService = () => {
  if (!instance) {
    instance = new PushNotificationService();
  }
  return instance;
};

/**
 * Hook React per utilizzare il servizio di notifiche push
 */
export const usePushNotifications = (onNotificationOpened) => {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const initializeService = async () => {
      const service = getPushNotificationService();
      
      // Inizializza il servizio
      const initialized = await service.initialize();
      
      if (initialized) {
        setIsReady(true);
        setToken(service.token);
        
        // Registra il callback per l'apertura delle notifiche
        if (onNotificationOpened) {
          service.registerNotificationOpenedHandler(onNotificationOpened);
        }
      }
    };
    
    initializeService();
    
    // Cleanup
    return () => {
      const service = getPushNotificationService();
      service.cleanup();
    };
  }, [onNotificationOpened]);
  
  return { isReady, token };
};

export default {
  getPushNotificationService,
  usePushNotifications
};
