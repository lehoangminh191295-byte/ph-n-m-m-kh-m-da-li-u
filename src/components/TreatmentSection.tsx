import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  Trash2, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Stethoscope, 
  Scissors, 
  SunMedium, 
  CalendarClock,
  HelpCircle,
  Pencil,
  X,
  Package,
  Search
} from 'lucide-react';
import { PrescriptionItem, TreatmentPlan, Patient, InventoryItem } from '../types';
import { TREATMENT_PRESETS, POPULAR_MEDICATIONS, TreatmentPreset } from '../data/treatmentPresets';
import { loadInventory } from '../services/storageService';

interface TreatmentSectionProps {
  treatmentPlan?: TreatmentPlan;
  treatmentAppliedText?: string;
  doctorInstructionsText?: string;
  diagnosisText?: string;
  doctorName?: string;
  visitDate?: string;
  patient?: Patient;
  isEditable?: boolean;
  onSavePlan?: (updatedPlan: TreatmentPlan, updatedTreatmentApplied: string, updatedInstructions: string) => void;
  onPrintPrescription?: () => void;
}

export const TreatmentSection: React.FC<TreatmentSectionProps> = ({
  treatmentPlan,
  treatmentAppliedText = '',
  doctorInstructionsText = '',
  diagnosisText = '',
  doctorName = 'BS. CKII Lê Hoàng Minh',
  visitDate = new Date().toISOString().split('T')[0],
  patient,
  isEditable = true,
  onSavePlan,
  onPrintPrescription
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Form states
  const [treatmentContent, setTreatmentContent] = useState(
    treatmentPlan?.treatmentContent || treatmentAppliedText || ''
  );
  const [interventionProcedure, setInterventionProcedure] = useState(
    treatmentPlan?.interventionProcedure || ''
  );
  const [skincareRegimen, setSkincareRegimen] = useState(
    treatmentPlan?.skincareRegimen || ''
  );
  const [doctorInstructions, setDoctorInstructions] = useState(
    doctorInstructionsText || ''
  );
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>(
    treatmentPlan?.prescriptions || []
  );

  // New single medication inputs
  const [medName, setMedName] = useState('');
  const [medForm, setMedForm] = useState('Viên uống');
  const [medDosage, setMedDosage] = useState('');
  const [medQuantity, setMedQuantity] = useState('');
  const [medInstructions, setMedInstructions] = useState('');

  // Editing existing prescription item state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editForm, setEditForm] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editInstructions, setEditInstructions] = useState('');

  // Inventory picker state
  const [isInventoryPickerOpen, setIsInventoryPickerOpen] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const inventoryItems = loadInventory();

  const handleStartEdit = (item: PrescriptionItem) => {
    setEditingId(item.id);
    setEditName(item.medicationName);
    setEditForm(item.formAndRoute);
    setEditDosage(item.dosage);
    setEditQuantity(item.quantity);
    setEditInstructions(item.instructions || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    setPrescriptions(
      prescriptions.map((p) =>
        p.id === id
          ? {
              ...p,
              medicationName: editName.trim(),
              formAndRoute: editForm,
              dosage: editDosage.trim() || 'Theo chỉ dẫn của bác sĩ',
              quantity: editQuantity.trim() || '1 đơn vị',
              instructions: editInstructions.trim(),
            }
          : p
      )
    );
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSelectFromInventory = (item: InventoryItem) => {
    setMedName(`${item.name} (${item.activeIngredient})`);
    if (item.category === 'TOPICAL_MEDICATION') {
      setMedForm('Gel / Kem bôi');
      setMedDosage('Thoa 1 lớp mỏng tại vùng tổn thương ngày 1-2 lần');
      setMedQuantity(`1 ${item.unit}`);
    } else if (item.category === 'ORAL_MEDICATION') {
      setMedForm('Viên uống');
      setMedDosage('Uống 1 viên x 2 lần/ngày sau khi ăn no');
      setMedQuantity(`30 ${item.unit}`);
    } else {
      setMedForm(item.unit);
      setMedDosage('Sử dụng theo phác đồ chỉ định');
      setMedQuantity(`1 ${item.unit}`);
    }
    setIsInventoryPickerOpen(false);
  };

  // Handle preset selection
  const handleApplyPreset = (preset: TreatmentPreset) => {
    setTreatmentContent(preset.treatmentContent);
    setInterventionProcedure(preset.interventionProcedure);
    setSkincareRegimen(preset.skincareRegimen);
    setDoctorInstructions(preset.doctorInstructions);
    
    const mappedPrescriptions: PrescriptionItem[] = preset.prescriptions.map((p, idx) => ({
      id: `rx-${Date.now()}-${idx}`,
      ...p
    }));
    setPrescriptions(mappedPrescriptions);
  };

  const handleAddMedication = () => {
    if (!medName.trim()) return;

    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      medicationName: medName.trim(),
      formAndRoute: medForm,
      dosage: medDosage.trim() || 'Theo chỉ dẫn của bác sĩ',
      quantity: medQuantity.trim() || '1 đơn vị',
      instructions: medInstructions.trim()
    };

    setPrescriptions([...prescriptions, newItem]);
    setMedName('');
    setMedDosage('');
    setMedQuantity('');
    setMedInstructions('');
  };

  const handleQuickAddPopularMed = (popMed: typeof POPULAR_MEDICATIONS[0]) => {
    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}-${Math.random()}`,
      medicationName: popMed.name,
      formAndRoute: popMed.form,
      dosage: popMed.defaultDosage,
      quantity: popMed.defaultQty,
      instructions: ''
    };
    setPrescriptions([...prescriptions, newItem]);
  };

  const handleRemoveMedication = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  const handleSave = () => {
    const finalPlan: TreatmentPlan = {
      treatmentContent: treatmentContent.trim(),
      interventionProcedure: interventionProcedure.trim(),
      skincareRegimen: skincareRegimen.trim(),
      prescriptions
    };

    onSavePlan?.(finalPlan, treatmentContent.trim(), doctorInstructions.trim());
    setIsEditing(false);
  };

  const handleCopyPrescriptionText = () => {
    const lines = [
      `ĐƠN THUỐC ĐIỀU TRỊ DA LIỄU - ${patient?.fullName || 'BỆNH NHÂN'} (${visitDate})`,
      `Chẩn đoán: ${diagnosisText || 'Bệnh da liễu'}`,
      `Bác sĩ điều trị: ${doctorName}`,
      '----------------------------------------',
      'DANH MỤC THUỐC:',
      ...prescriptions.map((p, idx) => 
        `${idx + 1}. ${p.medicationName} (${p.formAndRoute})\n   - Số lượng: ${p.quantity}\n   - Liều dùng: ${p.dosage}${p.instructions ? `\n   - Lưu ý: ${p.instructions}` : ''}`
      ),
      '----------------------------------------',
      treatmentContent ? `Phác đồ điều trị: ${treatmentContent}` : '',
      interventionProcedure ? `Thủ thuật phòng khám: ${interventionProcedure}` : '',
      skincareRegimen ? `Chăm sóc da: ${skincareRegimen}` : '',
      doctorInstructions ? `Lời dặn bác sĩ: ${doctorInstructions}` : ''
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const hasData = 
    treatmentContent || 
    treatmentPlan?.treatmentContent || 
    prescriptions.length > 0 || 
    interventionProcedure || 
    skincareRegimen ||
    doctorInstructions;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              Kế hoạch Điều trị & Đơn thuốc Y khoa (Rx)
              {prescriptions.length > 0 && (
                <span className="text-[11px] font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  {prescriptions.length} thuốc
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500">
              Phác đồ điều trị, can thiệp thủ thuật, đơn thuốc và hướng dẫn chăm sóc da
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {prescriptions.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleCopyPrescriptionText}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                title="Sao chép đơn thuốc dạng văn bản"
              >
                {copiedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sao chép Rx</span>
                  </>
                )}
              </button>

              {onPrintPrescription && (
                <button
                  type="button"
                  onClick={onPrintPrescription}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg transition font-medium shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-300" />
                  In đơn thuốc
                </button>
              )}
            </>
          )}

          {isEditable && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              {hasData ? 'Chỉnh sửa Điều trị & Đơn thuốc' : '+ Kê đơn & Lập điều trị'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5">
        {/* EDIT MODE */}
        {isEditing ? (
          <div className="space-y-5">
            {/* Presets Bar */}
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Chọn mẫu phác đồ chuẩn da liễu nhanh:
                </span>
                <span className="text-[10px] text-blue-700 font-medium">Bấm để tự động điền đơn thuốc & phác đồ</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TREATMENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-xs px-2.5 py-1.5 bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-blue-200 rounded-lg shadow-2xs transition text-left flex items-center gap-1.5 font-medium"
                  >
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Treatment Content & Procedures Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  Nội dung điều trị & Phác đồ áp dụng:
                </label>
                <textarea
                  rows={3}
                  value={treatmentContent}
                  onChange={(e) => setTreatmentContent(e.target.value)}
                  placeholder="Mục tiêu điều trị, thuốc kiểm soát viêm, diệt khuẩn hoặc giảm sừng..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-blue-600" />
                  Thủ thuật / Can thiệp tại phòng khám:
                </label>
                <textarea
                  rows={3}
                  value={interventionProcedure}
                  onChange={(e) => setInterventionProcedure(e.target.value)}
                  placeholder="Ví dụ: Lấy nhân mụn chuẩn y khoa, chiếu ánh sáng sinh học, peel da hóa học, áp lạnh nitơ lỏng, sinh thiết trọn..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                  Chế độ sinh hoạt & Chăm sóc da (Skincare):
                </label>
                <textarea
                  rows={2}
                  value={skincareRegimen}
                  onChange={(e) => setSkincareRegimen(e.target.value)}
                  placeholder="Sữa rửa mặt pH 5.5, kem chống nắng, tránh nước nóng, kiêng đồ ngọt cay nóng..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
                  Lời dặn bác sĩ & Hẹn tái khám:
                </label>
                <textarea
                  rows={2}
                  value={doctorInstructions}
                  onChange={(e) => setDoctorInstructions(e.target.value)}
                  placeholder="Tái khám sau 2 - 4 tuần, liên hệ ngay nếu có dấu hiệu sưng đau tăng..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Prescription Builder */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="font-serif italic font-extrabold text-blue-700 text-sm">Rx</span>
                  Kê đơn thuốc ({prescriptions.length} thuốc):
                </h5>

                <div className="text-[11px] text-slate-500">
                  Thêm thuốc vào toa bên dưới
                </div>
              </div>

              {/* Quick Add Popular Meds */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-600 mr-1">Thuốc nhanh:</span>
                {POPULAR_MEDICATIONS.slice(0, 7).map((pop) => (
                  <button
                    key={pop.name}
                    type="button"
                    onClick={() => handleQuickAddPopularMed(pop)}
                    className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-700 rounded border border-slate-200 transition"
                  >
                    + {pop.name.split('(')[0].trim()}
                  </button>
                ))}
              </div>

              {/* Current Prescriptions Table in Edit Mode */}
              {prescriptions.length > 0 && (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/80 text-slate-600 uppercase font-semibold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Tên thuốc & Hàm lượng</th>
                        <th className="py-2.5 px-3">Dạng dùng</th>
                        <th className="py-2.5 px-3">Số lượng</th>
                        <th className="py-2.5 px-3">Liều & Cách dùng</th>
                        <th className="py-2.5 px-2 text-center w-20">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prescriptions.map((item, idx) => {
                        const isThisRowEditing = editingId === item.id;

                        if (isThisRowEditing) {
                          return (
                            <tr key={item.id} className="bg-blue-50/60">
                              <td className="py-2 px-3 font-mono font-bold text-blue-600">{idx + 1}</td>
                              <td className="py-2 px-2">
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  className="w-full text-xs border border-blue-300 rounded px-2 py-1 bg-white font-semibold"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="text"
                                  value={editForm}
                                  onChange={(e) => setEditForm(e.target.value)}
                                  className="w-full text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="text"
                                  value={editQuantity}
                                  onChange={(e) => setEditQuantity(e.target.value)}
                                  className="w-full text-xs border border-blue-300 rounded px-2 py-1 bg-white font-mono font-bold text-blue-700"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={editDosage}
                                    placeholder="Liều dùng"
                                    onChange={(e) => setEditDosage(e.target.value)}
                                    className="w-full text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                                  />
                                  <input
                                    type="text"
                                    value={editInstructions}
                                    placeholder="Lưu ý"
                                    onChange={(e) => setEditInstructions(e.target.value)}
                                    className="w-full text-[11px] border border-blue-200 rounded px-2 py-0.5 bg-white text-slate-500 italic"
                                  />
                                </div>
                              </td>
                              <td className="py-2 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveEdit(item.id)}
                                    className="p-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded transition"
                                    title="Lưu sửa đổi"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="p-1 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded transition"
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
                            <td className="py-2 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{item.medicationName}</td>
                            <td className="py-2 px-3 text-slate-600">{item.formAndRoute}</td>
                            <td className="py-2 px-3 font-mono font-bold text-blue-700">{item.quantity}</td>
                            <td className="py-2 px-3 text-slate-700">
                              <div>{item.dosage}</div>
                              {item.instructions && (
                                <div className="text-[10px] text-slate-500 italic mt-0.5">{item.instructions}</div>
                              )}
                            </td>
                            <td className="py-2 px-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(item)}
                                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                  title="Chỉnh sửa đơn thuốc (Không cần xóa)"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMedication(item.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                                  title="Xóa thuốc"
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

              {/* Add New Medication Inline Form with Inventory Integration */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 block">Thêm thuốc mới vào đơn:</span>
                  <button
                    type="button"
                    onClick={() => setIsInventoryPickerOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold shadow-2xs transition"
                  >
                    <Package className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chọn từ Kho thuốc & Dược chất</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Tên thuốc & hàm lượng (e.g. Klenzit-C, Doxycycline 100mg...)"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <select
                      value={medForm}
                      onChange={(e) => setMedForm(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="Viên uống">Viên uống</option>
                      <option value="Gel bôi ngoài da">Gel bôi ngoài da</option>
                      <option value="Kem bôi ngoài da">Kem bôi ngoài da</option>
                      <option value="Dung dịch bôi">Dung dịch bôi</option>
                      <option value="Dung dịch rửa / Tắm">Dung dịch rửa / Tắm</option>
                      <option value="Thuốc xịt ngoài da">Thuốc xịt ngoài da</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Số lượng (e.g. 1 tuýp 15g, 30 viên...)"
                      value={medQuantity}
                      onChange={(e) => setMedQuantity(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Liều dùng & Tần suất (e.g. Uống 1 viên x 2 lần/ngày sau ăn no; Bôi buổi tối...)"
                      value={medDosage}
                      onChange={(e) => setMedDosage(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Lưu ý (Uống nhiều nước, chống nắng...)"
                      value={medInstructions}
                      onChange={(e) => setMedInstructions(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    disabled={!medName.trim()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm vào đơn thuốc
                  </button>
                </div>
              </div>

              {/* Inventory Picker Modal */}
              {isInventoryPickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl p-5 space-y-3 animate-in fade-in max-h-[85vh] flex flex-col">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-slate-900 text-sm">
                          Chọn Thuốc & Dược Chất Từ Kho Phòng Khám
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsInventoryPickerOpen(false)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm theo tên biệt dược, hoạt chất (e.g. Clindamycin, Botox...)"
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>

                    <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-96 pr-1">
                      {inventoryItems
                        .filter((item) => {
                          const term = inventorySearch.toLowerCase();
                          return (
                            item.name.toLowerCase().includes(term) ||
                            item.activeIngredient.toLowerCase().includes(term) ||
                            item.code.toLowerCase().includes(term)
                          );
                        })
                        .map((item) => {
                          const isLow = item.stockQuantity <= item.minThreshold;
                          const isOut = item.stockQuantity === 0;

                          return (
                            <div
                              key={item.id}
                              onClick={() => !isOut && handleSelectFromInventory(item)}
                              className={`p-3 flex items-center justify-between gap-3 hover:bg-blue-50/50 rounded-xl cursor-pointer transition ${
                                isOut ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              <div>
                                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                  <span>{item.name}</span>
                                  <span className="text-[10px] font-mono text-slate-400">({item.code})</span>
                                </div>
                                <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                                  {item.activeIngredient}
                                </div>
                                <div className="text-[10px] text-slate-500 mt-0.5">
                                  Quy cách: {item.unit} {item.unitPrice ? `• ${item.unitPrice.toLocaleString('vi-VN')} đ` : ''}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                  isOut 
                                    ? 'bg-rose-100 text-rose-800' 
                                    : isLow 
                                    ? 'bg-amber-100 text-amber-800' 
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  Tồn: {item.stockQuantity} {item.unit}
                                </span>
                                {!isOut && (
                                  <div className="text-[10px] text-blue-600 font-semibold mt-1 hover:underline">
                                    + Chọn vào đơn
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setIsInventoryPickerOpen(false)}
                        className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                Lưu phác đồ & Đơn thuốc
              </button>
            </div>
          </div>
        ) : (
          /* VIEW MODE */
          <div className="space-y-4">
            {!hasData ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                <Pill className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">
                  Chưa có phác đồ điều trị và đơn thuốc cho lần khám này.
                </p>
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Kê đơn & Thiết lập phác đồ điều trị
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Treatment details columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {treatmentContent && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                        <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                        Nội dung & Phác đồ điều trị:
                      </span>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line">{treatmentContent}</p>
                    </div>
                  )}

                  {interventionProcedure && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                        <Scissors className="w-3.5 h-3.5 text-blue-600" />
                        Thủ thuật / Can thiệp tại chỗ:
                      </span>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line">{interventionProcedure}</p>
                    </div>
                  )}

                  {skincareRegimen && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                        <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                        Chăm sóc da & Chế độ sinh hoạt:
                      </span>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line">{skincareRegimen}</p>
                    </div>
                  )}

                  {doctorInstructions && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wider">
                        <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
                        Lời dặn bác sĩ & Hẹn tái khám:
                      </span>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-line">{doctorInstructions}</p>
                    </div>
                  )}
                </div>

                {/* Prescription Table */}
                {prescriptions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="font-serif italic font-extrabold text-blue-700 text-sm">Rx</span>
                        Đơn thuốc điều trị ({prescriptions.length} loại thuốc):
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                          Bác sĩ kê: <strong className="text-slate-800">{doctorName}</strong>
                        </span>
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-md border border-blue-200 transition"
                            title="Chỉnh sửa các loại thuốc trong đơn"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Sửa đơn thuốc</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">STT</th>
                            <th className="py-2.5 px-3">Tên thuốc & Hoạt chất</th>
                            <th className="py-2.5 px-3">Dạng dùng</th>
                            <th className="py-2.5 px-3">Số lượng</th>
                            <th className="py-2.5 px-3">Liều dùng & Cách dùng</th>
                            {isEditable && <th className="py-2.5 px-2 text-center w-12">Sửa</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {prescriptions.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-slate-900">{item.medicationName}</span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">
                                  {item.formAndRoute}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{item.quantity}</td>
                              <td className="py-2.5 px-3 text-slate-800">
                                <div className="font-medium">{item.dosage}</div>
                                {item.instructions && (
                                  <div className="text-[11px] text-slate-500 italic mt-0.5">
                                    Lưu ý: {item.instructions}
                                  </div>
                                )}
                              </td>
                              {isEditable && (
                                <td className="py-2.5 px-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsEditing(true);
                                      handleStartEdit(item);
                                    }}
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                    title="Sửa thuốc này trực tiếp"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
