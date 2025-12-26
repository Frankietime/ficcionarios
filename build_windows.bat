@echo off
echo Construyendo ejecutable para Windows...
pip install pyinstaller
pyinstaller --onefile --windowed --name "GeneradorDiccionariosKindle" --icon=NONE main.py
echo.
echo Ejecutable generado en: dist\GeneradorDiccionariosKindle.exe
pause

