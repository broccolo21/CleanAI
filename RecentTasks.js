// File: src/components/RecentTasks.js
import { CheckBadgeIcon as BadgeCheckIcon, ClockIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function RecentTasks({ tasks }) {
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

  // Funzione per determinare il colore del badge di stato
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Funzione per tradurre lo stato in italiano
  const translateStatus = (status) => {
    const statusMap = {
      'completed': 'Completata',
      'in_progress': 'In Corso',
      'pending': 'In Attesa',
      'cancelled': 'Annullata'
    };
    return statusMap[status] || status;
  };

  // Funzione per determinare il colore del badge di priorità
  const getPriorityColor = (priority) => {
    switch (priority) {
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

  // Funzione per tradurre la priorità in italiano
  const translatePriority = (priority) => {
    const priorityMap = {
      'low': 'Bassa',
      'medium': 'Media',
      'high': 'Alta',
      'urgent': 'Urgente'
    };
    return priorityMap[priority] || priority;
  };

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li key={task.id} className="py-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {task.status === 'completed' ? (
                    <BadgeCheckIcon className="h-8 w-8 text-green-500" />
                  ) : (
                    <ClockIcon className="h-8 w-8 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {task.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {task.location}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                    {translateStatus(task.status)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                    {translatePriority(task.priority)}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Programmata: {formatDate(task.scheduledAt)}</span>
                {task.completedAt && (
                  <span>Completata: {formatDate(task.completedAt)}</span>
                )}
                {task.qualityScore && (
                  <span>Qualità: {Math.round(task.qualityScore * 100)}%</span>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className="py-4 text-center text-gray-500 dark:text-gray-400">
            Nessuna attività recente da visualizzare
          </li>
        )}
      </ul>
      <div className="mt-4 text-center">
        <Link href="/tasks">
          <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-50 hover:bg-primary-100 dark:text-primary-400 dark:bg-gray-700 dark:hover:bg-gray-600">
            Visualizza tutte le attività
          </span>
        </Link>
      </div>
    </div>
  );
}
