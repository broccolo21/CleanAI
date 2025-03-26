// Modelli di dati per CleanAI
// Questo file definisce le entità principali del sistema

// Modello User - Rappresenta gli utenti del sistema
export class User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'supervisor' | 'operator';
  createdAt: Date;
  updatedAt: Date;
  
  // Relazioni
  assignedTasks?: CleaningTask[];
  notifications?: Notification[];
}

// Modello Client - Rappresenta i clienti che richiedono servizi di pulizia
export class Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relazioni
  locations?: Location[];
}

// Modello Location - Rappresenta i luoghi dove vengono effettuate le pulizie
export class Location {
  id: string;
  clientId: string;
  name: string;
  address: string;
  size: number; // in metri quadri
  type: 'office' | 'commercial' | 'industrial' | 'residential';
  createdAt: Date;
  updatedAt: Date;
  
  // Relazioni
  client?: Client;
  cleaningTasks?: CleaningTask[];
  iotSensors?: IoTSensor[];
}

// Modello CleaningTask - Rappresenta le attività di pulizia programmate
export class CleaningTask {
  id: string;
  locationId: string;
  operatorId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt: Date;
  estimatedDuration: number; // in minuti
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relazioni
  location?: Location;
  operator?: User;
  cleaningReport?: CleaningReport;
}

// Modello CleaningReport - Rappresenta i report delle pulizie effettuate
export class CleaningReport {
  id: string;
  taskId: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  qualityScore: number; // da 0 a 1
  notes: string;
  duration: number; // in minuti
  createdAt: Date;
  
  // Relazioni
  task?: CleaningTask;
}

// Modello IoTSensor - Rappresenta i sensori IoT installati nelle location
export class IoTSensor {
  id: string;
  locationId: string;
  name: string;
  type: 'humidity' | 'temperature' | 'motion' | 'air_quality' | 'dirt_level';
  status: 'active' | 'inactive' | 'maintenance';
  batteryLevel: number; // percentuale
  lastMaintenance: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relazioni
  location?: Location;
  readings?: SensorReading[];
}

// Modello SensorReading - Rappresenta le letture dei sensori IoT
export class SensorReading {
  id: string;
  sensorId: string;
  value: number;
  unit: string;
  timestamp: Date;
  
  // Relazioni
  sensor?: IoTSensor;
}

// Modello Notification - Rappresenta le notifiche inviate agli utenti
export class Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  read: boolean;
  createdAt: Date;
  
  // Relazioni
  user?: User;
}
