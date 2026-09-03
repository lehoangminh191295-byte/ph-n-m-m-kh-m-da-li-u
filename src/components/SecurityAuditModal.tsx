import React, { useState } from 'react';
import { X, Shield, Lock, Download, KeyRound, Check, AlertTriangle, Activity } from 'lucide-react';
import { AuditLogEntry } from '../types';
import { getSecurityPin, setSecurityPin, logAuditEvent } from '../services/storageService';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLogEntry[];
  onLockNow: () => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
  onLockNow,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'settings'>('logs');
  const [currentPin, setCurrentPin] = useState(getSecurityPin());
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinChangeMsg('Mã PIN tối thiểu phải có 4 chữ số.');
      return;
    }
    setSecurityPin(newPin);
    setCurrentPin(newPin);
    setNewPin('');
    setPinChangeMsg('Đã cập nhật mã PIN phòng khám thành công!');
    logAuditEvent('TOGGLE_SECURITY_LOCK', 'Thay đổi mã PIN bảo mật phòng khám', undefined, undefined, 'INFO');
  };

  const handleExportLogs = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NhatKyKiemToan_Dermacare_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base text-slate-100">Trung Tâm Bảo Mật Y Tế & Nhật Ký Kiểm Toán (Audit Trail)</h3>
              <p className="text-[11px] text-slate-400">
                Tuân thủ tiêu chuẩn bảo vệ dữ liệu hồ sơ bệnh án da liễu & dermoscopy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            Nhật ký truy vết thao tác ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Cấu hình bảo mật & Khóa PIN
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'logs' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Mọi hành động xem bệnh án, mở ảnh dermoscopy, chạy AI chẩn đoán và xuất PDF đều được ghi nhận tự động.
                </p>
                <button
                  onClick={handleExportLogs}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Xuất file JSON kiểm toán
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Thời gian</th>
                      <th className="px-4 py-2.5">Bác sĩ / Người dùng</th>
                      <th className="px-4 py-2.5">Hành động</th>
                      <th className="px-4 py-2.5">Chi tiết thao tác</th>
                      <th className="px-4 py-2.5">Mức độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-2.5 font-sans font-medium text-slate-800">
                          {log.doctorName}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-sans text-slate-700 max-w-md truncate">
                          {log.details}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.severity === 'WARNING'
                              ? 'bg-amber-100 text-amber-800'
                              : log.severity === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-xl">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-blue-600" />
                  Đổi mã PIN mở khóa phòng khám
                </h4>
                <p className="text-xs text-slate-500">
                  Mã PIN hiện tại: <span className="font-mono font-bold text-slate-800">{currentPin}</span>
                </p>

                <form onSubmit={handleUpdatePin} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mã PIN mới (4 - 6 số):
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Nhập PIN mới..."
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>

                  {pinChangeMsg && (
                    <p className="text-xs text-blue-700 font-semibold">{pinChangeMsg}</p>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Lưu mã PIN mới
                  </button>
                </form>
              </div>

              {/* Instant Lock Option */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Khóa phiên làm việc ngay lập tức</h4>
                  <p className="text-xs text-slate-500">
                    Bật màn hình khóa bảo mật khi bác sĩ rời bàn làm việc để bảo vệ dữ liệu bệnh nhân.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onLockNow();
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Khóa ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
