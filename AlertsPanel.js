// File: src/components/AlertsPanel.js
import { ExclamationTriangleIcon as ExclamationIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function AlertsPanel({ alerts }) {
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

  // Funzione per determinare il colore del badge di severità
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Funzione per tradurre la severità in italiano
  const translateSeverity = (severity) => {
    const severityMap = {
      'low': 'Bassa',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return severityMap[severity] || severity;
  };

  // Funzione per ottenere l'icona del tipo di sensore
  const getSensorIcon = (sensorType) => {
    switch (sensorType) {
      case 'humidity':
        return '💧'; // Goccia d'acqua per umidità
      case 'temperature':
        return '🌡️'; // Termometro per temperatura
      case 'motion':
        return '🔄'; // Frecce circolari per movimento
      case 'air_quality':
        return '💨'; // Vento per qualità dell'aria
      case 'dirt_level':
        return '🧹'; // Scopa per livello di sporco
      default:
        return '📊'; // Grafico per default
    }
  };

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <li key={alert.id} className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-100">
                    <ExclamationIcon className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getSensorIcon(alert.sensorType)}</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {alert.title}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {alert.location}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                    {translateSeverity(alert.severity)}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.value}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Rilevato: {formatDate(alert.timestamp)}</span>
              </div>
            </li>
          ))
        ) : (
          <li className="py-4 text-center text-gray-500 dark:text-gray-400">
            Nessun avviso recente da visualizzare
          </li>
        )}
      </ul>
      <div className="mt-4 text-center">
        <Link href="/iot-sensors">
          <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 dark:text-primary-400 dark:bg-gray-700 dark:hover:bg-gray-600">
            Visualizza tutti i sensori
          </span>
        </Link>
      </div>
    </div>
  );
}
