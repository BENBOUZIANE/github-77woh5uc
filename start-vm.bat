@echo off
REM ============================================
REM Script de démarrage VM LOCAL (Windows)
REM ============================================

echo.
echo ========================================
echo   Deploiement sur VM (Reseau Local)
echo ========================================
echo.

REM Demander l'adresse IP de la VM
set /p VM_IP="Entrez l'adresse IP de votre VM (ex: 192.168.1.50): "

if "%VM_IP%"=="" (
    echo [ERREUR] Vous devez entrer une adresse IP
    pause
    exit /b 1
)

echo.
echo IP de la VM: %VM_IP%
echo.

REM Vérifier que MySQL est démarré
echo [1/6] Verification de MySQL...
sc query MySQL80 | find /I "RUNNING" >nul || sc query MySQL80 | find /I "EN COURS" >nul
if errorlevel 1 (
    echo [ERREUR] MySQL n'est pas demarre sur cette machine.
    echo.
    echo IMPORTANT: Ce script prepare les fichiers pour la VM.
    echo MySQL doit etre demarre sur la VM, pas sur cette machine.
    echo.
    set /p continue="Voulez-vous continuer quand meme? (O/N): "
    if /i not "%continue%"=="O" exit /b 1
)
echo.

REM Créer le fichier .env avec l'IP de la VM
echo [2/6] Creation du fichier .env...
(
    echo # Configuration VM - Genere automatiquement
    echo VITE_API_URL=http://%VM_IP%:8080/api
    echo VITE_APP_URL=http://%VM_IP%:5173
) > .env
echo [OK] Fichier .env cree
echo.

REM Mettre à jour application-vm.properties
echo [3/6] Configuration du backend...
powershell -Command "(Get-Content 'backend\src\main\resources\application-vm.properties') -replace '<VM_IP>', '%VM_IP%' | Set-Content 'backend\src\main\resources\application-vm.properties'"
echo [OK] Configuration backend mise a jour
echo.

REM Installer les dépendances si nécessaire
if not exist "node_modules" (
    echo [4/6] Installation des dependances frontend...
    call npm install
    if errorlevel 1 (
        echo [ERREUR] Echec de l'installation des dependances
        pause
        exit /b 1
    )
) else (
    echo [4/6] Dependances frontend deja installees
)
echo.

REM Compiler le backend
echo [5/6] Compilation du backend (cela peut prendre quelques minutes)...
cd backend
call mvnw.cmd clean package -DskipTests
if errorlevel 1 (
    echo [ERREUR] Echec de la compilation du backend
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Backend compile
echo.

REM Compiler le frontend
echo [6/6] Compilation du frontend...
call npm run build
if errorlevel 1 (
    echo [ERREUR] Echec de la compilation du frontend
    pause
    exit /b 1
)
echo [OK] Frontend compile
echo.

echo ========================================
echo   Compilation terminee avec succes!
echo ========================================
echo.
echo PROCHAINES ETAPES:
echo.
echo 1. Transferer les fichiers vers la VM:
echo    - backend\target\cosmetovigilance-backend-1.0.0.jar
echo    - dist\ (dossier complet)
echo.
echo 2. Sur la VM Linux, executer:
echo    java -jar cosmetovigilance-backend-1.0.0.jar --spring.profiles.active=vm
echo.
echo 3. Pour servir le frontend sur la VM:
echo    npx serve -s dist -l 5173 --host 0.0.0.0
echo.
echo URLs d'acces (depuis n'importe quel PC du reseau):
echo   Frontend: http://%VM_IP%:5173
echo   Backend:  http://%VM_IP%:8080/api
echo   Swagger:  http://%VM_IP%:8080/api/swagger-ui.html
echo.
echo IMPORTANT:
echo - Assurez-vous que MySQL est demarre sur la VM
echo - Verifiez que les ports 8080 et 5173 sont ouverts sur la VM
echo - Mettez a jour le mot de passe de la base de donnees dans:
echo   backend\src\main\resources\application-vm.properties
echo.
pause
