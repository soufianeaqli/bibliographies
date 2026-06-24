@echo off
title PFE - Installation du projet
chcp 65001 >nul

echo ============================================
echo    PFE - Gestion Bibliographique
echo    Installation automatique
echo ============================================
echo.

:: Vérifier PHP
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] PHP est introuvable. Installez PHP ^>= 8.2
    exit /b 1
)
echo [OK] PHP trouve

:: Vérifier Composer
where composer >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Composer est introuvable. Installez Composer
    exit /b 1
)
echo [OK] Composer trouve

:: Vérifier Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js est introuvable. Installez Node.js
    exit /b 1
)
echo [OK] Node.js trouve

:: Vérifier npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] npm est introuvable.
    exit /b 1
)
echo [OK] npm trouve
echo.

:: --- BACKEND ---
echo [1/5] Installation des dependances backend...
cd backend
call composer install --no-interaction --prefer-dist
if %errorlevel% neq 0 (
    echo [ERREUR] echec de composer install
    exit /b 1
)
echo [OK] Dependances backend installees

:: Créer .env si absent
if not exist .env (
    copy .env.example .env >nul
    echo [INFO] .env cree depuis .env.example
    echo [ATTENTION] Modifiez les identifiants de base de donnees dans backend\.env
) else (
    echo [OK] .env existe deja
)

:: Générer la clé d'application
echo [2/5] Generation de la cle d'application...
php artisan key:generate --force
if %errorlevel% neq 0 (
    echo [ERREUR] echec de key:generate
    exit /b 1
)
echo [OK] Cle generee

:: Migrations
echo [3/5] Migration de la base de donnees...
php artisan migrate --force
if %errorlevel% neq 0 (
    echo [ERREUR] echec des migrations
    echo [INFO] Verifiez les identifiants dans backend\.env
    exit /b 1
)
echo [OK] Migrations effectuees

:: Seeders
echo [4/5] Insertion des donnees de test...
php artisan db:seed --force
if %errorlevel% neq 0 (
    echo [ERREUR] echec du seed
    exit /b 1
)
echo [OK] Donnees de test inserees

:: Lien symbolique storage
php artisan storage:link >nul 2>&1

cd ..
echo.
echo [OK] Backend pret

:: --- FRONTEND ---
echo [5/5] Installation des dependances frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] echec de npm install
    exit /b 1
)
cd ..
echo [OK] Dependances frontend installees
echo.

echo ============================================
echo   Installation terminee avec succes !
echo ============================================
echo.
echo Pour lancer le projet :
echo.
echo   Terminal 1 - Backend :
echo     cd backend ^&^& php artisan serve
echo.
echo   Terminal 2 - Frontend :
echo     cd frontend ^&^& npm run dev
echo.
echo   Puis ouvrir http://localhost:5173
echo.
echo [IMPORTANT] Si vous utilisez XAMPP/WAMP,
echo assurez-vous que MySQL est lance et
echo que les identifiants dans backend\.env
echo sont corrects (DB_HOST, DB_PORT, DB_DATABASE,
echo DB_USERNAME, DB_PASSWORD).
echo.

pause
