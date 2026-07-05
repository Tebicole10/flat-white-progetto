#!/bin/bash

# Flat White Progetto - Setup Script
# Este script prepara el proyecto para desarrollo o deployment

set -e

echo "☕ Flat White Progetto - Setup"
echo "=============================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo -e "${BLUE}Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js no está instalado${NC}"
    echo "Descargá desde: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo ""

# 2. Instalar dependencias
echo -e "${BLUE}Instalando dependencias...${NC}"
npm install
echo -e "${GREEN}✓ Dependencias instaladas${NC}"
echo ""

# 3. Mostrar opciones
echo -e "${BLUE}¿Qué querés hacer?${NC}"
echo "1) Ejecutar servidor de desarrollo (npm run dev)"
echo "2) Compilar para producción (npm run build)"
echo "3) Solo instalar dependencias (listo)"
echo ""
read -p "Opción (1-3): " option

case $option in
    1)
        echo -e "${GREEN}Iniciando servidor dev...${NC}"
        npm run dev
        ;;
    2)
        echo -e "${GREEN}Compilando para producción...${NC}"
        npm run build
        echo -e "${GREEN}✓ Build completo en ./dist/${NC}"
        ;;
    3)
        echo -e "${GREEN}✓ Setup completado${NC}"
        echo ""
        echo "Para comenzar:"
        echo "  npm run dev"
        ;;
esac
