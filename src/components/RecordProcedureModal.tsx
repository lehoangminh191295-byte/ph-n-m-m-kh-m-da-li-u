import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Zap, 
  Syringe, 
  Droplet, 
  Layers, 
  Scissors, 
  ShieldCheck,
  Package,
  Calendar,
  User,
  Activity
} from 'lucide-react';
import { ClinicalProcedure, ProcedureType, Patient, InventoryItem, ProcedureTechnicalParams } from '../types';
import { loadInventory, adjustInventoryStock } from '../services/storageService';

interface RecordProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient;
  allPatients?: Patient[];
  onSaveProcedure: (procedure: ClinicalProcedure, shouldDeductInventory: boolean) => void;
}

const PROCEDURE_TYPE_CONFIG: Record<ProcedureType, { label: string; icon: string; color: string; badgeBg: string }> = {
  LASER: { label: 'Laser Da Liễu', icon: '⚡', color: 'text-amber-700 border-amber-300', badgeBg: 'bg-amber-50' },
  BOTOX: { label: 'Tiêm Botulinum Toxin', icon: '💉', color: 'text-purple-700 border-purple-300', badgeBg: 'bg-purple-50' },
  FILLER: { label: 'Tiêm Filler HA', icon: '✨', color: 'text-blue-700 border-blue-300', badgeBg: 'bg-blue-50' },
  MESOTHERAPY: { label: 'Mesotherapy & BAP', icon: '💧', color: 'text-emerald-700 border-emerald-300', badgeBg: 'bg-emerald-50' },
  MICRONEEDLING: { label: 'Lăn kim / Phi kim', icon: '🎯', color: 'text-cyan-700 border-cyan-300', badgeBg: 'bg-cyan-50' },
  MINOR_SURGERY: { label: 'Tiểu phẫu da', icon: '✂️', color: 'text-rose-700 border-rose-300', badgeBg: 'bg-rose-50' },
  CHEMICAL_PEEL: { label: 'Peel da hóa học', icon: '🧪', color: 'text-orange-700 border-orange-300', badgeBg: 'bg-orange-50' }
};

interface ProcedurePreset {
  id: string;
  name: string;
  type: ProcedureType;
  productUsed: string;
  dosageOrVolume: string;
  targetArea: string;
  anesthesiaMethod: string;
  immediateResponse: string;
  postCareInstructions: string;
  params: ProcedureTechnicalParams;
  suggestedCost: number;
}

const PROCEDURE_PRESETS: ProcedurePreset[] = [
  {
    id: 'pr-laser-co2',
    name: 'Laser CO2 Fractional tái tạo vi điểm trị sẹo rỗ',
    type: 'LASER',
    productUsed: 'Hệ thống Lutronic eCO2 Fractional vi điểm',
    dosageOrVolume: '2 passes, 800 - 1000 micro-shots',
    targetArea: 'Vùng má 2 bên và trán',
    anesthesiaMethod: 'Ủ tê kem Lidocaine 10.56% trong 45 phút + Làm mát Cryo Cooler',
    immediateResponse: 'Đỏ da đồng đều (Erythema Grade 2), phù nhẹ quanh vi lỗ nhiệt, an toàn không bỏng rát sâu.',
    postCareInstructions: 'Chườm gạc lạnh trong 24h đầu, xịt khoáng vô khuẩn mỗi 2 giờ, thoa serum B5/EGF phục hồi, kiêng nước lã 24h, chống nắng vật lý SPF 50+ sau ngày thứ 3.',
    params: {
      laserType: 'CO2 Fractional 10,600 nm',
      wavelength: '10,600 nm',
      energy: '45 mJ / microbeam',
      passesOrDensity: 'Mật độ 15%, 2 passes chồng',
      pulseWidthOrFrequency: 'Static mode, 150 Hz',
    },
    suggestedCost: 3500000,
  },
  {
    id: 'pr-laser-yag',
    name: 'Laser Nd:YAG Q-Switched điều trị sắc tố & tàn nhang',
    type: 'LASER',
    productUsed: 'Laser Q-Switched Nd:YAG MedLite C6',
    dosageOrVolume: '1500 pulses',
    targetArea: 'Hai bên gò má và sống mũi',
    anesthesiaMethod: 'Ủ tê Lidocaine 30 phút',
    immediateResponse: 'Xuất hiện điểm sương trắng thoáng qua (Frosting), không xuất huyết dưới da.',
    postCareInstructions: 'Đắp gạc lạnh làm dịu da ngay sau bắn, thoa kem phục hồi K-Ox, che chắn nắng tuyệt đối bằng khẩu trang tối màu và kem chống nắng SPF 50+.',
    params: {
      laserType: 'Q-Switched Nd:YAG',
      wavelength: '1064 nm / 532 nm',
      energy: '1.8 J/cm2 (Spot size 6mm)',
      pulseWidthOrFrequency: '10 Hz, Nanosecond pulse',
      passesOrDensity: '2 passes toning + 1 pass spot',
    },
    suggestedCost: 2500000,
  },
  {
    id: 'pr-botox-wrinkles',
    name: 'Tiêm Botulinum Toxin xóa nhăn trán, cau mày & đuôi mắt',
    type: 'BOTOX',
    productUsed: 'Botox Allergan 100 Units (Mỹ)',
    dosageOrVolume: '32 Units (Frontalis: 12U, Glabella: 12U, Crow feet: 8U)',
    targetArea: 'Vùng trán, gian mày và khóe mắt ngoài 2 bên',
    anesthesiaMethod: 'Chườm túi đá lạnh giảm đau tại chỗ (Ice pack)',
    immediateResponse: 'Nốt sẩn tiêm tan nhanh sau 15-20 phút, không tụ máu, không sưng bầm.',
    postCareInstructions: 'Giữ đầu thẳng đứng 4 giờ đầu, không massage day ấn vùng tiêm trong 48 giờ, kiêng xông hơi và tập thể dục cường độ cao 3 ngày.',
    params: {
      botoxUnits: 32,
      injectionPoints: 14,
      dilutionRatio: 'Pha 2.5 ml NaCl 0.9% vô khuẩn / lọ 100U (4 Units / 0.1 ml)',
    },
    suggestedCost: 4800000,
  },
  {
    id: 'pr-botox-jaw',
    name: 'Tiêm Botulinum Toxin thon gọn góc hàm (Masseter)',
    type: 'BOTOX',
    productUsed: 'Botox Allergan 100 Units / Dysport 300U',
    dosageOrVolume: '50 Units (25 Units mỗi bên cơ cắn)',
    targetArea: 'Cơ cắn (Masseter muscle) 2 bên góc hàm',
    anesthesiaMethod: 'Chườm đá lạnh tại chỗ',
    immediateResponse: 'Cảm giác mỏi nhẹ cơ cắn khi nhai sau 3-5 ngày, không sưng viêm.',
    postCareInstructions: 'Hạn chế nhai thức ăn cứng, dai (kẹo cao su, mực nướng), không chườm nóng góc hàm.',
    params: {
      botoxUnits: 50,
      injectionPoints: 6,
      dilutionRatio: 'Pha 2.0 ml NaCl 0.9% / lọ 100U',
    },
    suggestedCost: 5500000,
  },
  {
    id: 'pr-filler-nasolabial',
    name: 'Tiêm Filler Hyaluronic Acid làm đầy rãnh cười (Nasolabial folds)',
    type: 'FILLER',
    productUsed: 'Juvederm Ultra Plus XC (Allergan) 1.0 ml',
    dosageOrVolume: '1.0 ml (0.5 ml mỗi bên rãnh)',
    targetArea: 'Rãnh mũi má 2 bên',
    anesthesiaMethod: 'Sản phẩm có sẵn Lidocaine 0.3% + Ủ tê điểm vào Canula',
    immediateResponse: 'Rãnh cười nông tức thì, kiểm tra hồi lưu mao mạch bình thường (<2s), không có dấu hiệu tắc mạch.',
    postCareInstructions: 'Không sờ nắn day ép rãnh cười, không nằm sấp, chườm mát nếu sưng nhẹ, kiêng rượu bia 3 ngày.',
    params: {
      fillerVolumeMl: 1.0,
      deliveryTool: 'Canula đầu tù 25G 50mm + Kim mồi 23G',
      injectionPlane: 'Kỹ thuật luồn sâu hạ bì & mỡ sâu rẽ quạt (Deep subcutaneous fan)',
    },
    suggestedCost: 8500000,
  },
  {
    id: 'pr-meso-bap',
    name: 'Mesotherapy BAP 5 điểm sinh học căng bóng phục hồi da',
    type: 'MESOTHERAPY',
    productUsed: 'Placentex PDRN cá hồi 3ml + Hyaron HA phân tử nhỏ 2.5ml',
    dosageOrVolume: '2.5 ml dung dịch cocktail',
    targetArea: 'Toàn bộ 2 bên má (5 điểm giải phẫu BAP mỗi bên)',
    anesthesiaMethod: 'Ủ tê kem Lidocaine 30 phút',
    immediateResponse: 'Các nốt sẩn sinh học hấp thu sau 12 - 24 giờ, không để lại vết thâm.',
    postCareInstructions: 'Đắp mặt nạ phục hồi sinh học, thoa dưỡng ẩm chứa B5 & ceramide, chống nắng kỹ càng.',
    params: {
      mesoTechnique: 'Kỹ thuật Bio Aesthetic Points (BAP) 5 điểm sinh học trung bì sâu',
      needleDepthMm: 'Kim 32G 4mm, góc 45 độ',
      cocktailActives: 'PDRN DNA cá hồi 2% + Non-crosslinked HA 25mg',
    },
    suggestedCost: 3200000,
  },
  {
    id: 'pr-microneedling-scars',
    name: 'Lăn kim / Phi kim Dermapen kết hợp Tế bào gốc EGF trị sẹo rỗ',
    type: 'MICRONEEDLING',
    productUsed: 'Đầu kim titan vô khuẩn 16 kim + Tinh chất Bio-EGF',
    dosageOrVolume: '1 đầu kim vô khuẩn + 5 ml serum tế bào gốc',
    targetArea: 'Vùng má sẹo rỗ, trán và mũi',
    anesthesiaMethod: 'Ủ tê kem 40 phút',
    immediateResponse: 'Điểm rớm máu sương (Frosting & Pinpoint bleeding) đạt đáp ứng lâm sàng chuẩn.',
    postCareInstructions: 'Rửa mặt bằng nước muối sinh lý vô trùng 48h đầu, thoa serum tế bào gốc 3 lần/ngày, kiêng nắng tuyệt đối.',
    params: {
      needleDepthMm: 'Trán 0.8mm, Gò má 1.5mm, Mũi 0.5mm',
      passesOrDensity: '3 passes hình xoắn ốc và lưới đan chéo',
      cocktailActives: 'Oligopeptide EGF + Hyaluronic Acid + Vitamin B5',
    },
    suggestedCost: 2200000,
  },
];

export const RecordProcedureModal: React.FC<RecordProcedureModalProps> = ({
  isOpen,
  onClose,
  patient,
  allPatients = [],
  onSaveProcedure,
}) => {
  const inventory = loadInventory();

  // Selected patient if not passed
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patient?.id || (allPatients[0]?.id || ''));

  // Procedure form state
  const [procedureType, setProcedureType] = useState<ProcedureType>('LASER');
  const [procedureName, setProcedureName] = useState('Laser CO2 Fractional tái tạo vi điểm trị sẹo rỗ');
  const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [doctorName, setDoctorName] = useState('BS. CKII Lê Hoàng Minh');
  const [technicianName, setTechnicianName] = useState('KTV. Trần Thảo Vy');
  const [targetArea, setTargetArea] = useState('Vùng má 2 bên và trán');
  const [productUsed, setProductUsed] = useState('Hệ thống Lutronic eCO2 Fractional');
  const [dosageOrVolume, setDosageOrVolume] = useState('2 passes, 800 - 1000 micro-shots');
  const [sessionNumber, setSessionNumber] = useState<number>(1);
  const [totalSessions, setTotalSessions] = useState<number>(4);
  const [anesthesiaMethod, setAnesthesiaMethod] = useState('Ủ tê kem Lidocaine 10.56% trong 45 phút');
  const [immediateResponse, setImmediateResponse] = useState('Đỏ da đồng đều (Erythema Grade 2), phù nhẹ quanh vi lỗ nhiệt, an toàn không bỏng rát sâu.');
  const [postCareInstructions, setPostCareInstructions] = useState('Chườm lạnh 24h đầu, xịt khoáng vô khuẩn mỗi 2 giờ, thoa serum B5/EGF, chống nắng vật lý SPF 50+');
  const [complications, setComplications] = useState('Không có biến chứng ghi nhận (No adverse event)');
  const [cost, setCost] = useState<number>(3500000);
  const [notes, setNotes] = useState('');

  // Technical params
  const [techParams, setTechParams] = useState<ProcedureTechnicalParams>({
    laserType: 'CO2 Fractional 10,600 nm',
    wavelength: '10,600 nm',
    energy: '45 mJ / microbeam',
    passesOrDensity: 'Mật độ 15%, 2 passes',
    pulseWidthOrFrequency: 'Static mode, 150 Hz',
  });

  // Inventory linkage
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string>('');
  const [deductFromInventory, setDeductFromInventory] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentPatient = patient || allPatients.find((p) => p.id === selectedPatientId) || allPatients[0];

  const handleApplyPreset = (preset: ProcedurePreset) => {
    setProcedureType(preset.type);
    setProcedureName(preset.name);
    setProductUsed(preset.productUsed);
    setDosageOrVolume(preset.dosageOrVolume);
    setTargetArea(preset.targetArea);
    setAnesthesiaMethod(preset.anesthesiaMethod);
    setImmediateResponse(preset.immediateResponse);
    setPostCareInstructions(preset.postCareInstructions);
    setTechParams(preset.params);
    setCost(preset.suggestedCost);

    // Try finding matching inventory item
    const matchedInv = inventory.find((item) => 
      item.name.toLowerCase().includes(preset.productUsed.toLowerCase().split(' ')[0]) ||
      (preset.type === 'BOTOX' && item.category === 'BOTOX_TOXIN') ||
      (preset.type === 'FILLER' && item.category === 'FILLER_HA')
    );
    if (matchedInv) {
      setSelectedInventoryItemId(matchedInv.id);
    }
  };

  const handleSelectInventoryItem = (itemId: string) => {
    setSelectedInventoryItemId(itemId);
    const item = inventory.find((i) => i.id === itemId);
    if (item) {
      setProductUsed(`${item.name} (${item.activeIngredient})`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

    const newProc: ClinicalProcedure = {
      id: `proc-${Date.now()}`,
      patientId: currentPatient.id,
      patientName: currentPatient.fullName,
      patientCode: currentPatient.code,
      procedureType,
      procedureName: procedureName.trim(),
      treatmentDate,
      doctorName: doctorName.trim(),
      technicianName: technicianName.trim() || undefined,
      targetArea: targetArea.trim(),
      productUsed: productUsed.trim(),
      inventoryItemId: selectedInventoryItemId || undefined,
      dosageOrVolume: dosageOrVolume.trim(),
      technicalParams: techParams,
      sessionNumber: Number(sessionNumber) || 1,
      totalSessions: Number(totalSessions) || 1,
      anesthesiaMethod: anesthesiaMethod.trim(),
      immediateResponse: immediateResponse.trim(),
      postCareInstructions: postCareInstructions.trim(),
      complications: complications.trim() || 'Không có biến chứng ghi nhận',
      cost: Number(cost) || 0,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveProcedure(newProc, deductFromInventory && !!selectedInventoryItemId);
    onClose();
  };

  const selectedInventoryItem = inventory.find((i) => i.id === selectedInventoryItemId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-auto overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Ghi Nhận Thủ Thuật & Can Thiệp Da Liễu
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Laser • Botox • Filler • Meso • Lăn kim
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Lưu trữ thông số kỹ thuật, dược chất sử dụng và hồ sơ can thiệp y khoa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Quick Presets Bar */}
          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Mẫu thủ thuật chuyên khoa (Chọn để điền nhanh toàn bộ thông số):
              </span>
              <span className="text-[10px] text-amber-800 font-medium">Bác sĩ có thể tùy biến lại sau khi chọn</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PROCEDURE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1.5 bg-white hover:bg-amber-600 hover:text-white text-slate-800 rounded-lg text-xs font-medium border border-amber-300/80 shadow-2xs transition flex items-center gap-1.5"
                >
                  <span>{PROCEDURE_TYPE_CONFIG[preset.type].icon}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Patient & Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bệnh nhân thực hiện:
              </label>
              {patient ? (
                <div className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900">
                  {patient.fullName} ({patient.code}) - {patient.phone}
                </div>
              ) : (
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {allPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.code}) - {p.phone}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phân loại thủ thuật:
              </label>
              <select
                value={procedureType}
                onChange={(e) => setProcedureType(e.target.value as ProcedureType)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
              >
                <option value="LASER">⚡ Laser Da Liễu (CO2, Nd:YAG, Pico...)</option>
                <option value="BOTOX">💉 Tiêm Botulinum Toxin (Allergan, Dysport...)</option>
                <option value="FILLER">✨ Tiêm Filler HA (Juvederm, Restylane...)</option>
                <option value="MESOTHERAPY">💧 Mesotherapy & Tiêm BAP 5 điểm</option>
                <option value="MICRONEEDLING">🎯 Lăn kim / Phi kim Dermapen</option>
                <option value="CHEMICAL_PEEL">🧪 Peel da hóa học (TCA, Salicylic...)</option>
                <option value="MINOR_SURGERY">✂️ Tiểu phẫu / Áp lạnh Nitơ lỏng</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày can thiệp:
              </label>
              <input
                type="date"
                value={treatmentDate}
                onChange={(e) => setTreatmentDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Section 2: Procedure Identity & Personnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên thủ thuật thực hiện: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={procedureName}
                onChange={(e) => setProcedureName(e.target.value)}
                placeholder="Ví dụ: Laser CO2 Fractional sẹo rỗ, Tiêm Botox xóa nhăn trán..."
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vùng thực hiện can thiệp: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={targetArea}
                onChange={(e) => setTargetArea(e.target.value)}
                placeholder="Ví dụ: Toàn mặt, Vùng trán & gian mày, Rãnh cười 2 bên, Gò má..."
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bác sĩ thực hiện:</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kỹ thuật viên phụ tá:</label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="KTV hỗ trợ"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Buổi thứ mấy trong đợt:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={sessionNumber}
                  onChange={(e) => setSessionNumber(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-center"
                />
                <span className="text-xs text-slate-400">/</span>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={totalSessions}
                  onChange={(e) => setTotalSessions(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chi phí thủ thuật (VNĐ):</label>
              <input
                type="number"
                step="50000"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-blue-700"
              />
            </div>
          </div>

          {/* Section 3: Product, Active Ingredient & Stock Link */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-600" />
                Dược chất / Thiết bị / Liên kết Kho thuốc:
              </span>
              <span className="text-[11px] text-blue-700">Tự động kiểm tra số lượng tồn kho</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Chọn sản phẩm từ Kho Thuốc & Dược Chất:
                </label>
                <select
                  value={selectedInventoryItemId}
                  onChange={(e) => handleSelectInventoryItem(e.target.value)}
                  className="w-full text-xs border border-blue-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="">-- Tự nhập bên dưới (Không trừ kho) --</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} [{item.activeIngredient}] — Tồn kho: {item.stockQuantity} {item.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tên sản phẩm / Hoạt chất / Thiết bị thực tế:
                </label>
                <input
                  type="text"
                  value={productUsed}
                  onChange={(e) => setProductUsed(e.target.value)}
                  placeholder="Ví dụ: Botox Allergan 100U, Juvederm Ultra Plus XC, Laser Lutronic..."
                  className="w-full text-xs border border-blue-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Liều lượng / Thể tích / Số shots:
                </label>
                <input
                  type="text"
                  value={dosageOrVolume}
                  onChange={(e) => setDosageOrVolume(e.target.value)}
                  placeholder="Ví dụ: 32 Units, 1.0 ml (1 syringe), 850 shots, 2.5 ml..."
                  className="w-full text-xs border border-blue-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-blue-900"
                  required
                />
              </div>

              {selectedInventoryItem && (
                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-blue-200 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{selectedInventoryItem.name}</span>
                    <p className="text-[11px] text-slate-500">
                      Tồn hiện tại: <strong className="text-blue-700 font-mono">{selectedInventoryItem.stockQuantity} {selectedInventoryItem.unit}</strong>
                    </p>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={deductFromInventory}
                      onChange={(e) => setDeductFromInventory(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Trừ 1 đơn vị kho</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Dynamic Technical Parameters (Adapts by Procedure Type) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-slate-600" />
              Thông số kỹ thuật chi tiết:
            </span>

            {procedureType === 'LASER' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Bước sóng (Wavelength):</label>
                  <input
                    type="text"
                    value={techParams.wavelength || ''}
                    onChange={(e) => setTechParams({ ...techParams, wavelength: e.target.value })}
                    placeholder="10,600 nm, 1064 nm..."
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Mức năng lượng (Energy):</label>
                  <input
                    type="text"
                    value={techParams.energy || ''}
                    onChange={(e) => setTechParams({ ...techParams, energy: e.target.value })}
                    placeholder="45 mJ, 1.8 J/cm2..."
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Mật độ / Số passes:</label>
                  <input
                    type="text"
                    value={techParams.passesOrDensity || ''}
                    onChange={(e) => setTechParams({ ...techParams, passesOrDensity: e.target.value })}
                    placeholder="2 passes, Density 15%..."
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
              </div>
            )}

            {procedureType === 'BOTOX' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tổng số Units:</label>
                  <input
                    type="number"
                    value={techParams.botoxUnits || 0}
                    onChange={(e) => setTechParams({ ...techParams, botoxUnits: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Số điểm tiêm:</label>
                  <input
                    type="number"
                    value={techParams.injectionPoints || 0}
                    onChange={(e) => setTechParams({ ...techParams, injectionPoints: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tỷ lệ pha dung môi (NaCl):</label>
                  <input
                    type="text"
                    value={techParams.dilutionRatio || ''}
                    onChange={(e) => setTechParams({ ...techParams, dilutionRatio: e.target.value })}
                    placeholder="2.5 ml NaCl 0.9% / 100U"
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
              </div>
            )}

            {procedureType === 'FILLER' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Thể tích tiêm (ml):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={techParams.fillerVolumeMl || 1.0}
                    onChange={(e) => setTechParams({ ...techParams, fillerVolumeMl: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Dụng cụ tiêm (Kim / Canula):</label>
                  <input
                    type="text"
                    value={techParams.deliveryTool || ''}
                    onChange={(e) => setTechParams({ ...techParams, deliveryTool: e.target.value })}
                    placeholder="Canula 25G 50mm, Kim 30G..."
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Tầng giải phẫu tiêm:</label>
                  <input
                    type="text"
                    value={techParams.injectionPlane || ''}
                    onChange={(e) => setTechParams({ ...techParams, injectionPlane: e.target.value })}
                    placeholder="Dưới màng xương, Hạ bì sâu..."
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
              </div>
            )}

            {(procedureType === 'MESOTHERAPY' || procedureType === 'MICRONEEDLING') && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Độ sâu kim (mm):</label>
                  <input
                    type="text"
                    value={techParams.needleDepthMm || ''}
                    onChange={(e) => setTechParams({ ...techParams, needleDepthMm: e.target.value })}
                    placeholder="0.8 - 1.5 mm, 32G 4mm..."
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-600 mb-1">Thành phần hoạt chất cocktail:</label>
                  <input
                    type="text"
                    value={techParams.cocktailActives || ''}
                    onChange={(e) => setTechParams({ ...techParams, cocktailActives: e.target.value })}
                    placeholder="PDRN cá hồi 2% + Non-crosslinked HA + Vitamin C..."
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Clinical Response & Post-Care */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phương pháp vô cảm (Gây tê):
              </label>
              <input
                type="text"
                value={anesthesiaMethod}
                onChange={(e) => setAnesthesiaMethod(e.target.value)}
                placeholder="Ủ tê kem Lidocaine 10.56% 45 phút, Chườm đá lạnh..."
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phản ứng tức thì sau thủ thuật:
              </label>
              <input
                type="text"
                value={immediateResponse}
                onChange={(e) => setImmediateResponse(e.target.value)}
                placeholder="Đỏ da nhẹ đồng đều, nốt sẩn tan tốt, không tụ máu..."
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Hướng dẫn chăm sóc tại nhà & Lời dặn sau can thiệp:
            </label>
            <textarea
              rows={2}
              value={postCareInstructions}
              onChange={(e) => setPostCareInstructions(e.target.value)}
              placeholder="Chườm mát, kiêng nước, thoa kem phục hồi B5, chống nắng phổ rộng..."
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi nhận biến chứng / Dị ứng:
              </label>
              <input
                type="text"
                value={complications}
                onChange={(e) => setComplications(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-emerald-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú thêm của bác sĩ:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Hẹn tái khám sau 2 tuần, đáp ứng mô rất tốt..."
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Lưu Hồ Sơ Thủ Thuật Y Khoa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
