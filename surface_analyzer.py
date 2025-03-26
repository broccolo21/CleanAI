# Implementazione del modello YOLO-NAS per analisi superfici
# Questo file contiene l'implementazione del modello di computer vision per l'analisi delle superfici

import os
import cv2
import numpy as np
import torch
from super_gradients.training import models
from PIL import Image

class SurfaceAnalyzer:
    def __init__(self, model_path=None):
        """
        Inizializza l'analizzatore di superfici con YOLO-NAS
        
        Args:
            model_path: Percorso al modello pre-addestrato (opzionale)
        """
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Utilizzo dispositivo: {self.device}")
        
        # Carica il modello YOLO-NAS
        try:
            if model_path and os.path.exists(model_path):
                # Carica un modello personalizzato se specificato
                self.model = torch.load(model_path, map_location=self.device)
                print(f"Modello caricato da {model_path}")
            else:
                # Altrimenti usa il modello pre-addestrato
                self.model = models.get("yolo_nas_s", pretrained_weights="coco")
                print("Modello YOLO-NAS pre-addestrato caricato")
            
            # Sposta il modello sul dispositivo appropriato
            self.model = self.model.to(self.device)
            # Imposta il modello in modalità valutazione
            self.model.eval()
            
            # Classi per il rilevamento di sporco e superfici
            self.classes = [
                'clean_surface', 'dirty_surface', 'dust', 'stain', 
                'liquid_spill', 'trash', 'scratch', 'mold'
            ]
            
            print("Inizializzazione SurfaceAnalyzer completata")
        except Exception as e:
            print(f"Errore nell'inizializzazione del modello: {e}")
            # In un ambiente di produzione, utilizzeremmo un modello di fallback
            # Per ora, creiamo un modello simulato per dimostrare la funzionalità
            self.model = None
            print("Utilizzo modalità simulazione per demo")
    
    def preprocess_image(self, image_path):
        """
        Preprocessa l'immagine per l'analisi
        
        Args:
            image_path: Percorso all'immagine da analizzare
            
        Returns:
            Immagine preprocessata
        """
        try:
            # Carica l'immagine
            if isinstance(image_path, str):
                image = cv2.imread(image_path)
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            else:
                # Supporta anche array numpy o oggetti PIL
                if isinstance(image_path, np.ndarray):
                    image = image_path
                    if image.shape[2] == 3:
                        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                elif isinstance(image_path, Image.Image):
                    image = np.array(image_path)
                else:
                    raise ValueError("Formato immagine non supportato")
            
            # Ridimensiona l'immagine a 640x640 (dimensione standard per YOLO)
            image_resized = cv2.resize(image, (640, 640))
            
            # Normalizza i valori dei pixel
            image_normalized = image_resized / 255.0
            
            # Converte in tensore PyTorch
            if self.model is not None:
                image_tensor = torch.from_numpy(image_normalized).permute(2, 0, 1).float().unsqueeze(0)
                image_tensor = image_tensor.to(self.device)
                return image_tensor, image
            else:
                return image_normalized, image
                
        except Exception as e:
            print(f"Errore nel preprocessamento dell'immagine: {e}")
            return None, None
    
    def analyze_surface(self, image_path):
        """
        Analizza una superficie per rilevare sporco e problemi
        
        Args:
            image_path: Percorso all'immagine da analizzare
            
        Returns:
            Dizionario con i risultati dell'analisi
        """
        try:
            # Preprocessa l'immagine
            processed_image, original_image = self.preprocess_image(image_path)
            
            if processed_image is None:
                return {"error": "Errore nel preprocessamento dell'immagine"}
            
            # Se siamo in modalità simulazione, genera risultati simulati
            if self.model is None:
                return self._simulate_analysis(original_image)
            
            # Esegui l'inferenza
            with torch.no_grad():
                predictions = self.model.predict(processed_image)
            
            # Estrai i risultati
            boxes = predictions.prediction.bboxes_xyxy
            scores = predictions.prediction.confidence
            labels = predictions.prediction.labels
            
            # Converti in lista di dizionari
            detections = []
            for i in range(len(boxes)):
                box = boxes[i].cpu().numpy()
                score = float(scores[i])
                label_idx = int(labels[i])
                label = self.classes[label_idx] if label_idx < len(self.classes) else f"class_{label_idx}"
                
                detections.append({
                    "box": box.tolist(),
                    "score": score,
                    "label": label
                })
            
            # Calcola il punteggio di pulizia
            cleanliness_score = self._calculate_cleanliness_score(detections)
            
            return {
                "detections": detections,
                "cleanliness_score": cleanliness_score,
                "analysis_summary": self._generate_analysis_summary(detections, cleanliness_score)
            }
            
        except Exception as e:
            print(f"Errore nell'analisi della superficie: {e}")
            return {"error": str(e)}
    
    def compare_before_after(self, before_image_path, after_image_path):
        """
        Confronta le immagini prima e dopo la pulizia
        
        Args:
            before_image_path: Percorso all'immagine prima della pulizia
            after_image_path: Percorso all'immagine dopo la pulizia
            
        Returns:
            Dizionario con i risultati del confronto
        """
        try:
            # Analizza entrambe le immagini
            before_analysis = self.analyze_surface(before_image_path)
            after_analysis = self.analyze_surface(after_image_path)
            
            if "error" in before_analysis or "error" in after_analysis:
                return {"error": "Errore nell'analisi delle immagini"}
            
            # Calcola il miglioramento
            improvement = after_analysis["cleanliness_score"] - before_analysis["cleanliness_score"]
            improvement_percentage = improvement * 100
            
            # Genera un rapporto di confronto
            comparison_report = {
                "before_score": before_analysis["cleanliness_score"],
                "after_score": after_analysis["cleanliness_score"],
                "improvement": improvement,
                "improvement_percentage": improvement_percentage,
                "before_detections": before_analysis["detections"],
                "after_detections": after_analysis["detections"],
                "summary": self._generate_comparison_summary(before_analysis, after_analysis)
            }
            
            return comparison_report
            
        except Exception as e:
            print(f"Errore nel confronto delle immagini: {e}")
            return {"error": str(e)}
    
    def _calculate_cleanliness_score(self, detections):
        """
        Calcola un punteggio di pulizia basato sulle rilevazioni
        
        Args:
            detections: Lista di rilevazioni
            
        Returns:
            Punteggio di pulizia (0-1)
        """
        if not detections:
            return 1.0  # Superficie perfettamente pulita
        
        # Conta le rilevazioni di sporco
        dirt_count = sum(1 for d in detections if d["label"] != "clean_surface")
        
        # Calcola la somma dei punteggi di confidenza per le rilevazioni di sporco
        dirt_confidence_sum = sum(d["score"] for d in detections if d["label"] != "clean_surface")
        
        # Calcola il punteggio di pulizia
        if dirt_count == 0:
            return 1.0
        
        # Formula: 1 - (somma delle confidenze / numero di rilevazioni)
        base_score = 1.0 - (dirt_confidence_sum / len(detections))
        
        # Applica una penalità basata sul numero di rilevazioni
        penalty = min(0.5, dirt_count * 0.1)
        
        # Punteggio finale
        final_score = max(0.0, base_score - penalty)
        
        return final_score
    
    def _generate_analysis_summary(self, detections, cleanliness_score):
        """
        Genera un riepilogo testuale dell'analisi
        
        Args:
            detections: Lista di rilevazioni
            cleanliness_score: Punteggio di pulizia
            
        Returns:
            Riepilogo testuale
        """
        if cleanliness_score >= 0.9:
            quality = "eccellente"
        elif cleanliness_score >= 0.8:
            quality = "buona"
        elif cleanliness_score >= 0.7:
            quality = "accettabile"
        elif cleanliness_score >= 0.6:
            quality = "mediocre"
        else:
            quality = "insufficiente"
        
        # Conta le occorrenze di ciascun tipo di problema
        problem_counts = {}
        for detection in detections:
            label = detection["label"]
            if label != "clean_surface":
                problem_counts[label] = problem_counts.get(label, 0) + 1
        
        # Genera il riepilogo
        summary = f"Qualità della pulizia: {quality} ({cleanliness_score:.2f})\n"
        
        if problem_counts:
            summary += "Problemi rilevati:\n"
            for label, count in problem_counts.items():
                summary += f"- {label}: {count}\n"
        else:
            summary += "Nessun problema rilevato."
        
        return summary
    
    def _generate_comparison_summary(self, before_analysis, after_analysis):
        """
        Genera un riepilogo testuale del confronto prima/dopo
        
        Args:
            before_analysis: Analisi dell'immagine prima
            after_analysis: Analisi dell'immagine dopo
            
        Returns:
            Riepilogo testuale
        """
        before_score = before_analysis["cleanliness_score"]
        after_score = after_analysis["cleanliness_score"]
        improvement = after_score - before_score
        improvement_percentage = improvement * 100
        
        if improvement_percentage >= 50:
            quality = "eccellente"
        elif improvement_percentage >= 30:
            quality = "ottimo"
        elif improvement_percentage >= 20:
            quality = "buono"
        elif improvement_percentage >= 10:
            quality = "discreto"
        elif improvement_percentage > 0:
            quality = "minimo"
        else:
            quality = "nessun miglioramento"
        
        summary = f"Miglioramento {quality}: {improvement_percentage:.1f}%\n"
        summary += f"Punteggio prima: {before_score:.2f}\n"
        summary += f"Punteggio dopo: {after_score:.2f}\n\n"
        
        # Confronta i problemi rilevati
        before_problems = {d["label"]: d["score"] for d in before_analysis["detections"] if d["label"] != "clean_surface"}
        after_problems = {d["label"]: d["score"] for d in after_analysis["detections"] if d["label"] != "clean_surface"}
        
        resolved_problems = []
        for label in before_problems:
            if label not in after_problems:
                resolved_problems.append(label)
        
        if resolved_problems:
            summary += "Problemi risolti:\n"
            for label in resolved_problems:
                summary += f"- {label}\n"
        
        remaining_problems = []
        for label in after_problems:
            remaining_problems.append(label)
        
        if remaining_problems:
            summary += "\nProblemi rimanenti:\n"
            for label in remaining_problems:
                summary += f"- {label}\n"
        
        return summary
    
    def _simulate_analysis(self, image):
        """
        Simula un'analisi per scopi dimostrativi
        
        Args:
            image: Immagine da analizzare
            
        Returns:
            Risultati simulati
        """
        # Estrai alcune caratteristiche semplici dall'immagine
        if image is None:
            return {"error": "Immagine non valida"}
        
        # Calcola la luminosità media
        if len(image.shape) == 3:
            brightness = np.mean(image)
        else:
            brightness = np.mean(image)
        
        # Calcola la varianza (può indicare texture/sporco)
        variance = np.var(image)
        
        # Simula un punteggio di pulizia basato su queste caratteristiche
        # Più alta è la varianza, più probabile è che ci sia sporco
        cleanliness_base = max(0, min(1, 1 - (variance / 10000)))
        
        # Aggiusta in base alla luminosità (immagini molto scure o molto chiare potrebbero essere problematiche)
        brightness_factor = 1 - abs((brightness / 255) - 0.5) * 2
        
        # Punteggio finale
        cleanliness_score = cleanliness_base * brightness_factor
        
        # Simula alcune rilevazioni
        detections = []
        
        # Se il punteggio è basso, aggiungi alcune rilevazioni di sporco
        if cleanliness_score < 0.8:
            num_detections = int((1 - cleanliness_score) * 10)
            for i in range(num_detections):
                # Genera box casuali
                x1 = np.random.randint(0, image.shape[1] - 100)
                y1 = np.random.randint(0, image.shape[0] - 100)
                x2 = x1 + np.random.randint(50, 100)
                y2 = y1 + np.random.randint(50, 100)
                
                # Scegli un tipo di sporco casuale
                dirt_types = ['dust', 'stain', 'liquid_spill', 'trash', 'scratch', 'mold']
                label = np.random.choice(dirt_types)
                
                # Genera un punteggio di confidenza
                score = np.random.uniform(0.6, 0.95)
                
                detections.append({
                    "box": [x1, y1, x2, y2],
                    "score": float(score),
                    "label": label
                })
        
        # Aggiungi sempre almeno una rilevazione di superficie pulita
        x1 = np.random.randint(0, image.shape[1] - 200)
        y1 = np.random.randint(0, image.shape[0] - 200)
        x2 = x1 + np.random.randint(150, 200)
        y2 = y1 + np.random.randint(150, 200)
        
        detections.append({
            "box": [x1, y1, x2, y2],
            "score": float(np.random.uniform(0.8, 0.99)),
            "label": "clean_surface"
        })
        
        return {
            "detections": detections,
            "cleanliness_score": float(cleanliness_score),
            "analysis_summary": self._generate_analysis_summary(detections, cleanliness_score),
            "simulated": True
        }

# Funzione di utilità per visualizzare i risultati
def visualize_results(image_path, analysis_results, output_path=None):
    """
    Visualizza i risultati dell'analisi sull'immagine
    
    Args:
        image_path: Percorso all'immagine
        analysis_results: Risultati dell'analisi
        output_path: Percorso dove salvare l'immagine con annotazioni
    
    Returns:
        Immagine con annotazioni
    """
    try:
        # Carica l'immagine
        if isinstance(image_path, str):
            image = cv2.imread(image_path)
<response clipped><NOTE>To save on context only part of this file has been shown to you. You should retry this tool after you have searched inside the file with `grep -n` in order to find the line numbers of what you are looking for.</NOTE>