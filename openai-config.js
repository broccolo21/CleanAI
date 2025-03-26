// File: src/utils/openai-config.js
/**
 * Configurazione e utility per l'integrazione con OpenAI API
 * Questo file gestisce l'interazione con l'API di OpenAI per il tutor virtuale
 */

// Funzione per inizializzare il client OpenAI
export const initOpenAI = (apiKey) => {
  // In un'implementazione reale, utilizzeremmo la libreria ufficiale di OpenAI
  // Per ora, creiamo un client simulato per dimostrare la funzionalità
  
  const client = {
    apiKey,
    baseURL: 'https://api.openai.com/v1',
    
    // Metodo per generare completamenti di testo
    createCompletion: async (prompt, options = {}) => {
      try {
        // Simuliamo una chiamata API
        console.log('Chiamata a OpenAI API con prompt:', prompt);
        
        // In un'implementazione reale, qui ci sarebbe una vera chiamata API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Risposte simulate per diversi tipi di prompt
        let response;
        
        if (prompt.includes('pulizia')) {
          response = "Per eseguire una pulizia efficace di questa area, segui questi passaggi:\n1. Rimuovi tutti gli oggetti dalla superficie\n2. Applica il detergente appropriato\n3. Utilizza movimenti circolari per pulire\n4. Risciacqua con acqua pulita\n5. Asciuga con un panno in microfibra";
        } else if (prompt.includes('sanificazione')) {
          response = "Per sanificare correttamente questa area:\n1. Indossa i dispositivi di protezione personale\n2. Applica il sanificante spray su tutte le superfici\n3. Lascia agire per almeno 5 minuti\n4. Passa un panno pulito per rimuovere i residui\n5. Assicurati che l'area sia ben ventilata";
        } else if (prompt.includes('manutenzione')) {
          response = "Procedura di manutenzione consigliata:\n1. Controlla eventuali danni o usura\n2. Applica il prodotto specifico per questo tipo di superficie\n3. Utilizza l'attrezzatura appropriata per la lucidatura\n4. Verifica il risultato con attenzione\n5. Documenta l'intervento eseguito";
        } else {
          response = "Ecco le istruzioni per completare questa attività:\n1. Prepara l'attrezzatura necessaria\n2. Segui le procedure standard di sicurezza\n3. Esegui l'operazione con attenzione\n4. Verifica la qualità del risultato\n5. Segnala eventuali problemi riscontrati";
        }
        
        return {
          data: {
            choices: [{ text: response }],
            usage: {
              prompt_tokens: prompt.length,
              completion_tokens: response.length,
              total_tokens: prompt.length + response.length
            }
          }
        };
      } catch (error) {
        console.error('Errore nella chiamata a OpenAI API:', error);
        throw error;
      }
    },
    
    // Metodo per generare chat completions
    createChatCompletion: async (messages, options = {}) => {
      try {
        // Simuliamo una chiamata API
        console.log('Chiamata a OpenAI Chat API con messaggi:', messages);
        
        // In un'implementazione reale, qui ci sarebbe una vera chiamata API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Estrai l'ultimo messaggio per determinare la risposta
        const lastMessage = messages[messages.length - 1].content;
        
        // Risposte simulate per diversi tipi di messaggi
        let response;
        
        if (lastMessage.includes('pulizia')) {
          response = "Per eseguire una pulizia efficace di questa area, segui questi passaggi:\n1. Rimuovi tutti gli oggetti dalla superficie\n2. Applica il detergente appropriato\n3. Utilizza movimenti circolari per pulire\n4. Risciacqua con acqua pulita\n5. Asciuga con un panno in microfibra";
        } else if (lastMessage.includes('sanificazione')) {
          response = "Per sanificare correttamente questa area:\n1. Indossa i dispositivi di protezione personale\n2. Applica il sanificante spray su tutte le superfici\n3. Lascia agire per almeno 5 minuti\n4. Passa un panno pulito per rimuovere i residui\n5. Assicurati che l'area sia ben ventilata";
        } else if (lastMessage.includes('manutenzione')) {
          response = "Procedura di manutenzione consigliata:\n1. Controlla eventuali danni o usura\n2. Applica il prodotto specifico per questo tipo di superficie\n3. Utilizza l'attrezzatura appropriata per la lucidatura\n4. Verifica il risultato con attenzione\n5. Documenta l'intervento eseguito";
        } else {
          response = "Ecco le istruzioni per completare questa attività:\n1. Prepara l'attrezzatura necessaria\n2. Segui le procedure standard di sicurezza\n3. Esegui l'operazione con attenzione\n4. Verifica la qualità del risultato\n5. Segnala eventuali problemi riscontrati";
        }
        
        return {
          data: {
            choices: [{ message: { role: 'assistant', content: response } }],
            usage: {
              prompt_tokens: JSON.stringify(messages).length,
              completion_tokens: response.length,
              total_tokens: JSON.stringify(messages).length + response.length
            }
          }
        };
      } catch (error) {
        console.error('Errore nella chiamata a OpenAI Chat API:', error);
        throw error;
      }
    }
  };
  
  return client;
};

// Classe per il Tutor Virtuale
export class VirtualTutor {
  constructor(openaiClient) {
    this.client = openaiClient;
    this.context = [];
  }
  
  // Aggiunge contesto al tutor
  addContext(role, content) {
    this.context.push({ role, content });
    
    // Mantieni il contesto a una lunghezza ragionevole
    if (this.context.length > 10) {
      this.context = this.context.slice(this.context.length - 10);
    }
    
    return this;
  }
  
  // Resetta il contesto
  resetContext() {
    this.context = [];
    return this;
  }
  
  // Genera istruzioni per un'attività specifica
  async generateInstructions(task, location, additionalInfo = '') {
    try {
      // Crea il messaggio di sistema
      const systemMessage = {
        role: 'system',
        content: 'Sei un tutor virtuale esperto di pulizie professionali. Fornisci istruzioni chiare, concise e dettagliate per aiutare gli operatori a svolgere le loro attività nel modo più efficiente e professionale possibile.'
      };
      
      // Crea il messaggio utente
      const userMessage = {
        role: 'user',
        content: `Devo eseguire la seguente attività: "${task}" presso "${location}". ${additionalInfo}`
      };
      
      // Prepara i messaggi per la chiamata API
      const messages = [systemMessage, ...this.context, userMessage];
      
      // Chiamata all'API
      const response = await this.client.createChatCompletion(messages, {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 500
      });
      
      // Estrai la risposta
      const instructions = response.data.choices[0].message.content;
      
      // Aggiungi la risposta al contesto
      this.addContext('assistant', instructions);
      
      return instructions;
    } catch (error) {
      console.error('Errore nella generazione delle istruzioni:', error);
      throw error;
    }
  }
  
  // Risponde a una domanda dell'operatore
  async answerQuestion(question) {
    try {
      // Crea il messaggio di sistema
      const systemMessage = {
        role: 'system',
        content: 'Sei un tutor virtuale esperto di pulizie professionali. Rispondi alle domande degli operatori in modo chiaro, conciso e utile.'
      };
      
      // Crea il messaggio utente
      const userMessage = {
        role: 'user',
        content: question
      };
      
      // Prepara i messaggi per la chiamata API
      const messages = [systemMessage, ...this.context, userMessage];
      
      // Chiamata all'API
      const response = await this.client.createChatCompletion(messages, {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 300
      });
      
      // Estrai la risposta
      const answer = response.data.choices[0].message.content;
      
      // Aggiungi la domanda e la risposta al contesto
      this.addContext('user', question);
      this.addContext('assistant', answer);
      
      return answer;
    } catch (error) {
      console.error('Errore nella risposta alla domanda:', error);
      throw error;
    }
  }
  
  // Genera un feedback sulla qualità della pulizia
  async generateFeedback(beforeImage, afterImage, qualityScore) {
    try {
      // In un'implementazione reale, qui analizzeremmo le immagini
      // Per ora, generiamo un feedback basato sul punteggio di qualità
      
      let feedbackType;
      if (qualityScore >= 0.9) {
        feedbackType = 'eccellente';
      } else if (qualityScore >= 0.8) {
        feedbackType = 'buono';
      } else if (qualityScore >= 0.7) {
        feedbackType = 'sufficiente';
      } else {
        feedbackType = 'insufficiente';
      }
      
      // Crea il messaggio di sistema
      const systemMessage = {
        role: 'system',
        content: 'Sei un tutor virtuale esperto di pulizie professionali. Fornisci feedback costruttivi sulla qualità del lavoro svolto dagli operatori.'
      };
      
      // Crea il messaggio utente
      const userMessage = {
        role: 'user',
        content: `Ho completato un'attività di pulizia con un punteggio di qualità di ${qualityScore * 100}%. Puoi fornirmi un feedback ${feedbackType}?`
      };
      
      // Prepara i messaggi per la chiamata API
      const messages = [systemMessage, userMessage];
      
      // Chiamata all'API
      const response = await this.client.createChatCompletion(messages, {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 300
      });
      
      // Estrai la risposta
      const feedback = response.data.choices[0].message.content;
      
      return feedback;
    } catch (error) {
      console.error('Errore nella generazione del feedback:', error);
      throw error;
    }
  }
}

// Esporta un'istanza predefinita del tutor virtuale
export const createVirtualTutor = (apiKey) => {
  const openaiClient = initOpenAI(apiKey);
  return new VirtualTutor(openaiClient);
};

export default {
  initOpenAI,
  VirtualTutor,
  createVirtualTutor
};
