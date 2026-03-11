# Use Node.js base image
FROM node:20-slim

# Install system dependencies for node-llama-cpp
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including building native modules)
RUN npm install --production

# Pre-download the Llama model during build to avoid slow startup
# This will increase image size but make the service ready immediately
RUN npx --yes node-llama-cpp download --uri "hf:mradermacher/Phi-3-mini-4k-instruct-GGUF/Phi-3-mini-4k-instruct.Q4_K_M.gguf"

# Copy application code
COPY . .

# Expose port (Cloud Run uses PORT env var)
ENV PORT=3001
EXPOSE 3001

# Command to run the application
CMD ["node", "server.js"]
