# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install dependencies cleanly
RUN npm ci

# Copy frontend source code and configs
COPY . .

# Build production bundle with Vite
RUN npm run build

# Stage 2: Serve application with lightweight Nginx
FROM nginx:alpine

# Copy custom Nginx reverse-proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
