import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { getSecurityPin, logAuditEvent } from '../services/storageService';

interface SecurityLockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const SecurityLockScreen: React.FC<SecurityLockScreenProps> = ({ isLocked, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  if (!isLocked) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = getSecurityPin();
    if (pin === correctPin) {
      setError(false);
      setPin('');
      logAuditEvent('TOGGLE_SECURITY_LOCK', 'Mở khóa phiên làm việc bảo mật y tế', undefined, undefined, 'INFO');
      onUnlock();
    } else {
      setError(true);
      logAuditEvent('TOGGLE_SECURITY_LOCK', 'Nhập sai mã PIN bảo mật phòng khám', undefined, undefined, 'WARNING');
    }
  };

  const handleQuickKey = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setError(false);
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 text-center border border-slate-200">
        {/* Lock Icon Header */}
        <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">Khóa Bảo Mật Y Tế</h2>
        <p className="text-xs text-slate-500 mb-6">
          Hệ thống lưu trữ hồ sơ bệnh nhân & Dermoscopy tuân thủ tiêu chuẩn an toàn dữ liệu y tế. Nhập mã PIN bác sĩ để tiếp tục.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={6}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••"
              className={`w-full text-center tracking-[0.6em] text-2xl font-mono font-bold py-3 px-4 rounded-xl border ${
                error ? 'border-rose-500 bg-rose-50/50 text-rose-700' : 'border-slate-300 bg-slate-50 focus:bg-white text-slate-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-rose-600 flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Mã PIN không chính xác (Mặc định: 1234)
            </p>
          )}

          {/* Quick Digit Pad for Touch Screens / Tablets */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleQuickKey(d)}
                className="py-3 text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-blue-100 rounded-xl transition"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 rounded-xl transition"
            >
              Xóa
            </button>
            <button
              type="button"
              onClick={() => handleQuickKey('0')}
              className="py-3 text-base font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-blue-100 rounded-xl transition"
            >
              0
            </button>
            <button
              type="submit"
              className="py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition"
            >
              Mở
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Mã PIN phòng khám mặc định: <strong className="text-slate-600 font-mono">1234</strong></span>
          </div>
        </form>
      </div>
    </div>
  );
};
