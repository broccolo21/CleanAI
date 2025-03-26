// Configurazione MQTT Broker per CleanAI
// Questo file gestisce la connessione MQTT per i sensori IoT

import * as mqtt from 'mqtt';
import { supabase } from './supabase-config';

// Configurazione del client MQTT
const mqttOptions = {
  host: process.env.MQTT_HOST || 'localhost',
  port: parseInt(process.env.MQTT_PORT || '1883'),
  protocol: 'mqtt',
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clientId: `cleanai-server-${Math.random().toString(16).substring(2, 8)}`
};

// Creazione del client MQTT
const client = mqtt.connect(mqttOptions);

// Gestione degli eventi di connessione
client.on('connect', () => {
  console.log('Connesso al broker MQTT');
  
  // Sottoscrizione ai topic dei sensori
  client.subscribe('cleanai/sensors/#', (err) => {
    if (!err) {
      console.log('Sottoscritto ai topic dei sensori');
    } else {
      console.error('Errore nella sottoscrizione ai topic:', err);
    }
  });
});

// Gestione degli errori di connessione
client.on('error', (error) => {
  console.error('Errore di connessione MQTT:', error);
});

// Gestione della disconnessione
client.on('close', () => {
  console.log('Disconnesso dal broker MQTT');
});

// Gestione dei messaggi in arrivo
client.on('message', async (topic, message) => {
  console.log(`Messaggio ricevuto sul topic ${topic}: ${message.toString()}`);
  
  try {
    // Parsing del messaggio JSON
    const data = JSON.parse(message.toString());
    
    // Estrazione dell'ID del sensore dal topic
    // Formato atteso: cleanai/sensors/{sensorId}
    const topicParts = topic.split('/');
    if (topicParts.length < 3) {
      console.error('Formato del topic non valido:', topic);
      return;
    }
    
    const sensorId = topicParts[2];
    
    // Verifica che il sensore esista
    const { data: sensor, error: sensorError } = await supabase
      .from('iot_sensors')
      .select('*')
      .eq('id', sensorId)
      .single();
    
    if (sensorError) {
      console.error('Errore nel recupero del sensore:', sensorError);
      return;
    }
    
    // Salvataggio della lettura del sensore
    const readingData = {
      sensorId: sensorId,
      value: data.value,
      unit: data.unit || determineUnit(sensor.type),
      timestamp: data.timestamp || new Date().toISOString()
    };
    
    const { error: insertError } = await supabase
      .from('sensor_readings')
      .insert(readingData);
    
    if (insertError) {
      console.error('Errore nell\'inserimento della lettura:', insertError);
      return;
    }
    
    // Verifica se il valore supera la soglia per generare un alert
    if (isAboveThreshold(sensor.type, data.value)) {
      // Trova la location associata al sensore
      const { data: location, error: locationError } = await supabase
        .from('locations')
        .select('*')
        .eq('id', sensor.locationId)
        .single();
      
      if (locationError) {
        console.error('Errore nel recupero della location:', locationError);
        return;
      }
      
      // Trova gli operatori assegnati a questa location
      const { data: tasks, error: tasksError } = await supabase
        .from('cleaning_tasks')
        .select('operator_id')
        .eq('location_id', location.id)
        .eq('status', 'pending');
      
      if (tasksError) {
        console.error('Errore nel recupero delle attività:', tasksError);
        return;
      }
      
      // Crea notifiche per gli operatori
      const operatorIds = [...new Set(tasks.map(task => task.operator_id))];
      
      for (const operatorId of operatorIds) {
        const notificationData = {
          userId: operatorId,
          title: 'Allarme sensore IoT',
          message: `Il sensore ${sensor.name} in ${location.name} ha rilevato un valore anomalo: ${data.value} ${readingData.unit}`,
          type: 'alert',
          read: false,
          createdAt: new Date().toISOString()
        };
        
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notificationData);
        
        if (notificationError) {
          console.error('Errore nella creazione della notifica:', notificationError);
        } else {
          // Pubblica la notifica sul topic delle notifiche
          client.publish(`cleanai/notifications/${operatorId}`, JSON.stringify(notificationData));
        }
      }
    }
    
    console.log('Lettura del sensore salvata con successo');
    
  } catch (error) {
    console.error('Errore nell\'elaborazione del messaggio:', error);
  }
});

// Funzione per determinare l'unità di misura in base al tipo di sensore
function determineUnit(sensorType) {
  switch (sensorType) {
    case 'humidity':
      return '%';
    case 'temperature':
      return '°C';
    case 'air_quality':
      return 'AQI';
    case 'dirt_level':
      return 'DL';
    default:
      return 'units';
  }
}

// Funzione per verificare se il valore supera la soglia
function isAboveThreshold(sensorType, value) {
  // Soglie predefinite per tipo di sensore
  const thresholds = {
    humidity: 80, // 80%
    temperature: 30, // 30°C
    air_quality: 150, // AQI 150 (unhealthy)
    dirt_level: 70, // 70% sporco
    motion: 1 // qualsiasi movimento (1 = movimento rilevato)
  };
  
  return value > (thresholds[sensorType] || 0);
}

// Funzione per pubblicare un messaggio
export function publishMessage(topic, message) {
  client.publish(topic, JSON.stringify(message), { qos: 1 });
}

// Funzione per simulare una lettura del sensore (utile per test)
export function simulateSensorReading(sensorId, value, unit) {
  const message = {
    value,
    unit,
    timestamp: new Date().toISOString()
  };
  
  publishMessage(`cleanai/sensors/${sensorId}`, message);
}

export default client;
