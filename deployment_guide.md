# Guida al Deployment di CleanAI

## Configurazione di Supabase

1. Accedi al tuo account Supabase (https://supabase.com)
2. Crea un nuovo progetto
3. Una volta creato il progetto, vai alla sezione "SQL Editor"
4. Esegui lo script SQL contenuto nel file `supabase_tables.sql` per creare tutte le tabelle necessarie
5. Vai alla sezione "Settings" > "API" e copia:
   - URL del progetto (da inserire come SUPABASE_URL)
   - anon key (da inserire come NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (da inserire come SUPABASE_KEY)

## Deployment del Backend su Railway

1. Accedi al tuo account Railway (https://railway.app)
2. Crea un nuovo progetto
3. Seleziona "Deploy from GitHub repo"
4. Seleziona il repository contenente il backend di CleanAI
5. Configura le variabili d'ambiente nel pannello "Variables":
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-supabase-service-role-key
   PORT=3001
   NODE_ENV=production
   ```
6. Assicurati che il file `supabase-config.js` sia aggiornato con la versione corretta
7. Avvia il deployment

## Deployment del Frontend su Vercel

1. Accedi al tuo account Vercel (https://vercel.com)
2. Crea un nuovo progetto
3. Seleziona "Import Git Repository" e seleziona il repository contenente il frontend di CleanAI
4. Configura le variabili d'ambiente nel pannello "Environment Variables":
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-url.railway.app
   ```
5. Assicurati che il file `SupabaseContext.js` sia aggiornato con la versione corretta
6. Avvia il deployment

## Verifica del Deployment

1. Accedi all'URL del frontend fornito da Vercel
2. Verifica che la connessione con Supabase funzioni correttamente
3. Verifica che la connessione con il backend funzioni correttamente
4. Testa le funzionalità principali dell'applicazione

## Risoluzione dei Problemi Comuni

### Errore di connessione a Supabase
- Verifica che le variabili d'ambiente siano configurate correttamente
- Controlla che le chiavi API di Supabase siano valide
- Verifica che le tabelle siano state create correttamente in Supabase

### Errore di build su Vercel
- Verifica che tutte le dipendenze siano elencate nel package.json
- Controlla i log di build per identificare eventuali errori
- Prova a pulire la cache di Vercel e riavviare il deployment

### Errore di connessione al backend
- Verifica che l'URL del backend sia corretto nelle variabili d'ambiente del frontend
- Controlla che il backend sia in esecuzione su Railway
- Verifica che le porte e i CORS siano configurati correttamente
