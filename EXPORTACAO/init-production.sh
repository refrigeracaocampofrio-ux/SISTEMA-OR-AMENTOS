#!/bin/bash

# Script de inicialização do Sistema de Orçamentos
# Use: ./init-production.sh

echo "=================================="
echo "Sistema de Orçamentos - Inicialização"
echo "=================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo -e "${YELLOW}[1/5] Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# 2. Verificar npm
echo -e "${YELLOW}[2/5] Verificando npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# 3. Instalar dependências
echo -e "${YELLOW}[3/5] Instalando dependências...${NC}"
npm install --production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
else
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi

# 4. Verificar .env
echo -e "${YELLOW}[4/5] Verificando configurações (.env)...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo "Criando a partir de .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  IMPORTANTE: Edite o arquivo .env com suas credenciais!${NC}"
    echo "Abra .env e configure:"
    echo "  - DB_HOST, DB_USER, DB_PASS, DB_NAME"
    echo "  - JWT_SECRET"
    echo "  - EMAIL_FROM, EMAIL_USER, EMAIL_PASS (SMTP)"
fi

# 5. Instalar PM2 (opcional)
echo -e "${YELLOW}[5/5] Configurando PM2 para produção...${NC}"
npm install -g pm2
pm2 start backend/server.js --name "sistema-orcamento" --instances max --exec-mode cluster
pm2 startup
pm2 save

echo ""
echo -e "${GREEN}=================================="
echo "✅ Inicialização concluída!"
echo "==================================${NC}"
echo ""
echo "Próximos passos:"
echo "1. Edite o arquivo .env com suas credenciais"
echo "2. Importe o schema do banco: mysql < database/schema.sql"
echo "3. Acesse o sistema em http://localhost:3000"
echo "4. Configure o sistema em /setup.html"
echo ""
echo "Para parar o servidor: pm2 stop sistema-orcamento"
echo "Para ver logs: pm2 logs sistema-orcamento"
