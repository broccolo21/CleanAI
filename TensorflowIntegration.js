// File: src/components/TensorflowIntegration.js
import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

/**
 * Componente per l'integrazione di TensorFlow.js nel frontend di CleanAI
 * Questo componente gestisce il caricamento dei modelli e l'inferenza lato client
 */
const TensorflowIntegration = ({ modelUrl, imageUrl, onPrediction }) => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // Carica il modello TensorFlow.js
  useEffect(() => {
    async function loadModel() {
      try {
        setLoading(true);
        
        // In un'implementazione reale, caricherebbe un modello da un URL
        // Per ora, utilizziamo un modello simulato per dimostrare la funzionalità
        if (modelUrl) {
          console.log(`Caricamento modello da ${modelUrl}...`);
          const loadedModel = await tf.loadGraphModel(modelUrl);
          setModel(loadedModel);
          console.log('Modello caricato con successo');
        } else {
          console.log('Creazione modello simulato per demo...');
          // Crea un modello simulato per demo
          const demoModel = {
            predict: async (tensor) => {
              // Simula una predizione
              return tf.tidy(() => {
                // Estrai alcune caratteristiche semplici dall'immagine
                const mean = tensor.mean();
                const std = tf.moments(tensor).variance.sqrt();
                
                // Simula un punteggio di pulizia basato su queste caratteristiche
                const cleanlinessScore = tf.scalar(0.8 + Math.random() * 0.2);
                
                // Simula rilevazioni di sporco
                const numDetections = Math.floor(Math.random() * 5);
                const boxes = [];
                const scores = [];
                const classes = [];
                
                for (let i = 0; i < numDetections; i++) {
                  // Box casuali [y1, x1, y2, x2]
                  boxes.push([
                    Math.random() * 0.8,
                    Math.random() * 0.8,
                    Math.random() * 0.2 + 0.8,
                    Math.random() * 0.2 + 0.8
                  ]);
                  
                  // Punteggi casuali
                  scores.push(0.6 + Math.random() * 0.4);
                  
                  // Classi casuali (0-7)
                  classes.push(Math.floor(Math.random() * 8));
                }
                
                return {
                  boxes: tf.tensor2d(boxes),
                  scores: tf.tensor1d(scores),
                  classes: tf.tensor1d(classes),
                  cleanlinessScore: cleanlinessScore
                };
              });
            }
          };
          
          setModel(demoModel);
          console.log('Modello simulato creato per demo');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Errore nel caricamento del modello:', err);
        setError(`Errore nel caricamento del modello: ${err.message}`);
        setLoading(false);
      }
    }
    
    loadModel();
    
    // Cleanup
    return () => {
      if (model && model.dispose) {
        model.dispose();
      }
    };
  }, [modelUrl]);

  // Esegui la predizione quando l'immagine cambia
  useEffect(() => {
    if (!model || !imageUrl) return;
    
    async function runPrediction() {
      try {
        setLoading(true);
        
        // Carica l'immagine
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;
        
        img.onload = async () => {
          // Converti l'immagine in un tensore
          const tensor = tf.browser.fromPixels(img)
            .resizeNearestNeighbor([640, 640]) // Ridimensiona a 640x640
            .toFloat()
            .expandDims(0); // Aggiungi la dimensione del batch
          
          // Normalizza i valori dei pixel
          const normalized = tensor.div(tf.scalar(255));
          
          // Esegui la predizione
          const result = await model.predict(normalized);
          
          // Visualizza i risultati
          visualizePrediction(img, result);
          
          // Salva la predizione
          setPrediction(result);
          
          // Notifica il componente padre
          if (onPrediction) {
            onPrediction(result);
          }
          
          // Rilascia le risorse
          tensor.dispose();
          normalized.dispose();
          
          setLoading(false);
        };
        
        img.onerror = (err) => {
          setError(`Errore nel caricamento dell'immagine: ${err.message}`);
          setLoading(false);
        };
        
        // Salva il riferimento all'immagine
        imageRef.current = img;
        
      } catch (err) {
        console.error('Errore nell\'esecuzione della predizione:', err);
        setError(`Errore nell'esecuzione della predizione: ${err.message}`);
        setLoading(false);
      }
    }
    
    runPrediction();
  }, [model, imageUrl, onPrediction]);

  // Visualizza la predizione sul canvas
  const visualizePrediction = (image, prediction) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Imposta le dimensioni del canvas
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Disegna l'immagine
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    
    // Disegna i box di rilevamento
    if (prediction.boxes && prediction.scores && prediction.classes) {
      const boxes = prediction.boxes.arraySync();
      const scores = prediction.scores.arraySync();
      const classes = prediction.classes.arraySync();
      
      // Classi per il rilevamento di sporco e superfici
      const classNames = [
        'clean_surface', 'dirty_surface', 'dust', 'stain', 
        'liquid_spill', 'trash', 'scratch', 'mold'
      ];
      
      // Colori per le diverse classi
      const colors = [
        'rgba(0, 255, 0, 0.7)',    // verde per clean_surface
        'rgba(255, 0, 0, 0.7)',    // rosso per dirty_surface
        'rgba(0, 0, 255, 0.7)',    // blu per dust
        'rgba(255, 0, 255, 0.7)',  // magenta per stain
        'rgba(0, 255, 255, 0.7)',  // ciano per liquid_spill
        'rgba(255, 255, 0, 0.7)',  // giallo per trash
        'rgba(128, 0, 128, 0.7)',  // viola per scratch
        'rgba(0, 128, 128, 0.7)'   // marrone per mold
      ];
      
      // Disegna i box
      for (let i = 0; i < boxes.length; i++) {
        if (scores[i] > 0.5) { // Soglia di confidenza
          const [y1, x1, y2, x2] = boxes[i];
          const classId = Math.floor(classes[i]);
          const className = classNames[classId] || `class_${classId}`;
          const color = colors[classId] || 'rgba(255, 255, 255, 0.7)';
          
          // Converti le coordinate normalizzate in pixel
          const x = x1 * canvas.width;
          const y = y1 * canvas.height;
          const width = (x2 - x1) * canvas.width;
          const height = (y2 - y1) * canvas.height;
          
          // Disegna il box
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          
          // Disegna l'etichetta
          ctx.fillStyle = color;
          ctx.font = '14px Arial';
          ctx.fillText(`${className}: ${scores[i].toFixed(2)}`, x, y - 5);
        }
      }
      
      // Disegna il punteggio di pulizia
      if (prediction.cleanlinessScore) {
        const score = prediction.cleanlinessScore.arraySync();
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.font = '16px Arial';
        ctx.fillText(`Cleanliness: ${score.toFixed(2)}`, 10, 30);
      }
    }
  };

  // Visualizza i dati di performance con tfvis
  const visualizePerformance = () => {
    if (!prediction) return;
    
    // Crea un container per la visualizzazione
    const container = { name: 'Prediction Performance', tab: 'Model' };
    
    // Visualizza il punteggio di pulizia
    if (prediction.cleanlinessScore) {
      const score = prediction.cleanlinessScore.arraySync();
      tfvis.render.barchart(
        container,
        [{ index: 'Cleanliness Score', value: score }],
        { width: 300, height: 200 }
      );
    }
    
    // Visualizza i punteggi di confidenza
    if (prediction.scores) {
      const scores = prediction.scores.arraySync();
      const data = scores.map((score, i) => ({
        index: `Detection ${i+1}`,
        value: score
      }));
      
      tfvis.render.barchart(
        { name: 'Detection Scores', tab: 'Model' },
        data,
        { width: 300, height: 200 }
      );
    }
  };

  return (
    <div className="tensorflow-integration">
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Errore!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      <div className="mt-4">
        <canvas 
          ref={canvasRef} 
          className="w-full border border-gray-300 rounded-md"
        />
      </div>
      
      {prediction && (
        <div className="mt-4">
          <button
            onClick={visualizePerformance}
            className="btn btn-primary"
          >
            Visualizza Performance
          </button>
        </div>
      )}
    </div>
  );
};

export default TensorflowIntegration;
