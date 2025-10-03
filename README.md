# 🎬 InstaDL - Modern Instagram Reel Downloader

> A beautiful, privacy-first web application to download Instagram reels with temporary cloud storage and inline video playback.

[![Docker Build](https://github.com/hariomop12/Insta-Reel-Downloder/actions/workflows/docker-build.yml/badge.svg)](https://github.com/hariomop12/Insta-Reel-Downloder/actions/workflows/docker-build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Pulls](https://img.shields.io/docker/pulls/ghcr.io/hariomop12/insta-reel-downloder)](https://github.com/hariomop12/Insta-Reel-Downloder/pkgs/container/insta-reel-downloder)

## ✨ Features

- 🎨 **Modern UI** - Beautiful glassmorphism design with smooth animations
- 🎬 **Inline Video Player** - Watch reels directly on the page (no external links!)
- ☁️ **Cloud Storage** - Cloudflare R2 integration with 10-minute auto-expiry
- � **Privacy First** - No permanent storage, files auto-delete
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- 🐳 **Docker Ready** - One-command deployment
- ⚡ **Lightning Fast** - Optimized download and streaming
- � **Secure** - Presigned URLs and CORS protection

## 🏗️ Architecture

```
Frontend (Nginx) → Backend (Node.js) → Python Script → Cloudflare R2
```

- **No local file storage** - All files stored temporarily in Cloudflare R2
- **Auto-cleanup** - Files automatically deleted after 10 minutes
- **Privacy-first** - No permanent storage of user content
- **Scalable** - Cloud-based architecture ready for production

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Modern UI with animations)
- **Backend**: Node.js, Express.js
- **Downloader**: Python with instaloader
- **Storage**: Cloudflare R2 (S3-compatible)
- **Deployment**: Docker, Nginx reverse proxy

## 📋 Prerequisites

- Docker & Docker Compose
- Cloudflare R2 account with bucket
- R2 credentials (Access Key ID & Secret Access Key)

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Pull from GitHub Container Registry**
   ```bash
   docker pull ghcr.io/hariomop12/insta-reel-downloder:latest
   ```

2. **Clone the repository**
   ```bash
   git clone https://github.com/hariomop12/Insta-Reel-Downloder.git
   cd Insta-Reel-Downloder
   ```

3. **Configure environment variables**
   ```bash
   cp .env.sample .env
   # Edit .env with your Cloudflare R2 credentials
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - 🌐 **Frontend**: http://localhost:8080
   - 🔧 **API**: http://localhost:3000
   - 📊 **Health Check**: http://localhost:3000/health

### Using GitHub Container Registry

```yaml
# docker-compose.yml
version: '3.8'
services:
  instadl:
    image: ghcr.io/hariomop12/insta-reel-downloder:latest
    ports:
      - "3000:3000"
    environment:
      - R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
      - R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
      - R2_BUCKET_NAME=reels
      - R2_ENDPOINT=${R2_ENDPOINT}
```

## 🔧 Configuration

### Cloudflare R2 Setup
1. Create a Cloudflare account
2. Enable R2 storage
3. Create a bucket named `reels`
4. Generate API tokens with R2 permissions
5. Add credentials to `.env` file

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `R2_ACCESS_KEY_ID` | R2 access key ID | Yes |
| `R2_SECRET_ACCESS_KEY` | R2 secret access key | Yes |
| `R2_BUCKET_NAME` | R2 bucket name | Yes |
| `R2_ENDPOINT` | R2 endpoint URL | Yes |
| `NODE_ENV` | Environment (production/development) | No |

## 🚀 Deployment

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production with Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/download` | Download Instagram reel |
| `GET` | `/health` | Health check |

### Download Request
```javascript
POST /download
Content-Type: application/json

{
  "url": "https://www.instagram.com/reel/ABC123/"
}
```

### Response
```javascript
{
  "success": true,
  "downloadUrl": "https://r2-url.com/video.mp4",
  "filename": "reel_timestamp.mp4",
  "expiresIn": "10 minutes"
}
```

## 🎨 UI Features

- **Glassmorphism Design** - Modern translucent interface
- **Smooth animations** - Bounce effects and transitions
- **Responsive Layout** - Works on all devices
- **Input Validation** - Real-time URL validation
- **Loading States** - Beautiful loading animations
- **Error Handling** - User-friendly error messages

## 🔐 Security Features

- CORS protection
- Input validation
- Temporary file storage
- Auto-cleanup mechanism
- No permanent user data storage

## 🐛 Troubleshooting

### Common Issues

1. **R2 Connection Error**
   - Verify R2 credentials in `.env`
   - Check R2 endpoint URL format
   - Ensure bucket exists and has proper permissions

2. **Python Dependencies**
   - Docker image includes all Python dependencies
   - For local development: `pip install -r Backend/requirements.txt`

3. **Port Conflicts**
   - Default ports: 80 (nginx), 3000 (backend)
   - Modify ports in `docker-compose.yml` if needed

## 📝 Development

### File Structure
```
├── index.html          # Frontend UI
├── styles.css          # Modern CSS styles
├── script.js           # Client-side JavaScript
├── server.js           # Express server
├── r2Upload.js         # R2 integration
├── Backend/
│   ├── reel_download.py    # Python downloader
│   └── requirements.txt    # Python dependencies
├── Dockerfile          # Container configuration
├── docker-compose.yml  # Multi-service setup
└── nginx.conf         # Reverse proxy config
```

### Adding Features
1. Backend changes in `server.js`
2. Frontend changes in `index.html`, `styles.css`, `script.js`
3. Python script modifications in `Backend/reel_download.py`
4. R2 operations in `r2Upload.js`

## 📊 Monitoring

- Health check endpoint: `/health`
- Docker health checks enabled
- Auto-restart on failure
- Comprehensive error logging

## 🛠️ Development

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/hariomop12/Insta-Reel-Downloder.git
   cd Insta-Reel-Downloder
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd Backend && npm install && pip install -r requirements.txt
   
   # Return to root
   cd ..
   ```

3. **Set up environment**
   ```bash
   cp .env.sample .env
   # Configure your R2 credentials in .env
   ```

4. **Run in development mode**
   ```bash
   # Start backend
   cd Backend && npm run dev
   
   # Serve frontend (in another terminal)
   python -m http.server 8080
   ```

### Building from Source

```bash
# Build Docker image locally
docker build -t instadl .

# Run with docker-compose
docker-compose up --build
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🍴 Fork the repository**
2. **🌟 Create your feature branch** (`git checkout -b feature/amazing-feature`)
3. **💾 Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **📤 Push to the branch** (`git push origin feature/amazing-feature`)
5. **🔀 Open a Pull Request**

### Development Guidelines

- ✅ Test your changes with Docker
- ✅ Follow the existing code style
- ✅ Update documentation if needed
- ✅ Add tests for new features
- ✅ Ensure all checks pass

## 📊 Project Stats

- **Languages**: JavaScript, Python, HTML, CSS
- **Framework**: Node.js, Express
- **Storage**: Cloudflare R2
- **Deployment**: Docker, GitHub Container Registry
- **License**: MIT

## 🐛 Issues & Support

- 🐛 **Bug Reports**: [Create an issue](https://github.com/hariomop12/Insta-Reel-Downloder/issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Request a feature](https://github.com/hariomop12/Insta-Reel-Downloder/issues/new?template=feature_request.md)
- 💬 **Discussions**: [Join the discussion](https://github.com/hariomop12/Insta-Reel-Downloder/discussions)

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🐍 [instaloader](https://github.com/instaloader/instaloader) - Instagram API library
- ☁️ [Cloudflare R2](https://developers.cloudflare.com/r2/) - Object storage
- 🐳 [Docker](https://www.docker.com/) - Containerization
- 🎨 Modern CSS & Glassmorphism design patterns
- 🚀 GitHub Actions & Container Registry

---

<div align="center">
  <strong>Made with ❤️ by <a href="https://github.com/hariomop12">@hariomop12</a></strong>
  <br>
  <sub>⭐ Star this repo if you found it helpful!</sub>
</div>