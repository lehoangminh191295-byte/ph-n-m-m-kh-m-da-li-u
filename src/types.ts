export type Gender = 'Nam' | 'Nữ' | 'Khác';

export type FitzpatrickSkinType = 'Type I' | 'Type II' | 'Type III' | 'Type IV' | 'Type V' | 'Type VI';

export type LesionStatus = 'ACTIVE_MONITORING' | 'BIOPSIED' | 'RESOLVED' | 'EXCISED';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH';

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type ReminderChannel = 'SMS' | 'Zalo' | 'WhatsApp';

export interface Patient {
  id: string;
  code: string; // e.g., BN-2026-0042
  fullName: string;
  dob: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  fitzpatrick: FitzpatrickSkinType;
  medicalHistory: string;
  allergies?: string;
  familySkinCancerHistory: boolean;
  consentSigned: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LesionImage {
  id: string;
  type: 'macroscopic' | 'dermoscopy';
  dataUrl: string;
  label?: string;
  takenAt: string;
  magnification?: string; // e.g. "10x Polarized", "Clinical Full", "20x Contact"
  notes?: string;
}

export interface ABCDScore {
  asymmetry: number; // 0 - 2 (weight: 1.3)
  border: number; // 0 - 8 (weight: 0.1)
  color: number; // 1 - 6 (weight: 0.5)
  differentialStructures: number; // 1 - 5 (weight: 0.5)
  tds: number; // Total Dermoscopy Score
  interpretation: string;
}

export interface DifferentialDiagnosis {
  disease: string;
  probability: number;
  rationale: string;
}

export interface AIAnalysisResult {
  summary: string;
  macroscopicFindings: string;
  dermoscopyFindings: {
    pigmentNetwork: string;
    vascularPattern: string;
    dotsAndGlobules: string;
    blueWhiteVeil: string;
    structures: string[];
  };
  abcdScore: ABCDScore;
  riskLevel: RiskLevel;
  differentialDiagnoses: DifferentialDiagnosis[];
  suggestedPrimaryDiagnosis: string;
  recommendations: string[];
  urgentAttention: boolean;
  followUpInterval: string;
  analyzedAt: string;
}

export interface ProgressComparisonResult {
  progressStatus: 'IMPROVED' | 'STABLE' | 'REGRESSED' | 'CONCERN';
  statusLabel: string;
  sizeChangeDescription: string;
  pigmentationChangeDescription: string;
  dermoscopyEvolution: string;
  treatmentEfficacyEvaluation: string;
  nextStepRecommendations: string[];
  evaluatedAt: string;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string; // e.g., "Klenzit-C (Adapalene 0.1% + Clindamycin 1%)"
  formAndRoute: string; // e.g., "Gel bôi ngoài da", "Viên uống", "Kem bôi", "Dung dịch rửa"
  dosage: string; // e.g., "Thoa 1 lần vào buổi tối trước khi ngủ"
  quantity: string; // e.g., "1 tuýp 15g", "30 viên"
  instructions?: string; // e.g., "Rửa mặt sạch, chờ 15 phút rồi thoa lớp mỏng lên vùng sang thương"
}

export interface TreatmentPlan {
  treatmentContent: string; // Nội dung phác đồ điều trị tổng quát
  interventionProcedure?: string; // Thủ thuật tại phòng khám (nặn mụn y khoa, peel da, áp lạnh, laser...)
  skincareRegimen?: string; // Chăm sóc da & chế độ sinh hoạt
  prescriptions: PrescriptionItem[]; // Danh mục thuốc kê toa
}

export interface LesionVisit {
  id: string;
  lesionId: string;
  patientId: string;
  visitDate: string;
  visitType: 'Khám lần đầu' | 'Tái khám 1 tháng' | 'Tái khám 3 tháng' | 'Tái khám 6 tháng' | 'Sau can thiệp / Sinh thiết';
  doctorName: string;
  lesionSize: string; // e.g. "8 x 6 mm"
  clinicalSymptoms: string[];
  clinicalNotes: string;
  diagnosis: string;
  treatmentApplied: string;
  treatmentPlan?: TreatmentPlan;
  doctorInstructions: string;
  images: LesionImage[];
  aiAnalysis?: AIAnalysisResult;
  comparisonWithPrevious?: ProgressComparisonResult;
  createdAt: string;
}

export interface Lesion {
  id: string;
  patientId: string;
  code: string; // e.g., TL-01
  anatomicalSite: string; // e.g., "Lưng - vùng bả vai trái", "Gò má phải"
  lesionType: string; // e.g. "Trứng cá", "Viêm nang lông", "Trứng cá đỏ", "Sẩn ngứa khác", "Nốt ruồi sắc tố biến đổi"
  onsetDuration: string; // e.g. "6 tháng"
  initialSize: string;
  morphologyNotes?: string; // Ghi chú chi tiết hình dạng của sang thương (dạng sẩn, mụn mủ, cồi, bờ, bề mặt, dát...)
  symptoms: string[]; // e.g., ["Ngứa", "Đổi màu gần đây"]
  status: LesionStatus;
  visits: LesionVisit[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  patientPhone: string;
  doctorName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  purpose: 'Khám mới' | 'Tái khám Dermoscopy' | 'Theo dõi tiến triển điều trị' | 'Sinh thiết / Tiểu phẫu' | 'Cắt chỉ';
  status: AppointmentStatus;
  reminderSent: boolean;
  reminderChannel: ReminderChannel;
  lastReminderAt?: string;
  reminderContent?: string;
  notes?: string;
}

export type ProcedureType = 
  | 'LASER'
  | 'BOTOX'
  | 'FILLER'
  | 'MESOTHERAPY'
  | 'MICRONEEDLING'
  | 'MINOR_SURGERY'
  | 'CHEMICAL_PEEL';

export type LaserSubtype = 
  | 'CO2_SURGICAL'           // Laser CO2 Phẫu thuật bốc tách (Cắt đốt nốt ruồi, u tuyến bã, sùi...)
  | 'CO2_FRACTIONAL'         // Laser CO2 Fractional vi điểm (Sẹo rỗ, trẻ hóa vi điểm 10,600nm)
  | 'FRACTIONAL_NON_ABLATIVE' // Laser Fractional không bốc tách (Erbium Glass 1550nm, Thulium 1927nm)
  | 'ND_YAG_1064'            // Laser Nd:YAG 1064nm (Q-Switched toning, xung dài, sắc tố sâu)
  | 'ND_YAG_532'             // Laser Nd:YAG 532nm (KTP trị tàn nhang, đồi mồi, mao mạch nông)
  | 'UV_PHOTOTHERAPY'        // Chiếu UV / Quang trị liệu (Narrowband UVB 311nm, UVA/PUVA)
  | 'LED_PHOTOTHERAPY'       // Chiếu đèn sinh học LED (Blue 415nm trị mụn, Red 630nm phục hồi)
  | 'OTHER_LASER';           // Laser khác (Pico, Diode, Alexandrite...)

export interface ProcedureTechnicalParams {
  // Laser & Liệu pháp ánh sáng / Quang trị liệu
  laserSubtype?: LaserSubtype;
  laserType?: string; // e.g. "Laser CO2 Bốc tách", "Laser CO2 Fractional", "Laser Nd:YAG 1064nm", "Laser Nd:YAG 532nm", "Chiếu Narrowband UVB 311nm"
  wavelength?: string; // e.g. "10,600 nm", "1064 nm", "532 nm", "311 nm (UVB)", "1550 nm"
  energy?: string; // e.g. "45 mJ", "1.8 J/cm2", "350 mJ/cm2", "4.5 W"
  spotSize?: string; // e.g. "Spot 6mm", "Spot 3mm", "Đầu chiếu cục bộ", "Buồng chiếu toàn thân"
  pulseWidthOrFrequency?: string; // e.g. "10 Hz", "5 ms", "Nanosecond", "Thời gian chiếu: 3 phút"
  passesOrDensity?: string; // e.g. "2 passes", "Mật độ 15%", "Liều tích lũy 1.2 J/cm2"
  exposureTime?: string; // e.g. "2 phút 45 giây (Chiếu UV)", "20 phút (Đèn LED)"
  
  // Botox / Toxin
  botoxUnits?: number; // e.g. 30 Units
  injectionPoints?: number; // e.g. 12 điểm
  dilutionRatio?: string; // e.g. "2.5 ml NaCl 0.9% / 100U"
  
  // Filler
  fillerVolumeMl?: number; // e.g. 1.0 ml
  deliveryTool?: string; // e.g. "Canula 25G 50mm", "Kim nhọn 30G 13mm"
  injectionPlane?: string; // e.g. "Dưới màng xương (Supra-periosteal)", "Lớp mỡ sâu (Deep fat pad)", "Hạ bì sâu"
  
  // Mesotherapy / Microneedling
  needleDepthMm?: string; // e.g. "0.8 - 1.2 mm"
  mesoTechnique?: string; // e.g. "Tiêm BAP 5 điểm sinh học", "Vi điểm nông Epidermal Nappage", "Lăn kim tay Derma Roller"
  cocktailActives?: string; // e.g. "PDRN cá hồi 2% + HA không liên kết chéo + Glutathione"
}

export interface ClinicalProcedure {
  id: string;
  patientId: string;
  patientName: string;
  patientCode: string;
  lesionId?: string; // Tùy chọn liên kết tổn thương cụ thể
  procedureType: ProcedureType;
  procedureName: string; // Tên thủ thuật (e.g. "Laser CO2 Fractional sẹo rỗ", "Tiêm Botox xóa nhăn trán & đuôi mắt")
  treatmentDate: string; // YYYY-MM-DD
  doctorName: string;
  technicianName?: string; // KTV hỗ trợ
  targetArea: string; // Vị trí thực hiện: "Rãnh cười 2 bên", "Vùng trán & cau mày", "Toàn mặt", "Gò má"...
  productUsed?: string; // Sản phẩm / Dược chất sử dụng: "Botox Allergan 100U", "Juvederm Ultra Plus XC", "Laser Lutronic eCO2"...
  inventoryItemId?: string; // Liên kết kho thuốc nếu xuất kho
  dosageOrVolume?: string; // Liều lượng / Thể tích (e.g. "32 Units", "1.0 ml", "2.5 ml")
  technicalParams?: ProcedureTechnicalParams;
  sessionNumber?: number; // Buổi thứ mấy (e.g. 2)
  totalSessions?: number; // Tổng số buổi dự kiến (e.g. 5)
  anesthesiaMethod: string; // Phương pháp tê (e.g. "Ủ tê Lidocaine 10.56% 40 phút", "Làm mát Cryo Cooler", "Gây tê tiêm")
  immediateResponse: string; // Phản ứng tức thì (e.g. "Đỏ da nhẹ, phù nề quanh nốt tiêm, không bầm máu, an toàn")
  postCareInstructions: string; // Hướng dẫn chăm sóc tại nhà
  complications?: string; // "Không có biến chứng ghi nhận"
  cost?: number; // Chi phí thủ thuật (VNĐ)
  notes?: string;
  createdAt: string;
}

export type InventoryCategory = 
  | 'ORAL_MEDICATION'       // Thuốc uống
  | 'TOPICAL_MEDICATION'    // Thuốc bôi ngoài da
  | 'BOTOX_TOXIN'           // Botulinum Toxin
  | 'FILLER_HA'             // Chất làm đầy Hyaluronic Acid
  | 'MESO_SOLUTION'         // Tinh chất Mesotherapy & Tiêm BAP
  | 'CHEMICAL_PEEL'         // Dung dịch Peel hóa học
  | 'PROCEDURE_CONSUMABLE'  // Vật tư thủ thuật & Laser (Canula, đầu kim, gel...)
  | 'DERMO_COSMETIC';       // Dược mỹ phẩm phục hồi

export interface InventoryItem {
  id: string;
  code: string; // Mã quản lý: e.g. "MED-01", "BTX-01", "FIL-01"
  name: string; // Tên biệt dược / Tên sản phẩm
  activeIngredient: string; // Dược chất / Hoạt chất chính (e.g. "Botulinum Toxin Type A", "Adapalene 0.1% + Clindamycin 1%")
  category: InventoryCategory;
  unit: string; // Đơn vị tính: "Tuýp", "Hộp", "Lọ 100U", "Ống 1ml", "Viên", "Cây kim"...
  stockQuantity: number; // Số lượng tồn kho hiện tại
  minThreshold: number; // Định mức tồn tối thiểu để cảnh báo hết hàng
  batchNumber?: string; // Số lô sản xuất
  expiryDate?: string; // Hạn sử dụng YYYY-MM-DD
  unitPrice?: number; // Đơn giá niêm yết (VNĐ)
  manufacturer?: string; // Hãng sản xuất / Quốc gia
  storageConditions?: string; // Điều kiện bảo quản (e.g. "Tủ lạnh 2°C - 8°C", "Nhiệt độ phòng < 30°C")
  notes?: string;
  updatedAt: string;
}

export type AuditAction = 
  | 'VIEW_PATIENT'
  | 'VIEW_DERMOSCOPY'
  | 'CREATE_PATIENT'
  | 'UPDATE_PATIENT'
  | 'CREATE_LESION'
  | 'RECORD_VISIT'
  | 'RUN_AI_ANALYSIS'
  | 'COMPARE_PROGRESS'
  | 'EXPORT_PDF'
  | 'SEND_REMINDER'
  | 'AUTHENTICATE'
  | 'TOGGLE_SECURITY_LOCK'
  | 'CREATE_PROCEDURE'
  | 'UPDATE_PROCEDURE'
  | 'DELETE_PROCEDURE'
  | 'UPDATE_INVENTORY'
  | 'RESTOCK_INVENTORY'
  | 'DELETE_INVENTORY_ITEM'
  | 'SYSTEM_EXPORT'
  | 'GOOGLE_DRIVE_SYNC';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  doctorName: string;
  action: AuditAction;
  targetId?: string;
  targetName?: string;
  details: string;
  ipAddress: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}
