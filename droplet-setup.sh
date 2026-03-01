#!/bin/bash
# MAKUtalk Droplet İlk Kurulum Scripti
# Termius'ta bir kez çalıştır: bash droplet-setup.sh

set -e

echo "🔧 Docker kuruluyor..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

echo "✅ Docker versiyonu:"
docker --version
docker compose version

echo "🔥 Firewall ayarlanıyor..."
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo "🔑 GitHub Actions SSH key oluşturuluyor..."
ssh-keygen -t ed25519 -C "github-actions-makutalk" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

echo ""
echo "========================================"
echo "✅ KURULUM TAMAMLANDI!"
echo "========================================"
echo ""
echo "📋 Aşağıdaki PRIVATE KEY'i GitHub Secret'a ekle:"
echo "   Secret adı: SSH_PRIVATE_KEY"
echo ""
cat ~/.ssh/github_actions
echo ""
echo "========================================"
echo "📋 GitHub Secrets listesi:"
echo "   HOST          → 161.35.70.169"
echo "   USERNAME      → root"
echo "   SSH_PRIVATE_KEY → (yukarıdaki key)"
echo "   DB_PASSWORD   → güçlü bir şifre"
echo "   DATABASE_URL  → postgresql://admin:SIFRE@db:5432/makutalk_db"
echo "   JWT_SECRET    → rastgele uzun string"
echo "   RESEND_API_KEY → resend'den"
echo "   GEMINI_API_KEY → google'dan"
echo "   SMTP_FROM     → email adresin"
echo "   FRONTEND_URL  → https://makutalk.com"
echo "   VITE_API_URL  → https://makutalk.com/api"
echo "========================================"