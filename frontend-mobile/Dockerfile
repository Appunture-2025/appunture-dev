FROM node:18-alpine AS build

WORKDIR /app

# Copy Expo project manifests
COPY appunture/package*.json ./
RUN npm install

# Copy the rest of the Expo application
COPY appunture/ ./

# Ensure Expo's web sqlite worker can locate the wasm binary
RUN mkdir -p node_modules/expo-sqlite/web/wa-sqlite \
    && cp node_modules/wa-sqlite/dist/wa-sqlite.wasm node_modules/expo-sqlite/web/wa-sqlite/wa-sqlite.wasm

# Export the Expo Router project as a static web bundle
RUN npx expo export --platform web --output-dir dist

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]