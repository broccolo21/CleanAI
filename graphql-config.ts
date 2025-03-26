// Configurazione GraphQL per CleanAI
// Questo file definisce lo schema GraphQL e i resolver

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { supabase } from './supabase-config';

// Definizione del modulo GraphQL
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req }) => ({ req }),
    }),
  ],
})
export class GraphQLConfigModule {}

// Definizione dei tipi GraphQL
export const typeDefs = `
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    createdAt: String!
    updatedAt: String!
    assignedTasks: [CleaningTask]
    notifications: [Notification]
  }

  type Client {
    id: ID!
    name: String!
    email: String!
    phone: String!
    address: String!
    createdAt: String!
    updatedAt: String!
    locations: [Location]
  }

  type Location {
    id: ID!
    clientId: ID!
    name: String!
    address: String!
    size: Float!
    type: String!
    createdAt: String!
    updatedAt: String!
    client: Client
    cleaningTasks: [CleaningTask]
    iotSensors: [IoTSensor]
  }

  type CleaningTask {
    id: ID!
    locationId: ID!
    operatorId: ID!
    title: String!
    description: String!
    status: String!
    priority: String!
    scheduledAt: String!
    estimatedDuration: Int!
    startedAt: String
    completedAt: String
    createdAt: String!
    updatedAt: String!
    location: Location
    operator: User
    cleaningReport: CleaningReport
  }

  type CleaningReport {
    id: ID!
    taskId: ID!
    beforeImageUrl: String!
    afterImageUrl: String!
    qualityScore: Float!
    notes: String!
    duration: Int!
    createdAt: String!
    task: CleaningTask
  }

  type IoTSensor {
    id: ID!
    locationId: ID!
    name: String!
    type: String!
    status: String!
    batteryLevel: Float!
    lastMaintenance: String!
    createdAt: String!
    updatedAt: String!
    location: Location
    readings: [SensorReading]
  }

  type SensorReading {
    id: ID!
    sensorId: ID!
    value: Float!
    unit: String!
    timestamp: String!
    sensor: IoTSensor
  }

  type Notification {
    id: ID!
    userId: ID!
    title: String!
    message: String!
    type: String!
    read: Boolean!
    createdAt: String!
    user: User
  }

  type DashboardStats {
    totalTasks: Int!
    completedTasks: Int!
    pendingTasks: Int!
    averageQualityScore: Float!
    tasksByPriority: [PriorityCount]
    tasksByStatus: [StatusCount]
    recentNotifications: [Notification]
  }

  type PriorityCount {
    priority: String!
    count: Int!
  }

  type StatusCount {
    status: String!
    count: Int!
  }

  type Query {
    users: [User]
    user(id: ID!): User
    clients: [Client]
    client(id: ID!): Client
    locations(clientId: ID): [Location]
    location(id: ID!): Location
    cleaningTasks(status: String, operatorId: ID): [CleaningTask]
    cleaningTask(id: ID!): CleaningTask
    cleaningReports(taskId: ID): [CleaningReport]
    cleaningReport(id: ID!): CleaningReport
    iotSensors(locationId: ID, status: String): [IoTSensor]
    iotSensor(id: ID!): IoTSensor
    sensorReadings(sensorId: ID!, limit: Int): [SensorReading]
    notifications(userId: ID!): [Notification]
    dashboardStats(operatorId: ID): DashboardStats
  }

  type Mutation {
    createUser(input: UserInput!): User
    updateUser(id: ID!, input: UserInput!): User
    deleteUser(id: ID!): Boolean
    
    createClient(input: ClientInput!): Client
    updateClient(id: ID!, input: ClientInput!): Client
    deleteClient(id: ID!): Boolean
    
    createLocation(input: LocationInput!): Location
    updateLocation(id: ID!, input: LocationInput!): Location
    deleteLocation(id: ID!): Boolean
    
    createCleaningTask(input: CleaningTaskInput!): CleaningTask
    updateCleaningTask(id: ID!, input: CleaningTaskInput!): CleaningTask
    updateCleaningTaskStatus(id: ID!, status: String!, completionData: CompletionDataInput): CleaningTask
    deleteCleaningTask(id: ID!): Boolean
    
    createCleaningReport(input: CleaningReportInput!): CleaningReport
    updateCleaningReport(id: ID!, input: CleaningReportInput!): CleaningReport
    deleteCleaningReport(id: ID!): Boolean
    
    createIoTSensor(input: IoTSensorInput!): IoTSensor
    updateIoTSensor(id: ID!, input: IoTSensorInput!): IoTSensor
    deleteIoTSensor(id: ID!): Boolean
    
    createSensorReading(input: SensorReadingInput!): SensorReading
    
    createNotification(input: NotificationInput!): Notification
    markNotificationAsRead(id: ID!): Notification
  }

  input UserInput {
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    password: String
  }

  input ClientInput {
    name: String!
    email: String!
    phone: String!
    address: String!
  }

  input LocationInput {
    clientId: ID!
    name: String!
    address: String!
    size: Float!
    type: String!
  }

  input CleaningTaskInput {
    locationId: ID!
    operatorId: ID!
    title: String!
    description: String!
    status: String!
    priority: String!
    scheduledAt: String!
    estimatedDuration: Int!
  }

  input CompletionDataInput {
    startedAt: String
    completedAt: String
    notes: String
  }

  input CleaningReportInput {
    taskId: ID!
    beforeImageUrl: String!
    afterImageUrl: String!
    qualityScore: Float!
    notes: String!
    duration: Int!
  }

  input IoTSensorInput {
    locationId: ID!
    name: String!
    type: String!
    status: String!
    batteryLevel: Float!
    lastMaintenance: String!
  }

  input SensorReadingInput {
    sensorId: ID!
    value: Float!
    unit: String!
    timestamp: String!
  }

  input NotificationInput {
    userId: ID!
    title: String!
    message: String!
    type: String!
  }
`;

// Definizione dei resolver GraphQL
export const resolvers = {
  Query: {
    users: async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw new Error(error.message);
      return data;
    },
    user: async (_, { id }) => {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    clients: async () => {
      const { data, error } = await supabase.from('clients').select('*');
      if (error) throw new Error(error.message);
      return data;
    },
    client: async (_, { id }) => {
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    locations: async (_, { clientId }) => {
      let query = supabase.from('locations').select('*');
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    },
    location: async (_, { id }) => {
      const { data, error } = await supabase.from('locations').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    cleaningTasks: async (_, { status, operatorId }) => {
      let query = supabase.from('cleaning_tasks').select('*');
      if (status) {
        query = query.eq('status', status);
      }
      if (operatorId) {
        query = query.eq('operator_id', operatorId);
      }
      const { data, error } = await query.order('scheduled_at', { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
    cleaningTask: async (_, { id }) => {
      const { data, error } = await supabase.from('cleaning_tasks').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    cleaningReports: async (_, { taskId }) => {
      let query = supabase.from('cleaning_reports').select('*');
      if (taskId) {
        query = query.eq('task_id', taskId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    cleaningReport: async (_, { id }) => {
      const { data, error } = await supabase.from('cleaning_reports').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    iotSensors: async (_, { locationId, status }) => {
      let query = supabase.from('iot_sensors').select('*');
      if (locationId) {
        query = query.eq('location_id', locationId);
      }
      if (status) {
        query = query.eq('status', status);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    },
    iotSensor: async (_, { id }) => {
      const { data, error } = await supabase.from('iot_sensors').select('*').eq('id', id).single();
      if (error) throw new Error(error.message);
      return data;
    },
    sensorReadings: async (_, { sensorId, limit = 10 }) => {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('sensor_id', sensorId)
        .order('timestamp', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return data;
    },
    notifications: async (_, { userId }) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
    dashboardStats: async (_, { operatorId }) => {
      // Implementazione delle statistiche per la dashboard
      // Questo è un esempio semplificato, in produzione si utilizzerebbero query più ottimizzate
      
      let tasksQuery = supabase.from('cleaning_tasks').select('*', { count: 'exact' });
      if (operatorId) {
        tasksQuery = tasksQuery.eq('operator_id', operatorId);
      }
      
      const { data: tasks, error: tasksError, count: totalTasks } = await tasksQuery;
      if (tasksError) throw new Error(tasksError.message);
      
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      
      // Calcolo della qualità media
      const { data: reports, error: reportsError } = await supabase
        .from('cleaning_reports')
        .select('quality_score');
      if (reportsError) throw new Error(reportsError.message);
      
      const averageQualityScore = reports.length > 0
        ? reports.reduce((sum, report) => sum + report.quality_score, 0) / reports.length
        : 0;
      
      // Conteggio per priorità
      const priorities = ['low', 'medium', 'high', 'urgent'];
      const tasksByPriority = priorities.map(priority => ({
        priority,
        count: tasks.filter(task => task.priority === priority).length
      }));
      
      // Conteggio per stato
      const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      const tasksByStatus = statuses.map(status => ({
        status,
        count: tasks.filter(task => task.status === status).length
      }));
      
      // Notifiche recenti
      let notificationsQuery = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (operatorId) {
        notificationsQuery = notificationsQuery.eq('user_id', operatorId);
      }
      
      const { data: recentNotifications, error: notificationsError } = await notificationsQuery;
      if (notificationsError) throw new Error(notificationsError.message);
      
      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        averageQualityScore,
        tasksByPriority,
        tasksByStatus,
        recentNotifications
      };
    }
  },
  
  // Implementazione delle relazioni
  User: {
    assignedTasks: async (parent) => {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .eq('operator_id', parent.id);
      if (error) throw new Error(error.message);
      return data;
    },
    notifications: async (parent) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', parent.id);
      if (error) throw new Error(error.message);
      return data;
    }
  },
  
  Client: {
    locations: async (parent) => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('client_id', parent.id);
      if (error) throw new Error(error.message);
      return data;
    }
  },
  
  Location: {
    client: async (parent) => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', parent.clientId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    cleaningTasks: async (parent) => {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .eq('location_id', parent.id);
      if (error) throw new Error(error.message);
      return data;
    },
    iotSensors: async (parent) => {
      const { data, error } = await supabase
        .from('iot_sensors')
        .select('*')
        .eq('location_id', parent.id);
      if (error) throw new Error(error.message);
      return data;
    }
  },
  
  CleaningTask: {
    location: async (parent) => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', parent.locationId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    operator: async (parent) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', parent.operatorId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    cleaningReport: async (parent) => {
      const { data, error } = await supabase
        .from('cleaning_reports')
        .select('*')
        .eq('task_id', parent.id)
        .single();
      if (error && error.code !== 'PGRST116') throw new Error(error.message);
      return data;
    }
  },
  
  CleaningReport: {
    task: async (parent) => {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .eq('id', parent.taskId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }
  },
  
  IoTSensor: {
    location: async (parent) => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', parent.locationId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    readings: async (parent) => {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('sensor_id', parent.id)
        .order('timestamp', { ascending: false })
        .limit(10);
      if (error) throw new Error(error.message);
      return data;
    }
  },
  
  SensorReading: {
    sensor: async (parent) => {
      const { data, error } = await supabase
        .from('iot_sensors')
        .select('*')
        .eq('id', parent.sensorId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    }
  },
  
  Notification: {
    user: async (parent) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', parent.userId)
        .single();
<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>