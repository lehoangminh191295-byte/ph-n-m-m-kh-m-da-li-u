import { Patient, Lesion, Appointment, AuditLogEntry, AuditAction, AIAnalysisResult, ProgressComparisonResult, ClinicalProcedure, InventoryItem } from '../types';
import { INITIAL_PATIENTS, INITIAL_LESIONS, INITIAL_APPOINTMENTS, INITIAL_AUDIT_LOGS, INITIAL_PROCEDURES, INITIAL_INVENTORY } from '../data/mockData';

const PATIENTS_KEY = 'dermacare_patients_v1';
const LESIONS_KEY = 'dermacare_lesions_v1';
const APPOINTMENTS_KEY = 'dermacare_appointments_v1';
const AUDIT_LOGS_KEY = 'dermacare_audit_logs_v1';
const PROCEDURES_KEY = 'dermacare_procedures_v1';
const INVENTORY_KEY = 'dermacare_inventory_v1';
const PIN_KEY = 'dermacare_security_pin_v1';

let diskSyncTimeout: any = null;

export function triggerAutoDiskSync() {
  if (typeof window === 'undefined') return;
  if (diskSyncTimeout) clearTimeout(diskSyncTimeout);
  diskSyncTimeout = setTimeout(() => {
    saveToLocalComputerDisk().catch((err) => {
      // In web-only mode without server running or during static preview, this gracefully fails without disrupting user
      console.debug('Background disk sync status:', err?.message);
    });
  }, 1200);
}

export function getStoredPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(PATIENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored patients:', e);
  }
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(INITIAL_PATIENTS));
  return INITIAL_PATIENTS;
}

export function savePatients(patients: Patient[]) {
  localStorage.setItem(PATIENTS_KEY, JSON.stringify(patients));
  triggerAutoDiskSync();
}

export function getStoredLesions(): Lesion[] {
  try {
    const raw = localStorage.getItem(LESIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored lesions:', e);
  }
  localStorage.setItem(LESIONS_KEY, JSON.stringify(INITIAL_LESIONS));
  return INITIAL_LESIONS;
}

export function saveLesions(lesions: Lesion[]) {
  localStorage.setItem(LESIONS_KEY, JSON.stringify(lesions));
  triggerAutoDiskSync();
}

export function getStoredAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored appointments:', e);
  }
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
  return INITIAL_APPOINTMENTS;
}

export function saveAppointments(appointments: Appointment[]) {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  triggerAutoDiskSync();
}

export function getStoredAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored audit logs:', e);
  }
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
  return INITIAL_AUDIT_LOGS;
}

export function logAuditEvent(action: AuditAction, details: string, targetId?: string, targetName?: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') {
  const currentLogs = getStoredAuditLogs();
  const newEntry: AuditLogEntry = {
    id: 'log-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    doctorName: 'BS. CKII Lê Hoàng Minh',
    action,
    targetId,
    targetName,
    details,
    ipAddress: '192.168.1.102 (Nội bộ)',
    severity,
  };
  const updated = [newEntry, ...currentLogs.slice(0, 199)]; // keep latest 200 logs
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
  return newEntry;
}

export function getSecurityPin(): string {
  return localStorage.getItem(PIN_KEY) || '1234';
}

export function setSecurityPin(pin: string) {
  localStorage.setItem(PIN_KEY, pin);
}

// --- Procedures Storage ---
export function getStoredProcedures(): ClinicalProcedure[] {
  try {
    const raw = localStorage.getItem(PROCEDURES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored procedures:', e);
  }
  localStorage.setItem(PROCEDURES_KEY, JSON.stringify(INITIAL_PROCEDURES));
  return INITIAL_PROCEDURES;
}

export function saveProcedures(procedures: ClinicalProcedure[]) {
  localStorage.setItem(PROCEDURES_KEY, JSON.stringify(procedures));
  triggerAutoDiskSync();
}

// --- Inventory Storage ---
export function getStoredInventory(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(INVENTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored inventory:', e);
  }
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(INITIAL_INVENTORY));
  return INITIAL_INVENTORY;
}

export function saveInventory(items: InventoryItem[]) {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
  triggerAutoDiskSync();
}

export function adjustInventoryStock(itemId: string, delta: number, reason: string): InventoryItem | null {
  const items = getStoredInventory();
  const idx = items.findIndex((i) => i.id === itemId);
  if (idx === -1) return null;

  const current = items[idx];
  const newQty = Math.max(0, current.stockQuantity + delta);
  const updatedItem: InventoryItem = {
    ...current,
    stockQuantity: newQty,
    updatedAt: new Date().toISOString(),
  };

  items[idx] = updatedItem;
  saveInventory(items);

  logAuditEvent(
    delta >= 0 ? 'RESTOCK_INVENTORY' : 'UPDATE_INVENTORY',
    `${delta >= 0 ? 'Nhập kho' : 'Xuất kho/Sử dụng'}: ${Math.abs(delta)} ${current.unit} ${current.name}. Lý do: ${reason}. Tồn mới: ${newQty}`,
    current.id,
    current.name,
    'INFO'
  );

  return updatedItem;
}

export const loadPatients = getStoredPatients;
export const loadLesions = getStoredLesions;
export const loadAppointments = getStoredAppointments;
export const loadAuditLogs = getStoredAuditLogs;
export const loadProcedures = getStoredProcedures;
export const loadInventory = getStoredInventory;

const LOCK_KEY = 'dermacare_locked_status';

export function getSecurityLockStatus(): boolean {
  return localStorage.getItem(LOCK_KEY) === 'true';
}

export function setSecurityLockStatus(isLocked: boolean) {
  localStorage.setItem(LOCK_KEY, String(isLocked));
}

// --- Google Drive Backup & Restore Utilities ---
export interface ClinicBackupPayload {
  appVersion: string;
  exportDate: string;
  clinicName: string;
  totalPatients: number;
  totalLesions: number;
  totalProcedures: number;
  data: {
    patients: Patient[];
    lesions: Lesion[];
    appointments: Appointment[];
    procedures: ClinicalProcedure[];
    inventory: InventoryItem[];
    auditLogs: AuditLogEntry[];
  };
}

export function getFullClinicExportData(): ClinicBackupPayload {
  const patients = getStoredPatients();
  const lesions = getStoredLesions();
  const appointments = getStoredAppointments();
  const procedures = getStoredProcedures();
  const inventory = getStoredInventory();
  const auditLogs = getStoredAuditLogs();

  return {
    appVersion: '1.2.0',
    exportDate: new Date().toISOString(),
    clinicName: 'Phòng Khám Da Liễu Dermacare AI',
    totalPatients: patients.length,
    totalLesions: lesions.length,
    totalProcedures: procedures.length,
    data: {
      patients,
      lesions,
      appointments,
      procedures,
      inventory,
      auditLogs,
    },
  };
}

export function restoreFullClinicData(payload: any): boolean {
  if (!payload || !payload.data) {
    throw new Error('Dữ liệu sao lưu không hợp lệ hoặc thiếu cấu trúc tiêu chuẩn');
  }

  const { patients, lesions, appointments, procedures, inventory, auditLogs } = payload.data;

  if (Array.isArray(patients)) savePatients(patients);
  if (Array.isArray(lesions)) saveLesions(lesions);
  if (Array.isArray(appointments)) saveAppointments(appointments);
  if (Array.isArray(procedures)) saveProcedures(procedures);
  if (Array.isArray(inventory)) saveInventory(inventory);
  if (Array.isArray(auditLogs)) localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(auditLogs));

  logAuditEvent(
    'SYSTEM_EXPORT',
    `Khôi phục toàn bộ cơ sở dữ liệu phòng khám từ bản sao lưu Google Drive (${payload.exportDate || 'Không rõ ngày'})`,
    undefined,
    'Google Drive Restore',
    'CRITICAL'
  );

  return true;
}

export function getPatientDossierExport(patientId: string) {
  const patients = getStoredPatients();
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return null;

  const lesions = getStoredLesions().filter((l) => l.patientId === patientId);
  const appointments = getStoredAppointments().filter((a) => a.patientId === patientId);
  const procedures = getStoredProcedures().filter((pr) => pr.patientId === patientId);

  return {
    appVersion: '1.2.0',
    exportDate: new Date().toISOString(),
    type: 'PATIENT_DOSSIER',
    patient,
    lesions,
    appointments,
    procedures,
  };
}

// --- Local Computer Hard Drive (data/clinic_database.json) Operations ---

export interface LocalDiskStatus {
  success: boolean;
  isLocal: boolean;
  dataDir: string;
  dbFileName: string;
  dbFilePath: string;
  exists: boolean;
  sizeBytes: number;
  sizeFormatted: string;
  updatedAt: string | null;
  counts: {
    patients: number;
    lesions: number;
    appointments: number;
    procedures: number;
    inventory: number;
    auditLogs: number;
  };
  hasBackup: boolean;
}

/**
 * Save all clinic state to local computer hard drive (data/clinic_database.json) via backend API
 */
export async function saveToLocalComputerDisk(): Promise<{ success: boolean; sizeFormatted?: string; message?: string; dbFilePath?: string }> {
  const fullData = getFullClinicExportData();
  try {
    const res = await fetch('/api/storage/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullData),
    });
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const result = await res.json();
    return result;
  } catch (e: any) {
    return { success: false, message: e.message || 'Không thể ghi vào thư mục máy tính' };
  }
}

/**
 * Load database from local computer hard drive and synchronize into localStorage
 */
export async function loadFromLocalComputerDisk(): Promise<{ success: boolean; loaded: boolean; message: string; updatedAt?: string }> {
  try {
    const res = await fetch('/api/storage/load');
    if (!res.ok) {
      return { success: false, loaded: false, message: `Server HTTP ${res.status}` };
    }
    const result = await res.json();
    if (result.exists && result.data) {
      restoreFullClinicData({
        data: result.data,
        exportDate: result.updatedAt,
      });
      return {
        success: true,
        loaded: true,
        message: 'Đã tải thành công dữ liệu từ tệp data/clinic_database.json',
        updatedAt: result.updatedAt,
      };
    }
    return {
      success: true,
      loaded: false,
      message: 'Chưa có tệp dữ liệu trên ổ cứng máy tính (sẽ tạo mới khi lưu)',
    };
  } catch (e: any) {
    return { success: false, loaded: false, message: e.message || 'Lỗi kết nối' };
  }
}

/**
 * Check health, file size, path and count of records on local computer disk
 */
export async function checkLocalDiskStatus(): Promise<LocalDiskStatus | null> {
  try {
    const res = await fetch('/api/storage/status');
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

/**
 * Direct file download of database to user's computer (works in all browsers and offline)
 */
export function downloadBackupFileToComputer() {
  const fullData = getFullClinicExportData();
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `dermacare_backup_${dateStr}.json`;
  const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  logAuditEvent(
    'SYSTEM_EXPORT',
    `Đã tải tệp cơ sở dữ liệu phòng khám về máy tính: ${fileName}`,
    undefined,
    'Sao lưu máy tính',
    'INFO'
  );
}

/**
 * Read and restore a backup JSON file from the user's computer hard drive
 */
export function readAndRestoreBackupFile(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        restoreFullClinicData(parsed);

        // Also push to local server hard disk
        await saveToLocalComputerDisk();

        logAuditEvent(
          'SYSTEM_EXPORT',
          `Khôi phục dữ liệu từ tệp máy tính (${file.name}, kích thước ${(file.size / 1024).toFixed(1)} KB)`,
          undefined,
          'Khôi phục tệp',
          'WARNING'
        );

        resolve({ success: true, message: `Đã khôi phục thành công từ tệp ${file.name}!` });
      } catch (err: any) {
        reject(new Error('Tệp không đúng định dạng JSON hoặc cấu trúc không tương thích.'));
      }
    };
    reader.onerror = () => reject(new Error('Không thể đọc tệp từ máy tính.'));
    reader.readAsText(file);
  });
}

