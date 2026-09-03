@echo off
title Phong Kham Da Lieu Dermacare AI - May Chu Local
color 0b
echo ======================================================================
echo   HE THONG HO SO BENH AN DA LIEU DERMACARE AI - KHOI DONG LOCAL
echo ======================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI NGHIEP TRONG] Khong tim thay Node.js tren may tinh cua ban!
    echo Vui long truy cap https://nodejs.org de tai va cai dat Node.js (ban LTS).
    echo Sau khi cai dat, vui long chay lai tep nay.
    echo.
    pause
    exit /b
)

if not exist node_modules (
    echo [THONG BAO] Phat hien chua cai dat thu vien, dang chay "npm install"...
    echo Qua trinh nay co the mat 1-2 phut tuy toc do mang.
    call npm install
    if %errorlevel% neq 0 (
        echo [LOI] Qua trinh cai dat thu vien gap su co.
        pause
        exit /b
    )
)

if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [THONG BAO] Da tu dong tao tep cau hinh .env tu .env.example.
    )
)

if not exist data (
    mkdir data
    echo [THONG BAO] Da tao thu muc data/ de luu tru co so du lieu benh vien tren o cung.
)

echo.
echo ======================================================================
echo   DANG KHOI CHAY MAY CHU DERMACARE AI TAI: http://localhost:3000
echo   DU LIEU SE DUOC LUU TAI: ./data/clinic_database.json
echo ======================================================================
echo.

timeout /t 2 >nul
start http://localhost:3000

call npm run dev
pause
