// File: src/supabase-config.js
import { createClient } from '@supabase/supabase-js';

// Utilizzo delle variabili d'ambiente per la configurazione
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Verifica che le variabili d'ambiente siano definite
if (!supabaseUrl || !supabaseKey) {
  console.error('Errore: Variabili d\'ambiente SUPABASE_URL e SUPABASE_KEY non definite');
  console.error('Assicurati di configurare le variabili d\'ambiente nel file .env o nel servizio di hosting');
}

// Creazione del client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);

// Funzioni di utilità per interagire con Supabase
export const supabaseUtils = {
  // Autenticazione
  auth: {
    signUp: async (email, password) => {
      return await supabase.auth.signUp({ email, password });
    },
    signIn: async (email, password) => {
      return await supabase.auth.signInWithPassword({ email, password });
    },
    signOut: async () => {
      return await supabase.auth.signOut();
    },
    getUser: async () => {
      return await supabase.auth.getUser();
    }
  },
  
  // Operazioni CRUD per le tabelle principali
  users: {
    getAll: async () => {
      return await supabase.from('users').select('*');
    },
    getById: async (id) => {
      return await supabase.from('users').select('*').eq('id', id).single();
    },
    create: async (userData) => {
      return await supabase.from('users').insert(userData);
    },
    update: async (id, userData) => {
      return await supabase.from('users').update(userData).eq('id', id);
    },
    delete: async (id) => {
      return await supabase.from('users').delete().eq('id', id);
    }
  },
  
  // Clients
  clients: {
    getAll: async () => {
      return await supabase.from('clients').select('*');
    },
    getById: async (id) => {
      return await supabase.from('clients').select('*').eq('id', id).single();
    },
    create: async (clientData) => {
      return await supabase.from('clients').insert(clientData);
    },
    update: async (id, clientData) => {
      return await supabase.from('clients').update(clientData).eq('id', id);
    },
    delete: async (id) => {
      return await supabase.from('clients').delete().eq('id', id);
    }
  },
  
  // Locations
  locations: {
    getAll: async () => {
      return await supabase.from('locations').select('*, clients(*)');
    },
    getById: async (id) => {
      return await supabase.from('locations').select('*, clients(*)').eq('id', id).single();
    },
    getByClientId: async (clientId) => {
      return await supabase.from('locations').select('*').eq('client_id', clientId);
    },
    create: async (locationData) => {
      return await supabase.from('locations').insert(locationData);
    },
    update: async (id, locationData) => {
      return await supabase.from('locations').update(locationData).eq('id', id);
    },
    delete: async (id) => {
      return await supabase.from('locations').delete().eq('id', id);
    }
  },
  
  // Funzioni specifiche per CleanAI
  cleaningTasks: {
    getAll: async () => {
      return await supabase
        .from('cleaning_tasks')
        .select('*, locations(*), users(*)');
    },
    
    getById: async (id) => {
      return await supabase
        .from('cleaning_tasks')
        .select('*, locations(*), users(*)')
        .eq('id', id)
        .single();
    },
    
    getTasksForOperator: async (operatorId) => {
      return await supabase
        .from('cleaning_tasks')
        .select('*, locations(*)')
        .eq('operator_id', operatorId)
        .order('scheduled_at', { ascending: true });
    },
    
    getTasksByStatus: async (status) => {
      return await supabase
        .from('cleaning_tasks')
        .select('*, locations(*), users(*)')
        .eq('status', status)
        .order('scheduled_at', { ascending: true });
    },
    
    create: async (taskData) => {
      return await supabase
        .from('cleaning_tasks')
        .insert(taskData);
    },
    
    update: async (id, taskData) => {
      return await supabase
        .from('cleaning_tasks')
        .update(taskData)
        .eq('id', id);
    },
    
    updateTaskStatus: async (taskId, status, completionData = {}) => {
      return await supabase
        .from('cleaning_tasks')
        .update({ 
          status, 
          completed_at: status === 'completed' ? new Date() : null,
          ...completionData 
        })
        .eq('id', taskId);
    },
    
    delete: async (id) => {
      return await supabase
        .from('cleaning_tasks')
        .delete()
        .eq('id', id);
    }
  },
  
  // Cleaning Reports
  cleaningReports: {
    getAll: async () => {
      return await supabase
        .from('cleaning_reports')
        .select('*, cleaning_tasks(*), users(*)');
    },
    
    getById: async (id) => {
      return await supabase
        .from('cleaning_reports')
        .select('*, cleaning_tasks(*), users(*)')
        .eq('id', id)
        .single();
    },
    
    getByTaskId: async (taskId) => {
      return await supabase
        .from('cleaning_reports')
        .select('*, users(*)')
        .eq('task_id', taskId)
        .single();
    },
    
    createCleaningReport: async (reportData) => {
      return await supabase
        .from('cleaning_reports')
        .insert(reportData);
    },
    
    update: async (id, reportData) => {
      return await supabase
        .from('cleaning_reports')
        .update(reportData)
        .eq('id', id);
    },
    
    delete: async (id) => {
      return await supabase
        .from('cleaning_reports')
        .delete()
        .eq('id', id);
    }
  },
  
  // Funzioni per i sensori IoT
  iotSensors: {
    getAll: async () => {
      return await supabase
        .from('iot_sensors')
        .select('*, locations(*)');
    },
    
    getById: async (id) => {
      return await supabase
        .from('iot_sensors')
        .select('*, locations(*)')
        .eq('id', id)
        .single();
    },
    
    getByLocationId: async (locationId) => {
      return await supabase
        .from('iot_sensors')
        .select('*')
        .eq('location_id', locationId);
    },
    
    create: async (sensorData) => {
      return await supabase
        .from('iot_sensors')
        .insert(sensorData);
    },
    
    update: async (id, sensorData) => {
      return await supabase
        .from('iot_sensors')
        .update(sensorData)
        .eq('id', id);
    },
    
    delete: async (id) => {
      return await supabase
        .from('iot_sensors')
        .delete()
        .eq('id', id);
    },
    
    getLatestReadings: async (locationId) => {
      return await supabase
        .from('sensor_readings')
        .select('*, iot_sensors(*)')
        .eq('location_id', locationId)
        .order('timestamp', { ascending: false })
        .limit(10);
    },
    
    createSensorReading: async (readingData) => {
      return await supabase
        .from('sensor_readings')
        .insert(readingData);
    }
  },
  
  // Notifiche
  notifications: {
    getAll: async () => {
      return await supabase
        .from('notifications')
        .select('*');
    },
    
    getByUserId: async (userId) => {
      return await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    },
    
    getUnreadByUserId: async (userId) => {
      return await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });
    },
    
    create: async (notificationData) => {
      return await supabase
        .from('notifications')
        .insert(notificationData);
    },
    
    markAsRead: async (id) => {
      return await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    },
    
    markAllAsRead: async (userId) => {
      return await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
    },
    
    delete: async (id) => {
      return await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
    }
  }
};

export default supabaseUtils;
