# 🚀 Deployment Guide

This guide will help you deploy InstaDL in various environments.

## 📋 Prerequisites

1. **Cloudflare R2 Account** with:
   - R2 bucket created (e.g., `reels`)
   - API tokens with R2 permissions
   - Account ID for endpoint URL

2. **Docker & Docker Compose** installed on your server

## 🐳 Docker Deployment

### Option 1: Using GitHub Container Registry (Recommended)

1. **Download the production compose file**:
   ```bash
   wget https://raw.githubusercontent.com/hariomop12/Insta-Reel-Downloder/main/docker-compose.prod.yml
   wget https://raw.githubusercontent.com/hariomop12/Insta-Reel-Downloder/main/.env.sample
   ```

2. **Configure environment**:
   ```bash
   cp .env.sample .env
   # Edit .env with your R2 credentials
   ```

3. **Start the application**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Option 2: Build from Source

1. **Clone and configure**:
   ```bash
   git clone https://github.com/hariomop12/Insta-Reel-Downloder.git
   cd Insta-Reel-Downloder
   cp .env.sample .env
   # Configure your .env file
   ```

2. **Build and run**:
   ```bash
   docker-compose up --build -d
   ```

## ☁️ Cloud Deployment

### AWS EC2 / DigitalOcean Droplet

1. **Launch instance** (minimum: 1GB RAM, 1 vCPU)
2. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   ```
3. **Follow Docker deployment steps above**

### Google Cloud Run

1. **Build and push image**:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/instadl
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy --image gcr.io/PROJECT-ID/instadl --port 3000
   ```

### Heroku

1. **Create Heroku app**:
   ```bash
   heroku create your-app-name
   ```

2. **Set environment variables**:
   ```bash
   heroku config:set R2_ACCESS_KEY_ID=your-key
   heroku config:set R2_SECRET_ACCESS_KEY=your-secret
   # ... other variables
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

## 🔒 SSL/HTTPS Setup

### Using Nginx Proxy Manager

1. **Add to docker-compose**:
   ```yaml
   nginx-proxy-manager:
     image: jc21/nginx-proxy-manager:latest
     ports:
       - "80:80"
       - "443:443"
       - "81:81"
   ```

2. **Configure SSL** through the web interface at port 81

### Using Caddy

1. **Create Caddyfile**:
   ```
   your-domain.com {
     reverse_proxy instadl-nginx:8080
   }
   ```

2. **Add Caddy to compose**:
   ```yaml
   caddy:
     image: caddy:alpine
     ports:
       - "80:80"
       - "443:443"
     volumes:
       - ./Caddyfile:/etc/caddy/Caddyfile
   ```

## 📊 Monitoring

### Health Checks

The app includes built-in health checks:
- **Endpoint**: `http://your-domain:3000/health`
- **Docker**: Automatic container health monitoring

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f instadl-app
```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key | ✅ | - |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key | ✅ | - |
| `R2_BUCKET_NAME` | R2 bucket name | ✅ | `reels` |
| `R2_ENDPOINT` | R2 endpoint URL | ✅ | - |
| `NODE_ENV` | Node environment | ❌ | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | ❌ | `http://localhost:8080` |

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **R2 permissions**: Ensure API token has read/write/delete permissions
3. **Memory issues**: Increase server RAM or add swap space

### Debug Mode

```bash
# Enable debug logging
docker-compose -f docker-compose.yml -f docker-compose.debug.yml up
```

## 📈 Scaling

### Horizontal Scaling

```yaml
services:
  instadl-app:
    deploy:
      replicas: 3
  
  nginx:
    depends_on:
      - instadl-app
    # Add load balancing configuration
```

### Resource Limits

```yaml
services:
  instadl-app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          memory: 256M
```

## 🔒 Security Best Practices

1. **Use HTTPS** in production
2. **Rotate R2 credentials** regularly
3. **Update dependencies** frequently
4. **Monitor logs** for suspicious activity
5. **Limit resource usage** with Docker constraints

## 📞 Support

Need help with deployment? 
- 📖 Check the [documentation](https://github.com/hariomop12/Insta-Reel-Downloder)
- 🐛 Report issues on [GitHub](https://github.com/hariomop12/Insta-Reel-Downloder/issues)
- 💬 Join [discussions](https://github.com/hariomop12/Insta-Reel-Downloder/discussions)