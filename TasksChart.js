// File: src/components/TasksChart.js
import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrazione dei componenti necessari per Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function TasksChart({ tasksByStatus, tasksByPriority }) {
  const [activeChart, setActiveChart] = useState('status');

  // Configurazione dati per il grafico dello stato delle attività
  const statusChartData = {
    labels: tasksByStatus.map(item => {
      // Traduzione degli stati per l'interfaccia in italiano
      const statusLabels = {
        'pending': 'In Attesa',
        'in_progress': 'In Corso',
        'completed': 'Completate',
        'cancelled': 'Annullate'
      };
      return statusLabels[item.status] || item.status;
    }),
    datasets: [
      {
        data: tasksByStatus.map(item => item.count),
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)',  // arancione per pending
          'rgba(54, 162, 235, 0.7)',   // blu per in_progress
          'rgba(75, 192, 192, 0.7)',   // verde per completed
          'rgba(201, 203, 207, 0.7)'   // grigio per cancelled
        ],
        borderColor: [
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(75, 192, 192)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Configurazione dati per il grafico della priorità delle attività
  const priorityChartData = {
    labels: tasksByPriority.map(item => {
      // Traduzione delle priorità per l'interfaccia in italiano
      const priorityLabels = {
        'low': 'Bassa',
        'medium': 'Media',
        'high': 'Alta',
        'urgent': 'Urgente'
      };
      return priorityLabels[item.priority] || item.priority;
    }),
    datasets: [
      {
        data: tasksByPriority.map(item => item.count),
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',   // verde per low
          'rgba(255, 205, 86, 0.7)',   // giallo per medium
          'rgba(255, 159, 64, 0.7)',   // arancione per high
          'rgba(255, 99, 132, 0.7)'    // rosso per urgent
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 205, 86)',
          'rgb(255, 159, 64)',
          'rgb(255, 99, 132)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Opzioni comuni per entrambi i grafici
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="h-80">
      {/* Tabs per selezionare il tipo di grafico */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeChart === 'status'
              ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveChart('status')}
        >
          Per Stato
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeChart === 'priority'
              ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveChart('priority')}
        >
          Per Priorità
        </button>
      </div>

      {/* Contenitore del grafico */}
      <div className="h-64">
        {activeChart === 'status' ? (
          <Pie data={statusChartData} options={chartOptions} />
        ) : (
          <Pie data={priorityChartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}
