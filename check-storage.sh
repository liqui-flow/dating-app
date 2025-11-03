#!/bin/bash

# Storage Health Check Script
# Quick command-line tool to remind you how to fix storage issues

echo "🔍 Storage Bucket Health Check"
echo "================================"
echo ""
echo "📋 This script helps you fix storage upload issues"
echo ""

echo "✅ Buckets that should exist:"
echo "   1. verification-documents (PRIVATE)"
echo "   2. face-scans (PRIVATE)"
echo "   3. profile-photos (PUBLIC)"
echo "   4. profile-videos (PUBLIC)"
echo "   5. matrimony-photos (PUBLIC)"
echo ""

echo "🔧 To fix upload issues:"
echo "   1. Open Supabase Dashboard → SQL Editor"
echo "   2. Run the SQL from: storage-policies.sql"
echo "   3. Verify policies in: Storage → [bucket] → Policies tab"
echo ""

echo "🧪 To test if storage is working:"
echo "   1. Start dev server: npm run dev"
echo "   2. Open: http://localhost:3000/test-storage"
echo "   3. Click 'Run Health Check'"
echo ""

echo "📖 For detailed guide, see: STORAGE_FIX_GUIDE.md"
echo ""

# Check if dev server is running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Dev server is running on http://localhost:3000"
    echo "   Test page: http://localhost:3000/test-storage"
else
    echo "⚠️  Dev server is not running"
    echo "   Start it with: npm run dev"
fi

echo ""
echo "================================"
echo "Need help? Check STORAGE_FIX_GUIDE.md"

