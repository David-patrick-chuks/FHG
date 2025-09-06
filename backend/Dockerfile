# Use Puppeteer base image with Chrome pre-installed
FROM ghcr.io/puppeteer/puppeteer:24.15.0

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn

# Set working directory
WORKDIR /app

# Install additional system dependencies as root (before switching to puppeteer user)
USER root
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching (as root to ensure proper ownership)
COPY package*.json ./

# Check what users exist and create puppeteer user if needed
RUN id puppeteer 2>/dev/null || ( \
    groupadd -r puppeteer && \
    useradd -r -g puppeteer -G audio,video puppeteer \
    -m -s /bin/bash --skel /dev/null --home-dir /home/puppeteer \
    )

# Ensure proper ownership of the app directory
RUN chown -R puppeteer:puppeteer /app

# Switch to puppeteer user for the rest of the build
USER puppeteer

# Debug: Show what files were copied
RUN echo "=== Package files copied ===" && \
    ls -la package*.json && \
    echo "=== Package-lock.json content (first 10 lines) ===" && \
    if [ -f package-lock.json ]; then head -10 package-lock.json; else echo "No package-lock.json found"; fi

# Install dependencies with multiple fallback strategies
RUN if [ -f package-lock.json ]; then \
        echo "Using npm ci with package-lock.json" && \
        npm ci --only=production && npm cache clean --force; \
    elif [ -f package-lock.json ] && npm --version | grep -q "8\|9"; then \
        echo "Using npm ci with newer npm version" && \
        npm ci --only=production && npm cache clean --force; \
    else \
        echo "Falling back to npm install" && \
        npm install --only=production && npm cache clean --force; \
    fi

# Copy source code (as root to ensure proper ownership)
USER root
COPY . .

# Ensure proper ownership of all copied files
RUN chown -R puppeteer:puppeteer /app

# Switch back to puppeteer user for build and runtime
USER puppeteer

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build (clean up)
RUN npm prune --production

# Expose port
EXPOSE 8080

# Health check with extended start period
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start the server (use PORT env variable, default to 8080)
CMD ["sh", "-c", "node dist/index.js"] 