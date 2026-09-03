import React, { useState } from 'react';
import {
  X,
  Camera,
  Plus,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Activity,
  Calendar,
  FileText,
  Maximize2,
  RefreshCw,
  Pill,
  Printer,
  Trash2,
} from 'lucide-react';
import { Patient, Lesion, LesionVisit, LesionImage, AIAnalysisResult, TreatmentPlan, PrescriptionItem } from '../types';
import { analyzeLesionWithAI } from '../services/apiService';
import { logAuditEvent } from '../services/storageService';
import { CameraCaptureModal } from './CameraCaptureModal';
import { DermoscopyViewerModal } from './DermoscopyViewerModal';
import { TreatmentSection } from './TreatmentSection';
import { PrescriptionPrintModal } from './PrescriptionPrintModal';
import { TREATMENT_PRESETS, POPULAR_MEDICATIONS } from '../data/treatmentPresets';

interface LesionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  lesion: Lesion;
  onUpdateLesion: (updated: Lesion) => void;
  onOpenComparison?: () => void;
}

export const LesionDetailModal: React.FC<LesionDetailModalProps> = ({
  isOpen,
  onClose,
  patient,
  lesion,
  onUpdateLesion,
  onOpenComparison,
}) => {
  const [selectedVisitId, setSelectedVisitId] = useState<string>(lesion.visits[lesion.visits.length - 1]?.id || '');
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeImageForViewer, setActiveImageForViewer] = useState<LesionImage | null>(null);
  const [isAddingVisit, setIsAddingVisit] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Print prescription modal state
  const [isPrescriptionPrintOpen, setIsPrescriptionPrintOpen] = useState(false);
  const [visitForPrint, setVisitForPrint] = useState<LesionVisit | null>(null);

  // New visit form state
  const [newVisitDate, setNewVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [newVisitType, setNewVisitType] = useState<LesionVisit['visitType']>('Tái khám 3 tháng');
  const [newVisitSize, setNewVisitSize] = useState('');
  const [newVisitNotes, setNewVisitNotes] = useState('');
  const [newVisitDiagnosis, setNewVisitDiagnosis] = useState('');
  const [newVisitTreatment, setNewVisitTreatment] = useState('');
  const [newVisitIntervention, setNewVisitIntervention] = useState('');
  const [newVisitSkincare, setNewVisitSkincare] = useState('');
  const [newVisitInstructions, setNewVisitInstructions] = useState('Tiếp tục chăm sóc theo hướng dẫn của bác sĩ.');
  const [newVisitPrescriptions, setNewVisitPrescriptions] = useState<PrescriptionItem[]>([]);
  const [newVisitImages, setNewVisitImages] = useState<LesionImage[]>([]);

  // Prescription builder within Add Visit
  const [addMedName, setAddMedName] = useState('');
  const [addMedForm, setAddMedForm] = useState('Kem bôi ngoài da');
  const [addMedDosage, setAddMedDosage] = useState('');
  const [addMedQuantity, setAddMedQuantity] = useState('1 tuýp');

  if (!isOpen) return null;

  const currentVisit = lesion.visits.find((v) => v.id === selectedVisitId) || lesion.visits[lesion.visits.length - 1];

  const handleRunAIAnalysis = async () => {
    if (!currentVisit) return;
    setIsAnalyzingAI(true);
    setAiError(null);

    try {
      const payload = {
        patient: {
          code: patient.code,
          age: patient.age,
          gender: patient.gender,
          fitzpatrick: patient.fitzpatrick,
          history: patient.medicalHistory + (patient.familySkinCancerHistory ? ' (Có tiền sử ung thư da gia đình)' : ''),
        },
        lesionInfo: {
          type: lesion.lesionType,
          location: lesion.anatomicalSite,
          duration: lesion.onsetDuration,
          size: currentVisit.lesionSize,
          symptoms: lesion.symptoms,
          morphology: lesion.morphologyNotes,
        },
        images: currentVisit.images.map((img) => ({
          type: img.type,
          dataUrl: img.dataUrl,
          label: img.label,
        })),
        clinicalNotes: currentVisit.clinicalNotes,
      };

      const result: AIAnalysisResult = await analyzeLesionWithAI(payload);

      const updatedVisits = lesion.visits.map((v) => {
        if (v.id === currentVisit.id) {
          return { ...v, aiAnalysis: result };
        }
        return v;
      });

      const updatedLesion = { ...lesion, visits: updatedVisits };
      onUpdateLesion(updatedLesion);

      logAuditEvent(
        'RUN_AI_ANALYSIS',
        `Phân tích AI Dermoscopy & Lâm sàng cho tổn thương ${lesion.code} (${lesion.anatomicalSite})`,
        lesion.id,
        lesion.code
      );
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAiError(err.message || 'Lỗi khi gửi ảnh phân tích AI. Vui lòng kiểm tra kết nối.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleSaveTreatmentPlan = (
    updatedPlan: TreatmentPlan,
    updatedApplied: string,
    updatedInstructions: string
  ) => {
    if (!currentVisit) return;
    const updatedVisits = lesion.visits.map((v) => {
      if (v.id === currentVisit.id) {
        return {
          ...v,
          treatmentPlan: updatedPlan,
          treatmentApplied: updatedApplied,
          doctorInstructions: updatedInstructions,
        };
      }
      return v;
    });

    const updatedLesion = { ...lesion, visits: updatedVisits };
    onUpdateLesion(updatedLesion);

    logAuditEvent(
      'UPDATE_PATIENT',
      `Cập nhật đơn thuốc & phác đồ điều trị cho tổn thương ${lesion.code} (${currentVisit.visitType})`,
      lesion.id,
      lesion.code
    );
  };

  const handleApplyPresetInAddVisit = (presetId: string) => {
    const preset = TREATMENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setNewVisitDiagnosis(preset.diagnosis);
    setNewVisitTreatment(preset.treatmentContent);
    setNewVisitIntervention(preset.interventionProcedure || '');
    setNewVisitSkincare(preset.skincareRegimen || '');
    setNewVisitInstructions(preset.doctorInstructions || 'Tái khám theo lịch hẹn.');
    setNewVisitPrescriptions(
      preset.prescriptions.map((p, idx) => ({
        ...p,
        id: 'rx-new-' + Date.now().toString(36) + '-' + idx,
      }))
    );
  };

  const handleQuickAddMedicationInAddVisit = (med: (typeof POPULAR_MEDICATIONS)[0]) => {
    const newRx: PrescriptionItem = {
      id: 'rx-new-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      medicationName: med.name,
      formAndRoute: med.form,
      dosage: med.defaultDosage,
      quantity: med.defaultQty,
      instructions: 'Dùng theo chỉ định của bác sĩ',
    };
    setNewVisitPrescriptions((prev) => [...prev, newRx]);
  };

  const handleAddCustomMedInAddVisit = () => {
    if (!addMedName.trim()) return;
    const newRx: PrescriptionItem = {
      id: 'rx-new-' + Date.now().toString(36),
      medicationName: addMedName.trim(),
      formAndRoute: addMedForm,
      dosage: addMedDosage.trim() || 'Dùng 1-2 lần/ngày',
      quantity: addMedQuantity.trim() || '1 đơn vị',
      instructions: 'Theo hướng dẫn bác sĩ',
    };
    setNewVisitPrescriptions((prev) => [...prev, newRx]);
    setAddMedName('');
    setAddMedDosage('');
  };

  const handleCreateVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitSize.trim()) {
      alert('Vui lòng nhập kích thước tổn thương hiện tại.');
      return;
    }

    const newVisit: LesionVisit = {
      id: 'vis-' + Date.now().toString(36),
      lesionId: lesion.id,
      patientId: patient.id,
      visitDate: newVisitDate,
      visitType: newVisitType,
      doctorName: 'BS. CKII Lê Hoàng Minh',
      lesionSize: newVisitSize.trim(),
      clinicalSymptoms: lesion.symptoms,
      clinicalNotes: newVisitNotes.trim(),
      diagnosis: newVisitDiagnosis.trim() || currentVisit?.diagnosis || 'Theo dõi định kỳ',
      treatmentApplied: newVisitTreatment.trim(),
      treatmentPlan: {
        treatmentContent: newVisitTreatment.trim(),
        interventionProcedure: newVisitIntervention.trim(),
        skincareRegimen: newVisitSkincare.trim(),
        prescriptions: newVisitPrescriptions,
      },
      doctorInstructions: newVisitInstructions.trim() || 'Tiếp tục chăm sóc theo hướng dẫn của bác sĩ.',
      images: newVisitImages,
      createdAt: new Date().toISOString(),
    };

    const updatedLesion = {
      ...lesion,
      visits: [...lesion.visits, newVisit],
    };

    onUpdateLesion(updatedLesion);
    setSelectedVisitId(newVisit.id);
    setIsAddingVisit(false);
    setNewVisitImages([]);
    setNewVisitNotes('');
    setNewVisitSize('');
    setNewVisitTreatment('');
    setNewVisitIntervention('');
    setNewVisitSkincare('');
    setNewVisitPrescriptions([]);
    setNewVisitDiagnosis('');

    logAuditEvent(
      'RECORD_VISIT',
      `Thêm lần khám ${newVisit.visitType} (${newVisit.visitDate}) cho tổn thương ${lesion.code}`,
      lesion.id,
      lesion.code
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl my-4 overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-mono font-bold">
              {lesion.code}
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{lesion.anatomicalSite}</h3>
              <p className="text-xs text-slate-500">
                Bệnh nhân: <strong className="text-slate-700">{patient.fullName}</strong> ({patient.code}) • {lesion.lesionType} • Khởi phát: {lesion.onsetDuration}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lesion.visits.length >= 2 && onOpenComparison && (
              <button
                onClick={() => {
                  onClose();
                  onOpenComparison();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition"
              >
                <Activity className="w-3.5 h-3.5" />
                So sánh tiến triển
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Lesion Morphology Notes Banner if provided */}
          {lesion.morphologyNotes && (
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-700">
              <span className="font-bold text-blue-900 shrink-0 bg-blue-100/80 px-2 py-0.5 rounded text-[11px] border border-blue-200">
                Hình thái sang thương:
              </span>
              <span className="text-slate-800 leading-relaxed font-medium">{lesion.morphologyNotes}</span>
            </div>
          )}

          {/* Visits Timeline Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Lịch sử các lần khám & Chụp ảnh:
              </span>
              <button
                onClick={() => setIsAddingVisit(!isAddingVisit)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAddingVisit ? 'Hủy thêm lần khám' : 'Thêm lần khám mới'}
              </button>
            </div>

            {/* Visit selector pills */}
            <div className="flex flex-wrap items-center gap-2">
              {lesion.visits.map((vis) => (
                <button
                  key={vis.id}
                  onClick={() => {
                    setSelectedVisitId(vis.id);
                    setIsAddingVisit(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
                    vis.id === currentVisit?.id && !isAddingVisit
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{vis.visitDate} ({vis.visitType})</span>
                  <span className="text-[10px] opacity-80 font-mono">{vis.lesionSize}</span>
                </button>
              ))}
            </div>
          </div>

          {/* New Visit Form Modal Section */}
          {isAddingVisit && (
            <form onSubmit={handleCreateVisit} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Ghi nhận lần tái khám / Chụp ảnh mới
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ngày khám:</label>
                  <input
                    type="date"
                    value={newVisitDate}
                    onChange={(e) => setNewVisitDate(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Loại lần khám:</label>
                  <select
                    value={newVisitType}
                    onChange={(e) => setNewVisitType(e.target.value as any)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Khám lần đầu">Khám lần đầu</option>
                    <option value="Tái khám 1 tháng">Tái khám 1 tháng</option>
                    <option value="Tái khám 3 tháng">Tái khám 3 tháng</option>
                    <option value="Tái khám 6 tháng">Tái khám 6 tháng</option>
                    <option value="Sau can thiệp / Sinh thiết">Sau can thiệp / Sinh thiết</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Kích thước đo được (mm):</label>
                  <input
                    type="text"
                    value={newVisitSize}
                    onChange={(e) => setNewVisitSize(e.target.value)}
                    placeholder="Ví dụ: 8.5 x 6.2 mm"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ghi chú lâm sàng:</label>
                  <textarea
                    rows={2}
                    value={newVisitNotes}
                    onChange={(e) => setNewVisitNotes(e.target.value)}
                    placeholder="Đặc điểm bờ tổn thương, vảy da, màu sắc..."
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Chẩn đoán lần này:</label>
                  <input
                    type="text"
                    value={newVisitDiagnosis}
                    onChange={(e) => setNewVisitDiagnosis(e.target.value)}
                    placeholder="Ví dụ: Trứng cá viêm mức độ trung bình"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phác đồ mẫu điều trị nhanh trong lần khám mới */}
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Áp dụng phác đồ điều trị & Đơn thuốc mẫu:
                  </span>
                  <span className="text-[10px] text-emerald-700 italic">Tự động điền đơn thuốc & nội dung</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TREATMENT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPresetInAddVisit(preset.id)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-600 hover:text-white text-emerald-900 rounded-lg border border-emerald-300 text-xs font-semibold shadow-2xs transition"
                    >
                      + {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nội dung điều trị:</label>
                  <textarea
                    rows={2}
                    value={newVisitTreatment}
                    onChange={(e) => setNewVisitTreatment(e.target.value)}
                    placeholder="Phác đồ phối hợp, mục tiêu điều trị..."
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Thủ thuật can thiệp:</label>
                  <textarea
                    rows={2}
                    value={newVisitIntervention}
                    onChange={(e) => setNewVisitIntervention(e.target.value)}
                    placeholder="Lấy nhân mụn, sát trùng, áp lạnh..."
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Hướng dẫn chăm sóc da:</label>
                  <input
                    type="text"
                    value={newVisitSkincare}
                    onChange={(e) => setNewVisitSkincare(e.target.value)}
                    placeholder="Sữa rửa mặt, dưỡng ẩm, chống nắng..."
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lời dặn bác sĩ & Hẹn khám:</label>
                  <input
                    type="text"
                    value={newVisitInstructions}
                    onChange={(e) => setNewVisitInstructions(e.target.value)}
                    placeholder="Tái khám sau 4 tuần..."
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bảng đơn thuốc Rx trong lần khám mới */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <span className="font-serif italic font-black text-blue-700">Rx.</span>
                    Kê đơn thuốc cho lần khám này ({newVisitPrescriptions.length} thuốc):
                  </span>
                </div>

                {newVisitPrescriptions.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 font-semibold text-slate-700">
                        <tr>
                          <th className="py-1.5 px-2 w-7">#</th>
                          <th className="py-1.5 px-2">Tên thuốc</th>
                          <th className="py-1.5 px-2 w-24">Dạng</th>
                          <th className="py-1.5 px-2 w-16">SL</th>
                          <th className="py-1.5 px-2">Liều dùng</th>
                          <th className="py-1.5 px-1.5 w-8 text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {newVisitPrescriptions.map((rx, idx) => (
                          <tr key={rx.id} className="hover:bg-slate-50/50">
                            <td className="py-1.5 px-2 font-mono text-slate-400 font-bold">{idx + 1}</td>
                            <td className="py-1.5 px-2 font-semibold text-slate-900">{rx.medicationName}</td>
                            <td className="py-1.5 px-2 text-slate-600">{rx.formAndRoute}</td>
                            <td className="py-1.5 px-2 font-mono font-bold text-blue-700">{rx.quantity}</td>
                            <td className="py-1.5 px-2 text-slate-800">{rx.dosage}</td>
                            <td className="py-1.5 px-1.5 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setNewVisitPrescriptions(newVisitPrescriptions.filter((item) => item.id !== rx.id))
                                }
                                className="text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Quick Add Medication */}
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-slate-500 font-semibold mr-1">Thêm nhanh:</span>
                  {POPULAR_MEDICATIONS.map((med) => (
                    <button
                      key={med.name}
                      type="button"
                      onClick={() => handleQuickAddMedicationInAddVisit(med)}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded border border-slate-200 transition"
                    >
                      + {med.name}
                    </button>
                  ))}
                </div>

                {/* Manual Add Medication */}
                <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center pt-1 border-t border-slate-100">
                  <input
                    type="text"
                    placeholder="Tên thuốc..."
                    value={addMedName}
                    onChange={(e) => setAddMedName(e.target.value)}
                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="SL (1 tuýp/hộp)"
                    value={addMedQuantity}
                    onChange={(e) => setAddMedQuantity(e.target.value)}
                    className="w-24 text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Cách dùng..."
                    value={addMedDosage}
                    onChange={(e) => setAddMedDosage(e.target.value)}
                    className="flex-1 text-xs border border-slate-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomMedInAddVisit}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-semibold shrink-0 hover:bg-blue-700 transition"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* Images for this visit */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">Hình ảnh đính kèm ({newVisitImages.length}):</span>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Chụp / Tải ảnh tổn thương
                  </button>
                </div>

                {newVisitImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {newVisitImages.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-300 group">
                        <img src={img.dataUrl} alt={img.label} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                          {img.type === 'dermoscopy' ? 'Dermoscopy' : 'Đại thể'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewVisitImages(newVisitImages.filter((i) => i.id !== img.id))}
                          className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center text-xs text-slate-500">
                    Chưa có ảnh. Vui lòng bấm <strong>"Chụp / Tải ảnh tổn thương"</strong> để bổ sung ảnh đại thể và dermoscopy.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingVisit(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm transition"
                >
                  Lưu lần khám
                </button>
              </div>
            </form>
          )}

          {/* Current Visit Details View */}
          {currentVisit && !isAddingVisit && (
            <div className="space-y-6">
              {/* Visit Summary Card */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Lần khám: {currentVisit.visitType}</span>
                      <span className="text-xs font-normal text-slate-500">({currentVisit.visitDate})</span>
                    </h4>
                    <p className="text-xs text-slate-500">Bác sĩ phụ trách: {currentVisit.doctorName}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCameraOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      Thêm ảnh vào lần khám này
                    </button>

                    <button
                      onClick={handleRunAIAnalysis}
                      disabled={isAnalyzingAI || currentVisit.images.length === 0}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                    >
                      {isAnalyzingAI ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Đang phân tích AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          AI Phân tích Dermoscopy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-500 block uppercase">Kích thước đo:</span>
                    <span className="text-slate-900 font-mono text-sm font-semibold">{currentVisit.lesionSize}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block uppercase">Chẩn đoán lâm sàng:</span>
                    <span className="text-slate-900 font-medium">{currentVisit.diagnosis || 'Chưa ghi nhận'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block uppercase">Phác đồ điều trị:</span>
                    <span className="text-slate-900">{currentVisit.treatmentApplied || 'Chưa can thiệp'}</span>
                  </div>
                </div>

                {currentVisit.clinicalNotes && (
                  <div className="text-xs bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-semibold text-slate-600 block mb-1">Ghi chú lâm sàng:</span>
                    <p className="text-slate-800 leading-relaxed">{currentVisit.clinicalNotes}</p>
                  </div>
                )}
              </div>

              {/* Interactive Treatment & Prescription Section */}
              <TreatmentSection
                treatmentPlan={currentVisit.treatmentPlan}
                treatmentAppliedText={currentVisit.treatmentApplied}
                doctorInstructionsText={currentVisit.doctorInstructions}
                diagnosisText={currentVisit.diagnosis}
                doctorName={currentVisit.doctorName}
                visitDate={currentVisit.visitDate}
                patient={patient}
                isEditable={true}
                onSavePlan={handleSaveTreatmentPlan}
                onPrintPrescription={() => {
                  setVisitForPrint(currentVisit);
                  setIsPrescriptionPrintOpen(true);
                }}
              />

              {aiError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Image Gallery (Macroscopic & Dermoscopy) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Hình ảnh học lâm sàng & Dermoscopy ({currentVisit.images.length}):
                  </h4>
                  <span className="text-xs text-slate-400">Nhấn vào ảnh để xem vi thể phóng đại & thước 1mm</span>
                </div>

                {currentVisit.images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {currentVisit.images.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => {
                          setActiveImageForViewer(img);
                          logAuditEvent(
                            'VIEW_DERMOSCOPY',
                            `Mở xem phóng đại hình ảnh ${img.type} cho tổn thương ${lesion.code}`,
                            img.id,
                            img.label
                          );
                        }}
                        className="group relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-end"
                      >
                        <img
                          src={img.dataUrl}
                          alt={img.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        
                        {/* Overlay tags */}
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                            img.type === 'dermoscopy' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'
                          }`}>
                            {img.type === 'dermoscopy' ? 'DERMOSCOPY' : 'ĐẠI THỂ'}
                          </span>
                          {img.magnification && (
                            <span className="text-[10px] bg-black/60 text-slate-200 px-1.5 py-0.5 rounded backdrop-blur-xs">
                              {img.magnification}
                            </span>
                          )}
                        </div>

                        <div className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>

                        <div className="p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
                          <div className="text-xs font-semibold truncate">{img.label}</div>
                          <div className="text-[10px] text-slate-300">
                            {new Date(img.takenAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                    <p className="text-sm text-slate-500">Chưa có hình ảnh nào cho lần khám này.</p>
                    <button
                      onClick={() => setIsCameraOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Chụp hoặc tải ảnh lên ngay
                    </button>
                  </div>
                )}
              </div>

              {/* AI Analysis Diagnostic Findings Section */}
              {currentVisit.aiAnalysis && (
                <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          Kết quả phân tích AI Dermoscopy (Gemini 3.8 Flash)
                        </h4>
                        <p className="text-xs text-slate-500">
                          Được thực hiện lúc {new Date(currentVisit.aiAnalysis.analyzedAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        currentVisit.aiAnalysis.riskLevel === 'HIGH'
                          ? 'bg-rose-100 text-rose-800'
                          : currentVisit.aiAnalysis.riskLevel === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        MỨC ĐỘ NGUY CƠ: {currentVisit.aiAnalysis.riskLevel}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl leading-relaxed border border-slate-200">
                    {currentVisit.aiAnalysis.summary}
                  </p>

                  {/* ABCD Score Grid */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Thang điểm ABCD & Điểm tổng Dermoscopy (TDS):
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block">A (Bất đối xứng)</span>
                        <span className="font-bold text-slate-800 text-base">{currentVisit.aiAnalysis.abcdScore.asymmetry}/2</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block">B (Đường bờ)</span>
                        <span className="font-bold text-slate-800 text-base">{currentVisit.aiAnalysis.abcdScore.border}/8</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block">C (Màu sắc)</span>
                        <span className="font-bold text-slate-800 text-base">{currentVisit.aiAnalysis.abcdScore.color}/6</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block">D (Cấu trúc)</span>
                        <span className="font-bold text-slate-800 text-base">{currentVisit.aiAnalysis.abcdScore.differentialStructures}/5</span>
                      </div>
                      <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200 col-span-2 sm:col-span-1">
                        <span className="text-blue-700 font-semibold block">TỔNG TDS</span>
                        <span className="font-black text-blue-900 text-lg">{currentVisit.aiAnalysis.abcdScore.tds}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 italic">
                      * Ý nghĩa TDS: {currentVisit.aiAnalysis.abcdScore.interpretation}
                    </p>
                  </div>

                  {/* Dermoscopic Features List */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Chi tiết đặc điểm kính soi da (Dermoscopy):
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <strong className="text-slate-700 block">Mạng sắc tố (Pigment network):</strong>
                        <span className="text-slate-600">{currentVisit.aiAnalysis.dermoscopyFindings.pigmentNetwork}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <strong className="text-slate-700 block">Cấu trúc mạch máu (Vascular patterns):</strong>
                        <span className="text-slate-600">{currentVisit.aiAnalysis.dermoscopyFindings.vascularPattern}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <strong className="text-slate-700 block">Chấm & Hạt (Dots & globules):</strong>
                        <span className="text-slate-600">{currentVisit.aiAnalysis.dermoscopyFindings.dotsAndGlobules}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <strong className="text-slate-700 block">Màn che xanh trắng (Blue-white veil):</strong>
                        <span className="text-slate-600">{currentVisit.aiAnalysis.dermoscopyFindings.blueWhiteVeil}</span>
                      </div>
                    </div>
                  </div>

                  {/* Differential Diagnoses */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Chẩn đoán phân biệt & Xác suất ước tính:
                    </h5>
                    <div className="space-y-1.5">
                      {currentVisit.aiAnalysis.differentialDiagnoses.map((diff, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-900">{diff.disease}</span>
                            <p className="text-slate-500 mt-0.5">{diff.rationale}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full"
                                style={{ width: `${diff.probability}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-blue-800 text-xs">{diff.probability}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
                    <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Khuyến nghị lâm sàng của AI:
                    </h5>
                    <ul className="space-y-1 text-xs text-blue-950">
                      {currentVisit.aiAnalysis.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                    ⚠️ <em>Lưu ý: Kết quả phân tích AI mang tính chất hỗ trợ quyết định lâm sàng. Bác sĩ chuyên khoa da liễu luôn là người đưa ra chẩn đoán và chỉ định điều trị cuối cùng.</em>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          if (isAddingVisit) {
            setNewVisitImages([...newVisitImages, img]);
          } else if (currentVisit) {
            const updatedVisits = lesion.visits.map((v) => {
              if (v.id === currentVisit.id) {
                return { ...v, images: [...v.images, img] };
              }
              return v;
            });
            onUpdateLesion({ ...lesion, visits: updatedVisits });
          }
        }}
      />

      {/* Dermoscopy Full-Screen Zoom Viewer */}
      <DermoscopyViewerModal
        isOpen={Boolean(activeImageForViewer)}
        onClose={() => setActiveImageForViewer(null)}
        image={activeImageForViewer}
        patientName={patient.fullName}
        lesionSite={lesion.anatomicalSite}
      />

      {/* Official Medical Prescription Print Modal */}
      {isPrescriptionPrintOpen && visitForPrint && (
        <PrescriptionPrintModal
          isOpen={isPrescriptionPrintOpen}
          onClose={() => {
            setIsPrescriptionPrintOpen(false);
            setVisitForPrint(null);
          }}
          patient={patient}
          prescriptions={visitForPrint.treatmentPlan?.prescriptions || []}
          treatmentPlan={visitForPrint.treatmentPlan}
          diagnosis={visitForPrint.diagnosis || lesion.lesionType}
          visitDate={visitForPrint.visitDate}
        />
      )}
    </div>
  );
};
