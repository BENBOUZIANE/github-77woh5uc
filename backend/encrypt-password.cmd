@echo off
REM Usage: encrypt-password.cmd [cle_jasypt] [mot_de_passe_db]
REM Exemple: encrypt-password.cmd cosmetoKey test1234
REM Puis definir au demarrage: set JASYPT_ENCRYPTOR_PASSWORD=cosmetoKey

set KEY=cosmetoKey
set PASS=test1234
if not "%~1"=="" set KEY=%~1
if not "%~2"=="" set PASS=%~2

echo Generer ENC(...) avec cle=%KEY% et mot de passe=%PASS%
echo.
call mvnw.cmd -q compile exec:java "-Dexec.mainClass=com.cosmetovigilance.util.EncryptPasswordUtil" "-Dexec.args=%KEY% %PASS%"
echo.
echo Au demarrage du backend, definir: set JASYPT_ENCRYPTOR_PASSWORD=%KEY%
pause
