@echo off
echo ==========================================
echo Déploiement de l'application Cosmetovigilance
echo ==========================================
echo.

echo Étape 1/4: Build du frontend...
call npm run build

if %errorlevel% neq 0 (
    echo Erreur lors du build du frontend!
    exit /b 1
)

echo.
echo Étape 2/4: Copie des fichiers frontend vers backend\static...
if not exist "backend\src\main\resources\static" mkdir "backend\src\main\resources\static"
xcopy /E /I /Y dist\* backend\src\main\resources\static\

if %errorlevel% neq 0 (
    echo Erreur lors de la copie des fichiers!
    exit /b 1
)

echo.
echo Étape 3/4: Build du backend...
cd backend
call mvnw.cmd clean package -DskipTests

if %errorlevel% neq 0 (
    echo Erreur lors du build du backend!
    exit /b 1
)

cd ..

echo.
echo ==========================================
echo Build terminé avec succès!
echo ==========================================
echo.
echo Pour lancer l'application:
echo   cd backend
echo   java -jar target\cosmetovigilance-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
echo.
echo L'application sera accessible sur: http://localhost:8080
echo ==========================================
pause
