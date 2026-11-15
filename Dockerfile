# Etap 1: Budowanie aplikacji
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN node scripts/fetch-plan.js public/schedule_data.json || echo "Ostrzeżenie: Nie udało się pobrać planu podczas budowania, użyto lokalnego pliku."
RUN npm run build

# Etap 2: Lekki serwer Nginx + mikroserwis współdzielonych notatek (Node.js)
FROM nginx:alpine
RUN apk add --no-cache nodejs && mkdir -p /data /app

ENV NOTES_FILE=/data/notes.json
ENV NOTES_PORT=3001

COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/scripts/notes-server.js /app/notes-server.js
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["sh", "-c", "node /app/notes-server.js & exec nginx -g 'daemon off;'"]
