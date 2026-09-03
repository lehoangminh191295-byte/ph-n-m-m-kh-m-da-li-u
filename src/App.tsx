import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  ShieldCheck,
  Plus,
  Search,
  Lock,
  Sparkles,
  Camera,
  Activity,
  FileText,
  UserCheck,
  ChevronRight,
  Filter,
  Layers,
  CheckCircle2,
  Smartphone,
  Hospital,
  Package,
  Zap,
  Syringe,
  Cloud
} from 'lucide-react';
import { Patient, Lesion, Appointment, AuditLogEntry, FitzpatrickSkinType, ClinicalProcedure, InventoryItem } from './types';
import {
  loadPatients,
  savePatients,
  loadLesions,
  saveLesions,
  loadAppointments,
  saveAppointments,
  loadAuditLogs,
  getSecurityLockStatus,
  setSecurityLockStatus,
  logAuditEvent,
  loadProcedures,
  saveProcedures,
  loadInventory,
  saveInventory,
  adjustInventoryStock
} from './services/storageService';
import { PatientDetail } from './components/PatientDetail';
import { AppointmentsView } from './components/AppointmentsView';
import { ProceduresView } from './components/ProceduresView';
import { InventoryView } from './components/InventoryView';
import { GoogleDriveView } from './components/GoogleDriveView';
import { NewPatientModal } from './components/NewPatientModal';
import { SecurityLockScreen } from './components/SecurityLockScreen';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { initAuth } from './services/googleAuthService';

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [lesions, setLesions] = useState<Lesion[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [procedures, setProcedures] = useState<ClinicalProcedure[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Active view: 'patients' | 'appointments' | 'procedures' | 'inventory' | 'google-drive'
  const [currentTab, setCurrentTab] = useState<'patients' | 'appointments' | 'procedures' | 'inventory' | 'google-drive'>('patients');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Google Drive Auth status
  const [hasDriveAuth, setHasDriveAuth] = useState(false);
  const [driveUserEmail, setDriveUserEmail] = useState<string | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFitzpatrick, setSelectedFitzpatrick] = useState<string>('ALL');

  // Modals
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  const reloadAllClinicData = () => {
    setPatients(loadPatients());
    setLesions(loadLesions());
    setAppointments(loadAppointments());
    setProcedures(loadProcedures());
    setInventory(loadInventory());
    setAuditLogs(loadAuditLogs());
  };

  // Google Auth listener
  useEffect(() => {
    const unsub = initAuth(
      (user) => {
        setHasDriveAuth(true);
        setDriveUserEmail(user.email);
      },
      () => {
        setHasDriveAuth(false);
        setDriveUserEmail(null);
      }
    );
    return () => unsub();
  }, []);

  // Initial load
  useEffect(() => {
    const loadedPatients = loadPatients();
    const loadedLesions = loadLesions();
    const loadedAppointments = loadAppointments();
    const loadedProcedures = loadProcedures();
    const loadedInventory = loadInventory();
    const loadedLogs = loadAuditLogs();
    const lockStatus = getSecurityLockStatus();

    setPatients(loadedPatients);
    setLesions(loadedLesions);
    setAppointments(loadedAppointments);
    setProcedures(loadedProcedures);
    setInventory(loadedInventory);
    setAuditLogs(loadedLogs);
    setIsLocked(lockStatus);

    // Initial audit event
    logAuditEvent('VIEW_PATIENT', 'Khởi động ứng dụng Dermacare AI', undefined, undefined, 'INFO');
  }, []);

  const handleUpdatePatients = (newPatients: Patient[]) => {
    setPatients(newPatients);
    savePatients(newPatients);
  };

  const handleUpdateLesions = (newLesions: Lesion[]) => {
    setLesions(newLesions);
    saveLesions(newLesions);
  };

  const handleUpdateAppointments = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    saveAppointments(newAppointments);
  };

  const handleAddProcedure = (procedure: ClinicalProcedure, shouldDeductInventory: boolean) => {
    const updated = [procedure, ...procedures];
    setProcedures(updated);
    saveProcedures(updated);

    if (shouldDeductInventory && procedure.inventoryItemId) {
      adjustInventoryStock(
        procedure.inventoryItemId,
        -1,
        `Sử dụng trong thủ thuật ${procedure.procedureName} cho bệnh nhân ${procedure.patientName}`
      );
      setInventory(loadInventory());
    }
  };

  const handleDeleteProcedure = (procedureId: string) => {
    const updated = procedures.filter((p) => p.id !== procedureId);
    setProcedures(updated);
    saveProcedures(updated);
    logAuditEvent('DELETE_PROCEDURE', `Xóa hồ sơ thủ thuật ID: ${procedureId}`, undefined, undefined, 'WARNING');
  };

  const handleSaveInventoryItem = (item: InventoryItem) => {
    const exists = inventory.some((i) => i.id === item.id);
    let updated: InventoryItem[];
    if (exists) {
      updated = inventory.map((i) => (i.id === item.id ? item : i));
    } else {
      updated = [item, ...inventory];
    }
    setInventory(updated);
    saveInventory(updated);
  };

  const handleDeleteInventoryItem = (itemId: string) => {
    const updated = inventory.filter((i) => i.id !== itemId);
    setInventory(updated);
    saveInventory(updated);
    logAuditEvent('DELETE_INVENTORY_ITEM', `Xóa mặt hàng kho ID: ${itemId}`, undefined, undefined, 'WARNING');
  };

  const handleAdjustStock = (itemId: string, delta: number, reason: string) => {
    adjustInventoryStock(itemId, delta, reason);
    setInventory(loadInventory());
  };

  const handleLockNow = () => {
    setIsLocked(true);
    setSecurityLockStatus(true);
  };

  const handleUnlock = () => {
    setIsLocked(false);
    setSecurityLockStatus(false);
    setAuditLogs(loadAuditLogs());
  };

  // Selected patient object
  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // Filtering
  const filteredPatients = patients.filter((patient) => {
    const term = searchTerm.toLowerCase();
    const matchesName = patient.fullName.toLowerCase().includes(term);
    const matchesCode = patient.code.toLowerCase().includes(term);
    const matchesPhone = patient.phone.includes(term);
    const matchesSite = lesions
      .filter((l) => l.patientId === patient.id)
      .some((l) => l.anatomicalSite.toLowerCase().includes(term));

    const matchesSearch = matchesName || matchesCode || matchesPhone || matchesSite;
    const matchesFitz = selectedFitzpatrick === 'ALL' || patient.fitzpatrick === selectedFitzpatrick;

    return matchesSearch && matchesFitz;
  });

  // Calculate high-level clinic metrics
  const totalLesionsCount = lesions.length;
  const totalVisitsCount = lesions.reduce((acc, l) => acc + l.visits.length, 0);
  const totalRemindersSent = appointments.filter((a) => a.reminderSent).length;

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Geometric Balance - Left Dark Navigation Sidebar */}
      <aside className="no-print w-64 bg-slate-900 text-slate-400 flex flex-col border-r border-slate-800 shrink-0 select-none hidden md:flex">
        {/* Brand Header */}
        <div className="p-6 mb-2">
          <div className="flex items-center gap-2.5 text-white font-bold text-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-black shadow-sm">
              D
            </div>
            <span className="tracking-tight">DERMA.AI</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Enterprise Clinician v2.4</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => {
              setSelectedPatientId(null);
              setCurrentTab('patients');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'patients' && !selectedPatientId
                ? 'bg-slate-800 text-white'
                : 'hover:bg-slate-800 hover:text-slate-200 text-slate-400'
            }`}
          >
            <span className="opacity-70 text-base">⬚</span>
            <span className="flex-1 text-left">Dashboard</span>
          </button>

          <button
            onClick={() => {
              setSelectedPatientId(null);
              setCurrentTab('patients');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'patients' && selectedPatientId
                ? 'bg-slate-800 text-white'
                : 'hover:bg-slate-800 hover:text-slate-200 text-slate-400'
            }`}
          >
            <span className="opacity-70 text-base">👤</span>
            <span className="flex-1 text-left">Bệnh Nhân</span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
              {patients.length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedPatientId(null);
              setCurrentTab('appointments');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'appointments'
                ? 'bg-slate-800 text-white'
                : 'hover:bg-slate-800 hover:text-slate-200 text-slate-400'
            }`}
          >
            <span className="opacity-70 text-base">📅</span>
            <span className="flex-1 text-left">Lịch Hẹn</span>
            {appointments.some((a) => !a.reminderSent) && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </button>

          <button
            onClick={() => {
              setSelectedPatientId(null);
              setCurrentTab('procedures');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'procedures'
                ? 'bg-slate-800 text-white'
                : 'hover:bg-slate-800 hover:text-slate-200 text-slate-400'
            }`}
          >
            <span className="opacity-70 text-base">⚡</span>
            <span className="flex-1 text-left">Thủ Thuật Da Liễu</span>
            <span className="text-[10px] bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold">
              {procedures.length}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedPatientId(null);
              setCurrentTab('inventory');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'inventory'
                ? 'bg-slate-800 text-white'
                : 'hover:bg-slate-800 hover:text-slate-200 text-slate-400'
            }`}
          >
            <span className="opacity-70 text-base">📦</span>
            <span className="flex-1 text-left">Kho Thuốc & Dược Chất</span>
            {inventory.some((i) => i.stockQuantity <= i.minThreshold) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Có mặt hàng sắp hết hàng" />
            )}
          </button>

          <button
            onClick={() => {
              setSelectedPatientId(null);
              setCurrentTab('google-drive');
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentTab === 'google-drive'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-800 hover:text-slate-200 text-slate-400'
            }`}
          >
            <Cloud className="w-4 h-4 text-blue-400" />
            <span className="flex-1 text-left">Đồng Bộ Google Drive</span>
            {hasDriveAuth ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Đã liên kết Google Drive" />
            ) : (
              <span className="text-[10px] bg-blue-900/80 text-blue-300 px-1.5 py-0.5 rounded font-bold">
                Mới
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSecurityModalOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-800 hover:text-slate-200 text-slate-400"
          >
            <span className="opacity-70 text-base">🛡️</span>
            <span className="flex-1 text-left">Bảo Mật HIPAA</span>
          </button>
        </nav>

        {/* Sidebar Footer / Security Card */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/30 text-xs text-blue-300">
            <p className="font-semibold mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Bảo mật: HIPAA Standard
            </p>
            <p className="opacity-80 text-[11px] leading-relaxed">
              Dữ liệu được mã hóa đầu-cuối AES-256
            </p>
            <button
              onClick={handleLockNow}
              className="mt-2.5 w-full py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 rounded border border-blue-400/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Lock className="w-3 h-3" />
              Khóa phiên khám
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Geometric Balance - Header */}
        <header className="no-print h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-20">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Mobile Brand Icon */}
            <div className="md:hidden w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0">
              D
            </div>

            {selectedPatient ? (
              <div className="flex items-center gap-2 sm:gap-3 truncate">
                <h2 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                  Hồ Sơ: {selectedPatient.code}
                </h2>
                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                  Đang Điều Trị
                </span>
              </div>
            ) : currentTab === 'appointments' ? (
              <div className="flex items-center gap-2 sm:gap-3 truncate">
                <h2 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                  Lịch Hẹn & Nhắc Lịch SMS
                </h2>
                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                  Active
                </span>
              </div>
            ) : currentTab === 'procedures' ? (
              <div className="flex items-center gap-2 sm:gap-3 truncate">
                <h2 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                  Thủ Thuật Da Liễu (Laser, Botox, Filler, Meso, Lăn Kim)
                </h2>
                <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                  {procedures.length} Lượt thực hiện
                </span>
              </div>
            ) : currentTab === 'inventory' ? (
              <div className="flex items-center gap-2 sm:gap-3 truncate">
                <h2 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                  Kho Thuốc & Dược Chất Phòng Khám
                </h2>
                <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                  {inventory.length} Mặt hàng
                </span>
              </div>
            ) : currentTab === 'google-drive' ? (
              <div className="flex items-center gap-2 sm:gap-3 truncate">
                <h2 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                  Đồng Bộ & Sao Lưu Google Drive
                </h2>
                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                  Drive API v3
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 truncate">
                <h2 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                  Tổng Quan Lâm Sàng Da Liễu
                </h2>
                <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
                  Online
                </span>
              </div>
            )}
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden items-center gap-1 mr-1">
              <button
                onClick={() => {
                  setSelectedPatientId(null);
                  setCurrentTab('patients');
                }}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  currentTab === 'patients' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Hồ sơ
              </button>
              <button
                onClick={() => {
                  setSelectedPatientId(null);
                  setCurrentTab('procedures');
                }}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  currentTab === 'procedures' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Thủ thuật
              </button>
              <button
                onClick={() => {
                  setSelectedPatientId(null);
                  setCurrentTab('inventory');
                }}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  currentTab === 'inventory' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Kho
              </button>
              <button
                onClick={() => {
                  setSelectedPatientId(null);
                  setCurrentTab('google-drive');
                }}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  currentTab === 'google-drive' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                Drive
              </button>
            </div>

            {/* Google Drive Status Indicator / Button */}
            <button
              onClick={() => {
                setSelectedPatientId(null);
                setCurrentTab('google-drive');
              }}
              className={`px-2.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border flex items-center gap-1.5 transition ${
                currentTab === 'google-drive'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : hasDriveAuth
                  ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="Mở bảng điều khiển đồng bộ Google Drive"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden lg:inline">
                {hasDriveAuth ? (driveUserEmail ? driveUserEmail.split('@')[0] : 'Drive Kết Nối') : 'Google Drive'}
              </span>
              {hasDriveAuth && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
            </button>

            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium border border-slate-200 transition"
            >
              Nhật Ký Audit
            </button>

            <button
              onClick={() => setIsNewPatientOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bệnh Nhân Mới</span>
              <span className="sm:hidden">Thêm</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {selectedPatient ? (
              /* Detailed Patient Dossier View */
              <PatientDetail
                patient={selectedPatient}
                lesions={lesions}
                appointments={appointments}
                procedures={procedures}
                onBack={() => setSelectedPatientId(null)}
                onUpdatePatient={(updated) => {
                  const updatedList = patients.map((p) => (p.id === updated.id ? updated : p));
                  handleUpdatePatients(updatedList);
                }}
                onUpdateLesions={handleUpdateLesions}
                onUpdateAppointments={handleUpdateAppointments}
                onAddProcedure={handleAddProcedure}
                onDeleteProcedure={handleDeleteProcedure}
              />
            ) : currentTab === 'procedures' ? (
              /* Clinical Procedures View (Laser, Botox, Filler, Meso, etc.) */
              <ProceduresView
                procedures={procedures}
                patients={patients}
                onAddProcedure={handleAddProcedure}
                onDeleteProcedure={handleDeleteProcedure}
                onSelectPatient={(patId) => {
                  setSelectedPatientId(patId);
                  setCurrentTab('patients');
                }}
              />
            ) : currentTab === 'inventory' ? (
              /* Inventory & Active Ingredients Management */
              <InventoryView
                inventory={inventory}
                onSaveItem={handleSaveInventoryItem}
                onDeleteItem={handleDeleteInventoryItem}
                onAdjustStock={handleAdjustStock}
              />
            ) : currentTab === 'appointments' ? (
              /* Appointments and Automated Reminders View */
              <AppointmentsView
                appointments={appointments}
                patients={patients}
                onUpdateAppointments={handleUpdateAppointments}
                onSelectPatient={(patId) => {
                  setSelectedPatientId(patId);
                  setCurrentTab('patients');
                }}
              />
            ) : currentTab === 'google-drive' ? (
              /* Google Drive Cloud Sync, Backup and Restore */
              <GoogleDriveView onDataRestored={reloadAllClinicData} />
            ) : (
              /* Patients Directory and Geometric Balance Clinical Overview */
              <div className="space-y-6">
                {/* 4-Column Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Họ Tên Quản Lý
                    </p>
                    <p className="font-semibold text-lg text-slate-900 mt-1">
                      {patients.length} Bệnh Nhân
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Tổn Thương Theo Dõi
                    </p>
                    <p className="font-semibold text-lg text-slate-900 mt-1">
                      {totalLesionsCount} Vị Trí
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Lượt Soi Dermoscopy
                    </p>
                    <p className="font-semibold text-lg text-slate-900 mt-1">
                      {totalVisitsCount} Lần Khám
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      Nhắc Lịch Tự Động
                    </p>
                    <p className="font-semibold text-lg text-slate-900 mt-1">
                      {totalRemindersSent} Đã Gửi SMS
                    </p>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm theo tên bệnh nhân, mã hồ sơ, SĐT hoặc vị trí tổn thương..."
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">Phân loại da:</span>
                    <select
                      value={selectedFitzpatrick}
                      onChange={(e) => setSelectedFitzpatrick(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">Tất cả Fitzpatrick</option>
                      <option value="Type I">Type I (Rất trắng)</option>
                      <option value="Type II">Type II (Trắng)</option>
                      <option value="Type III">Type III (Sáng / Châu Á)</option>
                      <option value="Type IV">Type IV (Bánh mật)</option>
                      <option value="Type V">Type V (Nâu sẫm)</option>
                      <option value="Type VI">Type VI (Đen sẫm)</option>
                    </select>
                  </div>
                </div>

                {/* Patient Grid & Clinical Highlights Section */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Left: Patient Cards Grid */}
                  <div className="xl:col-span-8 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => {
                          const pLesions = lesions.filter((l) => l.patientId === patient.id);
                          const pAppointments = appointments.filter((a) => a.patientId === patient.id);
                          const latestLesion = pLesions[0];
                          const latestVisit = latestLesion?.visits[latestLesion.visits.length - 1];
                          const dermoImg = latestVisit?.images.find((i) => i.type === 'dermoscopy');
                          const macroImg = latestVisit?.images.find((i) => i.type === 'macroscopic');

                          return (
                            <div
                              key={patient.id}
                              onClick={() => setSelectedPatientId(patient.id)}
                              className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-500 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 group"
                            >
                              <div>
                                {/* Header: Avatar, Name, Code */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={patient.avatarUrl}
                                      alt={patient.fullName}
                                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 shadow-xs"
                                    />
                                    <div>
                                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                                        {patient.fullName}
                                      </h3>
                                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <span className="font-mono font-semibold">{patient.code}</span>
                                        <span>•</span>
                                        <span>{patient.gender}, {patient.age}t</span>
                                      </div>
                                    </div>
                                  </div>

                                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                                    {patient.fitzpatrick}
                                  </span>
                                </div>

                                {/* Warnings / Badges */}
                                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                                  {patient.familySkinCancerHistory && (
                                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                      Tiền sử K Da
                                    </span>
                                  )}
                                  <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
                                    {pLesions.length} tổn thương
                                  </span>
                                  {pAppointments.length > 0 && (
                                    <span className="text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                                      Hẹn: {pAppointments[0].appointmentDate}
                                    </span>
                                  )}
                                </div>

                                {/* Recent Lesion Preview */}
                                {latestLesion && (
                                  <div className="mt-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-semibold text-slate-800 truncate">
                                        {latestLesion.anatomicalSite}
                                      </span>
                                      <span className="font-mono text-slate-500 text-[11px]">
                                        {latestVisit?.lesionSize}
                                      </span>
                                    </div>

                                    {/* Dual Thumbnail Preview */}
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-900 relative border border-slate-200">
                                        {macroImg ? (
                                          <img src={macroImg.dataUrl} alt="Macro" className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500">
                                            Ảnh đại thể
                                          </div>
                                        )}
                                        <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold absolute bottom-1 left-1">
                                          Gross
                                        </span>
                                      </div>

                                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-900 relative border border-slate-200">
                                        {dermoImg ? (
                                          <img src={dermoImg.dataUrl} alt="Dermoscopy" className="w-full h-full object-cover" />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500">
                                            Ảnh Dermoscopy
                                          </div>
                                        )}
                                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold absolute bottom-1 left-1">
                                          Dermoscopy
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Footer Actions */}
                              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-400 text-[11px] font-mono">{patient.phone}</span>
                                <span className="inline-flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-0.5 transition">
                                  Xem hồ sơ <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200">
                          <p className="text-slate-500 text-sm mb-3">Không tìm thấy bệnh nhân nào theo bộ lọc.</p>
                          <button
                            onClick={() => {
                              setSearchTerm('');
                              setSelectedFitzpatrick('ALL');
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                          >
                            Xóa bộ lọc
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tiến Triển Điều Trị / Progress Overview Widget */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm text-slate-900">Tiến Triển Điều Trị & Theo Dõi Định Kỳ</h3>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          Quy chuẩn ICD-11
                        </span>
                      </div>
                      <div className="flex items-end gap-3 h-24">
                        <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="w-full bg-slate-100 rounded-t h-[40%]" />
                          <span className="text-[10px] text-slate-400 font-medium">T5</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="w-full bg-slate-100 rounded-t h-[55%]" />
                          <span className="text-[10px] text-slate-400 font-medium">T6</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="w-full bg-blue-200 rounded-t h-[75%]" />
                          <span className="text-[10px] text-slate-400 font-medium">T7</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="w-full bg-blue-600 rounded-t h-[90%]" />
                          <span className="text-[10px] text-blue-600 font-bold">T8</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="w-full bg-blue-400 rounded-t h-[60%]" />
                          <span className="text-[10px] text-slate-400 font-medium">T9</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div className="w-full bg-slate-100 rounded-t h-[30%]" />
                          <span className="text-[10px] text-slate-400 font-medium">T10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Next Appointments & SMS Reminder Dark Card */}
                  <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* Next Appointments Card */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm text-slate-900">Lịch Hẹn Tiếp Theo</h3>
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">
                          {appointments.length} lịch
                        </span>
                      </div>

                      <div className="space-y-3">
                        {appointments.slice(0, 3).map((apt, idx) => (
                          <div
                            key={apt.id}
                            onClick={() => {
                              setSelectedPatientId(apt.patientId);
                              setCurrentTab('patients');
                            }}
                            className={`p-3 rounded-r-lg border-l-4 cursor-pointer hover:bg-slate-100/80 transition ${
                              idx === 0
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-slate-50 border-slate-300'
                            }`}
                          >
                            <p className="text-[10px] text-blue-600 font-bold uppercase">
                              {apt.appointmentDate} - {apt.appointmentTime}
                            </p>
                            <p className="font-semibold text-sm text-slate-900">{apt.purpose}</p>
                            <p className="text-[11px] text-slate-500">
                              BN: {apt.patientName} • {apt.doctorName}
                            </p>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPatientId(null);
                          setCurrentTab('appointments');
                        }}
                        className="w-full mt-5 py-2.5 border-2 border-dashed border-slate-200 rounded-lg text-xs font-bold text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all text-center"
                      >
                        + QUẢN LÝ TẤT CẢ LỊCH HẸN
                      </button>
                    </div>

                    {/* Dark Highlight SMS Reminder Card from Design HTML */}
                    <div className="bg-slate-900 p-6 rounded-xl text-white shadow-xl flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-xl">
                          💬
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                            SMS Reminder
                          </p>
                          <p className="text-sm font-medium">Hệ thống nhắc hẹn tự động</p>
                        </div>
                      </div>

                      <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <p className="text-[11px] italic opacity-80 leading-relaxed">
                          "Chào bạn, lịch hẹn tái khám soi da Dermoscopy tại Dermacare AI của bạn là 09:30 ngày mai. Vui lòng đến đúng giờ..."
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold opacity-60 uppercase tracking-wider">STATUS: AUTO ACTIVE</span>
                        <div className="flex -space-x-1.5">
                          <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-slate-900" />
                          <div className="w-5 h-5 rounded-full bg-blue-400 border-2 border-slate-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Geometric Balance - Footer */}
        <footer className="no-print h-8 bg-slate-100 border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
          <div className="flex gap-4">
            <span>Sync: 0.2s ago</span>
            <span>Device: Desktop/Mobile Synced</span>
          </div>
          <div>System Version 2.4.0-Enterprise • HIPAA Compliant</div>
        </footer>
      </div>

      {/* Security Pin Lock Screen */}
      <SecurityLockScreen isLocked={isLocked} onUnlock={handleUnlock} />

      {/* Modals */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onSavePatient={(newPat) => {
          handleUpdatePatients([newPat, ...patients]);
          setSelectedPatientId(newPat.id);
        }}
        existingCount={patients.length}
      />

      <SecurityAuditModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        auditLogs={auditLogs}
        onLockNow={handleLockNow}
      />
    </div>
  );
}

