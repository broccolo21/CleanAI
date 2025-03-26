// File: src/components/BeforeAfterAnalysis.js
import React, { useState, useEffect } from 'react';
import TensorflowIntegration from './TensorflowIntegration';

/**
 * Componente per l'analisi visiva prima/dopo delle superfici pulite
 * Questo componente gestisce il caricamento delle immagini, l'analisi e la visualizzazione dei risultati
 */
const BeforeAfterAnalysis = ({ onAnalysisComplete }) => {
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [beforeImageUrl, setBeforeImageUrl] = useState('');
  const [afterImageUrl, setAfterImageUrl] = useState('');
  const [beforePrediction, setBeforePrediction] = useState(null);
  const [afterPrediction, setAfterPrediction] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Gestisce il caricamento dell'immagine "prima"
  const handleBeforeImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBeforeImage(file);
        setBeforeImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestisce il caricamento dell'immagine "dopo"
  const handleAfterImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAfterImage(file);
        setAfterImageUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestisce la predizione dell'immagine "prima"
  const handleBeforePrediction = (prediction) => {
    setBeforePrediction(prediction);
    
    // Se entrambe le predizioni sono disponibili, confronta i risultati
    if (afterPrediction) {
      compareResults(prediction, afterPrediction);
    }
  };

  // Gestisce la predizione dell'immagine "dopo"
  const handleAfterPrediction = (prediction) => {
    setAfterPrediction(prediction);
    
    // Se entrambe le predizioni sono disponibili, confronta i risultati
    if (beforePrediction) {
      compareResults(beforePrediction, prediction);
    }
  };

  // Confronta i risultati delle due predizioni
  const compareResults = (before, after) => {
    try {
      setLoading(true);
      
      // Estrai i punteggi di pulizia
      const beforeScore = before.cleanlinessScore ? before.cleanlinessScore.arraySync() : 0.5;
      const afterScore = after.cleanlinessScore ? after.cleanlinessScore.arraySync() : 0.8;
      
      // Calcola il miglioramento
      const improvement = afterScore - beforeScore;
      const improvementPercentage = improvement * 100;
      
      // Determina la qualità del miglioramento
      let qualityLabel;
      if (improvementPercentage >= 50) {
        qualityLabel = 'eccellente';
      } else if (improvementPercentage >= 30) {
        qualityLabel = 'ottimo';
      } else if (improvementPercentage >= 20) {
        qualityLabel = 'buono';
      } else if (improvementPercentage >= 10) {
        qualityLabel = 'discreto';
      } else if (improvementPercentage > 0) {
        qualityLabel = 'minimo';
      } else {
        qualityLabel = 'nessun miglioramento';
      }
      
      // Crea il risultato del confronto
      const result = {
        beforeScore,
        afterScore,
        improvement,
        improvementPercentage,
        qualityLabel,
        timestamp: new Date().toISOString()
      };
      
      setComparisonResult(result);
      
      // Notifica il componente padre
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Errore nel confronto dei risultati:', err);
      setError(`Errore nel confronto dei risultati: ${err.message}`);
      setLoading(false);
    }
  };

  // Resetta l'analisi
  const resetAnalysis = () => {
    setBeforeImage(null);
    setAfterImage(null);
    setBeforeImageUrl('');
    setAfterImageUrl('');
    setBeforePrediction(null);
    setAfterPrediction(null);
    setComparisonResult(null);
    setError(null);
  };

  // Invia i risultati al server
  const saveResults = async () => {
    if (!comparisonResult) return;
    
    try {
      setLoading(true);
      
      // Prepara i dati da inviare
      const formData = new FormData();
      formData.append('beforeImage', beforeImage);
      formData.append('afterImage', afterImage);
      formData.append('comparisonResult', JSON.stringify(comparisonResult));
      
      // In un'implementazione reale, qui ci sarebbe una chiamata API
      // Per ora, simuliamo una chiamata API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Risultati salvati con successo');
      
      setLoading(false);
      
      // Resetta l'analisi dopo il salvataggio
      resetAnalysis();
    } catch (err) {
      console.error('Errore nel salvataggio dei risultati:', err);
      setError(`Errore nel salvataggio dei risultati: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="before-after-analysis">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Analisi Visiva Prima/Dopo
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sezione "Prima" */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Prima della Pulizia
          </h3>
          
          <div className="mb-4">
            <label className="label">Carica immagine "prima"</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleBeforeImageUpload}
              className="input"
            />
          </div>
          
          {beforeImageUrl && (
            <div className="mt-4">
              <TensorflowIntegration
                imageUrl={beforeImageUrl}
                onPrediction={handleBeforePrediction}
              />
            </div>
          )}
        </div>
        
        {/* Sezione "Dopo" */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Dopo la Pulizia
          </h3>
          
          <div className="mb-4">
            <label className="label">Carica immagine "dopo"</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAfterImageUpload}
              className="input"
            />
          </div>
          
          {afterImageUrl && (
            <div className="mt-4">
              <TensorflowIntegration
                imageUrl={afterImageUrl}
                onPrediction={handleAfterPrediction}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Risultati del confronto */}
      {comparisonResult && (
        <div className="card mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Risultati dell'Analisi
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Punteggio Prima
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(comparisonResult.beforeScore * 100).toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Punteggio Dopo
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(comparisonResult.afterScore * 100).toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Miglioramento
              </p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                +{comparisonResult.improvementPercentage.toFixed(1)}%
              </p>
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4">
            <p className="text-gray-900 dark:text-white">
              <span className="font-medium">Valutazione:</span> Miglioramento {comparisonResult.qualityLabel} della qualità della pulizia.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Analisi completata il {new Date(comparisonResult.timestamp).toLocaleString('it-IT')}
            </p>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={resetAnalysis}
              className="btn btn-outline"
            >
              Nuova Analisi
            </button>
            <button
              onClick={saveResults}
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvataggio...' : 'Salva Risultati'}
            </button>
          </div>
        </div>
      )}
      
      {/* Messaggio di errore */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">Errore!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
    </div>
  );
};

export default BeforeAfterAnalysis;
