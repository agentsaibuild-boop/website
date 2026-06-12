#!/bin/bash
set -e

echo "🔨 Строя сайта..."
npm run build

echo ""
echo "📤 Качвам на SuperHosting чрез SFTP..."

# SFTP качване със SSH ключа
sftp -i ./id_rsa -b /dev/stdin aibuilda@ftp.superhosting.bg << SFTP_COMMANDS
cd /public_html/
rm -r *
put -r dist/*
quit
SFTP_COMMANDS

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ УСПЕШНО!"
    echo "🌐 Отвори: https://aibuildagents.bg"
else
    echo ""
    echo "❌ Грешка при качване."
    exit 1
fi
