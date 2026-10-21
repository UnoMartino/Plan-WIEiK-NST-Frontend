# Etap 1: Budowanie aplikacji
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etap 2: Lekki serwer Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Poprawienie ścieżki w nginx.conf dla kontenera
RUN sed -i 's|/var/www/plan/dist|/usr/share/nginx/html|g' /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
