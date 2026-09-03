#!/bin/bash
# ======================================================================
#   HE THONG HO SO BENH AN DA LIEU DERMACARE AI - KHOI DONG LOCAL
# ======================================================================

echo "======================================================================"
echo "  DANG KHOI DONG DERMACARE AI TREN MAY TINH CUC BO (MACOS / LINUX)"
echo "======================================================================"

if ! command -v node &> /dev/null; then
    echo "[LOI] Khong tim thay Node.js tren may tinh cua ban!"
    echo "Vui long cai dat Node.js tai https://nodejs.org"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[THONG BAO] Dang cai dat thu vien phu thuoc (npm install)..."
    npm install
fi

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo "[THONG BAO] Da tao tep .env tu .env.example"
fi

if [ ! -d "data" ]; then
    mkdir -p data
    echo "[THONG BAO] Da tao thu muc ./data de luu tru co so du lieu phong kham tren o cung"
fi

echo ""
echo "======================================================================"
echo "  MAY CHU DERMACARE AI CHAY TAI: http://localhost:3000"
echo "  DU LIEU LUU TRU TAI: ./data/clinic_database.json"
echo "======================================================================"
echo ""

# Auto open browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    (sleep 2 && open http://localhost:3000) &
elif command -v xdg-open &> /dev/null; then
    (sleep 2 && xdg-open http://localhost:3000) &
fi

npm run dev
