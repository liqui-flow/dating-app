#!/bin/bash

# Face Scanner Installation Script
# This script installs all required dependencies for the Face Verification feature

echo "🚀 Installing Face Scanner Dependencies..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install Node.js and npm first"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js version 18+ recommended (you have: $(node -v))"
fi

echo "📦 Installing TensorFlow.js dependencies..."
npm install @tensorflow/tfjs @tensorflow/tfjs-core @tensorflow/tfjs-backend-webgl @tensorflow-models/face-detection

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Installation Complete!"
    echo ""
    echo "📚 Documentation:"
    echo "  - Usage Guide: FACE_SCANNER_USAGE.md"
    echo "  - Installation: INSTALLATION.md"
    echo "  - Permissions: CAMERA_PERMISSIONS_SETUP.md"
    echo "  - Summary: FACE_SCANNER_SUMMARY.md"
    echo ""
    echo "🧪 Test the feature:"
    echo "  1. Run: npm run dev"
    echo "  2. Visit: http://localhost:3000/test-face-scanner"
    echo ""
    echo "🎉 Happy coding!"
else
    echo ""
    echo "❌ Installation failed"
    echo "Please check the error messages above"
    exit 1
fi

