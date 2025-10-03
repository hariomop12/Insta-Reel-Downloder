#!/bin/bash

# Build and Push to GitHub Container Registry
# Usage: ./build-and-push.sh [version]

set -e

# Configuration
REGISTRY="ghcr.io"
REPO_OWNER="hariomop12"
IMAGE_NAME="insta-reel-downloder"
VERSION=${1:-"latest"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building and pushing InstaDL Docker image${NC}"
echo -e "${YELLOW}Registry: ${REGISTRY}${NC}"
echo -e "${YELLOW}Image: ${REPO_OWNER}/${IMAGE_NAME}:${VERSION}${NC}"

# Check if logged in to GitHub Container Registry
echo -e "\n${BLUE}📋 Checking GitHub Container Registry authentication...${NC}"
if ! docker info | grep -q "ghcr.io"; then
    echo -e "${YELLOW}⚠️  Not logged in to GHCR. Please run:${NC}"
    echo -e "${YELLOW}   echo \$GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin${NC}"
    exit 1
fi

# Build the image
echo -e "\n${BLUE}🔨 Building Docker image...${NC}"
docker build \
    --platform linux/amd64,linux/arm64 \
    --tag ${REGISTRY}/${REPO_OWNER}/${IMAGE_NAME}:${VERSION} \
    --tag ${REGISTRY}/${REPO_OWNER}/${IMAGE_NAME}:latest \
    .

# Push the image
echo -e "\n${BLUE}📤 Pushing to GitHub Container Registry...${NC}"
docker push ${REGISTRY}/${REPO_OWNER}/${IMAGE_NAME}:${VERSION}

if [ "$VERSION" != "latest" ]; then
    docker push ${REGISTRY}/${REPO_OWNER}/${IMAGE_NAME}:latest
fi

echo -e "\n${GREEN}✅ Successfully pushed to GitHub Container Registry!${NC}"
echo -e "${GREEN}📦 Image: ${REGISTRY}/${REPO_OWNER}/${IMAGE_NAME}:${VERSION}${NC}"

# Show usage instructions
echo -e "\n${BLUE}🎯 Usage:${NC}"
echo -e "${YELLOW}docker pull ${REGISTRY}/${REPO_OWNER}/${IMAGE_NAME}:${VERSION}${NC}"
echo -e "${YELLOW}docker run -p 3000:3000 ${REGISTRY}/${REPO_OWNER}/${IMAGE_NAME}:${VERSION}${NC}"

echo -e "\n${GREEN}🎉 All done!${NC}"