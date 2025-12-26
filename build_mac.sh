#!/bin/bash
echo "Construyendo aplicación para macOS..."
echo ""
echo "IMPORTANTE: Este script debe ejecutarse en macOS, no en Windows"
echo ""

# Verificar que estamos en macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "ERROR: Este script solo puede ejecutarse en macOS"
    echo "Estás ejecutando en: $OSTYPE"
    exit 1
fi

pip3 install pyinstaller
pyinstaller --onefile --windowed --name "GeneradorDiccionariosKindle" --icon=NONE main.py

if [ -d "dist/GeneradorDiccionariosKindle.app" ]; then
    echo ""
    echo "✓ Aplicación generada exitosamente en: dist/GeneradorDiccionariosKindle.app"
    echo ""
    echo "Nota: Puede ser necesario firmar la aplicación para que funcione en macOS"
    echo "Para firmar, ejecuta:"
    echo "codesign --force --deep --sign - dist/GeneradorDiccionariosKindle.app"
else
    echo ""
    echo "ERROR: No se pudo generar la aplicación .app"
    echo "Verifica que PyInstaller se haya instalado correctamente"
fi

