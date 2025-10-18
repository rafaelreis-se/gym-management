#!/bin/bash

# Script para testar health check da API

echo "🏥 Testando Health Check da Gym Management API"
echo "=============================================="

# Definir URL base
BASE_URL="${1:-http://localhost:3000/api}"

echo "🌐 URL Base: $BASE_URL"
echo ""

# Testar health check
echo "📋 Testando Health Check..."
echo "GET $BASE_URL/health"
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL/health")
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ Health Check: OK ($HTTP_STATUS)"
    echo "📊 Resposta:"
    echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_body"
else
    echo "❌ Health Check: FALHOU ($HTTP_STATUS)"
    echo "📊 Resposta:"
    echo "$RESPONSE_BODY"
fi

echo ""
echo "=============================================="

# Testar API info
echo "📋 Testando API Info..."
echo "GET $BASE_URL/"
echo ""

RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$BASE_URL/")
HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ API Info: OK ($HTTP_STATUS)"
    echo "📊 Resposta:"
    echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo "❌ API Info: FALHOU ($HTTP_STATUS)"
    echo "📊 Resposta:"
    echo "$RESPONSE_BODY"
fi

echo ""
echo "=============================================="
echo "🎯 Teste concluído!"

# Verificar se ambos os endpoints funcionaram
if curl -sf "$BASE_URL/health" > /dev/null && curl -sf "$BASE_URL/" > /dev/null; then
    echo "🎉 API está funcionando corretamente!"
    exit 0
else
    echo "⚠️  Alguns endpoints não estão respondendo corretamente"
    exit 1
fi