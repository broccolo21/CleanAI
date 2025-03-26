# Implementazione PyTorch per backend di CleanAI
# Questo file contiene l'implementazione degli algoritmi di ottimizzazione operativa

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
import os
import json
from datetime import datetime, timedelta

class OperationalOptimizer:
    """
    Classe per l'ottimizzazione operativa delle attività di pulizia
    Utilizza PyTorch per implementare modelli predittivi che ottimizzano
    la pianificazione e l'allocazione delle risorse
    """
    
    def __init__(self, model_path=None):
        """
        Inizializza l'ottimizzatore operativo
        
        Args:
            model_path: Percorso al modello pre-addestrato (opzionale)
        """
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Utilizzo dispositivo: {self.device}")
        
        # Definizione del modello
        self.model = None
        self.scaler = StandardScaler()
        
        # Carica il modello se specificato
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        
        print("Inizializzazione OperationalOptimizer completata")
    
    def load_model(self, model_path):
        """
        Carica un modello pre-addestrato
        
        Args:
            model_path: Percorso al modello
        """
        try:
            checkpoint = torch.load(model_path, map_location=self.device)
            self.model = PredictiveModel(
                input_size=checkpoint['input_size'],
                hidden_size=checkpoint['hidden_size'],
                output_size=checkpoint['output_size']
            )
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.model.to(self.device)
            self.model.eval()
            
            # Carica anche lo scaler
            if 'scaler_mean' in checkpoint and 'scaler_scale' in checkpoint:
                self.scaler.mean_ = checkpoint['scaler_mean']
                self.scaler.scale_ = checkpoint['scaler_scale']
            
            print(f"Modello caricato da {model_path}")
        except Exception as e:
            print(f"Errore nel caricamento del modello: {e}")
            # Creiamo un modello di default
            self.model = PredictiveModel(input_size=10, hidden_size=20, output_size=3)
            self.model.to(self.device)
            self.model.eval()
    
    def preprocess_data(self, data):
        """
        Preprocessa i dati per l'addestramento o l'inferenza
        
        Args:
            data: DataFrame con i dati delle attività di pulizia
            
        Returns:
            Dati preprocessati
        """
        # Estrai le feature rilevanti
        features = self._extract_features(data)
        
        # Normalizza i dati
        if features is not None:
            normalized_features = self.scaler.fit_transform(features)
            return normalized_features
        
        return None
    
    def _extract_features(self, data):
        """
        Estrae le feature dai dati grezzi
        
        Args:
            data: DataFrame con i dati delle attività di pulizia
            
        Returns:
            Array di feature
        """
        try:
            if isinstance(data, pd.DataFrame):
                # Estrai le feature rilevanti
                features = []
                
                for _, row in data.iterrows():
                    # Converti le date in timestamp
                    if 'scheduled_at' in row:
                        scheduled_at = pd.to_datetime(row['scheduled_at']).timestamp()
                    else:
                        scheduled_at = datetime.now().timestamp()
                    
                    # Estrai altre feature
                    location_size = row.get('location_size', 100)
                    priority = self._encode_priority(row.get('priority', 'medium'))
                    task_type = self._encode_task_type(row.get('task_type', 'regular'))
                    last_cleaned = row.get('days_since_last_cleaned', 7)
                    foot_traffic = row.get('foot_traffic', 50)
                    humidity = row.get('humidity', 50)
                    temperature = row.get('temperature', 22)
                    dirt_level = row.get('dirt_level', 0.5)
                    staff_available = row.get('staff_available', 5)
                    
                    # Combina le feature
                    feature_vector = [
                        scheduled_at, location_size, priority, task_type,
                        last_cleaned, foot_traffic, humidity, temperature,
                        dirt_level, staff_available
                    ]
                    
                    features.append(feature_vector)
                
                return np.array(features)
            else:
                # Gestisci il caso di un singolo record
                feature_vector = [
                    data.get('scheduled_at', datetime.now().timestamp()),
                    data.get('location_size', 100),
                    self._encode_priority(data.get('priority', 'medium')),
                    self._encode_task_type(data.get('task_type', 'regular')),
                    data.get('days_since_last_cleaned', 7),
                    data.get('foot_traffic', 50),
                    data.get('humidity', 50),
                    data.get('temperature', 22),
                    data.get('dirt_level', 0.5),
                    data.get('staff_available', 5)
                ]
                
                return np.array([feature_vector])
        except Exception as e:
            print(f"Errore nell'estrazione delle feature: {e}")
            return None
    
    def _encode_priority(self, priority):
        """
        Codifica la priorità in un valore numerico
        
        Args:
            priority: Priorità dell'attività (low, medium, high, urgent)
            
        Returns:
            Valore numerico
        """
        priority_map = {
            'low': 0.25,
            'medium': 0.5,
            'high': 0.75,
            'urgent': 1.0
        }
        return priority_map.get(priority.lower(), 0.5)
    
    def _encode_task_type(self, task_type):
        """
        Codifica il tipo di attività in un valore numerico
        
        Args:
            task_type: Tipo di attività (regular, deep, sanitization)
            
        Returns:
            Valore numerico
        """
        type_map = {
            'regular': 0.33,
            'deep': 0.66,
            'sanitization': 1.0
        }
        return type_map.get(task_type.lower(), 0.33)
    
    def train_model(self, training_data, target_data, epochs=100, batch_size=32, learning_rate=0.001):
        """
        Addestra il modello predittivo
        
        Args:
            training_data: Dati di addestramento
            target_data: Target per l'addestramento
            epochs: Numero di epoche
            batch_size: Dimensione del batch
            learning_rate: Tasso di apprendimento
            
        Returns:
            Storico dell'addestramento
        """
        try:
            # Preprocessa i dati
            X = self.preprocess_data(training_data)
            y = np.array(target_data)
            
            # Dividi in training e validation
            X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Converti in tensori PyTorch
            X_train = torch.FloatTensor(X_train).to(self.device)
            y_train = torch.FloatTensor(y_train).to(self.device)
            X_val = torch.FloatTensor(X_val).to(self.device)
            y_val = torch.FloatTensor(y_val).to(self.device)
            
            # Crea il modello
            input_size = X_train.shape[1]
            output_size = y_train.shape[1] if len(y_train.shape) > 1 else 1
            hidden_size = 20
            
            self.model = PredictiveModel(input_size, hidden_size, output_size)
            self.model.to(self.device)
            
            # Definisci la funzione di perdita e l'ottimizzatore
            criterion = nn.MSELoss()
            optimizer = optim.Adam(self.model.parameters(), lr=learning_rate)
            
            # Addestra il modello
            history = {
                'train_loss': [],
                'val_loss': []
            }
            
            for epoch in range(epochs):
                # Training
                self.model.train()
                train_loss = 0
                
                # Implementazione semplificata senza batching
                optimizer.zero_grad()
                outputs = self.model(X_train)
                loss = criterion(outputs, y_train)
                loss.backward()
                optimizer.step()
                
                train_loss = loss.item()
                
                # Validation
                self.model.eval()
                with torch.no_grad():
                    val_outputs = self.model(X_val)
                    val_loss = criterion(val_outputs, y_val).item()
                
                # Salva le metriche
                history['train_loss'].append(train_loss)
                history['val_loss'].append(val_loss)
                
                if (epoch + 1) % 10 == 0:
                    print(f'Epoch {epoch+1}/{epochs}, Train Loss: {train_loss:.4f}, Val Loss: {val_loss:.4f}')
            
            print("Addestramento completato")
            return history
            
        except Exception as e:
            print(f"Errore nell'addestramento del modello: {e}")
            return None
    
    def save_model(self, model_path):
        """
        Salva il modello addestrato
        
        Args:
            model_path: Percorso dove salvare il modello
        """
        if self.model is None:
            print("Nessun modello da salvare")
            return
        
        try:
            # Crea il dizionario con i parametri del modello
            checkpoint = {
                'model_state_dict': self.model.state_dict(),
                'input_size': self.model.input_size,
                'hidden_size': self.model.hidden_size,
                'output_size': self.model.output_size,
                'scaler_mean': self.scaler.mean_ if hasattr(self.scaler, 'mean_') else None,
                'scaler_scale': self.scaler.scale_ if hasattr(self.scaler, 'scale_') else None
            }
            
            # Salva il modello
            torch.save(checkpoint, model_path)
            print(f"Modello salvato in {model_path}")
        except Exception as e:
            print(f"Errore nel salvataggio del modello: {e}")
    
    def predict(self, data):
        """
        Esegue predizioni utilizzando il modello addestrato
        
        Args:
            data: Dati per la predizione
            
        Returns:
            Predizioni
        """
        if self.model is None:
            print("Nessun modello disponibile per la predizione")
            return self._simulate_prediction(data)
        
        try:
            # Preprocessa i dati
            X = self.preprocess_data(data)
            
            if X is None:
                return self._simulate_prediction(data)
            
            # Converti in tensore PyTorch
            X_tensor = torch.FloatTensor(X).to(self.device)
            
            # Esegui la predizione
            self.model.eval()
            with torch.no_grad():
                predictions = self.model(X_tensor)
            
            # Converti in numpy array
            predictions = predictions.cpu().numpy()
            
            return predictions
            
        except Exception as e:
            print(f"Errore nella predizione: {e}")
            return self._simulate_prediction(data)
    
    def _simulate_prediction(self, data):
        """
        Simula una predizione per scopi dimostrativi
        
        Args:
            data: Dati per la predizione
            
        Returns:
            Predizioni simulate
        """
        print("Utilizzo predizione simulata per demo")
        
        # Determina il numero di record
        if isinstance(data, pd.DataFrame):
            num_records = len(data)
        else:
            num_records = 1
        
        # Genera predizioni simulate
        # [durata stimata, punteggio qualità previsto, priorità suggerita]
        predictions = []
        
        for i in range(num_records):
            # Estrai alcune feature se disponibili
            if isinstance(data, pd.DataFrame) and i < len(data):
                row = data.iloc[i]
                location_size = row.get('location_size', 100)
                priority = self._encode_priority(row.get('priority', 'medium'))
                task_type = self._encode_task_type(row.get('task_type', 'regular'))
                dirt_level = row.get('dirt_level', 0.5)
            else:
                # Valori di default
                location_size = 100
                priority = 0.5
                task_type = 0.33
                dirt_level = 0.5
            
            # Calcola la durata stimata (in minuti)
            estimated_duration = (location_size / 10) * (task_type * 2) * (dirt_level + 0.5)
            estimated_duration = max(30, min(180, estimated_duration))
            
            # Calcola il punteggio di qualità previsto (0-1)
            expected_quality = 0.7 + (0.3 * (1 - dirt_level))
            expected_quality = max(0.6, min(0.95, expected_quality))
            
            # Calcola la priorità suggerita (0-1)
            suggested_priority = (priority * 0.5) + (dirt_level * 0.5)
            suggested_priority = max(0.1, min(0.9, suggested_priority))
            
            predictions.append([estimated_duration, expected_quality, suggested_priority])
        
        return np.array(predictions)
    
    def optimize_schedule(self, tasks, staff_count, start_date, end_date):
        """
        Ottimizza la pianificazione delle attività di pulizia
        
        Args:
            tasks: Lista di attività da pianificare
            staff_count: Numero di operatori disponibili
            start_date: Data di inizio della pianificazione
            end_date: Data di fine della pianificazione
            
        Returns:
            Pianificazione ottimizzata
        """
        try:
            # Converti le date in datetime
            if isinstance(start_date, str):
                start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            if isinstance(end_date, str):
                end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            
            # Calcola il numero di giorni disponibili
            days_available = (end_date - start_date).days + 1
            
            # Prepara i dati per la predizione
            tasks_df = pd.DataFrame(tasks)
            
            # Aggiungi la colonna staff_available
            tasks_df['staff_available'] = staff_count
            
            # Esegui la predizione per ottenere durata e priorità
            predictions = self.predict(tasks_df)
            
            # Aggiungi le predizioni al DataFrame
            tasks_df['estimated_duration'] = predictions[:, 0]
            tasks_df['expected_quality'] = predictions[:, 1]
            tasks_df['suggested_priority'] = predictions[:, 2]
            
            # Converti la priorità suggerita in una categoria
            def priority_to_category(priority):
                if priority >= 0.75:
                    return 'urgent'
                elif priority >= 0.5:
                    return 'high'
                elif priority >= 0.25:
              <response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>