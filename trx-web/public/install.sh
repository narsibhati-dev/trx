#!/bin/sh
set -e

# Configuration
REPO="pie-314/trx"
BINARY="trx"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper for errors
error() {
    printf "${RED}Error:${NC} $1\n"
    exit 1
}

info() {
    printf "${BLUE}==>${NC} $1\n"
}

# Check dependencies
for cmd in curl tar grep cut mktemp; do
    if ! command -v $cmd >/dev/null 2>&1; then
        error "Required command '$cmd' not found. Please install it and try again."
    fi
done

info "Detecting system architecture..."

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
    x86_64) ARCH="x86_64" ;;
    arm64|aarch64) ARCH="aarch64" ;;
    *) error "Unsupported architecture: $ARCH" ;;
esac

case "$OS" in
    linux) OS="linux" ;;
    darwin) OS="macos" ;;
    *) error "Unsupported OS: $OS" ;;
esac

ASSET_NAME="${BINARY}-${OS}-${ARCH}.tar.gz"

info "Fetching latest release from GitHub..."

# Get the latest release download URL
LATEST_RELEASE_JSON=$(curl -s "https://api.github.com/repos/${REPO}/releases/latest")
DOWNLOAD_URL=$(echo "$LATEST_RELEASE_JSON" | grep "browser_download_url" | grep "$ASSET_NAME" | cut -d '"' -f 4)

if [ -z "$DOWNLOAD_URL" ]; then
    error "Could not find a release asset named $ASSET_NAME in the latest release.\nCheck https://github.com/${REPO}/releases for available versions."
fi

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

info "Downloading ${GREEN}$ASSET_NAME${NC}..."
curl -L "$DOWNLOAD_URL" -o "$TMP_DIR/trx.tar.gz"

info "Extracting..."
tar -xzf "$TMP_DIR/trx.tar.gz" -C "$TMP_DIR"

INSTALL_DIR="/usr/local/bin"
info "Installing to $INSTALL_DIR (may require sudo)..."

if [ -w "$INSTALL_DIR" ]; then
    mv "$TMP_DIR/$BINARY" "$INSTALL_DIR/"
else
    sudo mv "$TMP_DIR/$BINARY" "$INSTALL_DIR/"
fi

printf "\n${GREEN}Success!${NC} ${BINARY} has been installed to ${INSTALL_DIR}/${BINARY}\n"
printf "Run '${GREEN}${BINARY}${NC}' to get started.\n"
