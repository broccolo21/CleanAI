// File: src/components/QualityScoreChart.js
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrazione dei componenti necessari per Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function QualityScoreChart({ completionRate, qualityScore }) {
  // Conversione del punteggio di qualità in percentuale
  const qualityPercentage = Math.round(qualityScore * 100);
  
  // Configurazione dati per il grafico del tasso di completamento
  const completionChartData = {
    labels: ['Completate', 'Rimanenti'],
    datasets: [
      {
        data: [completionRate, 100 - completionRate],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',  // verde per completate
          'rgba(201, 203, 207, 0.3)'  // grigio chiaro per rimanenti
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Configurazione dati per il grafico del punteggio di qualità
  const qualityChartData = {
    labels: ['Qualità', 'Margine di miglioramento'],
    datasets: [
      {
        data: [qualityPercentage, 100 - qualityPercentage],
        backgroundColor: [
          'rgba(153, 102, 255, 0.7)',  // viola per qualità
          'rgba(201, 203, 207, 0.3)'   // grigio chiaro per margine
        ],
        borderColor: [
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Opzioni comuni per entrambi i grafici
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col items-center">
        <div className="h-48 w-48 relative">
          <Doughnut data={completionChartData} options={chartOptions} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{completionRate}%</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completamento</p>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tasso di Completamento</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Percentuale di attività completate rispetto al totale
          </p>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="h-48 w-48 relative">
          <Doughnut data={qualityChartData} options={chartOptions} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{qualityPercentage}%</span>
              <p className="text-sm text-gray-500 dark:text-gray-400">Qualità</p>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Punteggio Qualità</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Valutazione media della qualità delle pulizie
          </p>
        </div>
      </div>
    </div>
  );
}
