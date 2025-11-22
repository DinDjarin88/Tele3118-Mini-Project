# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY public ./public
COPY src ./src
RUN npm run build

# Runtime stage: serve static build via nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
# Allow container to be fronted by reverse proxy; CORS handled by backend or nginx if needed.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
