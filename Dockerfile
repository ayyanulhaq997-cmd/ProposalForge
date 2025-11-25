FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app WITHOUT requiring secrets at build time
# Secrets are only needed at runtime, not during build
RUN npm run build

# Remove development dependencies
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 5000

# Start the app - Railway will inject secrets at runtime
CMD ["npm", "start"]
