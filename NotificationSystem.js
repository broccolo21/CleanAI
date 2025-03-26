// File: src/components/NotificationSystem.js
import React, { useState, useEffect } from 'react';
import { createNotificationManager } from '../utils/firebase-config';
import { getWebSocketService } from '../utils/websocket-service';

/**
 * Componente per il sistema di notifiche di CleanAI
 * Gestisce le notifiche per operatori e clienti
 */
const NotificationSystem = ({ userType, userId, authToken }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationManager, setNotificationManager] = useState(null);
  const [webSocketService, setWebSocketService] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  // Inizializza il sistema di notifiche
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Inizializza il manager delle notifiche
        const manager = createNotificationManager();
        const initialized = await manager.initialize();
        
        if (!initialized) {
          setError('Impossibile inizializzare il sistema di notifiche');
          return;
        }
        
        setNotificationManager(manager);
        
        // Sottoscrivi ai topic appropriati in base al tipo di utente
        if (userType === 'operator') {
          await manager.subscribeToTopic('operators');
          await manager.subscribeToTopic(`operator_${userId}`);
        } else if (userType === 'client') {
          await manager.subscribeToTopic('clients');
          await manager.subscribeToTopic(`client_${userId}`);
        }
        
        // Inizializza il servizio WebSocket
        const wsService = getWebSocketService();
        setWebSocketService(wsService);
        
        // Connetti al WebSocket
        const wsConnected = await wsService.connect(userId, authToken);
        setConnected(wsConnected);
        
        // Registra i listener per i messaggi WebSocket
        wsService.on('connect', handleWebSocketConnect);
        wsService.on('disconnect', handleWebSocketDisconnect);
        wsService.on('task_update', handleTaskUpdate);
        wsService.on('quality_score', handleQualityScore);
        wsService.on('sensor_alert', handleSensorAlert);
        wsService.on('staff_notification', handleStaffNotification);
        wsService.on('schedule_change', handleScheduleChange);
        
        // Carica le notifiche iniziali
        loadInitialNotifications();
        
        console.log('Sistema di notifiche inizializzato con successo');
      } catch (err) {
        console.error('Errore nell\'inizializzazione del sistema di notifiche:', err);
        setError(`Errore nell'inizializzazione del sistema di notifiche: ${err.message}`);
      }
    };
    
    initializeNotifications();
    
    // Cleanup
    return () => {
      if (webSocketService) {
        webSocketService.disconnect();
      }
      
      if (notificationManager) {
        notificationManager.cleanup();
      }
    };
  }, [userType, userId, authToken]);

  // Carica le notifiche iniziali
  const loadInitialNotifications = async () => {
    try {
      // In un'implementazione reale, qui ci sarebbe una chiamata API
      // Per ora, utilizziamo dati di esempio
      
      // Simula un ritardo di caricamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Crea notifiche di esempio
      const mockNotifications = [
        {
          id: 1,
          type: 'task_update',
          title: 'Attività completata',
          message: 'L\'attività di pulizia #1234 è stata completata con successo.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true
        },
        {
          id: 2,
          type: 'quality_score',
          title: 'Nuovo punteggio di qualità',
          message: 'Punteggio di qualità: 92% per l\'attività #1234.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: true
        },
        {
          id: 3,
          type: 'sensor_alert',
          title: 'Allarme sensore',
          message: 'Rilevato alto livello di umidità nell\'area 3.',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          read: false
        }
      ];
      
      setNotifications(mockNotifications);
      
      // Aggiorna il conteggio delle notifiche non lette
      const unread = mockNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Errore nel caricamento delle notifiche iniziali:', err);
      setError(`Errore nel caricamento delle notifiche: ${err.message}`);
    }
  };

  // Handler per la connessione WebSocket
  const handleWebSocketConnect = (data) => {
    console.log('WebSocket connesso:', data);
    setConnected(true);
  };

  // Handler per la disconnessione WebSocket
  const handleWebSocketDisconnect = (data) => {
    console.log('WebSocket disconnesso:', data);
    setConnected(false);
  };

  // Handler per gli aggiornamenti delle attività
  const handleTaskUpdate = (data) => {
    console.log('Aggiornamento attività ricevuto:', data);
    
    // Crea una nuova notifica
    const notification = {
      id: Date.now(),
      type: 'task_update',
      title: 'Aggiornamento attività',
      message: `L'attività #${data.taskId} è stata aggiornata a "${data.status}".`,
      timestamp: data.updatedAt,
      read: false,
      data: data
    };
    
    // Aggiungi la notifica all'elenco
    addNotification(notification);
  };

  // Handler per i punteggi di qualità
  const handleQualityScore = (data) => {
    console.log('Punteggio di qualità ricevuto:', data);
    
    // Crea una nuova notifica
    const notification = {
      id: Date.now(),
      type: 'quality_score',
      title: 'Nuovo punteggio di qualità',
      message: `Punteggio di qualità: ${Math.round(data.score * 100)}% per l'attività #${data.taskId}.`,
      timestamp: data.timestamp,
      read: false,
      data: data
    };
    
    // Aggiungi la notifica all'elenco
    addNotification(notification);
  };

  // Handler per gli allarmi dei sensori
  const handleSensorAlert = (data) => {
    console.log('Allarme sensore ricevuto:', data);
    
    // Crea una nuova notifica
    const notification = {
      id: Date.now(),
      type: 'sensor_alert',
      title: 'Allarme sensore',
      message: `Rilevato ${data.sensorType} (${data.value}) in ${data.location}.`,
      timestamp: data.timestamp,
      read: false,
      data: data
    };
    
    // Aggiungi la notifica all'elenco
    addNotification(notification);
  };

  // Handler per le notifiche al personale
  const handleStaffNotification = (data) => {
    console.log('Notifica personale ricevuta:', data);
    
    // Crea una nuova notifica
    const notification = {
      id: Date.now(),
      type: 'staff_notification',
      title: data.title,
      message: data.message,
      timestamp: data.timestamp,
      priority: data.priority,
      read: false,
      data: data
    };
    
    // Aggiungi la notifica all'elenco
    addNotification(notification);
  };

  // Handler per i cambiamenti di pianificazione
  const handleScheduleChange = (data) => {
    console.log('Cambiamento pianificazione ricevuto:', data);
    
    // Crea una nuova notifica
    const notification = {
      id: Date.now(),
      type: 'schedule_change',
      title: 'Cambiamento pianificazione',
      message: `L'attività #${data.taskId} è stata ripianificata. Motivo: ${data.reason}`,
      timestamp: data.timestamp,
      read: false,
      data: data
    };
    
    // Aggiungi la notifica all'elenco
    addNotification(notification);
  };

  // Aggiunge una nuova notifica all'elenco
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Mostra una notifica del browser
    showBrowserNotification(notification);
  };

  // Mostra una notifica del browser
  const showBrowserNotification = (notification) => {
    if (!('Notification' in window)) {
      console.log('Questo browser non supporta le notifiche desktop');
      return;
    }
    
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png'
      });
    }
  };

  // Segna una notifica come letta
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Aggiorna il conteggio delle notifiche non lette
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Segna tutte le notifiche come lette
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    
    // Azzera il conteggio delle notifiche non lette
    setUnreadCount(0);
  };

  // Elimina una notifica
  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    const wasUnread = notification && !notification.read;
    
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Aggiorna il conteggio delle notifiche non lette se necessario
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Formatta la data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ottiene l'icona per il tipo di notifica
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_update':
        return '📋';
      case 'quality_score':
        return '⭐';
      case 'sensor_alert':
        return '🔔';
      case 'staff_notification':
        return '👤';
      case 'schedule_change':
        return '🕒';
      default:
        return '📩';
    }
  };

  // Ottiene il colore per la priorità
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Toggle per mostrare/nascondere le notifiche
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="notification-system relative">
      {/* Pulsante delle notifiche */}
      <button
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        onClick={toggleNotifications}
        aria-label="Notifiche"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge per le notifiche non lette */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Pannello delle notifiche */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Notifiche
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                disabled={unreadCount === 0}
              >
                Segna tutte come lette
              </button>
            </div>
          </div>
          
          {/* Stato della connessione */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {connected ? 'Connesso' : 'Disconnesso'}
            </span>
          </div>
          
          {/* Lista delle notifiche */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map(notification => (
                  <li
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 text-2xl mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          {notification.priority && (
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(notification.timestamp)}
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0 flex">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="ml-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                        >
                          <sv<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>