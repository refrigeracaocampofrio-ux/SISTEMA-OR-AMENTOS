#!/bin/bash
# Script para criar tabela de agendamentos

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   Criando Tabela de Agendamentos                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Tente com senha vazia primeiro
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -h localhost sistema_orcamento < EXECUTAR_ISTO_NO_MYSQL.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Tabela criada com sucesso!"
    echo "📄 Agora recarregue o navegador e clique em 'Agendamentos'"
else
    echo ""
    echo "❌ Erro ao executar script"
    echo "Verifique:"
    echo "  1. MySQL está rodando?"
    echo "  2. Banco 'sistema_orcamento' existe?"
    echo "  3. Usuário 'root' com senha correta?"
fi
