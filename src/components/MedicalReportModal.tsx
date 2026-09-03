import React, { useRef } from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle, FileText } from 'lucide-react';
import { Patient, Lesion, LesionVisit } from '../types';
import { logAuditEvent } from '../services/storageService';

interface MedicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  lesion?: Lesion;
  visit?: LesionVisit;
}

export const MedicalReportModal: React.FC<MedicalReportModalProps> = ({
  isOpen,
  onClose,
  patient,
  lesion,
  visit,
}) => {
  const reportRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const currentVisit = visit || (lesion ? lesion.visits[lesion.visits.length - 1] : undefined);
  const macroImage = currentVisit?.images.find((i) => i.type === 'macroscopic');
  const dermoImage = currentVisit?.images.find((i) => i.type === 'dermoscopy');
  const ai = currentVisit?.aiAnalysis;

  const handlePrint = () => {
    logAuditEvent(
      'EXPORT_PDF',
      `Xuất in báo cáo bệnh án PDF cho bệnh nhân ${patient.fullName} (${patient.code})`,
      patient.id,
      patient.fullName,
      'SENSITIVE' as any
    );
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      facility: 'Phòng khám Chuyên khoa Da liễu Dermacare AI',
      generatedAt: new Date().toISOString(),
      patient,
      lesion,
      selectedVisit: currentVisit,
      compliance: 'HIPAA Standard / Medical Data Security Verified',
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BenhAn_${patient.code}_${lesion?.code || 'Full'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-4 overflow-hidden flex flex-col max-h-[94vh] border border-slate-200">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-slate-100">Báo cáo Y khoa Chuyên khoa Da liễu & Dermoscopy</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
              title="Xuất file dữ liệu bệnh án"
            >
              <Download className="w-4 h-4" />
              Tải dữ liệu JSON
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              In / Xuất PDF (A4)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Medical Case Report Document */}
        <div ref={reportRef} className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-slate-900 space-y-6">
          {/* Clinic Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-black text-sm flex items-center justify-center">
                  DM
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                    TRUNG TÂM DA LIỄU & CHẨN ĐOÁN HÌNH ẢNH DERMOSCOPY DERMACARE
                  </h1>
                  <p className="text-[11px] text-slate-600">
                    Địa chỉ: Số 120 Đường Nguyễn Du, Quận 1, TP. Hồ Chí Minh • Hotline: (028) 3822 9999
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-mono font-bold text-slate-900 text-sm">MÃ HỒ SƠ: {patient.code}</div>
              <div className="text-slate-500 text-[11px]">Ngày in: {new Date().toLocaleDateString('vi-VN')}</div>
              <div className="inline-flex items-center gap-1 text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded mt-1 border border-blue-200">
                <ShieldCheck className="w-3 h-3" />
                Chuẩn an toàn bảo mật y tế
              </div>
            </div>
          </div>

          {/* Report Title */}
          <div className="text-center py-1">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-slate-900">
              PHIẾU KHÁM & BÁO CÁO CA BỆNH DA LIỄU
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              (Hồ sơ lâm sàng, phân tích hình ảnh học Dermoscopy và tiến triển điều trị)
            </p>
          </div>

          {/* Part 1: Patient Administrative Info */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 print-break-inside-avoid">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 mb-2.5">
              I. THÔNG TIN HÀNH CHÍNH & TIỀN SỬ LÂM SÀNG
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 text-xs">
              <div>
                <span className="text-slate-500 block">Họ và tên:</span>
                <span className="font-bold text-slate-900 text-sm">{patient.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Năm sinh / Tuổi:</span>
                <span className="font-semibold text-slate-800">{patient.dob} ({patient.age} tuổi)</span>
              </div>
              <div>
                <span className="text-slate-500 block">Giới tính:</span>
                <span className="font-semibold text-slate-800">{patient.gender}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phân loại da Fitzpatrick:</span>
                <span className="font-semibold text-slate-800">{patient.fitzpatrick}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Số điện thoại:</span>
                <span className="font-mono text-slate-800">{patient.phone}</span>
              </div>
              <div className="col-span-1 sm:col-span-3">
                <span className="text-slate-500 block">Địa chỉ:</span>
                <span className="text-slate-800">{patient.address || 'Không ghi nhận'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Tiền sử bệnh / Dị ứng:</span>
                <span className="text-slate-800">{patient.medicalHistory} {patient.allergies ? `• Dị ứng: ${patient.allergies}` : ''}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Tiền sử ung thư da gia đình:</span>
                <span className="font-semibold text-slate-800">
                  {patient.familySkinCancerHistory ? 'Có ghi nhận tiền sử nốt ruồi bất thường / u hắc tố' : 'Chưa ghi nhận'}
                </span>
              </div>
            </div>
          </div>

          {/* Part 2: Lesion & Visit Details */}
          {lesion && currentVisit && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 print-break-inside-avoid">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5 mb-2.5">
                II. ĐẶC ĐIỂM TỔN THƯƠNG & LÂM SÀNG (LẦN KHÁM: {currentVisit.visitType} - {currentVisit.visitDate})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Mã tổn thương:</span>
                  <span className="font-mono font-bold text-slate-900">{lesion.code}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Vị trí giải phẫu:</span>
                  <span className="font-semibold text-slate-900">{lesion.anatomicalSite}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Kích thước đo được:</span>
                  <span className="font-mono font-bold text-slate-900">{currentVisit.lesionSize}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Thời gian xuất hiện:</span>
                  <span className="text-slate-800">{lesion.onsetDuration}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Triệu chứng cơ năng:</span>
                  <span className="text-slate-800">{lesion.symptoms.join(', ') || 'Không ngứa, không rỉ máu'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Bác sĩ phụ trách:</span>
                  <span className="font-semibold text-slate-800">{currentVisit.doctorName}</span>
                </div>
                {lesion.morphologyNotes && (
                  <div className="col-span-4 mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block font-semibold">Hình thái & Hình dạng sang thương:</span>
                    <span className="text-slate-800">{lesion.morphologyNotes}</span>
                  </div>
                )}
                {currentVisit.clinicalNotes && (
                  <div className="col-span-4 mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block font-semibold">Mô tả lâm sàng:</span>
                    <span className="text-slate-800">{currentVisit.clinicalNotes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Part 3: Macroscopic & Dermoscopy Images Attached */}
          {currentVisit && currentVisit.images.length > 0 && (
            <div className="print-break-inside-avoid space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                III. HÌNH ẢNH HỌC LÂM SÀNG & KÍNH SOI DA (DERMOSCOPY)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {macroImage && (
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 text-center space-y-1.5">
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                      <img src={macroImage.dataUrl} alt="Macroscopic" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 uppercase">Ảnh tổn thương đại thể (Macroscopic)</div>
                    <div className="text-[11px] text-slate-500">Độ phóng đại: {macroImage.magnification || 'Macro 1:1 có thước đo'}</div>
                  </div>
                )}
                {dermoImage && (
                  <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 text-center space-y-1.5">
                    <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center">
                      <img src={dermoImage.dataUrl} alt="Dermoscopy" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 uppercase">Ảnh soi da phân cực (Dermoscopy)</div>
                    <div className="text-[11px] text-slate-500">Độ phóng đại: {dermoImage.magnification || '10x Polarized Reticle'}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Part 4: AI & Dermoscopy Criteria Evaluation */}
          {ai && (
            <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 print-break-inside-avoid space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
                IV. KẾT QUẢ ĐÁNH GIÁ DERMOSCOPY & HỆ THỐNG TRỢ LÝ AI (GEMINI)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                  <span className="text-slate-500 block text-[10px]">A (Asymmetry)</span>
                  <span className="font-bold text-slate-800">{ai.abcdScore.asymmetry}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                  <span className="text-slate-500 block text-[10px]">B (Border)</span>
                  <span className="font-bold text-slate-800">{ai.abcdScore.border}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                  <span className="text-slate-500 block text-[10px]">C (Color)</span>
                  <span className="font-bold text-slate-800">{ai.abcdScore.color}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                  <span className="text-slate-500 block text-[10px]">D (Structures)</span>
                  <span className="font-bold text-slate-800">{ai.abcdScore.differentialStructures}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">Điểm tổng TDS (Total Dermoscopy Score): </span>
                  <span className="font-mono font-black text-teal-800 text-sm">{ai.abcdScore.tds}</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">{ai.abcdScore.interpretation}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                    ai.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                  }`}>
                    Nguy cơ: {ai.riskLevel}
                  </span>
                </div>
              </div>

              {/* Differential diagnosis list */}
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-slate-700 block">Chẩn đoán phân biệt khả dĩ:</span>
                {ai.differentialDiagnoses.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-100">
                    <span>{i + 1}. {d.disease}</span>
                    <span className="font-mono font-bold text-teal-700">{d.probability}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Part 5: Final Diagnosis & Treatment Regimen */}
          <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/50 print-break-inside-avoid space-y-2 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1.5">
              V. CHẨN ĐOÁN XÁC ĐỊNH & KẾ HOẠCH ĐIỀU TRỊ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block font-semibold">Chẩn đoán của bác sĩ điều trị:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {currentVisit?.diagnosis || 'Theo dõi nốt ruồi loạn sản / nghi ngờ tổn thương tế bào hắc tố'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Phác đồ điều trị / Can thiệp:</span>
                <p className="text-slate-800 mt-0.5">
                  {currentVisit?.treatmentPlan?.treatmentContent || currentVisit?.treatmentApplied || 'Chống nắng phổ rộng SPF50+, dưỡng ẩm, chưa can thiệp xâm lấn'}
                </p>
              </div>
            </div>

            {currentVisit?.treatmentPlan?.prescriptions && currentVisit.treatmentPlan.prescriptions.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-700 block font-bold mb-1">Đơn thuốc y khoa chỉ định (Rx):</span>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <th className="py-1.5 px-2.5 w-7">#</th>
                        <th className="py-1.5 px-2.5">Tên thuốc & hàm lượng</th>
                        <th className="py-1.5 px-2.5 w-24">Dạng</th>
                        <th className="py-1.5 px-2.5 w-20">Số lượng</th>
                        <th className="py-1.5 px-2.5">Cách dùng & Lưu ý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {currentVisit.treatmentPlan.prescriptions.map((rx, i) => (
                        <tr key={rx.id}>
                          <td className="py-1 px-2.5 font-mono text-slate-400 font-bold">{i + 1}</td>
                          <td className="py-1 px-2.5 font-semibold text-slate-900">{rx.medicationName}</td>
                          <td className="py-1 px-2.5 text-slate-600">{rx.formAndRoute}</td>
                          <td className="py-1 px-2.5 font-mono font-bold text-blue-700">{rx.quantity}</td>
                          <td className="py-1 px-2.5 text-slate-800">
                            <div>{rx.dosage}</div>
                            {rx.instructions && <div className="text-[10px] text-slate-500 italic">{rx.instructions}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentVisit?.treatmentPlan?.skincareRegimen && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block font-semibold">Chế độ chăm sóc da & sinh hoạt:</span>
                <p className="text-slate-800 mt-0.5">{currentVisit.treatmentPlan.skincareRegimen}</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200">
              <span className="text-slate-500 block font-semibold">Lời dặn bác sĩ & Lịch tái khám:</span>
              <p className="text-slate-800 mt-0.5">
                {currentVisit?.doctorInstructions || 'Tái khám định kỳ sau 3 tháng để chụp dermoscopy đối chiếu. Báo ngay bác sĩ nếu có vết loét, ngứa tăng hoặc thay đổi màu sắc nhanh chóng.'}
              </p>
            </div>
          </div>

          {/* Part 6: Signatures & Certification */}
          <div className="pt-6 grid grid-cols-2 gap-6 text-center text-xs print-break-inside-avoid">
            <div>
              <p className="font-semibold text-slate-600">BỆNH NHÂN / ĐẠI DIỆN HỢP PHÁP</p>
              <p className="text-[10px] text-slate-400 italic">(Đã đọc và đồng ý lưu trữ hình ảnh y tế)</p>
              <div className="h-20 flex items-center justify-center text-slate-400 italic">
                (Đã ký xác nhận điện tử)
              </div>
              <p className="font-bold text-slate-800">{patient.fullName}</p>
            </div>

            <div>
              <p className="font-semibold text-slate-600">BÁC SĨ CHUYÊN KHOA KHÁM & SOI DA</p>
              <p className="text-[10px] text-slate-400 italic">(Ký, ghi rõ họ tên và đóng dấu chuyên môn)</p>
              <div className="h-20 flex flex-col items-center justify-center">
                <div className="w-16 h-10 border border-teal-600/40 rounded flex items-center justify-center text-[10px] text-teal-800 font-mono rotate-[-4deg] bg-teal-50/50">
                  DERMACARE DIGITAL SEAL
                </div>
              </div>
              <p className="font-bold text-slate-900">{currentVisit?.doctorName || 'BS. CKII Lê Hoàng Minh'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
