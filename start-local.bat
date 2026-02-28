@echo off
REM ============================================
REM Script de démarrage DÉVELOPPEMENT LOCAL (Windows)
REM ============================================

echo.
echo ========================================
echo   Demarrage en mode LOCAL (Windows)
echo ========================================
echo.


REM Copier le fichier d'environnement
echo [2/5] Configuration de l'environnement frontend...
copy /Y .env.local .env >nul
echo [OK] Fichier .env configure
echo.

REM Installer les dépendances frontend si nécessaire
if not exist "node_modules" (
    echo [3/5] Installation des dependances frontend...
    call npm install
    if errorlevel 1 (
        echo [ERREUR] Echec de l'installation des dependances
        pause
        exit /b 1
    )
) else (
    echo [3/5] Dependances frontend deja installees
)
echo.

REM Démarrer le backend dans une nouvelle fenêtre
echo [4/5] Demarrage du backend sur le port 8080...
start "Backend Cosmetovigilance" cmd /k "cd backend && mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local"
echo [OK] Backend demarre dans une nouvelle fenetre
echo.

REM Attendre que le backend démarre
echo [5/5] Attente du demarrage du backend (15 secondes)...
timeout /t 15 /nobreak >nul
echo.

REM Démarrer le frontend
echo Demarrage du frontend sur le port 5173...
start "Frontend Cosmetovigilance" cmd /k "npm run dev"
echo [OK] Frontend demarre dans une nouvelle fenetre
echo.

echo ========================================
echo   Application demarree avec succes!
echo ========================================
echo.
echo Acces a l'application:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8080/api
echo   Swagger:  http://localhost:8080/api/swagger-ui.html
echo.
echo Pour arreter l'application:
echo   Fermez les fenetres "Backend" et "Frontend"
echo   OU appuyez sur Ctrl+C dans chaque fenetre
echo.
pause
