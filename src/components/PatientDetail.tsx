import React, { useState } from 'react';
import { ArrowLeft, Plus, Calendar, ShieldCheck, AlertCircle, FileText, Activity, Layers, Phone, Mail, MapPin, Sparkles, Camera, CheckCircle2, ChevronRight, User, Pill, Printer, Copy, Check, Trash2, Stethoscope, Sparkle, RefreshCw, Pencil, X, Package, Search, Zap, Syringe, Cloud, CloudUpload } from 'lucide-react';
import { Patient, Lesion, LesionVisit, Appointment, PrescriptionItem, TreatmentPlan, ClinicalProcedure, InventoryItem } from '../types';
import { ComparisonView } from './ComparisonView';
import { LesionDetailModal } from './LesionDetailModal';
import { MedicalReportModal } from './MedicalReportModal';
import { PrescriptionPrintModal } from './PrescriptionPrintModal';
import { RecordProcedureModal } from './RecordProcedureModal';
import { TREATMENT_PRESETS, POPULAR_MEDICATIONS } from '../data/treatmentPresets';
import { logAuditEvent, loadInventory, getPatientDossierExport } from '../services/storageService';
import { getAccessToken, googleSignIn } from '../services/googleAuthService';
import { getOrCreateFolder, uploadJsonToDrive } from '../services/googleDriveService';

interface PatientDetailProps {
  patient: Patient;
  lesions: Lesion[];
  appointments: Appointment[];
  procedures?: ClinicalProcedure[];
  onBack: () => void;
  onUpdatePatient: (updated: Patient) => void;
  onUpdateLesions: (updated: Lesion[]) => void;
  onUpdateAppointments: (updated: Appointment[]) => void;
  onAddProcedure?: (procedure: ClinicalProcedure, deductStock: boolean) => void;
  onDeleteProcedure?: (procedureId: string) => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({
  patient,
  lesions,
  appointments,
  procedures = [],
  onBack,
  onUpdatePatient,
  onUpdateLesions,
  onUpdateAppointments,
  onAddProcedure,
  onDeleteProcedure,
}) => {
  const [activeTab, setActiveTab] = useState<'lesions' | 'progress' | 'treatments' | 'procedures' | 'appointments'>('lesions');
  const [selectedLesion, setSelectedLesion] = useState<Lesion | null>(null);
  const [isNewLesionModalOpen, setIsNewLesionModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRecordProcedureOpen, setIsRecordProcedureOpen] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSaveSuccess, setDriveSaveSuccess] = useState<string | null>(null);

  const handleSavePatientToDrive = async () => {
    setIsSavingToDrive(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const res = await googleSignIn();
        token = res?.accessToken || null;
      }
      if (!token) {
        alert('Cần đăng nhập Google Drive để lưu trữ hồ sơ bệnh nhân.');
        setIsSavingToDrive(false);
        return;
      }

      const dossier = getPatientDossierExport(patient.id);
      if (!dossier) return;

      const folderId = await getOrCreateFolder(token);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `HoSo_${patient.code}_${patient.fullName.replace(/\s+/g, '_')}_${timestamp}.json`;
      const description = `Hồ sơ bệnh án da liễu & dermoscopy của bệnh nhân ${patient.fullName} (${patient.code})`;

      await uploadJsonToDrive(token, fileName, dossier, folderId, description);

      logAuditEvent(
        'SYSTEM_EXPORT',
        `Lưu hồ sơ bệnh nhân ${patient.fullName} (${patient.code}) lên Google Drive (${fileName})`,
        patient.id,
        patient.fullName,
        'INFO'
      );

      setDriveSaveSuccess(`Đã lưu hồ sơ bệnh nhân ${patient.fullName} vào Google Drive!`);
      setTimeout(() => setDriveSaveSuccess(null), 4000);
    } catch (err: any) {
      console.error('Error saving patient dossier to Drive:', err);
      alert(`Lỗi lưu lên Google Drive: ${err.message || 'Không thể tải lên'}`);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  // New lesion & consultation (hỏi bệnh & khám bệnh) form state
  const [newSite, setNewSite] = useState('');
  const [newType, setNewType] = useState('Trứng cá (Acne vulgaris)');
  const [newDuration, setNewDuration] = useState('3 tháng');
  const [newSize, setNewSize] = useState('');
  const [newMorphologyNotes, setNewMorphologyNotes] = useState('');
  const [newSymptoms, setNewSymptoms] = useState<string[]>(['Ngứa nhẹ']);
  const [newDiagnosis, setNewDiagnosis] = useState('Trứng cá viêm thông thường');

  // Treatment plan & prescription state for consultation
  const [newTreatmentContent, setNewTreatmentContent] = useState('');
  const [newIntervention, setNewIntervention] = useState('');
  const [newSkincare, setNewSkincare] = useState('');
  const [newDoctorInstructions, setNewDoctorInstructions] = useState('');
  const [newPrescriptions, setNewPrescriptions] = useState<PrescriptionItem[]>([]);

  // Editing existing prescription item in consultation modal
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<string | null>(null);
  const [editPrescriptionName, setEditPrescriptionName] = useState('');
  const [editPrescriptionForm, setEditPrescriptionForm] = useState('');
  const [editPrescriptionDosage, setEditPrescriptionDosage] = useState('');
  const [editPrescriptionQuantity, setEditPrescriptionQuantity] = useState('');
  const [editPrescriptionInstructions, setEditPrescriptionInstructions] = useState('');

  // Inventory selection inside consultation
  const [isInventoryPickerOpen, setIsInventoryPickerOpen] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const inventoryItems = loadInventory();

  // Prescription item input row
  const [medName, setMedName] = useState('');
  const [medForm, setMedForm] = useState('Kem bôi');
  const [medDosage, setMedDosage] = useState('');
  const [medQuantity, setMedQuantity] = useState('1 tuýp');
  const [medInstructions, setMedInstructions] = useState('');

  // Print modal state
  const [isPrescriptionPrintOpen, setIsPrescriptionPrintOpen] = useState(false);
  const [prescriptionPrintData, setPrescriptionPrintData] = useState<{
    prescriptions: PrescriptionItem[];
    treatmentPlan?: TreatmentPlan;
    diagnosis: string;
    visitDate?: string;
  } | null>(null);

  // Copied state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const patientLesions = lesions.filter((l) => l.patientId === patient.id);
  const patientAppointments = appointments.filter((a) => a.patientId === patient.id);
  const patientProcedures = procedures.filter((p) => p.patientId === patient.id);

  const handleStartEditPrescription = (item: PrescriptionItem) => {
    setEditingPrescriptionId(item.id);
    setEditPrescriptionName(item.medicationName);
    setEditPrescriptionForm(item.formAndRoute);
    setEditPrescriptionDosage(item.dosage);
    setEditPrescriptionQuantity(item.quantity);
    setEditPrescriptionInstructions(item.instructions || '');
  };

  const handleSaveEditPrescription = (id: string) => {
    if (!editPrescriptionName.trim()) return;
    setNewPrescriptions(
      newPrescriptions.map((p) =>
        p.id === id
          ? {
              ...p,
              medicationName: editPrescriptionName.trim(),
              formAndRoute: editPrescriptionForm.trim() || 'Kem bôi',
              dosage: editPrescriptionDosage.trim() || 'Dùng theo chỉ định',
              quantity: editPrescriptionQuantity.trim() || '1 đơn vị',
              instructions: editPrescriptionInstructions.trim(),
            }
          : p
      )
    );
    setEditingPrescriptionId(null);
  };

  const handleCancelEditPrescription = () => {
    setEditingPrescriptionId(null);
  };

  const handleSelectFromInventoryInConsultation = (item: InventoryItem) => {
    setMedName(`${item.name} (${item.activeIngredient})`);
    if (item.category === 'TOPICAL_MEDICATION') {
      setMedForm('Kem / Gel bôi ngoài da');
      setMedDosage('Thoa 1 lớp mỏng tại vùng tổn thương ngày 1-2 lần');
      setMedQuantity(`1 ${item.unit}`);
    } else if (item.category === 'ORAL_MEDICATION') {
      setMedForm('Viên uống');
      setMedDosage('Uống 1 viên x 2 lần/ngày sau khi ăn no');
      setMedQuantity(`30 ${item.unit}`);
    } else {
      setMedForm(item.unit);
      setMedDosage('Dùng theo phác đồ chỉ định');
      setMedQuantity(`1 ${item.unit}`);
    }
    setIsInventoryPickerOpen(false);
  };

  const handleUpdateSingleLesion = (updated: Lesion) => {
    const updatedList = lesions.map((l) => (l.id === updated.id ? updated : l));
    onUpdateLesions(updatedList);
    setSelectedLesion(updated);
  };

  const handleApplyPresetInConsultation = (presetId: string) => {
    const preset = TREATMENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setNewTreatmentContent(preset.treatmentContent);
    setNewIntervention(preset.interventionProcedure);
    setNewSkincare(preset.skincareRegimen);
    setNewDoctorInstructions(preset.doctorInstructions);
    setNewDiagnosis(preset.diagnosis);

    const generatedPrescriptions: PrescriptionItem[] = preset.prescriptions.map((p, idx) => ({
      ...p,
      id: 'rx-new-' + Date.now().toString(36) + '-' + idx,
    }));
    setNewPrescriptions(generatedPrescriptions);
  };

  const handleAddMedicationToPrescription = () => {
    if (!medName.trim()) {
      alert('Vui lòng nhập tên thuốc.');
      return;
    }
    const newItem: PrescriptionItem = {
      id: 'rx-new-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      medicationName: medName.trim(),
      formAndRoute: medForm.trim() || 'Kem bôi',
      dosage: medDosage.trim() || 'Dùng theo chỉ định',
      quantity: medQuantity.trim() || '1 đơn vị',
      instructions: medInstructions.trim(),
    };
    setNewPrescriptions([...newPrescriptions, newItem]);
    setMedName('');
    setMedDosage('');
    setMedQuantity('1 tuýp');
    setMedInstructions('');
  };

  const handleQuickAddMedication = (med: typeof POPULAR_MEDICATIONS[0]) => {
    const newItem: PrescriptionItem = {
      id: 'rx-new-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      medicationName: med.name,
      formAndRoute: med.form,
      dosage: med.defaultDosage,
      quantity: med.defaultQty,
      instructions: 'Dùng theo chỉ định của bác sĩ',
    };
    setNewPrescriptions([...newPrescriptions, newItem]);
  };

  const handleRemovePrescriptionItem = (id: string) => {
    setNewPrescriptions(newPrescriptions.filter((p) => p.id !== id));
  };

  const handleCreateLesion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.trim() || !newSize.trim()) {
      alert('Vui lòng nhập vị trí giải phẫu và kích thước tổn thương.');
      return;
    }

    const newLesionCode = `TL-0${patientLesions.length + 1}`;
    const newLesionId = 'les-' + Date.now().toString(36);

    const treatmentPlanObj: TreatmentPlan = {
      treatmentContent: newTreatmentContent.trim() || 'Theo dõi và chăm sóc da tại chỗ.',
      interventionProcedure: newIntervention.trim() || undefined,
      skincareRegimen: newSkincare.trim() || undefined,
      prescriptions: newPrescriptions,
    };

    const initialVisit: LesionVisit = {
      id: 'vis-' + Date.now().toString(36),
      lesionId: newLesionId,
      patientId: patient.id,
      visitDate: new Date().toISOString().split('T')[0],
      visitType: 'Khám lần đầu',
      doctorName: 'BS. CKII Lê Hoàng Minh',
      lesionSize: newSize.trim(),
      clinicalSymptoms: newSymptoms,
      clinicalNotes: `Ghi nhận tổn thương mới tại ${newSite}. Loại: ${newType}. Khởi phát: ${newDuration}.${newMorphologyNotes.trim() ? ` Hình thái sang thương: ${newMorphologyNotes.trim()}.` : ''}`,
      diagnosis: newDiagnosis.trim() || newType,
      treatmentApplied: newTreatmentContent.trim() || 'Chụp lưu trữ hình ảnh, theo dõi định kỳ.',
      doctorInstructions: newDoctorInstructions.trim() || 'Tránh cọ xát cơ học, tái khám theo lịch hẹn.',
      treatmentPlan: treatmentPlanObj,
      images: [],
      createdAt: new Date().toISOString(),
    };

    const createdLesion: Lesion = {
      id: newLesionId,
      patientId: patient.id,
      code: newLesionCode,
      anatomicalSite: newSite.trim(),
      lesionType: newType,
      onsetDuration: newDuration,
      initialSize: newSize.trim(),
      morphologyNotes: newMorphologyNotes.trim() || undefined,
      symptoms: newSymptoms,
      status: 'ACTIVE_MONITORING',
      visits: [initialVisit],
      createdAt: new Date().toISOString(),
    };

    onUpdateLesions([...lesions, createdLesion]);
    setIsNewLesionModalOpen(false);

    // Reset form
    setNewSite('');
    setNewSize('');
    setNewMorphologyNotes('');
    setNewTreatmentContent('');
    setNewIntervention('');
    setNewSkincare('');
    setNewDoctorInstructions('');
    setNewPrescriptions([]);

    setSelectedLesion(createdLesion);

    logAuditEvent(
      'CREATE_LESION',
      `Tạo tổn thương mới ${createdLesion.code} (${createdLesion.anatomicalSite}) kèm đơn thuốc & phác đồ cho ${patient.fullName}`,
      createdLesion.id,
      createdLesion.code
    );
  };

  const handleCopyPrescriptionText = (prescriptions: PrescriptionItem[], visitId: string) => {
    if (prescriptions.length === 0) return;
    const text = prescriptions
      .map(
        (p, idx) =>
          `${idx + 1}. ${p.medicationName} (${p.formAndRoute})\n   Số lượng: ${p.quantity}\n   Cách dùng: ${p.dosage}${p.instructions ? ` (${p.instructions})` : ''}`
      )
      .join('\n\n');

    const fullMessage = `ĐƠN THUỐC DA LIỄU - BỆNH NHÂN: ${patient.fullName} (${patient.code})\nNgày: ${new Date().toLocaleDateString('vi-VN')}\n------------------------------------\n${text}\n------------------------------------\nLời dặn: Dùng thuốc đúng liều, tái khám đúng hẹn.`;

    navigator.clipboard.writeText(fullMessage);
    setCopiedId(visitId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Back button & top navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách bệnh nhân
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSavePatientToDrive}
            disabled={isSavingToDrive}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            title="Tải toàn bộ hồ sơ bệnh án và ảnh dermoscopy của bệnh nhân này lên Google Drive"
          >
            <CloudUpload className={`w-3.5 h-3.5 ${isSavingToDrive ? 'animate-bounce' : ''}`} />
            {isSavingToDrive ? 'Đang lưu lên Drive...' : 'Lưu Hồ Sơ Vào Google Drive'}
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Xuất Báo Cáo Y Khoa (PDF)
          </button>
        </div>
      </div>

      {/* Drive Save Notification */}
      {driveSaveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{driveSaveSuccess}</span>
        </div>
      )}

      {/* Patient Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              {patient.avatarUrl ? (
                <img
                  src={patient.avatarUrl}
                  alt={patient.fullName}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-blue-600 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-200">
                  <User className="w-8 h-8" />
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 p-1 bg-blue-600 text-white rounded-full">
                <ShieldCheck className="w-3 h-3" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{patient.fullName}</h1>
                <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {patient.code}
                </span>
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                  Fitzpatrick: {patient.fitzpatrick}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>{patient.gender} • {patient.age} tuổi ({patient.dob})</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {patient.phone}</span>
                {patient.address && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {patient.address}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {patient.familySkinCancerHistory && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Tiền sử gia đình: Ung thư da / Melanoma
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã ký cam kết đồng ý xử lý dữ liệu Y tế
            </span>
          </div>
        </div>

        {/* Clinical History Bar */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <span className="font-semibold text-slate-600 block">Tiền sử bệnh nội/ngoại khoa:</span>
            <span className="text-slate-800">{patient.medicalHistory}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-600 block">Dị ứng ghi nhận:</span>
            <span className="text-slate-800">{patient.allergies || 'Chưa ghi nhận dị ứng'}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 sm:gap-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('lesions')}
            className={`pb-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'lesions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            Tổn thương da & Dermoscopy ({patientLesions.length})
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'progress'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            Theo dõi tiến triển điều trị
          </button>
          <button
            onClick={() => setActiveTab('treatments')}
            className={`pb-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'treatments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Pill className="w-4 h-4 text-emerald-600" />
            Đơn thuốc & Phác đồ điều trị ({patientLesions.reduce((acc, l) => acc + l.visits.reduce((vAcc, v) => vAcc + (v.treatmentPlan?.prescriptions?.length || 0), 0), 0)})
          </button>
          <button
            onClick={() => setActiveTab('procedures')}
            className={`pb-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'procedures'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            Thủ thuật can thiệp (Laser, Botox, Filler, Meso...) ({patientProcedures.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 text-xs font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'appointments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Lịch hẹn & Nhắc tin nhắn ({patientAppointments.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Lesions & Dermoscopy */}
      {activeTab === 'lesions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Danh mục vị trí tổn thương theo dõi ({patientLesions.length})
            </h3>
            <button
              onClick={() => setIsNewLesionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Ghi nhận tổn thương mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientLesions.map((les) => {
              const latestVisit = les.visits[les.visits.length - 1];
              const dermoImg = latestVisit?.images.find((i) => i.type === 'dermoscopy');
              const macroImg = latestVisit?.images.find((i) => i.type === 'macroscopic');
              const ai = latestVisit?.aiAnalysis;

              return (
                <div
                  key={les.id}
                  onClick={() => setSelectedLesion(les)}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-500 shadow-sm transition cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {les.code}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-1 group-hover:text-blue-600 transition">
                          {les.anatomicalSite}
                        </h4>
                        <p className="text-xs text-slate-500">{les.lesionType} • Khởi phát: {les.onsetDuration}</p>
                        {les.morphologyNotes && (
                          <div className="mt-1.5 text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-start gap-1.5">
                            <span className="font-semibold text-slate-700 shrink-0">Hình dạng:</span>
                            <span className="line-clamp-2 text-slate-600">{les.morphologyNotes}</span>
                          </div>
                        )}
                      </div>

                      {ai && (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ai.riskLevel === 'HIGH'
                            ? 'bg-rose-100 text-rose-800'
                            : ai.riskLevel === 'MODERATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          TDS: {ai.abcdScore.tds} ({ai.riskLevel})
                        </span>
                      )}
                    </div>

                    {/* Image thumbnails for latest visit */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center relative border border-slate-200">
                        {macroImg ? (
                          <img src={macroImg.dataUrl} alt="Macro" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-400">Chưa có ảnh đại thể</span>
                        )}
                        <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                          Đại thể
                        </span>
                      </div>

                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center relative border border-slate-200">
                        {dermoImg ? (
                          <img src={dermoImg.dataUrl} alt="Dermoscopy" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-400">Chưa có ảnh Dermoscopy</span>
                        )}
                        <span className="absolute bottom-1 left-1 text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">
                          Dermoscopy
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {les.visits.length} lần khám • Gần nhất: {latestVisit?.visitDate} ({latestVisit?.lesionSize})
                    </span>
                    <span className="inline-flex items-center text-blue-600 font-semibold group-hover:translate-x-0.5 transition">
                      Xem chi tiết & Soi da <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Comparative Progress */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          {patientLesions.length > 0 ? (
            <ComparisonView
              patient={patient}
              lesion={patientLesions[0]}
              allLesions={patientLesions}
              onUpdateLesion={handleUpdateSingleLesion}
            />
          ) : (
            <div className="bg-white rounded-xl p-8 text-center text-slate-500 text-sm border border-slate-200">
              Chưa có tổn thương nào để theo dõi tiến triển. Vui lòng thêm tổn thương mới.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
              Lịch hẹn của {patient.fullName}
            </h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {patientAppointments.map((apt) => (
              <div key={apt.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{apt.appointmentDate} vào lúc {apt.appointmentTime}</span>
                    <span className="font-normal text-slate-500">({apt.purpose})</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">Bác sĩ phụ trách: {apt.doctorName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    apt.reminderSent ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {apt.reminderSent ? 'Đã gửi nhắc hẹn' : 'Chưa gửi'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Treatments & Prescriptions (Đơn thuốc & Phác đồ điều trị) */}
      {activeTab === 'treatments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                Hồ sơ Đơn thuốc & Phác đồ Điều trị Da liễu (Rx)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tổng hợp các đơn thuốc, chỉ định thủ thuật và hướng dẫn điều trị y khoa của bệnh nhân {patient.fullName}.
              </p>
            </div>
            <button
              onClick={() => setIsNewLesionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              Khám mới & Kê đơn thuốc
            </button>
          </div>

          {/* List of Treatments across all lesions & visits */}
          {patientLesions.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
              <Pill className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="font-semibold text-sm text-slate-700">Chưa có dữ liệu điều trị</p>
              <p className="text-xs text-slate-400 mt-1">
                Hãy tạo hồ sơ khám bệnh ban đầu để thiết lập phác đồ điều trị và đơn thuốc cho bệnh nhân.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {patientLesions.map((les) => (
                <div key={les.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                        {les.code}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{les.anatomicalSite}</h4>
                      <span className="text-xs text-slate-500 font-medium">• {les.lesionType}</span>
                    </div>
                    <button
                      onClick={() => setSelectedLesion(les)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    >
                      Xem chi tiết sang thương <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-6 divide-y divide-slate-100">
                    {les.visits.map((vis) => {
                      const prescriptions = vis.treatmentPlan?.prescriptions || [];
                      const plan = vis.treatmentPlan;

                      return (
                        <div key={vis.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                                {vis.visitType} ({vis.visitDate})
                              </span>
                              <span className="text-xs text-slate-500">
                                Bác sĩ: <strong>{vis.doctorName}</strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {prescriptions.length > 0 && (
                                <>
                                  <button
                                    onClick={() => handleCopyPrescriptionText(prescriptions, vis.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition"
                                  >
                                    {copiedId === vis.id ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-700">Đã sao chép</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        Sao chép đơn thuốc
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => {
                                      setPrescriptionPrintData({
                                        prescriptions,
                                        treatmentPlan: plan,
                                        diagnosis: vis.diagnosis || les.lesionType,
                                        visitDate: vis.visitDate,
                                      });
                                      setIsPrescriptionPrintOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold transition"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    Xem & In đơn thuốc (Rx)
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Diagnosis & Treatment overview */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/80 p-3 rounded-lg border border-slate-150">
                            <div>
                              <span className="text-slate-500 font-semibold block text-[11px]">Chẩn đoán:</span>
                              <span className="font-bold text-slate-900">{vis.diagnosis || 'Chưa phân loại'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold block text-[11px]">Nội dung điều trị:</span>
                              <span className="text-slate-800">
                                {plan?.treatmentContent || vis.treatmentApplied || 'Chưa có phác đồ'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-semibold block text-[11px]">Thủ thuật / Can thiệp:</span>
                              <span className="text-slate-800">
                                {plan?.interventionProcedure || 'Không can thiệp xâm lấn'}
                              </span>
                            </div>
                          </div>

                          {/* Prescriptions List */}
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                              <span className="font-serif italic text-blue-700 font-black text-sm">Rx.</span>
                              <span>Thuốc chỉ định ({prescriptions.length}):</span>
                            </div>

                            {prescriptions.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">Không có thuốc kê toa trong lần khám này.</p>
                            ) : (
                              <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                                    <tr>
                                      <th className="py-1.5 px-3 w-8">#</th>
                                      <th className="py-1.5 px-3">Tên thuốc</th>
                                      <th className="py-1.5 px-3 w-28">Dạng dùng</th>
                                      <th className="py-1.5 px-3 w-24">Số lượng</th>
                                      <th className="py-1.5 px-3">Cách dùng & Lưu ý</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-150">
                                    {prescriptions.map((rx, idx) => (
                                      <tr key={rx.id} className="hover:bg-slate-50/50">
                                        <td className="py-2 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                                        <td className="py-2 px-3 font-semibold text-slate-900">{rx.medicationName}</td>
                                        <td className="py-2 px-3 text-slate-600">{rx.formAndRoute}</td>
                                        <td className="py-2 px-3 font-mono font-bold text-blue-700">{rx.quantity}</td>
                                        <td className="py-2 px-3 text-slate-700">
                                          <div>{rx.dosage}</div>
                                          {rx.instructions && (
                                            <div className="text-[11px] text-slate-500 italic mt-0.5">
                                              {rx.instructions}
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

                          {/* Skincare & Doctor instructions */}
                          {(plan?.skincareRegimen || vis.doctorInstructions) && (
                            <div className="text-xs text-slate-600 bg-amber-50/50 border border-amber-200/60 p-2.5 rounded-lg space-y-1">
                              {plan?.skincareRegimen && (
                                <p>
                                  <strong>Chăm sóc da & sinh hoạt:</strong> {plan.skincareRegimen}
                                </p>
                              )}
                              {vis.doctorInstructions && (
                                <p>
                                  <strong>Lời dặn bác sĩ:</strong> {vis.doctorInstructions}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Procedures & Interventions (Laser, Botox, Filler, Mesotherapy, Lăn kim) */}
      {activeTab === 'procedures' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Hồ Sơ Thủ Thuật Da Liễu & Thẩm Mỹ Y Khoa
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Theo dõi các can thiệp: Laser chuyên sâu, Tiêm Botox, Tiêm Filler HA, Mesotherapy tinh chất, Lăn kim tái tạo da của bệnh nhân {patient.fullName}.
              </p>
            </div>
            <button
              onClick={() => setIsRecordProcedureOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              Ghi nhận thủ thuật mới
            </button>
          </div>

          {/* List of procedures */}
          {patientProcedures.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
              <Zap className="w-12 h-12 mx-auto text-purple-300 mb-3" />
              <p className="font-semibold text-sm text-slate-700">Chưa có hồ sơ thủ thuật nào</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Bệnh nhân {patient.fullName} chưa có ghi nhận can thiệp Laser, tiêm Botox/Filler hoặc liệu trình Mesotherapy nào. Nhấn "Ghi nhận thủ thuật mới" để lập hồ sơ.
              </p>
              <button
                onClick={() => setIsRecordProcedureOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                Thực hiện thủ thuật đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {patientProcedures.map((proc) => {
                const getBadgeColor = (type: string) => {
                  switch (type) {
                    case 'LASER': return 'bg-rose-50 text-rose-800 border-rose-200';
                    case 'BOTOX': return 'bg-purple-50 text-purple-800 border-purple-200';
                    case 'FILLER': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
                    case 'MESOTHERAPY': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
                    case 'MICRONEEDLING': return 'bg-amber-50 text-amber-800 border-amber-200';
                    default: return 'bg-slate-100 text-slate-800 border-slate-200';
                  }
                };

                return (
                  <div key={proc.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-purple-200 transition">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor(proc.procedureType)}`}>
                            {proc.procedureType}
                          </span>
                          <h4 className="font-bold text-slate-900 text-base">{proc.procedureName}</h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span>📅 Ngày thực hiện: {proc.treatmentDate}</span>
                          <span>•</span>
                          <span>👨‍⚕️ Bác sĩ: <strong>{proc.doctorName}</strong></span>
                          {proc.technicianName && (
                            <>
                              <span>•</span>
                              <span>KTV: {proc.technicianName}</span>
                            </>
                          )}
                          {proc.sessionNumber && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-purple-700">Buổi {proc.sessionNumber}/{proc.totalSessions || 1}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {onDeleteProcedure && (
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa thủ thuật "${proc.procedureName}"?`)) {
                              onDeleteProcedure(proc.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition"
                          title="Xóa thủ thuật"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Left: Device & Target */}
                      <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200/70">
                        <div>
                          <span className="font-semibold text-slate-600">Vùng giải phẫu can thiệp:</span>
                          <p className="font-bold text-slate-900 mt-0.5">{proc.targetArea}</p>
                        </div>
                        {proc.productUsed && (
                          <div>
                            <span className="font-semibold text-slate-600">Sản phẩm / Thiết bị sử dụng:</span>
                            <p className="text-slate-800 mt-0.5 font-medium">{proc.productUsed}</p>
                          </div>
                        )}
                        {proc.dosageOrVolume && (
                          <div>
                            <span className="font-semibold text-slate-600">Liều lượng / Năng lượng / Thông số:</span>
                            <p className="text-slate-800 mt-0.5 font-mono bg-white px-2 py-1 rounded border border-slate-200">
                              {proc.dosageOrVolume}
                            </p>
                          </div>
                        )}
                        {proc.technicalParams && Object.keys(proc.technicalParams).length > 0 && (
                          <div className="pt-1.5 border-t border-slate-200">
                            <span className="font-semibold text-slate-700 block mb-1">Thông số máy can thiệp:</span>
                            <div className="grid grid-cols-2 gap-1.5 bg-white p-2 rounded border border-slate-200 text-[11px] font-mono text-slate-700">
                              {proc.technicalParams.wavelength && (
                                <div>Bước sóng: <strong>{proc.technicalParams.wavelength}</strong></div>
                              )}
                              {proc.technicalParams.energy && (
                                <div>Năng lượng: <strong>{proc.technicalParams.energy}</strong></div>
                              )}
                              {proc.technicalParams.spotSize && (
                                <div>Spot size: <strong>{proc.technicalParams.spotSize}</strong></div>
                              )}
                              {proc.technicalParams.exposureTime && (
                                <div>Thời gian chiếu: <strong>{proc.technicalParams.exposureTime}</strong></div>
                              )}
                              {proc.technicalParams.passesOrDensity && (
                                <div className="col-span-2">Mật độ/Passes: <strong>{proc.technicalParams.passesOrDensity}</strong></div>
                              )}
                              {proc.technicalParams.botoxUnits && (
                                <div>Liều Botox: <strong>{proc.technicalParams.botoxUnits} Units</strong></div>
                              )}
                              {proc.technicalParams.fillerVolumeMl && (
                                <div>Thể tích: <strong>{proc.technicalParams.fillerVolumeMl} ml</strong></div>
                              )}
                            </div>
                          </div>
                        )}
                        {proc.anesthesiaMethod && (
                          <div>
                            <span className="font-semibold text-slate-600">Phương pháp vô cảm:</span>
                            <p className="text-slate-800 mt-0.5">{proc.anesthesiaMethod}</p>
                          </div>
                        )}
                      </div>

                      {/* Right: Drugs / Inventory & Notes */}
                      <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200/70">
                        {proc.inventoryItemId && (
                          <div>
                            <span className="font-semibold text-slate-600">Liên kết kho dược chất:</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Đã xuất trừ tồn kho phòng khám
                              </span>
                            </div>
                          </div>
                        )}
                        {proc.immediateResponse && (
                          <div>
                            <span className="font-semibold text-slate-600">Phản ứng tức thì sau thủ thuật:</span>
                            <p className="text-slate-800 mt-0.5">{proc.immediateResponse}</p>
                          </div>
                        )}
                        {proc.postCareInstructions && (
                          <div>
                            <span className="font-semibold text-slate-600">Chăm sóc & Dặn dò tại nhà:</span>
                            <p className="text-slate-800 mt-0.5 italic">{proc.postCareInstructions}</p>
                          </div>
                        )}
                        {proc.cost && proc.cost > 0 && (
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-slate-500">Chi phí thực hiện:</span>
                            <span className="font-mono font-bold text-slate-900">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(proc.cost)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Record Procedure Modal */}
      {isRecordProcedureOpen && (
        <RecordProcedureModal
          isOpen={isRecordProcedureOpen}
          onClose={() => setIsRecordProcedureOpen(false)}
          patient={patient}
          onSaveProcedure={(proc, deductStock) => {
            onAddProcedure?.(proc, deductStock);
            setIsRecordProcedureOpen(false);
          }}
        />
      )}

      {/* Lesion Detail Modal */}
      {selectedLesion && (
        <LesionDetailModal
          isOpen={Boolean(selectedLesion)}
          onClose={() => setSelectedLesion(null)}
          patient={patient}
          lesion={selectedLesion}
          onUpdateLesion={handleUpdateSingleLesion}
          onOpenComparison={() => {
            setSelectedLesion(null);
            setActiveTab('progress');
          }}
        />
      )}

      {/* New Lesion & Consultation Modal (Hỏi bệnh, Khám & Kế hoạch Điều trị) */}
      {isNewLesionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-6 flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-base">Hỏi Bệnh, Khám & Thiết Lập Điều Trị</h3>
                  <p className="text-[11px] text-slate-300">
                    Bệnh nhân: {patient.fullName} ({patient.code} • {patient.age} tuổi)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewLesionModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLesion} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* PHẦN 1: HỎI BỆNH & KHÁM LÂM SÀNG */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                    I
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                    Hỏi Bệnh & Khám Lâm Sàng Sang Thương
                  </h4>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vị trí giải phẫu trên cơ thể: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSite}
                    onChange={(e) => setNewSite(e.target.value)}
                    placeholder="Ví dụ: Vùng má và trán hai bên, Lưng - bả vai phải, Cẳng tay trái..."
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Loại tổn thương:</label>
                    <select
                      value={newType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewType(val);
                        // Auto match preset if available
                        if (val.includes('Trứng cá') && !val.includes('đỏ')) {
                          handleApplyPresetInConsultation('acne');
                        } else if (val.includes('Viêm nang lông')) {
                          handleApplyPresetInConsultation('folliculitis');
                        } else if (val.includes('Trứng cá đỏ')) {
                          handleApplyPresetInConsultation('rosacea');
                        } else if (val.includes('Sẩn ngứa')) {
                          handleApplyPresetInConsultation('prurigo');
                        } else if (val.includes('sắc tố') || val.includes('ruồi')) {
                          handleApplyPresetInConsultation('pigmented');
                        }
                      }}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <optgroup label="Viêm da & Nang lông tuyến bã">
                        <option value="Trứng cá (Acne vulgaris)">Trứng cá (Acne vulgaris)</option>
                        <option value="Viêm nang lông (Folliculitis)">Viêm nang lông (Folliculitis)</option>
                        <option value="Trứng cá đỏ (Rosacea)">Trứng cá đỏ (Rosacea)</option>
                        <option value="Sẩn ngứa khác (Prurigo / Sẩn dị ứng)">Sẩn ngứa khác (Prurigo / Sẩn dị ứng)</option>
                      </optgroup>
                      <optgroup label="Tổn thương sắc tố & sừng hóa">
                        <option value="Nốt ruồi sắc tố biến đổi">Nốt ruồi sắc tố biến đổi (Dysplastic Nevus)</option>
                        <option value="Dày sừng tiết bã / Sừng hóa">Dày sừng tiết bã / Sừng hóa</option>
                      </optgroup>
                      <optgroup label="Khối u & Mạch máu">
                        <option value="Sẩn gồ ánh ngọc / Nghi ngờ BCC">Sẩn gồ ánh ngọc / Nghi ngờ BCC</option>
                        <option value="Mảng ban đỏ vảy nến / Viêm da">Mảng ban đỏ vảy nến / Viêm da</option>
                        <option value="Tổn thương mạch máu / U máu">Tổn thương mạch máu / U máu</option>
                        <option value="Khác (Nang biểu bì, sẹo, u hạt...)">Khác (Nang biểu bì, sẹo, u hạt...)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Thời gian khởi phát:</label>
                    <input
                      type="text"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="Ví dụ: 3 tháng, 6 tháng, 1 năm..."
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kích thước đo ban đầu (mm): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder="Ví dụ: 7.5 x 5.0 mm"
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Ghi chú chi tiết hình dạng của sang thương */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Ghi chú chi tiết hình dạng của sang thương:
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Mô tả hình thái học</span>
                  </div>
                  <textarea
                    rows={2}
                    value={newMorphologyNotes}
                    onChange={(e) => setNewMorphologyNotes(e.target.value)}
                    placeholder="Ví dụ: Sẩn viêm đỏ gồ cao, cồi mở/đóng, mụn mủ ở trung tâm nang lông, bờ tròn rõ, bề mặt bong vảy nhẹ..."
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                  {/* Gợi ý hình thái thường gặp (Quick Insert Tags) */}
                  <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] text-slate-500 font-medium mr-0.5">Gợi ý nhanh:</span>
                    {[
                      'Sẩn viêm đỏ',
                      'Mụn mủ nang lông',
                      'Cồi mụn (Comedo)',
                      'Giãn mao mạch',
                      'Sẩn ngứa gồ ráp',
                      'Dát đỏ rải rác',
                      'Bờ tròn đều',
                      'Bờ răng cưa / Không đều',
                      'Bề mặt bong vảy',
                      'Đa sắc màu',
                    ].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setNewMorphologyNotes((prev) => (prev ? `${prev}, ${term}` : term));
                        }}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-600 rounded-md border border-slate-200 transition-colors"
                      >
                        + {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PHẦN 2: PHẦN ĐIỀU TRỊ & ĐƠN THUỐC Y KHOA */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                      II
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 uppercase tracking-wide">
                      Phần Điều Trị & Đơn Thuốc Y Khoa (Treatment & Rx)
                    </h4>
                  </div>
                </div>

                {/* Phác đồ mẫu chuẩn nhanh */}
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Áp dụng nhanh Phác đồ & Đơn thuốc chuẩn y khoa:
                    </span>
                    <span className="text-[10px] text-emerald-700 italic">Bác sĩ có thể chỉnh sửa lại bên dưới</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TREATMENT_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyPresetInConsultation(preset.id)}
                        className="px-3 py-1.5 bg-white hover:bg-emerald-600 hover:text-white text-emerald-900 rounded-lg border border-emerald-300 text-xs font-semibold shadow-2xs transition"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chẩn đoán xác định & Nội dung điều trị */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Chẩn đoán xác định:</label>
                    <input
                      type="text"
                      value={newDiagnosis}
                      onChange={(e) => setNewDiagnosis(e.target.value)}
                      placeholder="Ví dụ: Trứng cá viêm mức độ trung bình (Acne vulgaris Grade II)"
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nội dung điều trị & Phác đồ áp dụng:
                    </label>
                    <textarea
                      rows={2}
                      value={newTreatmentContent}
                      onChange={(e) => setNewTreatmentContent(e.target.value)}
                      placeholder="Mục tiêu điều trị, phác đồ kết hợp tại chỗ và toàn thân..."
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Thủ thuật can thiệp & Chăm sóc da */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Thủ thuật can thiệp tại phòng khám:
                    </label>
                    <input
                      type="text"
                      value={newIntervention}
                      onChange={(e) => setNewIntervention(e.target.value)}
                      placeholder="Ví dụ: Lấy nhân mụn chuẩn y khoa vô khuẩn, chiếu ánh sáng sinh học Blue/Red..."
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Hướng dẫn chăm sóc da & Chế độ sinh hoạt:
                    </label>
                    <input
                      type="text"
                      value={newSkincare}
                      onChange={(e) => setNewSkincare(e.target.value)}
                      placeholder="Ví dụ: Rửa mặt 2 lần/ngày, kiêng đồ ngọt, thoa kem chống nắng phổ rộng..."
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* BẢNG KÊ ĐƠN THUỐC (Rx) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <span className="font-serif italic font-black text-blue-700 text-sm">Rx.</span>
                      <span>Đơn thuốc chỉ định ({newPrescriptions.length} loại thuốc)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsInventoryPickerOpen(true)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        Chọn từ kho dược chất
                      </button>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">Kê toa điện tử</span>
                    </div>
                  </div>

                  {/* Danh sách thuốc đã kê */}
                  {newPrescriptions.length === 0 ? (
                    <div className="p-4 bg-white border border-dashed border-slate-300 rounded-lg text-center text-slate-400">
                      Chưa có thuốc trong đơn. Bác sĩ hãy chọn phác đồ mẫu, chọn từ kho dược chất hoặc thêm từng thuốc bên dưới.
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 font-semibold text-slate-700">
                          <tr>
                            <th className="py-2 px-2.5 w-7">#</th>
                            <th className="py-2 px-2.5">Tên thuốc & Hàm lượng</th>
                            <th className="py-2 px-2.5 w-24">Dạng</th>
                            <th className="py-2 px-2.5 w-20">SL</th>
                            <th className="py-2 px-2.5">Liều dùng & Lưu ý</th>
                            <th className="py-2 px-2 w-16 text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {newPrescriptions.map((item, idx) => {
                            const isEditing = editingPrescriptionId === item.id;
                            if (isEditing) {
                              return (
                                <tr key={item.id} className="bg-blue-50/70">
                                  <td className="py-2 px-2.5 font-mono font-bold text-slate-400">{idx + 1}</td>
                                  <td className="py-2 px-2.5">
                                    <input
                                      type="text"
                                      value={editPrescriptionName}
                                      onChange={(e) => setEditPrescriptionName(e.target.value)}
                                      className="w-full text-xs border border-blue-400 rounded px-2 py-1 bg-white font-semibold"
                                      placeholder="Tên thuốc"
                                    />
                                  </td>
                                  <td className="py-2 px-2.5">
                                    <input
                                      type="text"
                                      value={editPrescriptionForm}
                                      onChange={(e) => setEditPrescriptionForm(e.target.value)}
                                      className="w-full text-xs border border-blue-400 rounded px-2 py-1 bg-white"
                                      placeholder="Dạng dùng"
                                    />
                                  </td>
                                  <td className="py-2 px-2.5">
                                    <input
                                      type="text"
                                      value={editPrescriptionQuantity}
                                      onChange={(e) => setEditPrescriptionQuantity(e.target.value)}
                                      className="w-full text-xs border border-blue-400 rounded px-2 py-1 bg-white font-mono font-bold text-blue-700"
                                      placeholder="Số lượng"
                                    />
                                  </td>
                                  <td className="py-2 px-2.5 space-y-1">
                                    <input
                                      type="text"
                                      value={editPrescriptionDosage}
                                      onChange={(e) => setEditPrescriptionDosage(e.target.value)}
                                      className="w-full text-xs border border-blue-400 rounded px-2 py-1 bg-white"
                                      placeholder="Liều dùng"
                                    />
                                    <input
                                      type="text"
                                      value={editPrescriptionInstructions}
                                      onChange={(e) => setEditPrescriptionInstructions(e.target.value)}
                                      className="w-full text-[11px] border border-slate-300 rounded px-2 py-0.5 bg-white italic"
                                      placeholder="Lưu ý cách dùng"
                                    />
                                  </td>
                                  <td className="py-2 px-2 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditPrescription(item.id)}
                                        className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition shadow-2xs"
                                        title="Lưu sửa đổi"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleCancelEditPrescription}
                                        className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition"
                                        title="Hủy sửa"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }

                            return (
                              <tr key={item.id} className="hover:bg-slate-50/50">
                                <td className="py-2 px-2.5 font-mono font-bold text-slate-400">{idx + 1}</td>
                                <td className="py-2 px-2.5 font-bold text-slate-900">{item.medicationName}</td>
                                <td className="py-2 px-2.5 text-slate-600">{item.formAndRoute}</td>
                                <td className="py-2 px-2.5 font-mono font-bold text-blue-700">{item.quantity}</td>
                                <td className="py-2 px-2.5 text-slate-800">
                                  <div>{item.dosage}</div>
                                  {item.instructions && (
                                    <div className="text-[11px] text-slate-500 italic mt-0.5">{item.instructions}</div>
                                  )}
                                </td>
                                <td className="py-2 px-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEditPrescription(item)}
                                      className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition"
                                      title="Chỉnh sửa thuốc này"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePrescriptionItem(item.id)}
                                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition"
                                      title="Xóa khỏi đơn"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Thuốc da liễu phổ biến (Quick Select Chips) */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Thêm nhanh thuốc da liễu thông dụng:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_MEDICATIONS.map((med) => (
                        <button
                          key={med.name}
                          type="button"
                          onClick={() => handleQuickAddMedication(med)}
                          className="text-[11px] px-2 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 rounded-md border border-slate-200 transition-colors shadow-2xs font-medium"
                        >
                          + {med.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nhập thuốc thủ công */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <span className="font-semibold text-slate-700 block text-[11px]">
                      Hoặc nhập thêm thuốc tùy chỉnh:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Tên thuốc & hàm lượng (Ví dụ: Klenzit-C Gel)"
                          value={medName}
                          onChange={(e) => setMedName(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <select
                          value={medForm}
                          onChange={(e) => setMedForm(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                        >
                          <option value="Kem bôi ngoài da">Kem bôi</option>
                          <option value="Gel bôi ngoài da">Gel bôi</option>
                          <option value="Viên nang uống">Viên uống</option>
                          <option value="Dung dịch rửa">Dung dịch rửa</option>
                          <option value="Serum / Tinh chất">Serum / Tinh chất</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Số lượng (Ví dụ: 1 tuýp 15g)"
                          value={medQuantity}
                          onChange={(e) => setMedQuantity(e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Hướng dẫn liều dùng & lưu ý (Ví dụ: Thoa 1 lần vào buổi tối trước khi ngủ)"
                        value={medDosage}
                        onChange={(e) => setMedDosage(e.target.value)}
                        className="flex-1 text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddMedicationToPrescription}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shrink-0 transition"
                      >
                        + Thêm vào đơn
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lời dặn bác sĩ */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lời dặn của Bác sĩ & Lịch hẹn tái khám:
                  </label>
                  <textarea
                    rows={2}
                    value={newDoctorInstructions}
                    onChange={(e) => setNewDoctorInstructions(e.target.value)}
                    placeholder="Ví dụ: Tái khám sau 4 tuần để đánh giá đáp ứng. Liên hệ ngay nếu có kích ứng..."
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewLesionModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Lưu Hồ Sơ Khám & Kê Đơn Thuốc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Case Report Modal */}
      <MedicalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        patient={patient}
        lesion={patientLesions[0]}
      />

      {/* Official Medical Prescription Print Modal */}
      {isPrescriptionPrintOpen && prescriptionPrintData && (
        <PrescriptionPrintModal
          isOpen={isPrescriptionPrintOpen}
          onClose={() => {
            setIsPrescriptionPrintOpen(false);
            setPrescriptionPrintData(null);
          }}
          patient={patient}
          prescriptions={prescriptionPrintData.prescriptions}
          treatmentPlan={prescriptionPrintData.treatmentPlan}
          diagnosis={prescriptionPrintData.diagnosis}
          visitDate={prescriptionPrintData.visitDate}
        />
      )}

      {/* Inventory Picker Modal for Consultation Form */}
      {isInventoryPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm">Kho Thuốc & Dược Chất Phòng Khám</h3>
                  <p className="text-[11px] text-emerald-100">Chọn thuốc để đưa vào đơn thuốc cho {patient.fullName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInventoryPickerOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên thuốc, hoạt chất (Tretinoin, Isotretinoin, Botox, HA...)..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
              {inventoryItems
                .filter((item) =>
                  item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                  item.activeIngredient.toLowerCase().includes(inventorySearch.toLowerCase())
                )
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectFromInventoryInConsultation(item)}
                    className="py-3 px-2 flex items-center justify-between hover:bg-emerald-50/60 rounded-lg cursor-pointer transition group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs group-hover:text-emerald-800">
                          {item.name}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                          {item.activeIngredient}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.manufacturer ? `${item.manufacturer} • ` : ''}Đơn vị: {item.unit} {item.storageConditions ? `• ${item.storageConditions}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                        Tồn: {item.stockQuantity} {item.unit}
                      </span>
                      <span className="text-xs text-blue-600 font-semibold group-hover:underline">
                        Chọn &rarr;
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
