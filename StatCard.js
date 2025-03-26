// File: src/components/StatCard.js
import { 
  ClipboardDocumentCheckIcon as ClipboardCheckIcon, 
  ClockIcon, 
  CheckIcon, 
  StarIcon 
} from '@heroicons/react/24/outline';

// Componente per le card statistiche nella dashboard
export default function StatCard({ title, value, icon, color }) {
  // Funzione per determinare l'icona in base al parametro
  const getIcon = () => {
    switch (icon) {
      case 'tasks':
        return <ClipboardCheckIcon className="h-6 w-6" />;
      case 'clock':
        return <ClockIcon className="h-6 w-6" />;
      case 'check':
        return <CheckIcon className="h-6 w-6" />;
      case 'star':
        return <StarIcon className="h-6 w-6" />;
      default:
        return <ClipboardCheckIcon className="h-6 w-6" />;
    }
  };

  // Funzione per determinare il colore in base al parametro
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'green':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'purple':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100';
      case 'red':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  return (
    <div className="card flex items-center">
      <div className={`p-3 rounded-full ${getColorClasses()}`}>
        {getIcon()}
      </div>
      <div className="ml-5">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
          {title}
        </p>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}
