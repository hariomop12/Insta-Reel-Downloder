# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine

# Add metadata
LABEL org.opencontainers.image.title="InstaDL - Instagram Reel Downloader"
LABEL org.opencontainers.image.description="Modern web app to download Instagram reels with cloud storage"
LABEL org.opencontainers.image.url="https://github.com/hariomop12/Insta-Reel-Downloder"
LABEL org.opencontainers.image.source="https://github.com/hariomop12/Insta-Reel-Downloder"
LABEL org.opencontainers.image.licenses="MIT"

# Install Python and system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY Backend/package*.json ./Backend/
COPY Backend/requirements.txt ./Backend/

# Install Node.js dependencies
RUN cd Backend && npm install --production

# Install Python dependencies
RUN cd Backend && pip3 install -r requirements.txt --break-system-packages

# Copy application files
COPY Backend/ ./Backend/
COPY index.html ./
COPY styles.css ./
COPY script.js ./

# Create directory for temporary files
RUN mkdir -p /app/Backend/temp

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check - use environment PORT or fallback to 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const port = process.env.PORT || 3000; require('http').get(\`http://localhost:\${port}/health\`, (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "Backend/server.js"]