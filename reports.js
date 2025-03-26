// File: src/pages/reports.js
import { useState, useEffect } from 'react';
import { useSupabase } from '../contexts/SupabaseContext';
import { 
  CalendarIcon, 
  DocumentReportIcon, 
  DownloadIcon,
  FilterIcon
} from '@heroicons/react/outline';

export default function Reports() {
  const { supabase } = useSupabase();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    location: 'all',
    minQuality: 0
  });

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        
        // In un'implementazione reale, questi dati verrebbero recuperati dall'API
        // Per ora, utilizziamo dati di esempio
        
        // Simulazione di caricamento dati
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockReports = [
          {
            id: 1,
            taskId: 101,
            taskTitle: 'Pulizia uffici piano 3',
            location: 'Sede centrale',
            operator: 'Mario Rossi',
            beforeImageUrl: '/images/before1.jpg',
            afterImageUrl: '/images/after1.jpg',
            qualityScore: 0.92,
            notes: 'Pulizia completata con successo. Particolare attenzione alle aree comuni.',
            duration: 90,
            createdAt: '2025-03-24T15:30:00Z'
          },
          {
            id: 2,
            taskId: 102,
            taskTitle: 'Sanificazione area break',
            location: 'Filiale Nord',
            operator: 'Giulia Bianchi',
            beforeImageUrl: '/images/before2.jpg',
            afterImageUrl: '/images/after2.jpg',
            qualityScore: 0.85,
            notes: 'Sanificazione completata. Necessario monitorare l\'area nei prossimi giorni.',
            duration: 75,
            createdAt: '2025-03-24T11:15:00Z'
          },
          {
            id: 3,
            taskId: 103,
            taskTitle: 'Pulizia bagni piano terra',
            location: 'Sede centrale',
            operator: 'Luca Verdi',
            beforeImageUrl: '/images/before3.jpg',
            afterImageUrl: '/images/after3.jpg',
            qualityScore: 0.78,
            notes: 'Pulizia completata. Alcune aree richiedono maggiore attenzione nelle prossime sessioni.',
            duration: 60,
            createdAt: '2025-03-23T16:45:00Z'
          },
          {
            id: 4,
            taskId: 104,
            taskTitle: 'Pulizia vetrate ingresso',
            location: 'Filiale Est',
            operator: 'Anna Neri',
            beforeImageUrl: '/images/before4.jpg',
            afterImageUrl: '/images/after4.jpg',
            qualityScore: 0.95,
            notes: 'Pulizia eccellente. Tutte le vetrate sono state pulite a fondo.',
            duration: 120,
            createdAt: '2025-03-22T14:30:00Z'
          },
          {
            id: 5,
            taskId: 105,
            taskTitle: 'Pulizia pavimenti area produzione',
            location: 'Stabilimento Sud',
            operator: 'Roberto Gialli',
            beforeImageUrl: '/images/before5.jpg',
            afterImageUrl: '/images/after5.jpg',
            qualityScore: 0.88,
            notes: 'Pulizia completata secondo le procedure di sicurezza. Area pronta per l\'ispezione.',
            duration: 150,
            createdAt: '2025-03-21T17:00:00Z'
          }
        ];
        
        setReports(mockReports);
        setLoading(false);
      } catch (error) {
        console.error('Errore nel caricamento dei report:', error);
        setError('Si è verificato un errore nel caricamento dei report. Riprova più tardi.');
        setLoading(false);
      }
    }
    
    fetchReports();
  }, [supabase]);

  // Funzione per filtrare i report in base ai criteri selezionati
  const filteredReports = reports.filter(report => {
    // Filtro per data
    if (filters.dateRange !== 'all') {
      const reportDate = new Date(report.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));
      
      if (filters.dateRange === 'today' && daysDiff > 0) return false;
      if (filters.dateRange === 'week' && daysDiff > 7) return false;
      if (filters.dateRange === 'month' && daysDiff > 30) return false;
    }
    
    // Filtro per location
    if (filters.location !== 'all' && report.location !== filters.location) return false;
    
    // Filtro per qualità minima
    if (report.qualityScore < filters.minQuality / 100) return false;
    
    return true;
  });

  // Funzione per formattare la data
  const formatDate = (dateString) => {
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Funzione per generare un report PDF (simulata)
  const generatePDF = (reportId) => {
    alert(`Generazione PDF per il report #${reportId} (funzionalità simulata)`);
  };

  // Funzione per esportare tutti i report filtrati (simulata)
  const exportReports = () => {
    alert(`Esportazione di ${filteredReports.length} report (funzionalità simulata)`);
  };

  // Funzione per ottenere il colore del badge di qualità
  const getQualityColor = (score) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    if (score >= 0.8) return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
  };

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

  // Estrai le location uniche per il filtro
  const locations = ['all', ...new Set(reports.map(report => report.location))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Report di Pulizia</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Visualizza e analizza i report delle attività di pulizia completate
        </p>
      </div>

      {/* Filtri */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filtri</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="dateRange" className="label">Periodo</label>
            <select
              id="dateRange"
              className="input"
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            >
              <option value="all">Tutti i periodi</option>
              <option value="today">Oggi</option>
              <option value="week">Ultima settimana</option>
              <option value="month">Ultimo mese</option>
            </select>
          </div>
          <div>
            <label htmlFor="location" className="label">Location</label>
            <select
              id="location"
              className="input"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            >
              <option value="all">Tutte le location</option>
              {locations.filter(loc => loc !== 'all').map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="minQuality" className="label">Qualità minima: {filters.minQuality}%</label>
            <input
              id="minQuality"
              type="range"
              min="0"
              max="100"
              step="5"
              className="w-full"
              value={filters.minQuality}
              onChange={(e) => setFilters({...filters, minQuality: parseInt(e.target.value)})}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({dateRange: 'all', location: 'all', minQuality: 0})}
            className="btn btn-outline mr-2"
          >
            Reimposta filtri
          </button>
          <button
            onClick={exportReports}
            className="btn btn-primary flex items-center"
          >
            <DownloadIcon className="h-5 w-5 mr-1" />
            Esporta report
          </button>
        </div>
      </div>

      {/* Lista report */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Report ({filteredReports.length})
        </h2>
        
        {filteredReports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Attività
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Operatore
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Qualità
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Durata
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      #{report.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {report.taskTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {report.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {report.operator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getQualityColor(report.qualityScore)}`}>
                        {Math.round(report.qualityScore * 100)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {report.duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => generatePDF(report.id)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <DownloadIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Nessun report trovato con i filtri selezionati
          </div>
        )}
      </div>
    </div>
  );
}