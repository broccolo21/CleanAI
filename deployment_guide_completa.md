# Guida al Deployment di CleanAI

## Introduzione

Questa guida dettagliata ti aiuterà a completare il deployment di CleanAI senza errori. Ho risolto tutti i problemi di configurazione e preparato i file necessari per un deployment corretto.

## 1. Configurazione di Supabase

### 1.1 Creazione delle tabelle

1. Accedi al tuo account Supabase (https://supabase.com)
2. Seleziona il progetto con URL: https://xdvgrrkidfizcpswnxvt.supabase.co
3. Vai alla sezione "SQL Editor"
4. Crea una nuova query
5. Copia e incolla il contenuto del file `supabase_tables.sql` fornito nel pacchetto
6. Esegui lo script SQL per creare tutte le tabelle necessarie

### 1.2 Verifica della configurazione

Dopo aver eseguito lo script SQL, verifica che tutte le tabelle siano state create correttamente:
- users
- clients
- locations
- cleaning_tasks
- cleaning_reports
- iot_sensors
- sensor_readings
- notifications

## 2. Configurazione del Backend

### 2.1 Sostituzione dei file

1. Nella directory del backend del tuo progetto CleanAI, sostituisci il file `src/supabase-config.js` con quello fornito nel pacchetto
2. Crea un file `.env` nella root del backend e copia il contenuto del file `.env` fornito nel pacchetto

### 2.2 Installazione delle dipendenze

```bash
cd /path/to/CleanAI/backend
npm install
```

### 2.3 Deployment su Railway

1. Accedi al tuo account Railway (https://railway.app)
2. Crea un nuovo progetto
3. Seleziona "Deploy from GitHub repo"
4. Seleziona il repository contenente il backend di CleanAI
5. Configura le variabili d'ambiente nel pannello "Variables" copiando il contenuto del file `.env` fornito
6. Avvia il deployment

## 3. Configurazione del Frontend

### 3.1 Sostituzione dei file

1. Nella directory del frontend del tuo progetto CleanAI:
   - Sostituisci il file `src/contexts/SupabaseContext.js` con quello fornito nel pacchetto
   - Sostituisci il file `src/styles/globals.css` con quello fornito nel pacchetto
   - Crea un file `.env.local` nella root del frontend e copia il contenuto del file `.env.local` fornito nel pacchetto

### 3.2 Installazione delle dipendenze mancanti

```bash
cd /path/to/CleanAI/frontend
npm install @headlessui/react @tailwindcss/forms @tailwindcss/typography
```

### 3.3 Build e deployment su Vercel

```bash
# Build locale per verificare che tutto funzioni
npm run build

# Deployment su Vercel
npx vercel --prod
```

Se preferisci utilizzare l'interfaccia web di Vercel:
1. Accedi al tuo account Vercel (https://vercel.com)
2. Crea un nuovo progetto
3. Importa il repository GitHub del frontend
4. Configura le variabili d'ambiente copiando il contenuto del file `.env.local` fornito
5. Avvia il deployment

## 4. Verifica del Deployment

### 4.1 Test del backend

1. Accedi all'URL del backend fornito da Railway
2. Verifica che l'API risponda correttamente

### 4.2 Test del frontend

1. Accedi all'URL del frontend fornito da Vercel
2. Verifica che la connessione con Supabase funzioni correttamente
3. Verifica che la connessione con il backend funzioni correttamente
4. Testa le funzionalità principali dell'applicazione

## 5. Risoluzione dei Problemi Comuni

### 5.1 Errore di connessione a Supabase
- Verifica che le variabili d'ambiente siano configurate correttamente
- Controlla che le chiavi API di Supabase siano valide
- Verifica che le tabelle siano state create correttamente in Supabase

### 5.2 Errore di build su Vercel
- Verifica che tutte le dipendenze siano installate correttamente
- Controlla i log di build per identificare eventuali errori
- Prova a pulire la cache di Vercel e riavviare il deployment

### 5.3 Errore di connessione al backend
- Verifica che l'URL del backend sia corretto nelle variabili d'ambiente del frontend
- Controlla che il backend sia in esecuzione su Railway
- Verifica che le porte e i CORS siano configurati correttamente

## 6. Note Importanti

- Le credenziali Supabase sono già configurate nei file `.env` e `.env.local`
- Tutti i file problematici sono stati corretti e inclusi nel pacchetto
- Le dipendenze mancanti sono state identificate e incluse nelle istruzioni di installazione

Seguendo questa guida passo dopo passo, dovresti essere in grado di completare il deployment di CleanAI senza errori. Se incontri problemi, controlla la sezione "Risoluzione dei Problemi Comuni" o contattami per assistenza.
