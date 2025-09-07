FROM ghcr.io/puppeteer/puppeteer:24.15.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn

WORKDIR /app

USER root
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*


COPY package*.json ./


RUN id puppeteer 2>/dev/null || ( \
    groupadd -r puppeteer && \
    useradd -r -g puppeteer -G audio,video puppeteer \
    -m -s /bin/bash --skel /dev/null --home-dir /home/puppeteer \
    )


RUN chown -R puppeteer:puppeteer /app

USER puppeteer

RUN echo "=== Package files copied ===" && \
    ls -la package*.json && \
    echo "=== Package-lock.json content (first 10 lines) ===" && \
    if [ -f package-lock.json ]; then head -10 package-lock.json; else echo "No package-lock.json found"; fi

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

USER root
COPY . .

RUN chown -R puppeteer:puppeteer /app

USER puppeteer

RUN npm run build

RUN npm prune --production

# Expose port
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Start the server (use PORT env variable, default to 8080)
CMD ["sh", "-c", "node dist/index.js"] 