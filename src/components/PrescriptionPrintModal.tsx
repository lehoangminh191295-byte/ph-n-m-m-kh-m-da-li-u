import React, { useRef } from 'react';
import { X, Printer, Pill, Download, Calendar, ShieldCheck, Stethoscope } from 'lucide-react';
import { Patient, PrescriptionItem, TreatmentPlan } from '../types';

interface PrescriptionPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  prescriptions: PrescriptionItem[];
  treatmentPlan?: TreatmentPlan;
  diagnosis: string;
  doctorName?: string;
  visitDate?: string;
}

export const PrescriptionPrintModal: React.FC<PrescriptionPrintModalProps> = ({
  isOpen,
  onClose,
  patient,
  prescriptions,
  treatmentPlan,
  diagnosis,
  doctorName = 'BS. CKII Lê Hoàng Minh',
  visitDate = new Date().toISOString().split('T')[0]
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-6 flex flex-col max-h-[90vh]">
        {/* Top Control Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Xem & In Đơn Thuốc Y Khoa (Rx)</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              In đơn thuốc (Print / PDF)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 flex justify-center">
          <div
            ref={printRef}
            className="w-full max-w-2xl bg-white p-8 sm:p-10 rounded-xl shadow-md border border-slate-200 text-slate-900 text-xs space-y-6 print:m-0 print:p-6 print:shadow-none print:border-none"
          >
            {/* Clinic Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
              <div>
                <h1 className="font-black text-sm tracking-wider text-slate-900 uppercase">
                  Phòng Khám Chuyên Khoa Da Liễu DermaDrive
                </h1>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Địa chỉ: 120 Hai Bà Trưng, Phường Đa Kao, Quận 1, TP. Hồ Chí Minh
                </p>
                <p className="text-[11px] text-slate-600">
                  Hotline y khoa: (028) 3822 9988 • Giấy phép HĐ số: 04512/HCM-GPHĐ
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded border border-slate-300">
                  Mã BN: {patient.code}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">Ngày kê: {visitDate}</div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center py-2">
              <h2 className="text-xl font-black tracking-wide text-slate-900 uppercase">
                ĐƠN THUỐC ĐIỀU TRỊ DA LIỄU
              </h2>
              <p className="text-xs text-slate-500 font-serif italic">Medical Prescription</p>
            </div>

            {/* Patient Info */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block">Họ và tên:</span>
                <span className="font-bold text-slate-900 uppercase">{patient.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tuổi / Giới tính:</span>
                <span className="font-semibold text-slate-900">{patient.age} tuổi ({patient.gender})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Điện thoại:</span>
                <span className="font-mono font-medium text-slate-900">{patient.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Tiền sử dị ứng:</span>
                <span className="font-semibold text-rose-700">{patient.allergies || 'Không dị ứng'}</span>
              </div>
              <div className="col-span-2 sm:col-span-4 mt-1 pt-1 border-t border-slate-200 flex items-center gap-2">
                <span className="text-slate-500 shrink-0 font-semibold">Chẩn đoán xác định:</span>
                <span className="font-bold text-slate-900">{diagnosis || 'Bệnh lý da liễu'}</span>
              </div>
            </div>

            {/* Prescription Table */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <span className="font-serif italic font-black text-blue-700 text-base">Rx.</span>
                <span className="uppercase tracking-wider text-xs">Chỉ định thuốc điều trị:</span>
              </div>

              {prescriptions.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center text-slate-500">
                  Không có thuốc kê toa trong lần khám này.
                </div>
              ) : (
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300">
                      <tr>
                        <th className="py-2 px-3 w-8">#</th>
                        <th className="py-2 px-3">Tên thuốc & Hàm lượng</th>
                        <th className="py-2 px-3 w-28">Dạng dùng</th>
                        <th className="py-2 px-3 w-24">Số lượng</th>
                        <th className="py-2 px-3">Hướng dẫn dùng & Liều lượng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {prescriptions.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{item.medicationName}</td>
                          <td className="py-2.5 px-3 text-slate-700">{item.formAndRoute}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-800">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-slate-800">
                            <div className="font-semibold">{item.dosage}</div>
                            {item.instructions && (
                              <div className="text-[11px] text-slate-500 italic mt-0.5">
                                Lưu ý: {item.instructions}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Treatment plan & Skincare Regimen if any */}
            {(treatmentPlan?.treatmentContent || treatmentPlan?.skincareRegimen || treatmentPlan?.interventionProcedure) && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs">
                <span className="font-bold text-slate-800 uppercase block text-[11px]">
                  Nội dung điều trị phối hợp & Chăm sóc da:
                </span>
                {treatmentPlan.treatmentContent && (
                  <p className="text-slate-700">
                    <strong>Phác đồ:</strong> {treatmentPlan.treatmentContent}
                  </p>
                )}
                {treatmentPlan.interventionProcedure && (
                  <p className="text-slate-700">
                    <strong>Thủ thuật phòng khám:</strong> {treatmentPlan.interventionProcedure}
                  </p>
                )}
                {treatmentPlan.skincareRegimen && (
                  <p className="text-slate-700">
                    <strong>Chăm sóc da & sinh hoạt:</strong> {treatmentPlan.skincareRegimen}
                  </p>
                )}
              </div>
            )}

            {/* Advice & Next Visit */}
            <div className="border border-amber-200 bg-amber-50/60 p-3 rounded-lg text-xs space-y-1">
              <span className="font-bold text-amber-900 block">Lời dặn của Bác sĩ:</span>
              <ul className="list-disc list-inside text-slate-800 space-y-0.5 text-[11px]">
                <li>Dùng thuốc đúng liều, đúng giờ, không tự ý tăng giảm liều hoặc bỏ thuốc.</li>
                <li>Nếu xuất hiện triệu chứng bất thường (dị ứng, nổi mề đay, khó thở...), ngừng thuốc ngay và liên hệ phòng khám.</li>
                <li>Tái khám đúng hẹn hoặc khi có diễn biến bất thường. Khám lại xin mang theo đơn thuốc này.</li>
              </ul>
            </div>

            {/* Footer / Signatures */}
            <div className="pt-4 grid grid-cols-2 text-center text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-slate-600 block">Bệnh nhân / Người nhà</span>
                <span className="text-[10px] text-slate-400 italic block">(Ký và ghi rõ họ tên)</span>
                <div className="h-16"></div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 block">
                  TP. Hồ Chí Minh, ngày {new Date(visitDate).getDate()} tháng {new Date(visitDate).getMonth() + 1} năm {new Date(visitDate).getFullYear()}
                </span>
                <span className="font-bold text-slate-800 uppercase block">Bác sĩ điều trị</span>
                <div className="h-10 flex items-center justify-center">
                  <span className="font-serif italic text-blue-800 font-bold text-lg opacity-80">
                    Le H. Minh
                  </span>
                </div>
                <span className="font-bold text-slate-900 block">{doctorName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
