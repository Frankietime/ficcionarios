#!/bin/bash
echo "Construyendo aplicación para macOS..."
pip3 install pyinstaller
pyinstaller --onefile --windowed --name "GeneradorDiccionariosKindle" --icon=NONE main.py
echo ""
echo "Aplicación generada en: dist/GeneradorDiccionariosKindle.app"
echo ""
echo "Nota: Puede ser necesario firmar la aplicación para que funcione en macOS"
echo "Para firmar, ejecuta:"
echo "codesign --force --deep --sign - dist/GeneradorDiccionariosKindle.app"

