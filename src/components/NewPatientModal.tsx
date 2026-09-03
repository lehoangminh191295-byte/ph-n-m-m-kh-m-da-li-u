import React, { useState } from 'react';
import { X, UserPlus, ShieldCheck } from 'lucide-react';
import { Patient, FitzpatrickSkinType } from '../types';
import { logAuditEvent } from '../services/storageService';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePatient: (patient: Patient) => void;
  existingCount: number;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onSavePatient,
  existingCount,
}) => {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('1990-01-01');
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [fitzpatrick, setFitzpatrick] = useState<FitzpatrickSkinType>('Type III');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [familyCancer, setFamilyCancer] = useState(false);
  const [consent, setConsent] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Vui lòng nhập họ tên và số điện thoại bệnh nhân.');
      return;
    }

    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const calculatedAge = Math.max(1, currentYear - birthYear);

    const padNumber = String(existingCount + 1).padStart(3, '0');
    const newCode = `BN-2026-${padNumber}`;

    const newPatient: Patient = {
      id: 'pat-' + Date.now().toString(36),
      code: newCode,
      fullName: fullName.trim(),
      dob,
      age: calculatedAge,
      gender,
      phone: phone.trim(),
      address: address.trim(),
      fitzpatrick,
      medicalHistory: medicalHistory.trim() || 'Chưa ghi nhận bệnh lý mạn tính',
      allergies: allergies.trim() || 'Không có dị ứng đã biết',
      familySkinCancerHistory: familyCancer,
      consentSigned: consent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSavePatient(newPatient);
    logAuditEvent(
      'CREATE_PATIENT',
      `Đăng ký hồ sơ bệnh nhân mới: ${newPatient.fullName} (${newPatient.code})`,
      newPatient.id,
      newPatient.fullName
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" />
            Đăng Ký Hồ Sơ Bệnh Nhân Da Liễu Mới
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Họ và tên bệnh nhân:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày sinh:</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Giới tính:</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phân loại da (Fitzpatrick):</label>
              <select
                value={fitzpatrick}
                onChange={(e) => setFitzpatrick(e.target.value as any)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Type I">Type I (Rất trắng, dễ cháy nắng)</option>
                <option value="Type II">Type II (Trắng, hay cháy nắng)</option>
                <option value="Type III">Type III (Sáng - Trung bình Châu Á)</option>
                <option value="Type IV">Type IV (Bánh mật Châu Á)</option>
                <option value="Type V">Type V (Nâu sẫm)</option>
                <option value="Type VI">Type VI (Đen sẫm)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điện thoại (Nhận SMS/Zalo):</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ví dụ: 0912 345 678"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Địa chỉ thường trú:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ví dụ: Quận 1, TP. Hồ Chí Minh"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tiền sử bệnh lý:</label>
              <textarea
                rows={2}
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Viêm da cơ địa, tăng huyết áp, đái tháo đường..."
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dị ứng thuốc / thức ăn:</label>
              <textarea
                rows={2}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Dị ứng Penicillin, NSAIDs, hải sản..."
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={familyCancer}
                onChange={(e) => setFamilyCancer(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Gia đình có tiền sử Ung thư hắc tố da (Melanoma) hoặc ung thư da khác</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-blue-900 font-semibold bg-blue-50 p-2.5 rounded-xl border border-blue-200">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                required
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Bệnh nhân đã ký phiếu đồng ý lưu trữ hình ảnh soi da & chẩn đoán AI theo chuẩn y tế
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition"
            >
              Tạo hồ sơ bệnh nhân
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
