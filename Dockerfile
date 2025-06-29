FROM node:lts-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose default port
EXPOSE 1122

# Start the server - environment variables will be passed at runtime
CMD ["node", "build/index.js"]