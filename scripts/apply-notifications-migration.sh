#!/bin/bash

# Message notifications migration script
echo "=========================================="
echo "🔔 Message Notifications Setup"
echo "=========================================="
echo ""
echo "Run this SQL in your Supabase SQL Editor:"
echo "https://ubevbnynycrzjebxctme.supabase.co"
echo ""
echo "=========================================="
echo ""
cat supabase/migrations/002_add_message_read_tracking.sql
echo ""
echo "=========================================="
echo "🎵 Add notification sound:"
echo "=========================================="
echo ""
echo "Add a notification.mp3 file to: public/sounds/"
echo "See public/sounds/README.md for recommendations"
echo ""
