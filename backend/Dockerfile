# Usa l'immagine base di Node.js
FROM node:22

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file di configurazione
COPY package.json package-lock.json ./

# Installa le dipendenze
RUN npm install

# Copia il resto dei file dell'applicazione
COPY . .

# Espone la porta su cui l'applicazione ascolta
EXPOSE 3000

# Comando per avviare l'applicazione
CMD ["npm", "run", "dev"]