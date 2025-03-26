// File: src/pages/dashboard.js
import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import StatCard from '../components/StatCard';
import TasksChart from '../components/TasksChart';
import QualityScoreChart from '../components/QualityScoreChart';
import RecentTasks from '../components/RecentTasks';
import AlertsPanel from '../components/AlertsPanel';

export default function Dashboard() {
  const { supabase } = useSupabase();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    averageQualityScore: 0,
    tasksByPriority: [],
    tasksByStatus: [],
    recentNotifications: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // In un'implementazione reale, questi dati verrebbero recuperati dall'API GraphQL
        // Per ora, utilizziamo dati di esempio
        
        // Simulazione di caricamento dati
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const dashboardData = {
          totalTasks: 156,
          completedTasks: 124,
          pendingTasks: 32,
          averageQualityScore: 0.87,
          tasksByPriority: [
            { priority: 'low', count: 45 },
            { priority: 'medium', count: 78 },
            { priority: 'high', count: 25 },
            { priority: 'urgent', count: 8 }
          ],
          tasksByStatus: [
            { status: 'pending', count: 32 },
            { status: 'in_progress', count: 18 },
            { status: 'completed', count: 124 },
            { status: 'cancelled', count: 4 }
          ],
          recentTasks: [
            { id: 1, title: 'Pulizia uffici piano 3', location: 'Sede centrale', status: 'completed', priority: 'high', scheduledAt: '2025-03-24T14:00:00Z', completedAt: '2025-03-24T15:30:00Z', qualityScore: 0.92 },
            { id: 2, title: 'Sanificazione area break', location: 'Filiale Nord', status: 'completed', priority: 'medium', scheduledAt: '2025-03-24T10:00:00Z', completedAt: '2025-03-24T11:15:00Z', qualityScore: 0.85 },
            { id: 3, title: 'Pulizia vetrate esterne', location: 'Sede centrale', status: 'in_progress', priority: 'medium', scheduledAt: '2025-03-25T09:00:00Z', completedAt: null, qualityScore: null },
            { id: 4, title: 'Pulizia straordinaria magazzino', location: 'Deposito Sud', status: 'pending', priority: 'urgent', scheduledAt: '2025-03-26T08:00:00Z', completedAt: null, qualityScore: null },
            { id: 5, title: 'Manutenzione pavimenti', location: 'Filiale Est', status: 'pending', priority: 'low', scheduledAt: '2025-03-27T13:00:00Z', completedAt: null, qualityScore: null }
          ],
          recentAlerts: [
            { id: 1, title: 'Livello umidità elevato', location: 'Sede centrale - Piano 2', sensorType: 'humidity', value: '85%', timestamp: '2025-03-25T05:45:12Z', severity: 'high' },
            { id: 2, title: 'Livello sporco critico', location: 'Filiale Nord - Bagni', sensorType: 'dirt_level', value: '78%', timestamp: '2025-03-25T04:30:45Z', severity: 'urgent' },
            { id: 3, title: 'Temperatura elevata', location: 'Deposito Sud - Area server', sensorType: 'temperature', value: '32°C', timestamp: '2025-03-25T03:15:22Z', severity: 'medium' }
          ]
        };
        
        setStats(dashboardData);
        setLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei dati della dashboard:', error);
        setError('Si è verificato un errore nel caricamento dei dati. Riprova più tardi.');
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Errore!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Panoramica delle attività di pulizia e metriche chiave
        </p>
      </div>

      {/* Statistiche principali */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Attività Totali" 
          value={stats.totalTasks} 
          icon="tasks" 
          color="blue"
        />
        <StatCard 
          title="Completate" 
          value={stats.completedTasks} 
          icon="check" 
          color="green"
        />
        <StatCard 
          title="In Attesa" 
          value={stats.pendingTasks} 
          icon="clock" 
          color="yellow"
        />
        <StatCard 
          title="Qualità Media" 
          value={`${Math.round(stats.averageQualityScore * 100)}%`} 
          icon="star" 
          color="purple"
        />
      </div>

      {/* Grafici */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Distribuzione Attività</h2>
          <TasksChart 
            tasksByStatus={stats.tasksByStatus} 
            tasksByPriority={stats.tasksByPriority} 
          />
        </div>
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Punteggio Qualità</h2>
          <QualityScoreChart 
            completionRate={completionRate} 
            qualityScore={stats.averageQualityScore} 
          />
        </div>
      </div>

      {/* Attività recenti e Avvisi */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Attività Recenti</h2>
          <RecentTasks tasks={stats.recentTasks} />
        </div>
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Avvisi Sensori IoT</h2>
          <AlertsPanel alerts={stats.recentAlerts} />
        </div>
      </div>
    </div>
  );
}
