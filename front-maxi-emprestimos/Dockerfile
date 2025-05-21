# Build stage
FROM node:20 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
# Adicionar comandos de debug
RUN mkdir -p /usr/share/nginx/html
# Ajusta o caminho de acordo com a estrutura de saída do Angular 19
COPY --from=build-stage /app/dist/front-maxi-emprestimos/browser /usr/share/nginx/html
RUN mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
